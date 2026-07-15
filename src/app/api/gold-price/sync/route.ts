import { NextResponse } from "next/server";
import { ensureFreshGoldPrice } from "@/lib/gold-price-sync";

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
 */
export async function GET() {
  try {
    const result = await ensureFreshGoldPrice();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    // این روت هیچ‌وقت نباید صفحه‌ی کاربر رو خراب کنه، فقط لاگ می‌کنیم.
    console.error("[gold-price-sync] خطا:", err);
    return NextResponse.json({ ok: false, error: "sync-failed" }, { status: 200 });
  }
}
