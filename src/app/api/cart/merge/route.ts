import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRetry, DatabaseUnavailableError } from "@/lib/db-retry";
import type { CartItem } from "@/types";

/**
 * وقتی کاربری که سبد خرید مهمان (localStorage) دارد لاگین می‌کند، این روت
 * آیتم‌های همان سبد را با سبد ذخیره‌شده‌اش در دیتابیس جمع می‌زند (نه جایگزین)
 * تا هیچ‌چیز از دست نرود، و لیست نهایی ادغام‌شده را برمی‌گرداند.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "ابتدا وارد حساب کاربری شوید" }, { status: 401 });

  const { items: guestItems } = (await req.json()) as { items: CartItem[] };

  try {
    const cart = await withRetry(() =>
      prisma.cart.upsert({
        where: { userId },
        update: {},
        create: { userId },
        include: { items: true },
      })
    );

    for (const gi of guestItems) {
      const existing = cart.items.find((i) => i.productId === gi.productId && i.size === gi.size);
      await withRetry(() =>
        existing
          ? prisma.cartItem.update({
              where: { id: existing.id },
              data: { quantity: existing.quantity + gi.quantity },
            })
          : prisma.cartItem.create({
              data: { cartId: cart.id, productId: gi.productId, quantity: gi.quantity, size: gi.size },
            })
      );
    }

    const merged = await withRetry(() =>
      prisma.cartItem.findMany({ where: { cartId: cart.id } })
    );
    const items: CartItem[] = merged.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      size: i.size ?? undefined,
    }));
    return NextResponse.json({ items });
  } catch (err) {
    const isDbError = err instanceof DatabaseUnavailableError;
    return NextResponse.json(
      { error: isDbError ? err.message : "خطای غیرمنتظره" },
      { status: 503 }
    );
  }
}
