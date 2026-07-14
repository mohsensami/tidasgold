import { calculateGoldPrice } from "@/lib/price";
import { toToman } from "@/lib/utils";
import type { Product } from "@/types";
import { GOLD_PRICE } from "@/lib/constants";

export function PriceBreakdown({ product }: { product: Product }) {
  const p = calculateGoldPrice(product);

  const rows = [
    { label: `قیمت طلا (${product.weightGrams} گرم × ${toToman(GOLD_PRICE.pricePerGram18k)})`, value: p.goldValue },
    { label: "اجرت ساخت", value: p.wage },
    { label: "سود فروشنده", value: p.profitAmount },
    { label: "مالیات بر ارزش افزوده", value: p.taxAmount },
  ];

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
      <p className="font-bold mb-3">جزئیات قیمت</p>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between text-muted-foreground">
            <span>{r.label}</span>
            <span>{toToman(r.value)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3 font-bold">
        <span>قیمت نهایی</span>
        <span className="text-secondary text-lg">{toToman(p.total)}</span>
      </div>
    </div>
  );
}
