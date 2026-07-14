"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/cart-context";
import { calculateGoldPrice } from "@/lib/price";
import { toToman } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { SHIPPING } from "@/lib/constants";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, getProduct } = useCart();

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/40" />
        <p className="mt-4 text-lg font-medium">سبد خرید شما خالی است</p>
        <Button variant="gold" size="lg" className="mt-6" asChild>
          <Link href="/products">مشاهده محصولات</Link>
        </Button>
      </div>
    );
  }

  const shippingCost = totalPrice >= SHIPPING.freeShippingThreshold ? 0 : SHIPPING.standardCost;

  return (
    <div className="container py-8">
      <h1 className="font-display text-2xl font-bold mb-6">سبد خرید</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {items.map((item) => {
            const product = getProduct(item.productId);
            if (!product) return null;
            const { total } = calculateGoldPrice(product);
            return (
              <div
                key={product.id + (item.size ?? "")}
                className="flex gap-4 rounded-lg border border-border p-4"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link href={`/products/${product.slug}`} className="text-sm font-bold hover:text-secondary">
                      {product.title}
                    </Link>
                    {item.size && (
                      <p className="text-xs text-muted-foreground mt-0.5">سایز: {item.size}</p>
                    )}
                    <p className="text-sm font-bold text-secondary mt-1">{toToman(total)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-md border border-input">
                      <button
                        className="flex h-8 w-8 items-center justify-center"
                        onClick={() => updateQuantity(product.id, item.quantity - 1, item.size)}
                        aria-label="کاهش تعداد"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        className="flex h-8 w-8 items-center justify-center"
                        onClick={() => updateQuantity(product.id, item.quantity + 1, item.size)}
                        aria-label="افزایش تعداد"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(product.id, item.size)}
                      aria-label="حذف از سبد"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-fit rounded-lg border border-border p-5">
          <h2 className="font-bold mb-4">خلاصه سفارش</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>جمع کالاها</span>
              <span>{toToman(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>هزینه ارسال</span>
              <span>{shippingCost === 0 ? "رایگان" : toToman(shippingCost)}</span>
            </div>
          </div>
          <div className="mt-3 flex justify-between border-t border-border pt-3 font-bold">
            <span>مبلغ قابل پرداخت</span>
            <span className="text-secondary">{toToman(totalPrice + shippingCost)}</span>
          </div>
          <Button variant="gold" size="lg" className="w-full mt-5" asChild>
            <Link href="/checkout">ادامه فرآیند خرید</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
