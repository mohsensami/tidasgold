import { getAllProducts } from "@/lib/data/products";
import { calculateGoldPrice } from "@/lib/price";
import { ProductGrid } from "@/components/product/product-grid";
import { CategoryFilter } from "@/components/product/category-filter";
import { SortSelect } from "@/components/product/sort-select";
import { CATEGORIES } from "@/lib/constants";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string };
}) {
  let products = await getAllProducts();
  const { category, sort } = searchParams;

  if (category) products = products.filter((p) => p.category === category);

  switch (sort) {
    case "price-asc":
      products = [...products].sort(
        (a, b) => calculateGoldPrice(a).total - calculateGoldPrice(b).total
      );
      break;
    case "price-desc":
      products = [...products].sort(
        (a, b) => calculateGoldPrice(b).total - calculateGoldPrice(a).total
      );
      break;
    case "weight-asc":
      products = [...products].sort((a, b) => a.weightGrams - b.weightGrams);
      break;
    case "popular":
      products = [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      break;
    default:
      products = [...products].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  const categoryTitle = CATEGORIES.find((c) => c.slug === category)?.title;

  return (
    <div className="container py-8">
      <h1 className="font-display text-2xl font-bold mb-1">
        {categoryTitle ?? "همه محصولات"}
      </h1>
      <p className="text-sm text-muted-foreground mb-6">{products.length} محصول</p>

      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block">
          <CategoryFilter active={category} />
        </aside>

        <div>
          <div className="mb-4 flex justify-end">
            <SortSelect />
          </div>
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}
