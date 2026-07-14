import Link from "next/link";
import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { ProductGrid } from "@/components/product/product-grid";
import { getFeaturedProducts, getNewProducts } from "@/lib/data/products";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const featured = await getFeaturedProducts();
  const newest = await getNewProducts();

  return (
    <>
      <Hero />
      <CategoryGrid />

      <section className="container py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">پرفروش‌ترین‌ها</h2>
          <Button variant="link" asChild>
            <Link href="/products">مشاهده همه</Link>
          </Button>
        </div>
        <ProductGrid products={featured} />
      </section>

      <section className="container py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">تازه‌های فروشگاه</h2>
          <Button variant="link" asChild>
            <Link href="/products">مشاهده همه</Link>
          </Button>
        </div>
        <ProductGrid products={newest} />
      </section>

      <section className="bg-wine text-white">
        <div className="container py-14 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold">
            عضو خبرنامه قیمت طلا شوید
          </h2>
          <p className="mt-2 text-white/80 max-w-lg mx-auto">
            نوسانات لحظه‌ای قیمت طلا و تخفیف‌های ویژه را از دست ندهید.
          </p>
          <form className="mt-6 flex max-w-md mx-auto gap-2">
            <input
              type="email"
              placeholder="ایمیل شما"
              className="h-11 flex-1 rounded-md border-0 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
            <Button variant="gold" className="h-11">عضویت</Button>
          </form>
        </div>
      </section>
    </>
  );
}
