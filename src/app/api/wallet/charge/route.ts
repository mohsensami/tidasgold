import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRetry, DatabaseUnavailableError } from "@/lib/db-retry";
import { getOrCreateWallet } from "@/lib/data/wallet";
import { requestPayment, ZarinpalError } from "@/lib/zarinpal";
import { WALLET, SITE } from "@/lib/constants";
import { z } from "zod";

const chargeSchema = z.object({
  amount: z
    .number()
    .int()
    .min(WALLET.minCharge, `حداقل مبلغ شارژ ${WALLET.minCharge.toLocaleString("fa-IR")} تومان است`)
    .max(WALLET.maxCharge, `حداکثر مبلغ شارژ ${WALLET.maxCharge.toLocaleString("fa-IR")} تومان است`),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) {
    return NextResponse.json({ error: "برای شارژ کیف پول ابتدا وارد حساب کاربری شوید" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = chargeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }
  const { amount } = parsed.data;

  try {
    const wallet = await getOrCreateWallet(userId);

    // یک تراکنش pending می‌سازیم تا وقتی کاربر از درگاه برگشت، از روی authority پیداش کنیم
    const transaction = await withRetry(() =>
      prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "DEPOSIT",
          status: "PENDING",
          amount,
          description: "شارژ کیف پول",
        },
      })
    );

    const callbackUrl = `${SITE.url}/api/wallet/verify`;

    const { authority, paymentUrl } = await requestPayment({
      amountToman: amount,
      description: `شارژ کیف پول ${SITE.name}`,
      callbackUrl,
      email: session?.user?.email ?? undefined,
    });

    await withRetry(() =>
      prisma.walletTransaction.update({
        where: { id: transaction.id },
        data: { zarinpalAuthority: authority },
      })
    );

    return NextResponse.json({ paymentUrl });
  } catch (err) {
    if (err instanceof ZarinpalError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    const isDbError = err instanceof DatabaseUnavailableError;
    return NextResponse.json(
      { error: isDbError ? err.message : "خطا در شروع فرآیند شارژ" },
      { status: isDbError ? 503 : 500 }
    );
  }
}
