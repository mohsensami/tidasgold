import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PRODUCTS } from "../src/lib/data/seed-products";
import { numberToKarat } from "../src/lib/mappers";

const prisma = new PrismaClient();

const CATEGORIES_SEED = [
  { slug: "rings", title: "انگشتر", titleEn: "Rings", order: 1, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600" },
  { slug: "necklaces", title: "گردنبند", titleEn: "Necklaces", order: 2, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600" },
  { slug: "bracelets", title: "دستبند", titleEn: "Bracelets", order: 3, image: "https://images.unsplash.com/photo-1602752275849-9c5b3b0f5c5f?q=80&w=600" },
  { slug: "earrings", title: "گوشواره", titleEn: "Earrings", order: 4, image: "https://images.unsplash.com/photo-1620656798579-1984d9e87df7?q=80&w=600" },
  { slug: "sets", title: "سرویس", titleEn: "Sets", order: 5, image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600" },
  { slug: "coins", title: "سکه و شمش", titleEn: "Coins & Bullion", order: 6, image: "https://images.unsplash.com/photo-1610375461369-d613b564f4f4?q=80&w=600" },
];

async function main() {
  console.log("🌱 شروع seed کردن دیتابیس...");

  // ── تنظیمات (قیمت طلا) ──────────────────────────────────────────────
  await prisma.setting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      goldPricePerGram18k: 6_850_000, // این عدد را هر بار که خواستی از پنل/دیتابیس آپدیت کن
      goldPriceChangePercent: 0.8,
    },
  });
  console.log("✅ قیمت طلا تنظیم شد");

  // ── کاربران تستی ────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("123456", 10);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@talagold.ir" },
    update: {},
    create: { name: "کاربر نمونه", email: "demo@talagold.ir", password: passwordHash, role: "CUSTOMER" },
  });
  await prisma.wallet.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: { userId: demoUser.id, balance: 2_000_000 },
  });
  console.log("✅ کاربر نمونه ساخته شد (demo@talagold.ir / 123456) با ۲,۰۰۰,۰۰۰ تومان موجودی کیف پول");

  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@talagold.ir" },
    update: {},
    create: { name: "مدیر فروشگاه", email: "admin@talagold.ir", password: adminPasswordHash, role: "ADMIN" },
  });
  console.log("✅ کاربر ادمین ساخته شد (admin@talagold.ir / admin123)");

  // ── دسته‌بندی‌ها ─────────────────────────────────────────────────────
  const categoryIdBySlug = new Map<string, string>();
  for (const c of CATEGORIES_SEED) {
    const category = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { title: c.title, titleEn: c.titleEn, order: c.order, image: c.image },
      create: c,
    });
    categoryIdBySlug.set(c.slug, category.id);
  }
  console.log(`✅ ${CATEGORIES_SEED.length} دسته‌بندی ساخته/بروزرسانی شد`);

  // ── محصولات ─────────────────────────────────────────────────────────
  for (const p of PRODUCTS) {
    const categoryId = categoryIdBySlug.get(p.category);
    if (!categoryId) {
      console.warn(`⚠️ دسته‌بندی «${p.category}» برای محصول ${p.slug} پیدا نشد، رد شد`);
      continue;
    }
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        description: p.description,
        categoryId,
        karat: numberToKarat[p.karat],
        weightGrams: p.weightGrams,
        wage: p.wage,
        profitPercent: p.profitPercent ?? null,
        taxPercent: p.taxPercent ?? null,
        images: p.images,
        stock: p.stock,
        sizes: p.sizes ?? [],
        isFeatured: p.isFeatured ?? false,
        isNew: p.isNew ?? false,
      },
      create: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        categoryId,
        karat: numberToKarat[p.karat],
        weightGrams: p.weightGrams,
        wage: p.wage,
        profitPercent: p.profitPercent ?? null,
        taxPercent: p.taxPercent ?? null,
        images: p.images,
        stock: p.stock,
        sizes: p.sizes ?? [],
        isFeatured: p.isFeatured ?? false,
        isNew: p.isNew ?? false,
      },
    });
  }
  console.log(`✅ ${PRODUCTS.length} محصول ساخته/بروزرسانی شد`);

  console.log("🌱 seed کامل شد.");
}

main()
  .catch((e) => {
    console.error("❌ خطا در seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
