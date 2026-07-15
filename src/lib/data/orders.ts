import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/db-retry";

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
