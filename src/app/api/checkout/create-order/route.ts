import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withRetry, DatabaseUnavailableError } from '@/lib/db-retry';
import { addressSchema } from '@/lib/validations/checkout';
import { buildOrderPricing } from '@/lib/checkout-helpers';
import { SITE } from '@/lib/constants';
import { requestPayment, ZarinpalError } from '@/lib/zarinpal';
import type { CartItem } from '@/types';

/**
 * ثبت سفارش واقعی در دیتابیس (Order + OrderItem + Address) و سپس اتصال
 * به درگاه زرین‌پال، دقیقاً مثل فرآیند شارژ کیف پول (src/app/api/wallet/charge/route.ts):
 * سفارش با status=PENDING_PAYMENT ساخته می‌شود، از زرین‌پال authority گرفته
 * می‌شود و روی سفارش ذخیره می‌شود، و paymentUrl به کلاینت برمی‌گردد تا
 * کاربر را کامل به درگاه ریدایرکت کند. تایید نهایی در
 * src/app/api/checkout/verify/route.ts انجام می‌شود.
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
        const { orderItemsData, shippingCost, finalAmount } = await buildOrderPricing(items);

        const order = await withRetry(() =>
            prisma.order.create({
                data: {
                    user: {
                        connect: {
                            id: userId,
                        },
                    },

                    totalAmount: finalAmount,
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

        const callbackUrl = `${SITE.url}/api/checkout/verify`;

        const { authority, paymentUrl } = await requestPayment({
            amountToman: finalAmount,
            description: `پرداخت سفارش ${SITE.name}`,
            callbackUrl,
            mobile: parsedAddress.data.phone,
            email: session?.user?.email ?? undefined,
        });

        await withRetry(() =>
            prisma.order.update({ where: { id: order.id }, data: { zarinpalAuthority: authority } }),
        );

        return NextResponse.json({ paymentUrl });
    } catch (err) {
        if (err instanceof ZarinpalError) {
            return NextResponse.json({ error: err.message }, { status: 502 });
        }
        const isDbError = err instanceof DatabaseUnavailableError;
        return NextResponse.json(
            { error: isDbError ? err.message : err instanceof Error ? err.message : 'خطا در ثبت سفارش' },
            { status: isDbError ? 503 : 500 },
        );
    }
}
