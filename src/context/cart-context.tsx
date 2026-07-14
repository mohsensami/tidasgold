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
const STORAGE_KEY = "talagold-cart";

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

export function CartProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const hasMergedRef = useRef(false);

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

  // مرحله ۱: خواندن سبد مهمان از localStorage و گرفتن لیست محصولات
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // نادیده گرفتن خطای پارس
    }
    setHydrated(true);
    loadProducts();
  }, []);

  // مرحله ۲: وقتی کاربر لاگین می‌کند، سبد مهمان را با سبد دیتابیسش ادغام کن
  useEffect(() => {
    if (status !== "authenticated" || hasMergedRef.current || !hydrated) return;
    hasMergedRef.current = true;

    fetchWithRetry("/api/cart/merge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
      .then((res) => res.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => {
        // اگه ادغام شکست خورد، سبد مهمانِ فعلی همچنان local می‌ماند؛ کاربر چیزی از دست نمی‌دهد
        toast.error("سبد خرید قبلی شما هنگام ورود سینک نشد، دوباره تلاش می‌کنیم");
      });
  }, [status, hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  // مرحله ۳: هر تغییری در سبد را در localStorage ذخیره کن، و اگر لاگین است در دیتابیس هم
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

    if (status === "authenticated" && hasMergedRef.current) {
      fetchWithRetry("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      }).catch(() => {
        // سبد همچنان در localStorage امن است؛ دفعه بعد که تغییر کند دوباره تلاش می‌شود
      });
    }
  }, [items, hydrated, status]);

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
