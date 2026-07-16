"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface WishlistContextValue {
  ids: Set<string>;
  loading: boolean;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") {
      // علاقه‌مندی‌ها فقط برای کاربر لاگین‌کرده در دیتابیس نگه داشته می‌شود؛
      // برای مهمان چیزی برای نمایش نیست (بر خلاف سبد خرید که سمت مهمان هم کار می‌کند).
      setIds(new Set());
      setLoading(status === "loading");
      return;
    }
    setLoading(true);
    fetch("/api/wishlist")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setIds(new Set(data.productIds ?? [])))
      .catch(() => {
        // مشکلی نیست، فقط لیست خالی می‌ماند؛ کاربر می‌تواند دوباره تلاش کند
      })
      .finally(() => setLoading(false));
  }, [status]);

  function isWishlisted(productId: string) {
    return ids.has(productId);
  }

  function toggleWishlist(productId: string) {
    if (status !== "authenticated") {
      toast.info("برای افزودن به علاقه‌مندی‌ها ابتدا وارد حساب کاربری شوید");
      router.push("/login");
      return;
    }

    const wasWishlisted = ids.has(productId);

    // بروزرسانی خوش‌بینانه (optimistic) برای واکنش آنی روی UI
    setIds((prev) => {
      const next = new Set(prev);
      wasWishlisted ? next.delete(productId) : next.add(productId);
      return next;
    });

    const request = wasWishlisted
      ? fetch("/api/wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        })
      : fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });

    request
      .then((res) => {
        if (!res.ok) throw new Error();
        toast.success(wasWishlisted ? "از علاقه‌مندی‌ها حذف شد" : "به علاقه‌مندی‌ها اضافه شد");
      })
      .catch(() => {
        // اگر درخواست شکست خورد، تغییر خوش‌بینانه را برگردان
        setIds((prev) => {
          const next = new Set(prev);
          wasWishlisted ? next.add(productId) : next.delete(productId);
          return next;
        });
        toast.error("مشکلی پیش آمد، دوباره تلاش کنید");
      });
  }

  return (
    <WishlistContext.Provider value={{ ids, loading, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist باید داخل WishlistProvider استفاده شود");
  return ctx;
}
