"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toToman } from "@/lib/utils";
import { ReceiptText } from "lucide-react";

type OrderStatus = "PENDING_PAYMENT" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface OrderItem {
  id: string;
  title: string;
  image: string | null;
  quantity: number;
  size: string | null;
  priceAtPurchase: number;
}

interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  shippingCost: number;
  zarinpalRefId: string | null;
  createdAt: string;
  items: OrderItem[];
}

const fulfillmentLabel: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "در انتظار پرداخت",
  PROCESSING: "در حال آماده‌سازی",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل داده شده",
  CANCELLED: "لغو شده",
};

function paymentInfo(order: Order): { label: string; variant: "gold" | "new" | "destructive" } {
  if (order.status === "CANCELLED") return { label: "پرداخت ناموفق", variant: "destructive" };
  if (order.status === "PENDING_PAYMENT") return { label: "در انتظار پرداخت", variant: "gold" };
  return { label: "پرداخت موفق", variant: "new" };
}

export function OrdersPanel({
  orders,
  initialStatus,
}: {
  orders: Order[];
  initialStatus?: "success" | "failed" | "error";
}) {
  const router = useRouter();

  useEffect(() => {
    if (initialStatus === "success") toast.success("پرداخت با موفقیت انجام شد، سفارش شما ثبت شد");
    else if (initialStatus === "failed") toast.error("پرداخت ناموفق بود یا توسط شما لغو شد");
    else if (initialStatus === "error") toast.error("خطایی در تایید پرداخت رخ داد، با پشتیبانی تماس بگیرید");

    if (initialStatus) {
      router.replace("/dashboard/orders");
    }
  }, [initialStatus, router]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>وضعیت پرداخت</CardTitle>
          <ReceiptText className="h-5 w-5 text-gold-500" />
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">هنوز سفارشی ثبت نکرده‌اید.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const payment = paymentInfo(order);
                return (
                  <div key={order.id} className="rounded-lg border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                      <div>
                        <p className="text-xs text-muted-foreground" dir="ltr">
                          #{order.id.slice(-8)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(order.createdAt).toLocaleString("fa-IR", { timeZone: "Asia/Tehran" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={payment.variant}>{payment.label}</Badge>
                        <Badge variant="outline">{fulfillmentLabel[order.status]}</Badge>
                      </div>
                    </div>

                    <ul className="space-y-2 py-3">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex items-center gap-3 text-sm">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                            {item.image && (
                              <Image src={item.image} alt={item.title} fill sizes="40px" className="object-cover" />
                            )}
                          </div>
                          <span className="flex-1">
                            {item.title}
                            {item.size ? ` (سایز ${item.size})` : ""} × {item.quantity}
                          </span>
                          <span className="text-muted-foreground">
                            {toToman(item.priceAtPurchase * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                      <span className="text-muted-foreground">
                        هزینه ارسال: {order.shippingCost === 0 ? "رایگان" : toToman(order.shippingCost)}
                      </span>
                      <span className="font-bold text-secondary">{toToman(order.totalAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
