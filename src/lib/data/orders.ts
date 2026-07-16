import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/db-retry";
import type { Prisma } from "@prisma/client";

export async function getUserOrders(userId: string) {
  const orders = await withRetry(() =>
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: { select: { title: true, images: true, slug: true } } } },
      },
    })
  );
  return orders;
}

/**
 * فقط سفارش‌هایی که واقعاً پرداختشان موفق بوده را برمی‌گرداند — یعنی
 * PENDING_PAYMENT (هنوز پرداخت نشده) و CANCELLED (پرداخت ناموفق/لغوشده)
 * را کنار می‌گذاریم. برای پنل مدیریت سفارشات ادمین استفاده می‌شود.
 */
const PAID_STATUSES: Prisma.OrderWhereInput["status"] = {
  in: ["PROCESSING", "SHIPPED", "DELIVERED"],
};

export async function getPaidOrdersForAdmin() {
  const orders = await withRetry(() =>
    prisma.order.findMany({
      where: { status: PAID_STATUSES },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        address: true,
        items: { include: { product: { select: { title: true, images: true, slug: true } } } },
      },
    })
  );
  return orders;
}
