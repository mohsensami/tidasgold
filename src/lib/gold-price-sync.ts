import { prisma } from "@/lib/prisma";
import { updateGoldPrice } from "@/lib/data/settings";
import { withRetry } from "@/lib/db-retry";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

/**
 * جلوگیری از فراخوانی هم‌زمان چند‌باره‌ی brsapi وقتی چند ریکوئست همزمان
 * (مثلاً چند بازدید صفحه + یک ثبت سفارش) همه هم‌زمان تشخیص می‌دهند قیمت
 * «قدیمی» شده. این promise مشترک بین همه‌ی صدازننده‌ها (میدلور، روت sync،
 * و فرآیند checkout) به اشتراک گذاشته می‌شود.
 */
let syncInFlight: Promise<{ synced: boolean; reason?: string }> | null = null;

/**
 * تضمین می‌کند که قیمت طلا در دیتابیس بیش از ۵ دقیقه قدیمی نباشد.
 *
 * برخلاف صدا زدن از میدلور (که fire-and-forget است و منتظر نتیجه نمی‌ماند)،
 * این تابع را باید با await صدا زد. جاهایی که واقعاً درستیِ قیمت اهمیت
 * دارد — مثل لحظه‌ی محاسبه‌ی قیمت سفارش در checkout — باید حتماً با await
 * این تابع را قبل از خواندن قیمت صدا بزنند، چون سبد خرید کاربر ممکن است
 * ساعت‌ها قدیمی باشد و هیچ صفحه‌ای بین این مدت لود نشده باشد که میدلور
 * را trigger کند.
 */
export async function ensureFreshGoldPrice(): Promise<{ synced: boolean; reason?: string }> {
  return (syncInFlight ??= syncGoldPriceIfStale().finally(() => {
    syncInFlight = null;
  }));
}

async function syncGoldPriceIfStale(): Promise<{ synced: boolean; reason?: string }> {
  const setting = await withRetry(() =>
    prisma.setting.findUnique({ where: { id: "singleton" } })
  );

  // ⚠️ عمداً از goldPriceSourceTime استفاده می‌کنیم، نه از updatedAt.
  // updatedAt فقط زمانی‌ست که ما آخرین بار روی این ردیف نوشتیم (حتی اگر
  // مقدار قیمت عوض نشده باشد، @updatedAt در پریزما آن را هر بار آپدیت
  // می‌کند). goldPriceSourceTime همان لحظه‌ای‌ست که خودِ brsapi این قیمت
  // را ثبت کرده (فیلد time_unix پاسخش)، یعنی واقعاً «چقدر قدیمی» بودنِ
  // قیمت را نشان می‌دهد.
  const referenceTime = setting?.goldPriceSourceTime ?? setting?.updatedAt ?? null;
  const isStale = !referenceTime || Date.now() - referenceTime.getTime() > FIVE_MINUTES_MS;

  if (!isStale) {
    return { synced: false, reason: "fresh" };
  }

  const apiKey = process.env.BRSAPI_API_KEY;
  if (!apiKey) {
    console.warn("[gold-price-sync] BRSAPI_API_KEY در env تنظیم نشده است");
    return { synced: false, reason: "missing-api-key" };
  }

  // ⚠️ این تابع دیگر هیچ‌وقت خطا throw نمی‌کند (حتی اگر brsapi موقتاً از کار
  // بیفتد، تایم‌اوت بدهد، یا پاسخش غیرمنتظره باشد). چون این تابع مستقیماً از
  // checkout-helpers.ts هم صدا زده می‌شود، پرتاب خطا از اینجا یعنی کل فرآیند
  // پرداخت با ۵۰۰ بترکد فقط چون یک درخواست شبکه‌ای موقتاً fail شده — در حالی
  // که قیمتِ موجود در دیتابیس (هر چقدر هم که چند دقیقه قدیمی باشد) کاملاً
  // برای ادامه‌ی کار قابل استفاده است.
  // ⚠️ از cache: "no-store" عمداً استفاده نمی‌کنیم. next.revalidate یعنی
  // خودِ Next.js (نه ما) تضمین می‌کند این fetch در کل دیپلویمنت — حتی اگر
  // ده‌ها instance سرورلسِ مختلف هم‌زمان این تابع را صدا بزنند — بیشتر از
  // هر ۱۰ دقیقه یک‌بار واقعاً به brsapi نمی‌رود (Data Cache خودِ Next.js
  // مشترک/توزیع‌شده است، نه یک قفل تو حافظه‌ی یک instance تنها). این یک
  // لایه‌ی محافظتیِ اضافه‌ست، مکمل چکِ ۵ دقیقه‌ایِ روی goldPriceSourceTime
  // که پایین‌تر هم هست (نه جایگزینش) — چون آن چک تصمیم می‌گیرد «آیا اصلاً
  // بنویسیم رو دیتابیس»، این یکی تضمین می‌کند «به هر حال بیشتر از حدِ لازم
  // درخواست شبکه‌ای واقعی زده نشود».
  try {
    const res = await fetch(`https://api.brsapi.ir/Market/Gold_Currency.php?key=${apiKey}`, {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.error(`[gold-price-sync] brsapi پاسخ ${res.status} برگرداند`);
      return { synced: false, reason: `http-${res.status}` };
    }

    const data = await res.json();
    const gold18k = extractGold18k(data);

    if (!gold18k) {
      // این لاگ حیاتی‌ست: تنها راهی که می‌فهمیم ساختار واقعی پاسخ brsapi
      // چه شکلی‌ست (چون خودِ دامنه‌ی brsapi.ir قابل fetch مستقیم برای من
      // نیست) همین خروجی خام تو لاگ‌های Vercel است.
      console.error(
        "[gold-price-sync] آیتم طلای ۱۸ عیار پیدا نشد. پاسخ خام برای بررسی:",
        JSON.stringify(data).slice(0, 2000)
      );
      return { synced: false, reason: "18k-not-found" };
    }

    // فقط وقتی واقعاً در دیتابیس بنویس که brsapi خودش زمان جدیدتری اعلام
    // کرده باشه (یعنی منبع واقعاً رفرش شده). اگه هنوز همون قیمتِ قبلی رو
    // با همون زمان برگردونده (چون بازار موقتاً بسته‌ست یا API خودش هنوز
    // آپدیت نشده)، یه نوشتن اضافه‌ی بی‌فایده رو دیتابیس نزن.
    if (setting?.goldPriceSourceTime && gold18k.sourceTime.getTime() <= setting.goldPriceSourceTime.getTime()) {
      return { synced: false, reason: "source-unchanged" };
    }

    await updateGoldPrice(gold18k.pricePerGram, gold18k.changePercent, gold18k.sourceTime);
    return { synced: true };
  } catch (err) {
    console.error("[gold-price-sync] خطا در گرفتن/پردازش قیمت از brsapi:", err);
    return { synced: false, reason: "fetch-error" };
  }
}

/**
 * پاسخ brsapi را به‌شکلی که هر مقدار به‌ازای گرم طلای ۱۸ عیار را پیدا کند
 * پردازش می‌کند. چون ساختار دقیق پاسخِ زنده‌ی brsapi را نمی‌توانم مستقیم
 * fetch کنم (دامنه‌اش برای من قابل‌دسترس نیست)، این تابع را عمداً خیلی
 * انعطاف‌پذیر نوشته‌ام: هم آرایه‌ی مسطح، هم آبجکتی با چند دسته‌ی تودرتو
 * (gold/currency/gold_currency/...) را پشتیبانی می‌کند.
 */
function extractGold18k(
  data: unknown
): { pricePerGram: number; changePercent: number; sourceTime: Date } | null {
  const flat: any[] = [];

  function collect(node: unknown) {
    if (Array.isArray(node)) {
      for (const el of node) {
        if (el && typeof el === "object" && !Array.isArray(el)) flat.push(el);
        else collect(el);
      }
    } else if (node && typeof node === "object") {
      for (const value of Object.values(node)) collect(value);
    }
  }
  collect(data);

  const item = flat.find((it) => {
    // این دقیقاً همون چیزیه که خودِ brsapi برمی‌گردونه (symbol: "IR_GOLD_18K")
    if (it?.symbol === "IR_GOLD_18K") return true;
    // fallback برای وقتی brsapi اسم فیلدها رو عوض کنه
    const nameEn = String(it?.name_en ?? it?.symbol ?? it?.name_lat ?? "").toUpperCase();
    const name = String(it?.name ?? it?.title ?? "");
    const has18 = nameEn.includes("18") || name.includes("۱۸") || name.includes("18");
    const isGoldish =
      nameEn.includes("GOLD") ||
      nameEn.includes("AYAR") ||
      name.includes("طلا") ||
      name.includes("عیار");
    return has18 && isGoldish;
  });

  if (!item) return null;

  let price = Number(item.price ?? item.value ?? item.p ?? item.close ?? item.last);
  const changePercent = Number(
    item.change_percent ?? item.changePercent ?? item.drpercent ?? item.percent ?? 0
  );

  if (!Number.isFinite(price) || price <= 0) return null;

  // brsapi خودش واحد رو تو فیلد unit مشخص می‌کنه ("تومان" یا "ریال") —
  // این قابل‌اعتمادتر از حدس زدن از روی بزرگی عدده. فقط اگر این فیلد
  // نبود، به‌عنوان محافظ آخر از حدسِ بازه‌ی منطقی استفاده می‌کنیم.
  const unit = String(item.unit ?? "");
  if (unit.includes("ریال")) {
    price = price / 10;
  } else if (!unit && price > 60_000_000) {
    console.warn(
      `[gold-price-sync] فیلد unit نبود و مقدار (${price}) خیلی بزرگ به‌نظر می‌رسد؛ به‌عنوان ریال در نظر گرفته شد`
    );
    price = price / 10;
  }

  // time_unix ثانیه‌ای‌ست (نه میلی‌ثانیه)، پس ضرب در ۱۰۰۰ لازم است.
  // اگر به هر دلیلی این فیلد در پاسخ نبود، به لحظه‌ی الان برمی‌گردیم؛
  // یعنی این آیتم را «همین الان ثبت‌شده» فرض می‌کنیم به‌جای crash کردن.
  const rawUnix = Number(item.time_unix);
  const sourceTime = Number.isFinite(rawUnix) && rawUnix > 0 ? new Date(rawUnix * 1000) : new Date();

  return {
    pricePerGram: Math.round(price),
    changePercent: Number.isFinite(changePercent) ? changePercent : 0,
    sourceTime,
  };
}
