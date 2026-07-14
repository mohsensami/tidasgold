import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/db-retry";
import { verifyPayment } from "@/lib/zarinpal";
import { SITE } from "@/lib/constants";

function redirectToWallet(status: "success" | "failed" | "error") {
  return NextResponse.redirect(`${SITE.url}/dashboard/wallet?status=${status}`);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const authority = url.searchParams.get("Authority");
  const status = url.searchParams.get("Status");

  if (!authority) return redirectToWallet("error");

  try {
    const transaction = await withRetry(() =>
      prisma.walletTransaction.findUnique({ where: { zarinpalAuthority: authority } })
    );
    if (!transaction) return redirectToWallet("error");

    // اگر قبلاً موفق ثبت شده (مثلاً کاربر صفحه رفرش کرده)، دوباره شارژ نکن
    if (transaction.status === "SUCCESS") return redirectToWallet("success");

    if (status !== "OK") {
      await withRetry(() =>
        prisma.walletTransaction.update({ where: { id: transaction.id }, data: { status: "FAILED" } })
      );
      return redirectToWallet("failed");
    }

    const { refId } = await verifyPayment(authority, transaction.amount);

    // آپدیت تراکنش + افزایش موجودی کیف پول با هم، تا در صورت خطا هیچ‌کدام انجام نشود
    await withRetry(() =>
      prisma.$transaction([
        prisma.walletTransaction.update({
          where: { id: transaction.id },
          data: { status: "SUCCESS", zarinpalRefId: refId },
        }),
        prisma.wallet.update({
          where: { id: transaction.walletId },
          data: { balance: { increment: transaction.amount } },
        }),
      ])
    );

    return redirectToWallet("success");
  } catch (err) {
    console.error("خطا در تایید پرداخت زرین‌پال:", err);
    // تراکنش را FAILED می‌کنیم تا در تاریخچه گم نشود (اگر توانستیم پیدایش کنیم)
    try {
      await withRetry(() =>
        prisma.walletTransaction.updateMany({
          where: { zarinpalAuthority: authority, status: "PENDING" },
          data: { status: "FAILED" },
        })
      );
    } catch {
      // اگر همین آپدیت هم شکست خورد، کاربر همچنان پیام خطا می‌بیند و می‌تواند از پشتیبانی پیگیری کند
    }
    return redirectToWallet("error");
  }
}
