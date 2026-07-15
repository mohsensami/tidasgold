"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withRetry, DatabaseUnavailableError } from "@/lib/db-retry";
import { requireAdminSession } from "@/lib/require-admin";
import { productSchema, type ProductInput } from "@/lib/validations/product";
import { numberToKarat } from "@/lib/mappers";

type ActionResult = { error?: string; id?: string };

/**
 * افزودن، ویرایش و حذف محصول — به‌جای روت API از Server Action استفاده
 * می‌شود. فرم (src/components/dashboard/product-form.tsx) این توابع را
 * مستقیم صدا می‌زند، بدون نیاز به fetch جداگانه.
 */

function toPrismaData(data: ProductInput) {
  return {
    slug: data.slug,
    title: data.title,
    description: data.description,
    categoryId: data.categoryId,
    karat: numberToKarat[data.karat as 18 | 21 | 24],
    weightGrams: data.weightGrams,
    wage: data.wage,
    profitPercent: data.profitPercent,
    taxPercent: data.taxPercent,
    stock: data.stock,
    images: data.images,
    sizes: data.sizes ?? [],
    isFeatured: data.isFeatured ?? false,
    isNew: data.isNew ?? false,
  };
}

export async function createProduct(input: ProductInput): Promise<ActionResult> {
  const session = await requireAdminSession();
  if (!session) return { error: "دسترسی غیرمجاز" };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "اطلاعات فرم نامعتبر است" };
  }

  try {
    const product = await withRetry(() => prisma.product.create({ data: toPrismaData(parsed.data) }));
    revalidatePath("/dashboard/products");
    return { id: product.id };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "این اسلاگ قبلاً استفاده شده، اسلاگ دیگری انتخاب کنید" };
    }
    const isDbError = err instanceof DatabaseUnavailableError;
    return { error: isDbError ? err.message : "خطا در ساخت محصول" };
  }
}

export async function updateProduct(id: string, input: ProductInput): Promise<ActionResult> {
  const session = await requireAdminSession();
  if (!session) return { error: "دسترسی غیرمجاز" };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "اطلاعات فرم نامعتبر است" };
  }

  try {
    await withRetry(() => prisma.product.update({ where: { id }, data: toPrismaData(parsed.data) }));
    revalidatePath("/dashboard/products");
    return { id };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return { error: "این اسلاگ قبلاً استفاده شده، اسلاگ دیگری انتخاب کنید" };
      }
      if (err.code === "P2025") {
        return { error: "محصول پیدا نشد" };
      }
    }
    const isDbError = err instanceof DatabaseUnavailableError;
    return { error: isDbError ? err.message : "خطا در ویرایش محصول" };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const session = await requireAdminSession();
  if (!session) return { error: "دسترسی غیرمجاز" };

  try {
    await withRetry(() => prisma.product.delete({ where: { id } }));
    revalidatePath("/dashboard/products");
    return {};
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") return { error: "محصول پیدا نشد" };
      if (err.code === "P2003") {
        return { error: "این محصول در سفارش‌ها یا سبدهای خرید استفاده شده و قابل حذف نیست" };
      }
    }
    const isDbError = err instanceof DatabaseUnavailableError;
    return { error: isDbError ? err.message : "خطا در حذف محصول" };
  }
}
