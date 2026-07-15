import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/db-retry";
import { calculateGoldPrice } from "@/lib/price";
import { getGoldPrice } from "@/lib/data/settings";
import { SHIPPING } from "@/lib/constants";
import type { CartItem } from "@/types";

/**
 * قیمت و آیتم‌های سفارش را از روی سبد خرید، همیشه سمت سرور و با قیمت
 * لحظه‌ای طلا محاسبه می‌کند (نه چیزی که کلاینت فرستاده) تا کسی نتواند
 * قیمت را دستکاری کند. هم مسیر پرداخت با زرین‌پال و هم پرداخت با کیف پول
 * از همین تابع استفاده می‌کنند تا محاسبه قیمت یک‌جا و یکسان بماند.
 */
export async function buildOrderPricing(items: CartItem[]) {
  const [goldPrice, products] = await Promise.all([
    getGoldPrice(),
    withRetry(() => prisma.product.findMany({ where: { id: { in: items.map((i) => i.productId) } } })),
  ]);

  let totalAmount = 0;
  const orderItemsData = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error(`محصول ${item.productId} پیدا نشد`);
    if (product.stock < item.quantity) throw new Error(`موجودی «${product.title}» کافی نیست`);
    const price = calculateGoldPrice(product, goldPrice.pricePerGram18k).total;
    totalAmount += price * item.quantity;
    return {
      productId: item.productId,
      quantity: item.quantity,
      size: item.size,
      priceAtPurchase: price,
    };
  });

  const shippingCost = totalAmount >= SHIPPING.freeShippingThreshold ? 0 : SHIPPING.standardCost;
  return { orderItemsData, totalAmount, shippingCost, finalAmount: totalAmount + shippingCost };
}
