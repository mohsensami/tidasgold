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

  const res = await fetch(`https://api.brsapi.ir/Market/Gold_Currency.php?key=${apiKey}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new Error(`brsapi پاسخ ${res.status} برگرداند`);
  }

  const data = await res.json();
  const gold18k = extractGold18k(data);

  if (!gold18k) {
    console.warn("[gold-price-sync] آیتم طلای ۱۸ عیار در پاسخ brsapi پیدا نشد");
    return { synced: false, reason: "18k-not-found" };
  }

  await updateGoldPrice(gold18k.pricePerGram, gold18k.changePercent, gold18k.sourceTime);
  return { synced: true };
}

/**
 * پاسخ brsapi برای این وب‌سرویس معمولاً یک آرایه‌ی gold شامل چند نماد است
 * (طلای ۱۸ عیار، طلای ۲۴ عیار، مثقال، سکه و ...). این تابع سعی می‌کند
 * با چند روش مختلف (name_en، symbol، یا خود متن فارسی) آیتم ۱۸ عیار را
 * پیدا کند تا اگر ساختار دقیق پاسخ کمی فرق داشت هم کار کند.
 *
 * ⚠️ نکته مهم: قیمت‌های brsapi را با مقدار فعلی goldPricePerGram18k در
 * seed (۶,۸۵۰,۰۰۰ تومان) مقایسه کن. اگر عددی که برگشت ده برابر بزرگ‌تر
 * بود یعنی API ریال برمی‌گردونه، نه تومان — در اون صورت باید تقسیم بر
 * ۱۰ رو به این تابع اضافه کنی.
 */
function extractGold18k(
  data: unknown
): { pricePerGram: number; changePercent: number; sourceTime: Date } | null {
  const list: any[] = Array.isArray((data as any)?.gold)
    ? (data as any).gold
    : Array.isArray(data)
      ? (data as any[])
      : [];

  const item = list.find((it) => {
    const nameEn = String(it?.name_en ?? it?.symbol ?? "").toUpperCase();
    const name = String(it?.name ?? "");
    return (
      nameEn.includes("18K") ||
      nameEn.includes("GOLD_18") ||
      nameEn === "IR_GOLD_18K" ||
      name.includes("۱۸ عیار") ||
      name.includes("18 عیار")
    );
  });

  if (!item) return null;

  const price = Number(item.price ?? item.value ?? item.p);
  const changePercent = Number(item.change_percent ?? item.changePercent ?? item.drpercent ?? 0);

  if (!Number.isFinite(price) || price <= 0) return null;

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
