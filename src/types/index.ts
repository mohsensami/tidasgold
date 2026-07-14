export type Karat = 18 | 21 | 24;

export type CategorySlug =
  | "rings"
  | "necklaces"
  | "bracelets"
  | "earrings"
  | "sets"
  | "coins";

/**
 * ساختار محصول — عیناً منطبق با مدل Product در prisma/schema.prisma
 * تا وقتی دیتابیس وصل شد، فقط منبع داده از این آبجکت استاتیک به
 * prisma.product.findMany() تغییر کند و بقیه کامپوننت‌ها دست‌نخورده بمانند.
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
