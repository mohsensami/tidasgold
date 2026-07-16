import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRetry, DatabaseUnavailableError } from "@/lib/db-retry";
import { z } from "zod";

const bodySchema = z.object({ productId: z.string().min(1) });

async function requireUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.id as string | undefined;
}

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "برای مشاهده‌ی علاقه‌مندی‌ها ابتدا وارد حساب کاربری شوید" }, { status: 401 });
  }

  try {
    const rows = await withRetry(() =>
      prisma.wishlistItem.findMany({ where: { userId }, select: { productId: true } })
    );
    return NextResponse.json({ productIds: rows.map((r) => r.productId) });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: "دیتابیس موقتاً در دسترس نیست" }, { status: 503 });
    }
    throw err;
  }
}

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "برای افزودن به علاقه‌مندی‌ها ابتدا وارد حساب کاربری شوید" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "شناسه محصول نامعتبر است" }, { status: 400 });
  }

  try {
    await withRetry(() =>
      prisma.wishlistItem.upsert({
        where: { userId_productId: { userId, productId: parsed.data.productId } },
        update: {},
        create: { userId, productId: parsed.data.productId },
      })
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: "دیتابیس موقتاً در دسترس نیست" }, { status: 503 });
    }
    throw err;
  }
}

export async function DELETE(req: Request) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "برای این کار ابتدا وارد حساب کاربری شوید" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "شناسه محصول نامعتبر است" }, { status: 400 });
  }

  try {
    await withRetry(() =>
      prisma.wishlistItem.deleteMany({ where: { userId, productId: parsed.data.productId } })
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: "دیتابیس موقتاً در دسترس نیست" }, { status: 503 });
    }
    throw err;
  }
}
