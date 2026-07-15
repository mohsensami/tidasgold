"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRetry, DatabaseUnavailableError } from "@/lib/db-retry";
import { addressBookSchema, type AddressBookInput } from "@/lib/validations/address";
import { Prisma } from "@prisma/client";

type ActionResult = { error?: string; id?: string };

async function requireUserId() {
  const session = await getServerSession(authOptions);
  return ((session?.user as any)?.id as string | undefined) ?? null;
}

export async function createAddress(input: AddressBookInput): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { error: "ابتدا وارد حساب کاربری شوید" };

  const parsed = addressBookSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "اطلاعات آدرس نامعتبر است" };

  const { isDefault, ...addressData } = parsed.data;

  try {
    const address = await withRetry(() =>
      prisma.$transaction(async (tx) => {
        if (isDefault) {
          await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
        }
        return tx.address.create({ data: { userId, ...addressData, isDefault: !!isDefault } });
      })
    );
    revalidatePath("/dashboard/addresses");
    return { id: address.id };
  } catch (err) {
    const isDbError = err instanceof DatabaseUnavailableError;
    return { error: isDbError ? err.message : "خطا در ثبت آدرس" };
  }
}

export async function updateAddress(id: string, input: AddressBookInput): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { error: "ابتدا وارد حساب کاربری شوید" };

  const parsed = addressBookSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "اطلاعات آدرس نامعتبر است" };

  const { isDefault, ...addressData } = parsed.data;

  try {
    await withRetry(() =>
      prisma.$transaction(async (tx) => {
        const existing = await tx.address.findFirst({ where: { id, userId } });
        if (!existing) throw new Error("آدرس پیدا نشد");

        if (isDefault) {
          await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
        }
        await tx.address.update({ where: { id }, data: { ...addressData, isDefault: !!isDefault } });
      })
    );
    revalidatePath("/dashboard/addresses");
    return { id };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return { error: "آدرس پیدا نشد" };
    }
    const isDbError = err instanceof DatabaseUnavailableError;
    return { error: isDbError ? err.message : err instanceof Error ? err.message : "خطا در ویرایش آدرس" };
  }
}

export async function deleteAddress(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { error: "ابتدا وارد حساب کاربری شوید" };

  try {
    const existing = await withRetry(() =>
      prisma.address.findFirst({ where: { id, userId }, include: { _count: { select: { orders: true } } } })
    );
    if (!existing) return { error: "آدرس پیدا نشد" };
    if (existing._count.orders > 0) {
      return { error: "این آدرس در سفارش‌های قبلی استفاده شده و قابل حذف نیست" };
    }

    await withRetry(() => prisma.address.delete({ where: { id } }));
    revalidatePath("/dashboard/addresses");
    return {};
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return { error: "این آدرس در سفارش‌های قبلی استفاده شده و قابل حذف نیست" };
    }
    const isDbError = err instanceof DatabaseUnavailableError;
    return { error: isDbError ? err.message : "خطا در حذف آدرس" };
  }
}

export async function setDefaultAddress(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { error: "ابتدا وارد حساب کاربری شوید" };

  try {
    const existing = await withRetry(() => prisma.address.findFirst({ where: { id, userId } }));
    if (!existing) return { error: "آدرس پیدا نشد" };

    await withRetry(() =>
      prisma.$transaction([
        prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
        prisma.address.update({ where: { id }, data: { isDefault: true } }),
      ])
    );
    revalidatePath("/dashboard/addresses");
    return {};
  } catch (err) {
    const isDbError = err instanceof DatabaseUnavailableError;
    return { error: isDbError ? err.message : "خطا در تنظیم آدرس پیش‌فرض" };
  }
}
