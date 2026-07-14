import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getWalletWithTransactions } from "@/lib/data/wallet";
import { WalletPanel } from "@/components/dashboard/wallet-panel";

export default async function WalletPage({
  searchParams,
}: {
  searchParams: { status?: "success" | "failed" | "error" };
}) {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id as string;
  const wallet = await getWalletWithTransactions(userId);

  return (
    <WalletPanel
      balance={wallet.balance}
      transactions={wallet.transactions.map((t) => ({
        id: t.id,
        type: t.type,
        status: t.status,
        amount: t.amount,
        description: t.description,
        createdAt: t.createdAt.toISOString(),
      }))}
      initialStatus={searchParams.status}
    />
  );
}
