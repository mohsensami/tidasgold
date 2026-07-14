"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema, type AddressInput } from "@/lib/validations/checkout";
import { useCart } from "@/context/cart-context";
import { calculateGoldPrice } from "@/lib/price";
import { toToman } from "@/lib/utils";
import { SHIPPING } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, getProduct } = useCart();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>({ resolver: zodResolver(addressSchema) });

  const shippingCost = totalPrice >= SHIPPING.freeShippingThreshold ? 0 : SHIPPING.standardCost;

  async function onSubmit(data: AddressInput) {
    // TODO: وقتی کلید زرین‌پال آماده شد:
    // 1) این داده‌ها + سبد خرید را به یک Route Handler مثل
    //    /api/checkout/create-order بفرست
    // 2) آن route با Prisma یک Order با status=PENDING_PAYMENT بسازد
    // 3) با API زرین‌پال (PaymentRequest) یک authority بگیرد و کاربر را به
    //    درگاه ریدایرکت کند: https://www.zarinpal.com/pg/StartPay/{authority}
    // 4) بعد از بازگشت کاربر، در /api/checkout/verify با Verification
    //    زرین‌پال، وضعیت سفارش را PROCESSING کند.
    await new Promise((r) => setTimeout(r, 900));
    console.log("سفارش (نمونه):", { address: data, items, totalPrice: totalPrice + shippingCost });
    toast.success("سفارش شما ثبت شد (حالت نمایشی — درگاه پرداخت هنوز وصل نیست)");
    clearCart();
    router.push("/");
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
            {isSubmitting ? "در حال انتقال..." : "پرداخت با زرین‌پال"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            درگاه پرداخت هنوز به کلید واقعی زرین‌پال وصل نیست — این ثبت سفارش فقط نمایشی است.
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
                  <span>{toToman(calculateGoldPrice(product).total * item.quantity)}</span>
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
