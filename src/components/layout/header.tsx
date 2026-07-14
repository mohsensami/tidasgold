import { getAllCategories } from "@/lib/data/categories";
import { GoldPriceBar } from "./gold-price-bar";
import { HeaderNav } from "./header-nav";

export async function Header() {
  const categories = await getAllCategories();

  return (
    <header className="sticky top-0 z-40 w-full">
      <GoldPriceBar />
      <HeaderNav categories={categories} />
    </header>
  );
}
