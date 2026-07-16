"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { calculateGoldPrice } from "@/lib/price";
import { toToman, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, Scale } from "lucide-react";
import { useWishlist } from "@/context/wishlist-context";
import { useCompare } from "@/context/compare-context";

export function ProductCard({ product, pricePerGram }: { product: Product; pricePerGram: number }) {
  const { total } = calculateGoldPrice(product, pricePerGram);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isComparing, toggleCompare } = useCompare();
  const wishlisted = isWishlisted(product.id);
  const comparing = isComparing(product.id);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.images[0]}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1.5">
          {product.isNew && <Badge variant="new">جدید</Badge>}
          {product.isFeatured && <Badge variant="gold">پرفروش</Badge>}
        </div>

        {/* دکمه‌های افزودن به علاقه‌مندی و مقایسه — مثل قالب وودمارت، گوشه‌ی مخالفِ نشان‌ها */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          <button
            type="button"
            aria-label={wishlisted ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-colors hover:bg-background",
              wishlisted && "text-red-500"
            )}
          >
            <Heart className={cn("h-4 w-4", wishlisted && "fill-red-500")} />
          </button>
          <button
            type="button"
            aria-label={comparing ? "حذف از مقایسه" : "افزودن به مقایسه"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleCompare(product.id);
            }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-colors hover:bg-background",
              comparing && "text-secondary"
            )}
          >
            <Scale className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="p-3.5">
        <p className="text-sm font-medium leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.title}
        </p>
        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
          <span>عیار {product.karat}</span>
          <span>·</span>
          <span>{product.weightGrams} گرم</span>
        </div>
        {product.rating && (
          <div className="mt-1 flex items-center gap-1 text-xs text-gold-600">
            <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
            <span>{product.rating}</span>
            <span className="text-muted-foreground">({product.reviewsCount})</span>
          </div>
        )}
        <p className="mt-2 font-display font-bold text-secondary">{toToman(total)}</p>
      </div>
    </Link>
  );
}
