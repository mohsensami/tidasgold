import Link from "next/link";
import Image from "next/image";
import { getAllCategories } from "@/lib/data/categories";

const fallbackImage =
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600";

export async function CategoryGrid() {
  const categories = await getAllCategories();

  return (
    <section className="container py-12">
      <h2 className="font-display text-2xl font-bold text-center mb-8">دسته‌بندی محصولات</h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {categories.map((c) => (
          <Link key={c.slug} href={`/products?category=${c.slug}`} className="group text-center">
            <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-full border-2 border-gold-200">
              <Image
                src={c.image || fallbackImage}
                alt={c.title}
                fill
                sizes="120px"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <p className="mt-2 text-sm font-medium">{c.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
