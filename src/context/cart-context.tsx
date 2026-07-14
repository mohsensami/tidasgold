"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { CartItem, Product } from "@/types";
import { calculateGoldPrice } from "@/lib/price";
import { toast } from "sonner";

interface CartContextValue {
  items: CartItem[];
  products: Product[]; // کش محصولات گرفته‌شده از /api/products، برای محاسبه قیمت در سبد/تسویه‌حساب
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // نادیده گرفتن خطای پارس
    }
    setHydrated(true);

    // گرفتن لیست محصولات از دیتابیس (از طریق API) برای محاسبه قیمت در سبد خرید
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => toast.error("خطا در دریافت اطلاعات محصولات"));
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

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
    if (!product) return sum;
    return sum + calculateGoldPrice(product).total * i.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        products,
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
