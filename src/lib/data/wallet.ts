import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/db-retry";

export async function getOrCreateWallet(userId: string) {
  return withRetry(() =>
    prisma.wallet.upsert({
      where: { userId },
      update: {},
      create: { userId },
    })
  );
}

export async function getWalletWithTransactions(userId: string) {
  const wallet = await withRetry(() =>
    prisma.wallet.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: {
        transactions: { orderBy: { createdAt: "desc" }, take: 30 },
      },
    })
  );
  return wallet;
}
