import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRetry, DatabaseUnavailableError } from "@/lib/db-retry";
import { addressSchema } from "@/lib/validations/checkout";
import { buildOrderPricing } from "@/lib/checkout-helpers";
import { getOrCreateWallet } from "@/lib/data/wallet";
import type { CartItem } from "@/types";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) {
    return NextResponse.json({ error: "برای ثبت سفارش ابتدا وارد حساب کاربری شوید" }, { status: 401 });
  }

  const body = await req.json();
  const parsedAddress = addressSchema.safeParse(body.address);
  const items = body.items as CartItem[];

  if (!parsedAddress.success) {
    return NextResponse.json({ error: "آدرس وارد شده معتبر نیست" }, { status: 400 });
  }
  if (!items?.length) {
    return NextResponse.json({ error: "سبد خرید خالی است" }, { status: 400 });
  }

  try {
    const { orderItemsData, shippingCost, finalAmount } = await buildOrderPricing(items);
    const wallet = await getOrCreateWallet(userId);

    if (wallet.balance < finalAmount) {
      return NextResponse.json(
        { error: "موجودی کیف پول کافی نیست، لطفاً ابتدا کیف پول را شارژ کنید یا با زرین‌پال پرداخت کنید" },
        { status: 400 }
      );
    }

    const order = await withRetry(() =>
      prisma.$transaction(async (tx) => {
        // دوباره داخل تراکنش چک می‌کنیم که موجودی حین این چند میلی‌ثانیه عوض نشده باشد
        const freshWallet = await tx.wallet.findUniqueOrThrow({ where: { id: wallet.id } });
        if (freshWallet.balance < finalAmount) {
          throw new Error("موجودی کیف پول کافی نیست");
        }

        const created = await tx.order.create({
          data: {
            user: { connect: { id: userId } },
            totalAmount: finalAmount,
            shippingCost,
            status: "PROCESSING",
            address: { create: { userId, ...parsedAddress.data } },
            items: { create: orderItemsData },
          },
        });

        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { decrement: finalAmount } },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: "PURCHASE",
            status: "SUCCESS",
            amount: finalAmount,
            description: `پرداخت سفارش #${created.id.slice(-8)} با کیف پول`,
          },
        });

        for (const item of orderItemsData) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        return created;
      })
    );

    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    const isDbError = err instanceof DatabaseUnavailableError;
    return NextResponse.json(
      { error: isDbError ? err.message : err instanceof Error ? err.message : "خطا در ثبت سفارش" },
      { status: isDbError ? 503 : 500 }
    );
  }
}
