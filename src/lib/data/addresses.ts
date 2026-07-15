import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/db-retry";

export async function getUserAddresses(userId: string) {
  return withRetry(() =>
    prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { id: "desc" }],
    })
  );
}
