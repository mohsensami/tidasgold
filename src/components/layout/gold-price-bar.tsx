import { getGoldPrice } from "@/lib/data/settings";
import { toToman } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export async function GoldPriceBar() {
  const goldPrice = await getGoldPrice();
  const isUp = goldPrice.changePercent >= 0;
  const time = new Date(goldPrice.updatedAt).toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="w-full bg-gold-900 text-gold-50">
      <div className="container flex h-9 items-center justify-between gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="hidden sm:inline text-gold-200/80">قیمت هر گرم طلای ۱۸ عیار:</span>
          <span className="font-bold gold-shimmer">{toToman(goldPrice.pricePerGram18k)}</span>
          <span
            className={`flex items-center gap-0.5 font-medium ${
              isUp ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {Math.abs(goldPrice.changePercent)}٪
          </span>
        </div>
        <span className="hidden sm:inline text-gold-200/60 shrink-0">
          آخرین بروزرسانی: {time}
        </span>
      </div>
    </div>
  );
}
