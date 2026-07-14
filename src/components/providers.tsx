"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/context/cart-context";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <Toaster position="top-center" richColors dir="rtl" />
      </CartProvider>
    </SessionProvider>
  );
}
