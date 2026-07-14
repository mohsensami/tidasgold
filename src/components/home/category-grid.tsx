import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/lib/constants";

const images: Record<string, string> = {
  rings: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600",
  necklaces: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600",
  bracelets: "https://images.unsplash.com/photo-1602752275849-9c5b3b0f5c5f?q=80&w=600",
  earrings: "https://images.unsplash.com/photo-1620656798579-1984d9e87df7?q=80&w=600",
  sets: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600",
  coins: "https://images.unsplash.com/photo-1610375461369-d613b564f4f4?q=80&w=600",
};

export function CategoryGrid() {
  return (
    <section className="container py-12">
      <h2 className="font-display text-2xl font-bold text-center mb-8">دسته‌بندی محصولات</h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {CATEGORIES.map((c) => (
          <Link key={c.slug} href={`/products?category=${c.slug}`} className="group text-center">
            <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-full border-2 border-gold-200">
              <Image
                src={images[c.slug]}
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
