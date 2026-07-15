"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toToman } from "@/lib/utils";
import { WALLET } from "@/lib/constants";
import { Wallet, Loader2 } from "lucide-react";

interface Transaction {
  id: string;
  type: "DEPOSIT" | "PURCHASE" | "REFUND";
  status: "PENDING" | "SUCCESS" | "FAILED";
  amount: number;
  description: string | null;
  createdAt: string;
}

const chargeSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: "مبلغ را وارد کنید" })
    .int()
    .min(WALLET.minCharge, `حداقل مبلغ ${toToman(WALLET.minCharge)} است`)
    .max(WALLET.maxCharge, `حداکثر مبلغ ${toToman(WALLET.maxCharge)} است`),
});
type ChargeInput = z.infer<typeof chargeSchema>;

const typeLabel: Record<Transaction["type"], string> = {
  DEPOSIT: "شارژ کیف پول",
  PURCHASE: "خرید",
  REFUND: "بازگشت وجه",
};

const statusVariant: Record<Transaction["status"], "gold" | "new" | "destructive"> = {
  PENDING: "gold",
  SUCCESS: "new",
  FAILED: "destructive",
};

const statusLabel: Record<Transaction["status"], string> = {
  PENDING: "در انتظار",
  SUCCESS: "موفق",
  FAILED: "ناموفق",
};

export function WalletPanel({
  balance,
  transactions,
  initialStatus,
}: {
  balance: number;
  transactions: Transaction[];
  initialStatus?: "success" | "failed" | "error";
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialStatus === "success") toast.success("کیف پول شما با موفقیت شارژ شد");
    else if (initialStatus === "failed") toast.error("پرداخت ناموفق بود یا توسط شما لغو شد");
    else if (initialStatus === "error") toast.error("خطایی در تایید پرداخت رخ داد، با پشتیبانی تماس بگیرید");

    if (initialStatus) {
      // پاک کردن query param از URL تا با رفرش دوباره toast نشان داده نشود
      router.replace("/dashboard/wallet");
    }
  }, [initialStatus, router]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ChargeInput>({ resolver: zodResolver(chargeSchema) });

  async function onSubmit(data: ChargeInput) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/wallet/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: data.amount }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "خطا در شروع فرآیند شارژ");
        setSubmitting(false);
        return;
      }

      // ریدایرکت کامل به درگاه زرین‌پال (نه navigation داخلی)
      window.location.href = json.paymentUrl;
    } catch {
      toast.error("ارتباط با سرور برقرار نشد، دوباره تلاش کنید");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>کیف پول</CardTitle>
          <Wallet className="h-5 w-5 text-gold-500" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-extrabold text-secondary">{toToman(balance)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">شارژ کیف پول</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {WALLET.quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setValue("amount", amt, { shouldValidate: true })}
                  className="rounded-md border border-input px-3 py-1.5 text-xs font-medium hover:border-secondary hover:text-secondary"
                >
                  {toToman(amt)}
                </button>
              ))}
            </div>
            <div className="space-y-1.5 max-w-xs">
              <Label htmlFor="amount">مبلغ دلخواه (تومان)</Label>
              <Input id="amount" type="number" inputMode="numeric" {...register("amount")} />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <Button type="submit" variant="gold" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitting ? "در حال انتقال به درگاه..." : "پرداخت با زرین‌پال"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">تاریخچه تراکنش‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">هنوز تراکنشی ثبت نشده.</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm"
                >
                  <div>
                    <p className="font-medium">{t.description || typeLabel[t.type]}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(t.createdAt).toLocaleString("fa-IR", { timeZone: "Asia/Tehran" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariant[t.status]}>{statusLabel[t.status]}</Badge>
                    <span
                      className={
                        t.type === "DEPOSIT" || t.type === "REFUND"
                          ? "font-bold text-emerald-600"
                          : "font-bold text-destructive"
                      }
                    >
                      {t.type === "DEPOSIT" || t.type === "REFUND" ? "+" : "-"}
                      {toToman(t.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
