"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { ShoppingBag, User, Menu } from "lucide-react";
import { SITE } from "@/lib/constants";
import { useCart } from "@/context/cart-context";
import type { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose, SheetTrigger } from "@/components/ui/sheet";
import { SearchSheet } from "@/components/layout/search-sheet";

export function HeaderNav({ categories }: { categories: Category[] }) {
  const { totalItems, openCart } = useCart();
  const { status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="منو">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader className="mb-4">
              <SheetTitle>{SITE.name}</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col">
              {categories.map((c) => (
                <SheetClose asChild key={c.slug}>
                  <Link
                    href={`/products?category=${c.slug}`}
                    className="py-2.5 text-sm font-medium border-b border-border/60 last:border-0"
                  >
                    {c.title}
                  </Link>
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="font-display text-2xl font-extrabold gold-shimmer">{SITE.name}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/products?category=${c.slug}`}
              className="text-sm font-medium text-foreground/80 hover:text-secondary transition-colors"
            >
              {c.title}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <SearchSheet />
          <Button variant="ghost" size="icon" asChild aria-label="حساب کاربری">
            <Link href={status === "authenticated" ? "/dashboard" : "/login"}>
              <User className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="سبد خرید"
            onClick={openCart}
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[11px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
