import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/db-retry";
import type { Category } from "@/types";
import type { Category as PrismaCategory } from "@prisma/client";

function toCategory(c: PrismaCategory): Category {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    titleEn: c.titleEn,
    image: c.image,
    order: c.order,
  };
}

export async function getAllCategories(): Promise<Category[]> {
  const categories = await withRetry(() =>
    prisma.category.findMany({ orderBy: { order: "asc" } })
  );
  return categories.map(toCategory);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const category = await withRetry(() => prisma.category.findUnique({ where: { slug } }));
  return category ? toCategory(category) : null;
}
