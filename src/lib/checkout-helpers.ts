import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/db-retry";
import { calculateGoldPrice } from "@/lib/price";
import { getGoldPrice } from "@/lib/data/settings";
import { ensureFreshGoldPrice } from "@/lib/gold-price-sync";
import { SHIPPING } from "@/lib/constants";
import type { CartItem } from "@/types";

/**
 * قیمت و آیتم‌های سفارش را از روی سبد خرید، همیشه سمت سرور و با قیمت
 * لحظه‌ای طلا محاسبه می‌کند (نه چیزی که کلاینت فرستاده) تا کسی نتواند
 * قیمت را دستکاری کند. هم مسیر پرداخت با زرین‌پال و هم پرداخت با کیف پول
 * از همین تابع استفاده می‌کنند تا محاسبه قیمت یک‌جا و یکسان بماند.
 *
 * چرا اول ensureFreshGoldPrice؟ چون کاربر ممکن است سبد خریدش را صبح در
 * یک تب باز کرده باشد و شب، بدون این‌که هیچ صفحه‌ی دیگری لود شود (پس
 * بدون این‌که میدلور اصلاً trigger شود)، مستقیم دکمه‌ی پرداخت را بزند.
 * این await تضمین می‌کند که دقیقاً همین لحظه، اگر قیمت در دیتابیس بیش
 * از ۵ دقیقه قدیمی باشد، قبل از محاسبه‌ی قیمت سفارش تازه شود — نه این‌که
 * منتظر بازدید بعدیِ یک صفحه‌ی دیگر بمانیم.
 */
export async function buildOrderPricing(items: CartItem[]) {
  await ensureFreshGoldPrice();

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
