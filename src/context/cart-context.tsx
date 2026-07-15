"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
import type { CartItem, Product } from "@/types";
import { toast } from "sonner";

interface CartContextValue {
  items: CartItem[];
  products: Product[]; // کش محصولات گرفته‌شده از /api/products
  productsError: boolean; // اگه بعد از چند بار تلاش هم دیتابیس جواب نداد
  productsLoading: boolean;
  retryLoadProducts: () => void;
  addItem: (productId: string, quantity?: number, size?: string) => void;
  removeItem: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  getProduct: (productId: string) => Product | undefined;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

// سبدِ مهمان (قبل از ورود) فقط با این کلید در localStorage نگه داشته می‌شود.
// عمداً کلید سبدِ کاربرِ لاگین‌کرده را در localStorage ذخیره نمی‌کنیم؛ وگرنه
// روی یک مرورگر مشترک، بعد از خروج، سبدِ حساب قبلی به‌عنوان «سبد مهمان» به
// حساب کاربریِ بعدی که وارد می‌شود merge می‌شود و باعث می‌شود سبد خرید انگار
// خودش عوض می‌شود یا بین ورود/خروج پایدار نمی‌ماند.
const GUEST_STORAGE_KEY = "talagold-cart-guest";

// چند بار با فاصله‌زمانی افزایشی تلاش کن؛ برای درخواست‌های fetch سمت کلاینت
// (مشابه src/lib/db-retry.ts که سمت سرور استفاده می‌شود)
async function fetchWithRetry(url: string, init?: RequestInit, attempts = 3): Promise<Response> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      lastErr = new Error(`status ${res.status}`);
    } catch (err) {
      lastErr = err;
    }
    if (i < attempts - 1) await new Promise((r) => setTimeout(r, 500 * Math.pow(2, i)));
  }
  throw lastErr;
}

function readGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(false);
  // وقتی true شود یعنی سبد خرید از منبع درست (localStorage مهمان یا سبد
  // merge‌شده‌ی دیتابیس) خوانده شده و از این به بعد تغییرات را می‌شود ذخیره کرد.
  const [ready, setReady] = useState(false);
  const prevStatusRef = useRef<"loading" | "authenticated" | "unauthenticated">("loading");

  function loadProducts() {
    setProductsLoading(true);
    setProductsError(false);
    fetchWithRetry("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => {
        setProductsError(true);
        toast.error("دریافت اطلاعات محصولات با مشکل مواجه شد");
      })
      .finally(() => setProductsLoading(false));
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // مدیریت سبد خرید بر اساس وضعیت ورود کاربر.
  // فقط وقتی وضعیت واقعاً مشخص شود (نه در حالت loading) اجرا می‌شود، و فقط
  // یک‌بار برای هر انتقالِ واقعیِ وضعیت (نه رندرهای تکراری با همان وضعیت).
  useEffect(() => {
    if (status === "loading") return;
    if (prevStatusRef.current === status) return;
    const cameFromLoading = prevStatusRef.current === "loading";
    prevStatusRef.current = status;

    if (status === "authenticated") {
      // کاربر تازه لاگین کرده (یا صفحه با سشن معتبر لود شده): هر سبدِ مهمانِ
      // احتمالی را با سبدِ دیتابیسِ همین کاربر merge کن. اگر سبد مهمانی نبود
      // (خالی)، merge عملاً معادل خواندن سبد فعلی همان کاربر از دیتابیس است —
      // یعنی سبد قبلیِ او دقیقاً حفظ می‌شود.
      const guestItems = readGuestCart();
      setReady(false);
      fetchWithRetry("/api/cart/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: guestItems }),
      })
        .then((res) => res.json())
        .then((data) => {
          setItems(data.items ?? []);
          // سبد مهمان دیگر لازم نیست؛ از این به بعد منبع اصلی دیتابیس است.
          localStorage.removeItem(GUEST_STORAGE_KEY);
        })
        .catch(() => {
          toast.error("سبد خرید با حساب شما همگام نشد، دوباره تلاش می‌کنیم");
          setItems(guestItems);
        })
        .finally(() => setReady(true));
    } else {
      // کاربر مهمان یا تازه از حساب خارج شده: سبد را فقط از سبدِ مهمانِ
      // localStorage بخوان (نه چیزی که از حساب کاربریِ قبلی مانده).
      if (!cameFromLoading) {
        // یعنی این یک خروج واقعی از حساب بود؛ سبدِ حساب قبلی نباید برای
        // نشستِ مهمانِ بعدی (یا کاربر دیگر روی همین مرورگر) باقی بماند.
        localStorage.removeItem(GUEST_STORAGE_KEY);
        setItems([]);
      } else {
        setItems(readGuestCart());
      }
      setReady(true);
    }
  }, [status]);

  // هر تغییری در سبد را ذخیره کن: مهمان → localStorage، کاربر لاگین‌کرده → دیتابیس.
  // قبل از ready شدن چیزی ذخیره نمی‌شود تا داده‌ی درست با داده‌ی موقتِ مرحله‌ی
  // بارگذاری اشتباهی جای‌گزین نشود.
  useEffect(() => {
    if (!ready) return;

    if (status === "authenticated") {
      fetchWithRetry("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      }).catch(() => {
        // سبد همچنان در state امن است؛ دفعه بعد که تغییر کند دوباره تلاش می‌شود
      });
    } else {
      try {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(items));
      } catch {
        // نادیده گرفتن خطای ذخیره (مثلاً حالت خصوصی مرورگر)
      }
    }
  }, [items, ready, status]);

  function getProduct(productId: string) {
    return products.find((p) => p.id === productId);
  }

  function addItem(productId: string, quantity = 1, size?: string) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId && i.size === size);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId && i.size === size
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { productId, quantity, size }];
    });
    toast.success("به سبد خرید اضافه شد");
  }

  function removeItem(productId: string, size?: string) {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)));
  }

  function updateQuantity(productId: string, quantity: number, size?: string) {
    if (quantity < 1) return removeItem(productId, size);
    setItems((prev) =>
      prev.map((i) => (i.productId === productId && i.size === size ? { ...i, quantity } : i))
    );
  }

  function clearCart() {
    setItems([]);
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => {
    const product = getProduct(i.productId);
    if (!product || product.finalPrice == null) return sum;
    return sum + product.finalPrice * i.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        products,
        productsError,
        productsLoading,
        retryLoadProducts: loadProducts,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getProduct,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart باید داخل CartProvider استفاده شود");
  return ctx;
}
