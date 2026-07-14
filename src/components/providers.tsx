"use client";

import { SessionProvider } from "next-auth/react";
import { ProgressProvider } from "@bprogress/next/app";
import { CartProvider } from "@/context/cart-context";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider
      height="3px"
      color="#B8935A"
      options={{ showSpinner: false }}
      shallowRouting
    >
      <SessionProvider>
        <CartProvider>
          {children}
          <Toaster position="top-center" richColors dir="rtl" />
        </CartProvider>
      </SessionProvider>
    </ProgressProvider>
  );
}
