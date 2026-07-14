"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { SITE } from "@/lib/constants";
import { useCart } from "@/context/cart-context";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";
import { Button } from "@/components/ui/button";

export function HeaderNav({ categories }: { categories: Category[] }) {
  const { totalItems } = useCart();
  const { status } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="منو">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

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
          <Button variant="ghost" size="icon" aria-label="جستجو">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="حساب کاربری">
            <Link href={status === "authenticated" ? "/dashboard" : "/login"}>
              <User className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="relative" aria-label="سبد خرید">
            <Link href="/cart">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[11px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>

      {/* منوی موبایل */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 border-t border-border",
          open ? "max-h-96" : "max-h-0"
        )}
      >
        <nav className="container flex flex-col py-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/products?category=${c.slug}`}
              className="py-2.5 text-sm font-medium border-b border-border/60 last:border-0"
              onClick={() => setOpen(false)}
            >
              {c.title}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
