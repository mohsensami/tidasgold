import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withRetry, DatabaseUnavailableError } from '@/lib/db-retry';
import { addressSchema } from '@/lib/validations/checkout';
import { calculateGoldPrice } from '@/lib/price';
import { getGoldPrice } from '@/lib/data/settings';
import { SHIPPING } from '@/lib/constants';
import type { CartItem } from '@/types';

/**
 * ثبت سفارش واقعی در دیتابیس (Order + OrderItem + Address).
 * قیمت‌ها اینجا دوباره سمت سرور با قیمت لحظه‌ای طلا محاسبه می‌شوند
 * (نه با چیزی که کلاینت فرستاده) تا کسی نتواند قیمت را دستکاری کند.
 *
 * TODO مرحله بعد: بعد از ساخت Order با status=PENDING_PAYMENT، با API
 * زرین‌پال (PaymentRequest) یک authority بگیر و کاربر را به
 * https://www.zarinpal.com/pg/StartPay/{authority} بفرست. بعد از بازگشت
 * کاربر، در یک روت verify با PaymentVerification وضعیت را PROCESSING کن.
 */
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
        return NextResponse.json({ error: 'برای ثبت سفارش ابتدا وارد حساب کاربری شوید' }, { status: 401 });
    }

    const body = await req.json();
    const parsedAddress = addressSchema.safeParse(body.address);
    const items = body.items as CartItem[];

    if (!parsedAddress.success) {
        return NextResponse.json({ error: 'آدرس وارد شده معتبر نیست' }, { status: 400 });
    }
    if (!items?.length) {
        return NextResponse.json({ error: 'سبد خرید خالی است' }, { status: 400 });
    }

    try {
        const [goldPrice, products] = await Promise.all([
            getGoldPrice(),
            withRetry(() => prisma.product.findMany({ where: { id: { in: items.map((i) => i.productId) } } })),
        ]);

        let totalAmount = 0;
        const orderItemsData = items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product) throw new Error(`محصول ${item.productId} پیدا نشد`);
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

        const order = await withRetry(() =>
            prisma.order.create({
                data: {
                    user: {
                        connect: {
                            id: userId,
                        },
                    },

                    totalAmount: totalAmount + shippingCost,
                    shippingCost,
                    status: 'PENDING_PAYMENT',

                    address: {
                        create: {
                            userId,
                            ...parsedAddress.data,
                        },
                    },

                    items: {
                        create: orderItemsData,
                    },
                },
            }),
        );

        return NextResponse.json({ orderId: order.id });
    } catch (err) {
        const isDbError = err instanceof DatabaseUnavailableError;
        return NextResponse.json(
            { error: isDbError ? err.message : 'خطا در ثبت سفارش' },
            { status: isDbError ? 503 : 500 },
        );
    }
}
