import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateWallet } from "@/lib/data/wallet";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "ابتدا وارد حساب کاربری شوید" }, { status: 401 });

  const wallet = await getOrCreateWallet(userId);
  return NextResponse.json({ balance: wallet.balance });
}
