import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { calculateGoldPrice } from "@/lib/price";
import { toToman } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const { total } = calculateGoldPrice(product);

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
