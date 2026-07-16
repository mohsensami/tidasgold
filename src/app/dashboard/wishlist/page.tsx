import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserWishlistProductIds } from "@/lib/data/wishlist";
import { getAllProducts } from "@/lib/data/products";
import { getGoldPrice } from "@/lib/data/settings";
import { ProductGrid } from "@/components/product/product-grid";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id as string;

  const [wishlistIds, allProducts, goldPrice] = await Promise.all([
    getUserWishlistProductIds(userId),
    getAllProducts(),
    getGoldPrice(),
  ]);

  const idSet = new Set(wishlistIds);
  const products = allProducts.filter((p) => idSet.has(p.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">علاقه‌مندی‌ها</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {products.length > 0 ? `${products.length} محصول` : "هنوز محصولی به علاقه‌مندی‌ها اضافه نکرده‌اید"}
        </p>
      </div>
      <ProductGrid products={products} pricePerGram={goldPrice.pricePerGram18k} />
    </div>
  );
}
