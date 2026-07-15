"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toToman } from "@/lib/utils";
import { calculateGoldPrice } from "@/lib/price";
import { deleteProduct } from "@/app/dashboard/products/actions";
import type { AdminProduct } from "@/lib/data/products";

export function ProductsTable({
  products,
  pricePerGram,
}: {
  products: AdminProduct[];
  pricePerGram: number;
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  async function handleDelete(product: AdminProduct) {
    setConfirmingId(null);
    setDeletingId(product.id);
    try {
      const result = await deleteProduct(product.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("محصول حذف شد");
      router.refresh();
    } catch {
      toast.error("خطایی رخ داد، دوباره تلاش کنید");
    } finally {
      setDeletingId(null);
    }
  }

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        هنوز هیچ محصولی ثبت نشده. از دکمه «افزودن محصول» شروع کنید.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-right text-xs text-muted-foreground">
            <th className="p-3 font-medium">محصول</th>
            <th className="p-3 font-medium">دسته‌بندی</th>
            <th className="p-3 font-medium">عیار / وزن</th>
            <th className="p-3 font-medium">موجودی</th>
            <th className="p-3 font-medium">قیمت نهایی</th>
            <th className="p-3 font-medium">وضعیت</th>
            <th className="p-3 font-medium">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const { total } = calculateGoldPrice(p, pricePerGram);
            return (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                      {p.images[0] && (
                        <Image src={p.images[0]} alt={p.title} fill sizes="48px" className="object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium leading-tight line-clamp-1">{p.title}</p>
                      <p className="text-xs text-muted-foreground" dir="ltr">
                        {p.slug}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{p.categoryTitle}</td>
                <td className="p-3 text-muted-foreground">
                  عیار {p.karat} · {p.weightGrams} گرم
                </td>
                <td className="p-3">
                  <span className={p.stock === 0 ? "font-bold text-destructive" : ""}>{p.stock}</span>
                </td>
                <td className="p-3 font-bold text-secondary">{toToman(total)}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {p.isNew && <Badge variant="new">جدید</Badge>}
                    {p.isFeatured && <Badge variant="gold">ویژه</Badge>}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    {confirmingId === p.id ? (
                      <>
                        <span className="text-xs text-muted-foreground ml-1">مطمئنید؟</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deletingId === p.id}
                          onClick={() => handleDelete(p)}
                        >
                          {deletingId === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "بله، حذف کن"}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmingId(null)}>
                          انصراف
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="icon" asChild aria-label="ویرایش">
                          <Link href={`/dashboard/products/${p.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="حذف"
                          onClick={() => setConfirmingId(p.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
