"use client";

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
import { Lock, LogIn } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, getProduct } = useCart();
  const { status } = useSession();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>({ resolver: zodResolver(addressSchema) });

  const shippingCost = totalPrice >= SHIPPING.freeShippingThreshold ? 0 : SHIPPING.standardCost;

  async function onSubmit(data: AddressInput) {
    // سفارش واقعاً در دیتابیس ثبت می‌شود (قیمت‌ها دوباره سمت سرور محاسبه می‌شوند تا امن باشد).
    // TODO مرحله بعد: بعد از ساخته‌شدن سفارش، با API زرین‌پال (PaymentRequest) یک
    // authority بگیر و کاربر را به https://www.zarinpal.com/pg/StartPay/{authority}
    // بفرست. بعد از بازگشت کاربر، در یک روت verify وضعیت سفارش را PROCESSING کن.
    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: data, items }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "خطا در ثبت سفارش");
        return;
      }

      toast.success("سفارش شما ثبت شد (درگاه پرداخت هنوز وصل نیست — سفارش در وضعیت در انتظار پرداخت ماند)");
      clearCart();
      router.push("/");
    } catch {
      toast.error("ارتباط با سرور برقرار نشد، دوباره تلاش کنید");
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

  return (
    <div className="container py-8">
      <h1 className="font-display text-2xl font-bold mb-6">تسویه حساب</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <Button type="submit" variant="gold" size="lg" className="w-full mt-4" disabled={isSubmitting}>
            <Lock className="h-4 w-4" />
            {isSubmitting ? "در حال ثبت سفارش..." : "پرداخت با زرین‌پال"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            سفارش واقعاً در دیتابیس ثبت می‌شود؛ فقط اتصال درگاه پرداخت زرین‌پال هنوز کامل نیست.
          </p>
        </form>

        <div className="h-fit rounded-lg border border-border p-5">
          <h2 className="font-bold mb-4">خلاصه سفارش</h2>
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
              <span className="text-secondary">{toToman(totalPrice + shippingCost)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
