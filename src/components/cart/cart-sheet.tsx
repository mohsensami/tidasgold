"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { toToman } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

export function CartSheet() {
  const { items, isCartOpen, closeCart, openCart, getProduct, updateQuantity, removeItem, totalPrice } =
    useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => (open ? openCart() : closeCart())}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>سبد خرید ({items.length})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">سبد خرید شما خالی است</p>
            <SheetClose asChild>
              <Button variant="gold" asChild>
                <Link href="/products">مشاهده محصولات</Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto py-2">
              {items.map((item) => {
                const product = getProduct(item.productId);
                if (!product) return null;
                return (
                  <div key={product.id + (item.size ?? "")} className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <Link
                          href={`/products/${product.slug}`}
                          onClick={closeCart}
                          className="text-sm font-medium hover:text-secondary"
                        >
                          {product.title}
                        </Link>
                        {item.size && (
                          <p className="text-xs text-muted-foreground">سایز: {item.size}</p>
                        )}
                        <p className="text-sm font-bold text-secondary">
                          {toToman(product.finalPrice ?? 0)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center rounded-md border border-input">
                          <button
                            className="flex h-7 w-7 items-center justify-center"
                            onClick={() => updateQuantity(product.id, item.quantity - 1, item.size)}
                            aria-label="کاهش تعداد"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs">{item.quantity}</span>
                          <button
                            className="flex h-7 w-7 items-center justify-center"
                            onClick={() => updateQuantity(product.id, item.quantity + 1, item.size)}
                            aria-label="افزایش تعداد"
                          >
                            <Plus className="h-3 w-3" />
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

            <SheetFooter className="border-t border-border pt-4 sm:flex-col">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">جمع کل</span>
                <span className="font-bold text-secondary">{toToman(totalPrice)}</span>
              </div>
              <div className="flex w-full gap-2">
                <SheetClose asChild>
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href="/cart">مشاهده سبد خرید</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="gold" className="flex-1" asChild>
                    <Link href="/checkout">تکمیل خرید</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
