import type { Product } from "@/types";
import { ProductCard } from "./product-card";

export function ProductGrid({
  products,
  pricePerGram,
}: {
  products: Product[];
  pricePerGram: number;
}) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        محصولی با این مشخصات پیدا نشد.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} pricePerGram={pricePerGram} />
      ))}
    </div>
  );
}
