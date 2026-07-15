"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema, type AddressInput } from "@/lib/validations/checkout";
import { useCart } from "@/context/cart-context";
import { toToman } from "@/lib/utils";
import { SHIPPING } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Lock, LogIn, Loader2, Wallet } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, getProduct } = useCart();
  const { status } = useSession();
  const router = useRouter();
  const [submitting, setSubmitting] = useState<"zarinpal" | "wallet" | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressInput>({ resolver: zodResolver(addressSchema) });

  const shippingCost = totalPrice >= SHIPPING.freeShippingThreshold ? 0 : SHIPPING.standardCost;
  const finalAmount = totalPrice + shippingCost;

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/wallet/balance")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setWalletBalance(data?.balance ?? null))
      .catch(() => setWalletBalance(null));
  }, [status]);

  async function payWithZarinpal(data: AddressInput) {
    setSubmitting("zarinpal");
    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: data, items }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "خطا در ثبت سفارش");
        setSubmitting(null);
        return;
      }

      clearCart();
      // ریدایرکت کامل به درگاه زرین‌پال (نه navigation داخلی)
      window.location.href = json.paymentUrl;
    } catch {
      toast.error("ارتباط با سرور برقرار نشد، دوباره تلاش کنید");
      setSubmitting(null);
    }
  }

  async function payWithWallet(data: AddressInput) {
    setSubmitting("wallet");
    try {
      const res = await fetch("/api/checkout/pay-with-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: data, items }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "خطا در پرداخت با کیف پول");
        setSubmitting(null);
        return;
      }

      clearCart();
      toast.success("پرداخت با موفقیت از کیف پول انجام شد");
      router.push("/dashboard/orders?status=success");
    } catch {
      toast.error("ارتباط با سرور برقرار نشد، دوباره تلاش کنید");
      setSubmitting(null);
    }
  }

  if (status === "unauthenticated") {
    return (
      <div className="container flex flex-col items-center justify-center gap-4 py-24 text-center">
        <LogIn className="h-10 w-10 text-gold-500" />
        <p className="font-bold">برای ادامه خرید ابتدا وارد حساب کاربری شوید</p>
        <Button variant="gold" size="lg" asChild>
          <Link href="/login">ورود / ثبت‌نام</Link>
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center text-muted-foreground">
        سبد خرید شما خالی است.
      </div>
    );
  }

  const insufficientWalletBalance = walletBalance !== null && walletBalance < finalAmount;

  return (
    <div className="container py-8">
      <h1 className="font-display text-2xl font-bold mb-6">تسویه حساب</h1>
      <form onSubmit={handleSubmit(payWithZarinpal)} className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <h2 className="font-bold">آدرس تحویل</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">نام و نام‌خانوادگی</Label>
              <Input id="fullName" {...register("fullName")} />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">شماره موبایل</Label>
              <Input id="phone" placeholder="09121234567" {...register("phone")} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="province">استان</Label>
              <Input id="province" {...register("province")} />
              {errors.province && <p className="text-xs text-destructive">{errors.province.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">شهر</Label>
              <Input id="city" {...register("city")} />
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="addressLine">آدرس کامل</Label>
              <Input id="addressLine" {...register("addressLine")} />
              {errors.addressLine && <p className="text-xs text-destructive">{errors.addressLine.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="postalCode">کد پستی</Label>
              <Input id="postalCode" {...register("postalCode")} />
              {errors.postalCode && <p className="text-xs text-destructive">{errors.postalCode.message}</p>}
            </div>
          </div>
        </div>

        {/* ستون سمت چپ: خلاصه سفارش + دکمه‌های پرداخت — دقیقاً مثل قالب ووکامرس/وودمارت
            که «ثبت سفارش/پرداخت» زیر جدول خلاصه سفارش قرار می‌گیرد، نه زیر فرم آدرس. */}
        <div className="h-fit space-y-4 rounded-lg border border-border p-5">
          <h2 className="font-bold">خلاصه سفارش</h2>
          <ul className="space-y-2 text-sm text-muted-foreground mb-3">
            {items.map((item) => {
              const product = getProduct(item.productId);
              if (!product) return null;
              return (
                <li key={product.id + (item.size ?? "")} className="flex justify-between">
                  <span>{product.title} × {item.quantity}</span>
                  <span>{toToman((product.finalPrice ?? 0) * item.quantity)}</span>
                </li>
              );
            })}
          </ul>
          <div className="space-y-2 text-sm border-t border-border pt-3">
            <div className="flex justify-between text-muted-foreground">
              <span>هزینه ارسال</span>
              <span>{shippingCost === 0 ? "رایگان" : toToman(shippingCost)}</span>
            </div>
            <div className="flex justify-between font-bold text-base">
              <span>مبلغ نهایی</span>
              <span className="text-secondary">{toToman(finalAmount)}</span>
            </div>
          </div>

          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full mt-2"
            disabled={submitting !== null}
          >
            {submitting === "zarinpal" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            {submitting === "zarinpal" ? "در حال انتقال به درگاه..." : "پرداخت با زرین‌پال"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            disabled={submitting !== null || insufficientWalletBalance}
            onClick={handleSubmit(payWithWallet)}
          >
            {submitting === "wallet" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
            {submitting === "wallet" ? "در حال پرداخت..." : "پرداخت با کیف پول"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            {walletBalance === null
              ? "با کلیک روی پرداخت، به درگاه امن زرین‌پال منتقل می‌شوید."
              : insufficientWalletBalance
                ? `موجودی کیف پول شما ${toToman(walletBalance)} است و برای این خرید کافی نیست.`
                : `موجودی کیف پول: ${toToman(walletBalance)}`}
          </p>
        </div>
      </form>
    </div>
  );
}
