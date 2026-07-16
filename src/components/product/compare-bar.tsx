"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Scale, X } from "lucide-react";
import { useCompare } from "@/context/compare-context";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";

export function CompareBar() {
  const { ids, removeFromCompare, clearCompare } = useCompare();
  const { getProduct } = useCart();
  const router = useRouter();

  if (ids.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 shadow-lg backdrop-blur">
      <div className="container flex items-center gap-3 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-secondary">
          <Scale className="h-5 w-5" />
          <span>مقایسه ({ids.length})</span>
        </div>

        <div className="flex flex-1 items-center gap-2 overflow-x-auto">
          {ids.map((id) => {
            const product = getProduct(id);
            return (
              <div key={id} className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                {product && (
                  <Image src={product.images[0]} alt={product.title} fill sizes="48px" className="object-cover" />
                )}
                <button
                  type="button"
                  aria-label="حذف از مقایسه"
                  onClick={() => removeFromCompare(id)}
                  className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-white"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            );
          })}
        </div>

        <Button variant="ghost" size="sm" onClick={clearCompare}>
          پاک کردن
        </Button>
        <Button variant="gold" size="sm" onClick={() => router.push("/compare")}>
          مقایسه محصولات
        </Button>
      </div>
    </div>
  );
}
