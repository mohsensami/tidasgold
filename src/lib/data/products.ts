import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/db-retry";
import { karatToNumber } from "@/lib/mappers";
import type { Product } from "@/types";
import type { Product as PrismaProduct, Category as PrismaCategory } from "@prisma/client";

/**
 * منبع واقعی داده محصولات — از جدول Product در Neon Postgres می‌خواند.
 * هر کوئری با withRetry پوشیده شده تا کندی/قطعی لحظه‌ای دیتابیس با چند بار
 * تلاش مجدد جبران شود (به src/lib/db-retry.ts نگاه کن). اگر همه تلاش‌ها
 * شکست بخورد، خطا بالا می‌رود و نزدیک‌ترین error.tsx صفحه «تلاش مجدد» را
 * نشان می‌دهد.
 */
function toProduct(p: PrismaProduct & { category: PrismaCategory }): Product {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    category: p.category.slug,
    karat: karatToNumber[p.karat],
    weightGrams: p.weightGrams,
    wage: p.wage,
    profitPercent: p.profitPercent ?? undefined,
    taxPercent: p.taxPercent ?? undefined,
    images: p.images,
    stock: p.stock,
    sizes: p.sizes.length ? p.sizes : undefined,
    isFeatured: p.isFeatured,
    isNew: p.isNew,
    createdAt: p.createdAt.toISOString(),
  };
}

// cache() از React باعث می‌شود در یک درخواست (request) واحد، چند بار
// صدا زدن همین تابع فقط یک بار واقعاً به دیتابیس بزند (request memoization)
export const getAllProducts = cache(async (): Promise<Product[]> => {
  const products = await withRetry(() =>
    prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } })
  );
  return products.map(toProduct);
});

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const product = await withRetry(() =>
    prisma.product.findUnique({ where: { slug }, include: { category: true } })
  );
  return product ? toProduct(product) : null;
});

export const getFeaturedProducts = cache(async (): Promise<Product[]> => {
  const products = await withRetry(() =>
    prisma.product.findMany({
      where: { isFeatured: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    })
  );
  return products.map(toProduct);
});

export const getNewProducts = cache(async (): Promise<Product[]> => {
  const products = await withRetry(() =>
    prisma.product.findMany({
      where: { isNew: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    })
  );
  return products.map(toProduct);
});

export async function getProductsByCategorySlug(categorySlug: string): Promise<Product[]> {
  const products = await withRetry(() =>
    prisma.product.findMany({
      where: { category: { slug: categorySlug } },
      include: { category: true },
    })
  );
  return products.map(toProduct);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const products = await withRetry(() =>
    prisma.product.findMany({
      where: { category: { slug: product.category }, id: { not: product.id } },
      include: { category: true },
      take: limit,
    })
  );
  return products.map(toProduct);
}
