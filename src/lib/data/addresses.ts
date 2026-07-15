import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/db-retry";

/**
 * فقط آدرس‌هایی که کاربر از طریق «آدرس‌های من» (/dashboard/addresses) خودش
 * ساخته را برمی‌گرداند — نه آدرس‌های یک‌بارمصرفی که هنگام هر تسویه‌حساب
 * (checkout) به‌عنوان اسنپ‌شاتِ سفارش ساخته می‌شوند. آن آدرس‌ها عمداً به
 * سفارش متصل و غیرقابل‌حذف هستند تا تاریخچه‌ی سفارش تغییر نکند؛ نمایش‌شان
 * در این لیست فقط باعث خطای «Foreign key constraint» موقع حذف می‌شد.
 */
export async function getUserAddresses(userId: string) {
  return withRetry(() =>
    prisma.address.findMany({
      where: { userId, orders: { none: {} } },
      orderBy: [{ isDefault: "desc" }, { id: "desc" }],
    })
  );
}
