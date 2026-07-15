/**
 * این فایل فقط شامل «تنظیمات ثابت سایت» است (نام فروشگاه، آدرس، گزینه‌های
 * مرتب‌سازی و ...) — نه داده‌های تجاری. قیمت طلا و دسته‌بندی‌ها دیگر اینجا
 * نیستند چون کاملاً داینامیک و از دیتابیس خوانده می‌شوند:
 *   - قیمت طلا  → src/lib/data/settings.ts  (جدول Setting)
 *   - دسته‌بندی‌ها → src/lib/data/categories.ts (جدول Category)
 */

export const PRICE_FORMULA_DEFAULTS = {
  profitPercent: 7, // درصد سود فروشنده (پیش‌فرض وقتی روی محصول ست نشده)
  taxPercent: 9, // مالیات بر ارزش افزوده روی اجرت + سود
} as const;

export const SITE = {
  name: "طلاگستر",
  nameEn: "TalaGold",
  description:
    "فروشگاه آنلاین طلا و جواهر — خرید امن گردنبند، دستبند، انگشتر و گوشواره با گارانتی اصالت و قیمت لحظه‌ای طلا",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  phone: "021-91234567",
  supportPhone: "0912-000-0000",
  address: "تهران، خیابان طلافروش‌ها، پاساژ نگین، طبقه دوم",
  instagram: "https://instagram.com/talagold",
  workHours: "شنبه تا پنج‌شنبه، ۱۰ تا ۲۰",
} as const;

export const SHIPPING = {
  freeShippingThreshold: 5_000_000, // تومان
  standardCost: 150_000,
  expressCost: 350_000,
} as const;

export const WALLET = {
  minCharge: 50_000, // تومان
  maxCharge: 50_000_000, // تومان
  quickAmounts: [100_000, 500_000, 1_000_000, 5_000_000],
} as const;

export const KARAT_OPTIONS = [18, 21, 24] as const;

export const SORT_OPTIONS = [
  { value: "newest", label: "جدیدترین" },
  { value: "price-asc", label: "ارزان‌ترین" },
  { value: "price-desc", label: "گران‌ترین" },
  { value: "weight-asc", label: "کم‌وزن‌ترین" },
  { value: "popular", label: "پرفروش‌ترین" },
] as const;
