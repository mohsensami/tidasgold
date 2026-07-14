import { prisma } from "@/lib/prisma";
import { categoryToSlug, karatToNumber } from "@/lib/mappers";
import type { Product, CategorySlug } from "@/types";
import type { Product as PrismaProduct } from "@prisma/client";

/**
 * منبع واقعی داده محصولات — از جدول Product در Neon Postgres می‌خواند.
 * خروجی این توابع دقیقاً همان شکل type Product (src/types/index.ts) است
 * تا کامپوننت‌های UI (ProductCard, PriceBreakdown, ...) بدون تغییر کار کنند.
 */
function toProduct(p: PrismaProduct): Product {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    category: categoryToSlug[p.category],
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
    // rating/reviewsCount فعلاً در اسکیمای Review محاسبه نشده؛
    // بعداً می‌توان با aggregate روی جدول Review اضافه کرد.
    createdAt: p.createdAt.toISOString(),
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return products.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({ where: { slug } });
  return product ? toProduct(product) : null;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { isFeatured: true },
    orderBy: { createdAt: "desc" },
  });
  return products.map(toProduct);
}

export async function getNewProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { isNew: true },
    orderBy: { createdAt: "desc" },
  });
  return products.map(toProduct);
}

export async function getProductsByCategory(category: CategorySlug): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { category: category.toUpperCase() as any },
  });
  return products.map(toProduct);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { category: product.category.toUpperCase() as any, id: { not: product.id } },
    take: limit,
  });
  return products.map(toProduct);
}
