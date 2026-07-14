import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PRODUCTS } from "../src/lib/data/seed-products";
import { slugToCategory, numberToKarat } from "../src/lib/mappers";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 شروع seed کردن دیتابیس...");

  // کاربر نمونه برای تست ورود
  const passwordHash = await bcrypt.hash("123456", 10);
  await prisma.user.upsert({
    where: { email: "demo@talagold.ir" },
    update: {},
    create: {
      name: "کاربر نمونه",
      email: "demo@talagold.ir",
      password: passwordHash,
      role: "CUSTOMER",
    },
  });
  console.log("✅ کاربر نمونه ساخته شد (demo@talagold.ir / 123456)");

  // ادمین نمونه برای تست پنل مدیریت بعدی
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@talagold.ir" },
    update: {},
    create: {
      name: "مدیر فروشگاه",
      email: "admin@talagold.ir",
      password: adminPasswordHash,
      role: "ADMIN",
    },
  });
  console.log("✅ کاربر ادمین ساخته شد (admin@talagold.ir / admin123)");

  // محصولات
  for (const p of PRODUCTS) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        description: p.description,
        category: slugToCategory[p.category],
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
        category: slugToCategory[p.category],
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
