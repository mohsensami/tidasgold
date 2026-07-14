export type Karat = 18 | 21 | 24;

/** اسلاگ دسته‌بندی — دیگر union ثابت نیست چون دسته‌بندی‌ها از دیتابیس می‌آیند و قابل افزودن هستند */
export type CategorySlug = string;

export interface Category {
  id: string;
  slug: string;
  title: string;
  titleEn?: string | null;
  image?: string | null;
  order: number;
}

/**
 * ساختار محصول — عیناً منطبق با مدل Product در prisma/schema.prisma.
 * منبع واقعی این داده از prisma.product.findMany() است (src/lib/data/products.ts).
 */
export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: CategorySlug;
  karat: Karat;
  weightGrams: number; // وزن به گرم
  wage: number; // اجرت ساخت به تومان
  profitPercent?: number; // اگر ست نشود از PRICE_FORMULA_DEFAULTS استفاده می‌شود
  taxPercent?: number;
  images: string[];
  stock: number;
  sizes?: string[]; // مثلاً سایز انگشتر
  isFeatured?: boolean;
  isNew?: boolean;
  rating?: number;
  reviewsCount?: number;
  createdAt: string;
  /** فقط توسط /api/products پر می‌شود: قیمت نهایی محاسبه‌شده با قیمت لحظه‌ای طلا */
  finalPrice?: number;
}

export interface GoldPrice {
  pricePerGram18k: number;
  changePercent: number;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  size?: string;
}

export interface Address {
  id: string;
  fullName: string;
  province: string;
  city: string;
  addressLine: string;
  postalCode: string;
  phone: string;
}

export type OrderStatus =
  | "pending_payment"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  address: Address;
  createdAt: string;
}
