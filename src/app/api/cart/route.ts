import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRetry, DatabaseUnavailableError } from "@/lib/db-retry";
import type { CartItem } from "@/types";

async function getOrCreateCart(userId: string) {
  return withRetry(() =>
    prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: { items: true },
    })
  );
}

// گرفتن سبد خرید ذخیره‌شده کاربر لاگین‌کرده
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ items: [] });

  try {
    const cart = await getOrCreateCart(userId);
    const items: CartItem[] = cart.items.map((i) => ({
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

// جایگزینی کامل سبد خرید کاربر با لیست جدید (هر بار که سبد در کلاینت تغییر می‌کند)
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: "ابتدا وارد حساب کاربری شوید" }, { status: 401 });

  const { items } = (await req.json()) as { items: CartItem[] };

  try {
    const cart = await getOrCreateCart(userId);
    await withRetry(() =>
      prisma.$transaction([
        prisma.cartItem.deleteMany({ where: { cartId: cart.id } }),
        ...items.map((i) =>
          prisma.cartItem.create({
            data: { cartId: cart.id, productId: i.productId, quantity: i.quantity, size: i.size },
          })
        ),
      ])
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    const isDbError = err instanceof DatabaseUnavailableError;
    return NextResponse.json(
      { error: isDbError ? err.message : "خطای غیرمنتظره" },
      { status: 503 }
    );
  }
}
