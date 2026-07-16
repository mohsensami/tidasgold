import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/require-admin";
import { getPaidOrdersForAdmin } from "@/lib/data/orders";
import { AdminOrdersPanel } from "@/components/dashboard/admin-orders-panel";

export default async function AdminOrdersPage() {
  const session = await requireAdminSession();
  if (!session) redirect("/dashboard");

  const orders = await getPaidOrdersForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">سفارشات</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          سفارش‌هایی که پرداختشان با موفقیت انجام شده ({orders.length} سفارش)
        </p>
      </div>

      <AdminOrdersPanel
        orders={orders.map((o) => ({
          id: o.id,
          status: o.status,
          totalAmount: o.totalAmount,
          shippingCost: o.shippingCost,
          createdAt: o.createdAt.toISOString(),
          paymentMethod: o.zarinpalRefId ? "zarinpal" : "wallet",
          zarinpalRefId: o.zarinpalRefId,
          buyer: {
            name: o.user.name,
            email: o.user.email,
            phone: o.user.phone,
          },
          address: {
            fullName: o.address.fullName,
            province: o.address.province,
            city: o.address.city,
            addressLine: o.address.addressLine,
            postalCode: o.address.postalCode,
            phone: o.address.phone,
          },
          items: o.items.map((i) => ({
            id: i.id,
            title: i.product.title,
            image: i.product.images[0] ?? null,
            quantity: i.quantity,
            size: i.size,
            priceAtPurchase: i.priceAtPurchase,
          })),
        }))}
      />
    </div>
  );
}
