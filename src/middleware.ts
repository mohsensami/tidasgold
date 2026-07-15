import { NextResponse, type NextRequest, type NextFetchEvent } from "next/server";

/**
 * روی هر درخواستی به یک صفحه از سایت، بدون اینکه لود صفحه رو کند کنه
 * (event.waitUntil یعنی «بعد از فرستادن پاسخ به کاربر، این کار رو هم انجام بده»)،
 * یک درخواست به /api/gold-price/sync می‌زنیم. اون روت خودش چک می‌کنه که
 * آیا قیمت طلا بیشتر از ۵ دقیقه‌ست آپدیت نشده یا نه؛ اگه نشده، هیچ‌کاری
 * نمی‌کنه (پس این میدلور فشار اضافه به brsapi یا دیتابیس نمی‌زنه).
 */
export function middleware(request: NextRequest, event: NextFetchEvent) {
  const syncUrl = new URL("/api/gold-price/sync", request.url);

  event.waitUntil(
    fetch(syncUrl, { headers: { "x-triggered-by": "middleware" } }).catch((err) => {
      console.error("[gold-price-sync] فراخوانی از میدلور شکست خورد:", err);
    })
  );

  return NextResponse.next();
}

export const config = {
  matcher: [
    // همه‌ی مسیرها به جز api، فایل‌های استاتیک نکست، و فایل‌های عمومی (تصویر/فونت/آیکن و ...)
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)$).*)",
  ],
};
