import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateGoldPrice } from "@/lib/data/settings";
import { withRetry } from "@/lib/db-retry";

// این روت باید همیشه روی Node.js اجرا شود (نه Edge) چون از Prisma استفاده می‌کند.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

/**
 * جلوگیری از فراخوانی هم‌زمان چند‌باره‌ی brsapi وقتی چند ریکوئست همزمان
 * به سایت می‌رسند و همه فکر می‌کنند قیمت «قدیمی» شده.
 * (این فقط داخل یک instance سرور معتبر است؛ چک updatedAt در دیتابیس
 * تضمین اصلی جلوگیری از درخواست‌های اضافه‌ست، این فقط یک لایه‌ی کمکیه.)
 */
let syncInFlight: Promise<{ synced: boolean; reason?: string }> | null = null;

export async function GET() {
  try {
    const result = await (syncInFlight ??= syncGoldPriceIfStale().finally(() => {
      syncInFlight = null;
    }));
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    // این روت هیچ‌وقت نباید صفحه‌ی کاربر رو خراب کنه، فقط لاگ می‌کنیم.
    console.error("[gold-price-sync] خطا:", err);
    return NextResponse.json({ ok: false, error: "sync-failed" }, { status: 200 });
  }
}

async function syncGoldPriceIfStale(): Promise<{ synced: boolean; reason?: string }> {
  const setting = await withRetry(() =>
    prisma.setting.findUnique({ where: { id: "singleton" } })
  );

  const isStale =
    !setting || Date.now() - new Date(setting.updatedAt).getTime() > FIVE_MINUTES_MS;

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

  await updateGoldPrice(gold18k.pricePerGram, gold18k.changePercent);
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
function extractGold18k(data: unknown): { pricePerGram: number; changePercent: number } | null {
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

  return { pricePerGram: Math.round(price), changePercent: Number.isFinite(changePercent) ? changePercent : 0 };
}
