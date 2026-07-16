import { NextResponse } from "next/server";
import { ensureFreshGoldPrice } from "@/lib/gold-price-sync";
import { getGoldPrice } from "@/lib/data/settings";

// این روت باید همیشه روی Node.js اجرا شود (نه Edge) چون از Prisma استفاده می‌کند.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * این روت را میدلور بعد از هر بازدید صفحه (به‌صورت fire-and-forget با
 * event.waitUntil) صدا می‌زند تا در پس‌زمینه قیمت را تازه نگه دارد.
 *
 * توجه: مسیر اصلی و تضمین‌شده‌ی تازگی قیمت این نیست — چون این فراخوانی
 * منتظر نتیجه نمی‌ماند و روی مسیرهای api اصلاً اجرا نمی‌شود. تضمین واقعی
 * (به‌خصوص برای لحظه‌ی ثبت سفارش) از طریق await کردن مستقیم
 * ensureFreshGoldPrice() در src/lib/checkout-helpers.ts انجام می‌شود.
 *
 * برای دیباگ: کافی‌ست همین آدرس رو مستقیم تو مرورگر باز کنی (روی سایت
 * دیپلوی‌شده، نه لوکال) — جواب دقیقاً می‌گه الان چه قیمتی تو دیتابیسه،
 * کی آخرین بار sync شده، و اگه fail شده دلیلش چیه (missing-api-key،
 * 18k-not-found، fetch-error، http-XXX).
 */
export async function GET() {
  try {
    const result = await ensureFreshGoldPrice();
    const current = await getGoldPrice();
    return NextResponse.json({ ok: true, ...result, currentGoldPrice: current });
  } catch (err) {
    // این روت هیچ‌وقت نباید صفحه‌ی کاربر رو خراب کنه، فقط لاگ می‌کنیم.
    console.error("[gold-price-sync] خطا:", err);
    return NextResponse.json({ ok: false, error: "sync-failed" }, { status: 200 });
  }
}
