import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function CategoryFilter({ active }: { active?: string }) {
  return (
    <div className="space-y-1">
      <h3 className="font-bold text-sm mb-3">دسته‌بندی</h3>
      <Link
        href="/products"
        className={cn(
          "block rounded-md px-3 py-2 text-sm hover:bg-accent",
          !active && "bg-accent font-medium"
        )}
      >
        همه محصولات
      </Link>
      {CATEGORIES.map((c) => (
        <Link
          key={c.slug}
          href={`/products?category=${c.slug}`}
          className={cn(
            "block rounded-md px-3 py-2 text-sm hover:bg-accent",
            active === c.slug && "bg-accent font-medium"
          )}
        >
          {c.title}
        </Link>
      ))}
    </div>
  );
}
