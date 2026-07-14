"use client";

import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { Minus, Plus, ShoppingBag } from "lucide-react";

export function AddToCartForm({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [size, setSize] = useState<string | undefined>(product.sizes?.[0]);
  const [qty, setQty] = useState(1);
  const outOfStock = product.stock <= 0;

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
    </div>
  );
}
