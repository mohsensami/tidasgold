import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/db-retry";
import { verifyPayment } from "@/lib/zarinpal";
import { SITE } from "@/lib/constants";

function redirectToOrders(status: "success" | "failed" | "error") {
  return NextResponse.redirect(`${SITE.url}/dashboard/orders?status=${status}`);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const authority = url.searchParams.get("Authority");
  const status = url.searchParams.get("Status");

  if (!authority) return redirectToOrders("error");

  try {
    const order = await withRetry(() =>
      prisma.order.findFirst({ where: { zarinpalAuthority: authority }, include: { items: true } })
    );
    if (!order) return redirectToOrders("error");

    // اگر قبلاً تایید و پردازش شده (مثلاً کاربر صفحه را رفرش کرده)، دوباره موجودی کم نشود
    if (order.status !== "PENDING_PAYMENT") return redirectToOrders("success");

    if (status !== "OK") {
      await withRetry(() => prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } }));
      return redirectToOrders("failed");
    }

    const { refId } = await verifyPayment(authority, order.totalAmount);

    // آپدیت سفارش + کم‌کردن موجودی محصولات با هم، تا در صورت خطا هیچ‌کدام انجام نشود
    await withRetry(() =>
      prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { status: "PROCESSING", zarinpalRefId: refId },
        }),
        ...order.items.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        ),
      ])
    );

    return redirectToOrders("success");
  } catch (err) {
    console.error("خطا در تایید پرداخت سفارش:", err);
    try {
      await withRetry(() =>
        prisma.order.updateMany({
          where: { zarinpalAuthority: authority, status: "PENDING_PAYMENT" },
          data: { status: "CANCELLED" },
        })
      );
    } catch {
      // اگر همین آپدیت هم شکست خورد، کاربر همچنان پیام خطا می‌بیند
    }
    return redirectToOrders("error");
  }
}
