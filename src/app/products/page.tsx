import { getAllProducts } from "@/lib/data/products";
import { getAllCategories } from "@/lib/data/categories";
import { getGoldPrice } from "@/lib/data/settings";
import { calculateGoldPrice } from "@/lib/price";
import { ProductGrid } from "@/components/product/product-grid";
import { CategoryFilter } from "@/components/product/category-filter";
import { SortSelect } from "@/components/product/sort-select";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string; q?: string };
}) {
  const { category, sort, q } = searchParams;

  const [allProducts, categories, goldPrice] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
    getGoldPrice(),
  ]);
  const pricePerGram = goldPrice.pricePerGram18k;

  let products = category ? allProducts.filter((p) => p.category === category) : allProducts;

  if (q?.trim()) {
    const needle = q.trim().toLowerCase();
    products = products.filter(
      (p) => p.title.toLowerCase().includes(needle) || p.description.toLowerCase().includes(needle)
    );
  }

  switch (sort) {
    case "price-asc":
      products = [...products].sort(
        (a, b) => calculateGoldPrice(a, pricePerGram).total - calculateGoldPrice(b, pricePerGram).total
      );
      break;
    case "price-desc":
      products = [...products].sort(
        (a, b) => calculateGoldPrice(b, pricePerGram).total - calculateGoldPrice(a, pricePerGram).total
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

  const categoryTitle = categories.find((c) => c.slug === category)?.title;
  const heading = q?.trim() ? `نتایج جستجو برای «${q.trim()}»` : (categoryTitle ?? "همه محصولات");

  return (
    <div className="container py-8">
      <h1 className="font-display text-2xl font-bold mb-1">{heading}</h1>
      <p className="text-sm text-muted-foreground mb-6">{products.length} محصول</p>

      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <aside className="hidden md:block">
          <CategoryFilter categories={categories} active={category} />
        </aside>

        <div>
          <div className="mb-4 flex justify-end">
            <SortSelect />
          </div>
          <ProductGrid products={products} pricePerGram={pricePerGram} />
        </div>
      </div>
    </div>
  );
}
