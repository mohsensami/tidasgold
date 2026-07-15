import { prisma } from "@/lib/prisma";
import { withRetry, DatabaseUnavailableError } from "@/lib/db-retry";
import type { GoldPrice } from "@/types";

/**
 * قیمت طلا از جدول Setting خوانده می‌شود (نه یک مقدار ثابت در کد).
 * بعداً که یک ادمین‌پنل ساختی، کافی‌ست یک فرم بسازی که با
 * prisma.setting.update(...) همین رکورد را آپدیت کند و همه‌جای سایت
 * آنی قیمت جدید را می‌بیند (چون هر بار از دیتابیس خوانده می‌شود).
 */
export async function getGoldPrice(): Promise<GoldPrice> {
  const setting = await withRetry(() =>
    prisma.setting.findUniqueOrThrow({ where: { id: "singleton" } })
  );

  return {
    pricePerGram18k: setting.goldPricePerGram18k,
    changePercent: setting.goldPriceChangePercent,
    // زمانی که خودِ brsapi این قیمت را گزارش کرده (از time_unix)؛ اگر
    // هنوز هیچ sync موفقی انجام نشده (مقدار null)، به updatedAt برمی‌گردیم
    // که فقط برای جلوگیری از crash روی داده‌ی seed اولیه است.
    updatedAt: (setting.goldPriceSourceTime ?? setting.updatedAt).toISOString(),
  };
}

export async function updateGoldPrice(
  pricePerGram18k: number,
  changePercent: number,
  sourceTime: Date
) {
  return withRetry(() =>
    prisma.setting.upsert({
      where: { id: "singleton" },
      update: {
        goldPricePerGram18k: pricePerGram18k,
        goldPriceChangePercent: changePercent,
        goldPriceSourceTime: sourceTime,
      },
      create: {
        id: "singleton",
        goldPricePerGram18k: pricePerGram18k,
        goldPriceChangePercent: changePercent,
        goldPriceSourceTime: sourceTime,
      },
    })
  );
}

export { DatabaseUnavailableError };
