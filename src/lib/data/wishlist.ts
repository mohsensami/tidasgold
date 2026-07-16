import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/db-retry";

export async function getUserWishlistProductIds(userId: string): Promise<string[]> {
  const rows = await withRetry(() =>
    prisma.wishlistItem.findMany({ where: { userId }, select: { productId: true }, orderBy: { createdAt: "desc" } })
  );
  return rows.map((r) => r.productId);
}

