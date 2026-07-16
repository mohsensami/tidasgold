"use client";

import Link from "next/link";
import Image from "next/image";
import { useCompare } from "@/context/compare-context";
import { useCart } from "@/context/cart-context";
import { toToman } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Scale, Loader2 } from "lucide-react";

export default function ComparePage() {
  const { ids, removeFromCompare, clearCompare } = useCompare();
  const { getProduct, products, productsLoading } = useCart();

  if (productsLoading) {
    return (
      <div className="container flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
        <p className="text-sm">در حال دریافت اطلاعات محصولات...</p>
      </div>
    );
  }

  const compareProducts = ids.map((id) => getProduct(id)).filter((p): p is NonNullable<typeof p> => !!p);

  if (compareProducts.length === 0) {
    return (
      <div className="container py-20 text-center">
        <Scale className="mx-auto h-16 w-16 text-muted-foreground/40" />
        <p className="mt-4 text-lg font-medium">هنوز محصولی برای مقایسه انتخاب نکرده‌اید</p>
        <p className="mt-1 text-sm text-muted-foreground">
          از صفحه‌ی محصولات، روی آیکون ترازو کنار هر محصول بزنید تا اینجا اضافه شود.
        </p>
        <Button variant="gold" size="lg" className="mt-6" asChild>
          <Link href="/products">مشاهده محصولات</Link>
        </Button>
      </div>
    );
  }

  // برای محاسبه‌ی قیمت نهایی هر محصول در جدول مقایسه لازم است، چون در
  // useCart فقط finalPrice محاسبه‌شده با قیمت لحظه‌ی fetch در دسترس است —
  // که همان چیزی است که همین‌جا هم استفاده می‌کنیم.
  const rows: { label: string; render: (p: (typeof compareProducts)[number]) => React.ReactNode }[] = [
    { label: "قیمت", render: (p) => <span className="font-bold text-secondary">{toToman(p.finalPrice ?? 0)}</span> },
    { label: "عیار", render: (p) => `${p.karat} عیار` },
    { label: "وزن", render: (p) => `${p.weightGrams} گرم` },
    { label: "اجرت ساخت", render: (p) => toToman(p.wage) },
    { label: "موجودی", render: (p) => (p.stock > 0 ? `${p.stock} عدد` : "ناموجود") },
    { label: "دسته‌بندی", render: (p) => p.category },
  ];

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">مقایسه محصولات</h1>
        <Button variant="ghost" size="sm" onClick={clearCompare}>
          پاک کردن همه
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-32"></th>
              {compareProducts.map((p) => (
                <th key={p.id} className="p-3 align-top">
                  <div className="relative mx-auto mb-2 h-24 w-24 overflow-hidden rounded-md bg-muted">
                    <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                    <button
                      type="button"
                      aria-label="حذف از مقایسه"
                      onClick={() => removeFromCompare(p.id)}
                      className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <Link href={`/products/${p.slug}`} className="font-medium hover:text-secondary">
                    {p.title}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-border">
                <td className="p-3 font-medium text-muted-foreground">{row.label}</td>
                {compareProducts.map((p) => (
                  <td key={p.id} className="p-3 text-center">
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-border">
              <td className="p-3"></td>
              {compareProducts.map((p) => (
                <td key={p.id} className="p-3 text-center">
                  <Button variant="gold" size="sm" asChild>
                    <Link href={`/products/${p.slug}`}>مشاهده محصول</Link>
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
