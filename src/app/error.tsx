"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("خطای صفحه:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="font-display text-xl font-bold">مشکلی در ارتباط با سرور پیش آمد</h1>
      <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
        چند بار تلاش کردیم به دیتابیس وصل شویم ولی جواب نگرفتیم. ممکن است اتصال اینترنت
        شما یا سرور موقتاً قطع باشد. لطفاً چند لحظه دیگر دوباره امتحان کنید.
      </p>
      <div className="flex gap-3">
        <Button variant="gold" onClick={() => reset()}>
          <RefreshCw className="h-4 w-4" />
          تلاش مجدد
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">
            <Home className="h-4 w-4" />
            بازگشت به صفحه اصلی
          </Link>
        </Button>
      </div>
    </div>
  );
}
