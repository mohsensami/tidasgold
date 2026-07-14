import type { Product } from "@/types";

/**
 * ⚠️ این فایل دیگر توسط UI استفاده نمی‌شود.
 * فقط به‌عنوان «داده اولیه» توسط prisma/seed.ts خوانده می‌شود تا
 * دیتابیس نئون را پر کند. منبع واقعی داده محصولات برای صفحات سایت
 * الان src/lib/data/products.ts است که از Prisma می‌خواند.
 */
export const PRODUCTS: Product[] = [
  {
    id: "p1",
    slug: "ring-eternal-halo",
    title: "انگشتر طلا طرح هاله ابدی",
    description:
      "انگشتر ظریف طلای ۱۸ عیار با نگین‌چینی میکروپاوه، مناسب استفاده روزمره و مجالس. طراحی مینیمال با درخشش بالا.",
    category: "rings",
    karat: 18,
    weightGrams: 2.3,
    wage: 850000,
    images: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200",
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1200",
    ],
    stock: 5,
    sizes: ["5", "6", "7", "8"],
    isFeatured: true,
    isNew: true,
    rating: 4.8,
    reviewsCount: 34,
    createdAt: "2026-06-01T00:00:00Z",
  },
  {
    id: "p2",
    slug: "necklace-venus",
    title: "گردنبند طلا مدل ونوس",
    description:
      "گردنبند زنجیر باریک با آویز قطره‌ای، ساخته‌شده از طلای ۱۸ عیار آبکاری‌شده رودیوم برای درخشش ماندگار.",
    category: "necklaces",
    karat: 18,
    weightGrams: 3.1,
    wage: 1200000,
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200",
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1200",
    ],
    stock: 8,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 51,
    createdAt: "2026-05-20T00:00:00Z",
  },
  {
    id: "p3",
    slug: "bracelet-cuban-slim",
    title: "دستبند طلا زنجیر کوبایی باریک",
    description: "دستبند مردانه و زنانه با بافت کوبایی ظریف، مقاوم و مناسب پوشش روزانه.",
    category: "bracelets",
    karat: 18,
    weightGrams: 4.6,
    wage: 1450000,
    images: [
      "https://images.unsplash.com/photo-1602752275849-9c5b3b0f5c5f?q=80&w=1200",
    ],
    stock: 3,
    isNew: true,
    rating: 4.6,
    reviewsCount: 12,
    createdAt: "2026-07-01T00:00:00Z",
  },
  {
    id: "p4",
    slug: "earring-drop-pearl",
    title: "گوشواره طلا طرح مروارید آویز",
    description: "گوشواره آویزدار با نگین مروارید شل، مناسب مجالس عروسی و رسمی.",
    category: "earrings",
    karat: 18,
    weightGrams: 1.8,
    wage: 690000,
    images: [
      "https://images.unsplash.com/photo-1620656798579-1984d9e87df7?q=80&w=1200",
    ],
    stock: 10,
    rating: 4.7,
    reviewsCount: 22,
    createdAt: "2026-04-15T00:00:00Z",
  },
  {
    id: "p5",
    slug: "set-royal-bloom",
    title: "سرویس طلا رویال بلوم (گردنبند + گوشواره + انگشتر)",
    description: "سرویس کامل سه‌تکه با طرح گل، ست هماهنگ برای مراسم عروسی و نامزدی.",
    category: "sets",
    karat: 18,
    weightGrams: 9.4,
    wage: 3200000,
    profitPercent: 8,
    images: [
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=1200",
    ],
    stock: 2,
    isFeatured: true,
    rating: 5,
    reviewsCount: 8,
    createdAt: "2026-06-25T00:00:00Z",
  },
  {
    id: "p6",
    slug: "coin-bahar-azadi-half",
    title: "نیم‌سکه بهار آزادی",
    description: "نیم‌سکه طلای ۲۱ عیار ضرب بانک مرکزی، مناسب سرمایه‌گذاری و هدیه.",
    category: "coins",
    karat: 21,
    weightGrams: 4.09,
    wage: 0,
    profitPercent: 3,
    taxPercent: 0,
    images: [
      "https://images.unsplash.com/photo-1610375461369-d613b564f4f4?q=80&w=1200",
    ],
    stock: 15,
    rating: 4.9,
    reviewsCount: 63,
    createdAt: "2026-03-10T00:00:00Z",
  },
  {
    id: "p7",
    slug: "ring-classic-band",
    title: "حلقه ازدواج کلاسیک",
    description: "حلقه ساده و شیک طلای ۱۸ عیار، مناسب زوجین، قابل حکاکی نام.",
    category: "rings",
    karat: 18,
    weightGrams: 3.0,
    wage: 950000,
    images: [
      "https://images.unsplash.com/photo-1587467512961-120760940315?q=80&w=1200",
    ],
    stock: 20,
    sizes: ["6", "7", "8", "9", "10"],
    rating: 4.8,
    reviewsCount: 40,
    createdAt: "2026-02-01T00:00:00Z",
  },
  {
    id: "p8",
    slug: "bracelet-charm-heart",
    title: "دستبند طلا آویز قلب",
    description: "دستبند زنانه با پلاک قلب کوچک، هدیه‌ای دلنشین برای عزیزان.",
    category: "bracelets",
    karat: 18,
    weightGrams: 2.1,
    wage: 780000,
    images: [
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1200",
    ],
    stock: 6,
    isNew: true,
    rating: 4.5,
    reviewsCount: 9,
    createdAt: "2026-07-05T00:00:00Z",
  },
];

export function getAllProducts() {
  return PRODUCTS;
}

export function getProductBySlug(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export function getFeaturedProducts() {
  return PRODUCTS.filter((p) => p.isFeatured);
}

export function getNewProducts() {
  return PRODUCTS.filter((p) => p.isNew);
}

export function getProductsByCategory(category: string) {
  return PRODUCTS.filter((p) => p.category === category);
}

export function getRelatedProducts(product: Product, limit = 4) {
  return PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, limit);
}
