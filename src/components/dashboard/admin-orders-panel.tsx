import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toToman } from "@/lib/utils";
import { ClipboardList, User, MapPin, CreditCard } from "lucide-react";

type OrderStatus = "PENDING_PAYMENT" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface OrderItem {
  id: string;
  title: string;
  image: string | null;
  quantity: number;
  size: string | null;
  priceAtPurchase: number;
}

interface AdminOrder {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  shippingCost: number;
  createdAt: string;
  paymentMethod: "zarinpal" | "wallet";
  zarinpalRefId: string | null;
  buyer: { name: string | null; email: string; phone: string | null };
  address: {
    fullName: string;
    province: string;
    city: string;
    addressLine: string;
    postalCode: string;
    phone: string;
  };
  items: OrderItem[];
}

const fulfillmentLabel: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "در انتظار پرداخت",
  PROCESSING: "در حال آماده‌سازی",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل داده شده",
  CANCELLED: "لغو شده",
};

const paymentMethodLabel: Record<AdminOrder["paymentMethod"], string> = {
  zarinpal: "زرین‌پال",
  wallet: "کیف پول",
};

export function AdminOrdersPanel({ orders }: { orders: AdminOrder[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>سفارش‌های پرداخت‌شده</CardTitle>
        <ClipboardList className="h-5 w-5 text-gold-500" />
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">هنوز هیچ سفارشی با پرداخت موفق ثبت نشده.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border border-border p-4">
                {/* هدر: شماره سفارش، تاریخ، وضعیت */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <p className="text-xs text-muted-foreground" dir="ltr">
                      #{order.id.slice(-8)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString("fa-IR", { timeZone: "Asia/Tehran" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="new">پرداخت موفق</Badge>
                    <Badge variant="outline">{fulfillmentLabel[order.status]}</Badge>
                  </div>
                </div>

                {/* خریدار + آدرس + روش پرداخت */}
                <div className="grid gap-4 border-b border-border py-3 text-sm sm:grid-cols-3">
                  <div className="flex items-start gap-2">
                    <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{order.buyer.name ?? "بدون نام"}</p>
                      <p className="text-xs text-muted-foreground" dir="ltr">
                        {order.buyer.email}
                      </p>
                      {order.buyer.phone && (
                        <p className="text-xs text-muted-foreground" dir="ltr">
                          {order.buyer.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{order.address.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.address.province}، {order.address.city}، {order.address.addressLine}
                      </p>
                      <p className="text-xs text-muted-foreground" dir="ltr">
                        {order.address.postalCode} — {order.address.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{paymentMethodLabel[order.paymentMethod]}</p>
                      {order.zarinpalRefId && (
                        <p className="text-xs text-muted-foreground" dir="ltr">
                          کد پیگیری: {order.zarinpalRefId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* اقلام سفارش */}
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
