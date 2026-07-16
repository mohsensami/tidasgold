"use client";

import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { Minus, Plus, ShoppingBag, Heart, Scale } from "lucide-react";
import { useWishlist } from "@/context/wishlist-context";
import { useCompare } from "@/context/compare-context";

export function AddToCartForm({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isComparing, toggleCompare } = useCompare();
  const [size, setSize] = useState<string | undefined>(product.sizes?.[0]);
  const [qty, setQty] = useState(1);
  const outOfStock = product.stock <= 0;
  const wishlisted = isWishlisted(product.id);
  const comparing = isComparing(product.id);

  return (
    <div className="space-y-5">
      {product.sizes && (
        <div>
          <p className="text-sm font-bold mb-2">سایز</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={cn(
                  "h-10 min-w-10 rounded-md border px-3 text-sm font-medium transition-colors",
                  size === s
                    ? "border-secondary bg-secondary text-secondary-foreground"
                    : "border-input hover:border-secondary"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-bold mb-2">تعداد</p>
        <div className="flex w-fit items-center rounded-md border border-input">
          <button
            className="flex h-10 w-10 items-center justify-center disabled:opacity-40"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="کاهش تعداد"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-medium">{qty}</span>
          <button
            className="flex h-10 w-10 items-center justify-center disabled:opacity-40"
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            disabled={qty >= product.stock}
            aria-label="افزایش تعداد"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Button
        variant="gold"
        size="lg"
        className="w-full"
        disabled={outOfStock}
        onClick={() => addItem(product.id, qty, size)}
      >
        <ShoppingBag className="h-5 w-5" />
        {outOfStock ? "ناموجود" : "افزودن به سبد خرید"}
      </Button>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className={cn("flex-1", wishlisted && "border-red-400 text-red-500")}
          onClick={() => toggleWishlist(product.id)}
        >
          <Heart className={cn("h-4 w-4", wishlisted && "fill-red-500")} />
          {wishlisted ? "در علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
        </Button>
        <Button
          variant="outline"
          className={cn("flex-1", comparing && "border-secondary text-secondary")}
          onClick={() => toggleCompare(product.id)}
        >
          <Scale className="h-4 w-4" />
          {comparing ? "در حال مقایسه" : "مقایسه"}
        </Button>
      </div>
    </div>
  );
}
