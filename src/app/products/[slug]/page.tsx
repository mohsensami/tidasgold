import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { ProductGallery } from "@/components/product/product-gallery";
import { PriceBreakdown } from "@/components/product/price-breakdown";
import { AddToCartForm } from "@/components/product/add-to-cart-form";
import { ProductGrid } from "@/components/product/product-grid";
import { Badge } from "@/components/ui/badge";
import { Star, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};
  return { title: product.title, description: product.description };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  return (
    <div className="container py-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} title={product.title} />

        <div>
          <div className="flex gap-2 mb-3">
            {product.isNew && <Badge variant="new">جدید</Badge>}
            {product.isFeatured && <Badge variant="gold">پرفروش</Badge>}
          </div>
          <h1 className="font-display text-2xl font-bold leading-snug">{product.title}</h1>

          {product.rating && (
            <div className="mt-2 flex items-center gap-1 text-sm text-gold-600">
              <Star className="h-4 w-4 fill-gold-400 text-gold-400" />
              <span className="font-medium">{product.rating}</span>
              <span className="text-muted-foreground">
                ({product.reviewsCount} نظر)
              </span>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>عیار: {product.karat}</span>
            <span>وزن: {product.weightGrams} گرم</span>
            <span>
              موجودی:{" "}
              {product.stock > 0 ? `${product.stock} عدد` : "ناموجود"}
            </span>
          </div>

          <p className="mt-4 leading-relaxed text-sm text-foreground/80">
            {product.description}
          </p>

          <div className="mt-6">
            <PriceBreakdown product={product} />
          </div>

          <div className="mt-6">
            <AddToCartForm product={product} />
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-gold-600" />
            به همراه برگه اصالت و ضمانت بازخرید
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-xl font-bold mb-6">محصولات مشابه</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
