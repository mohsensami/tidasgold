import { PRICE_FORMULA_DEFAULTS } from '@/lib/constants';
import type { Product } from '@/types';

export type PriceCalculationProduct = {
    weightGrams: number;
    wage: number;
    profitPercent?: number | null;
    taxPercent?: number | null;
};

/**
 * فرمول محاسبه قیمت طلا در ایران:
 * قیمت‌کل = (قیمت‌گرم × وزن + اجرت) × (۱ + سود٪) × (۱ + مالیات٪)
 *
 * pricePerGram باید همیشه از src/lib/data/settings.ts (getGoldPrice) بیاید،
 * نه یک عدد ثابت — چون قیمت طلا حالا در دیتابیس است.
 */
export function calculateGoldPrice(product: PriceCalculationProduct, pricePerGram: number) {
    const profitPercent = product.profitPercent ?? PRICE_FORMULA_DEFAULTS.profitPercent;
    const taxPercent = product.taxPercent ?? PRICE_FORMULA_DEFAULTS.taxPercent;

    const goldValue = pricePerGram * product.weightGrams;
    const base = goldValue + product.wage;
    const withProfit = base * (1 + profitPercent / 100);
    const final = withProfit * (1 + taxPercent / 100);

    return {
        goldValue: Math.round(goldValue),
        wage: Math.round(product.wage),
        profitAmount: Math.round(withProfit - base),
        taxAmount: Math.round(final - withProfit),
        total: Math.round(final),
    };
}
