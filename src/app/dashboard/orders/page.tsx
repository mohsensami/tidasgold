import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserOrders } from "@/lib/data/orders";
import { OrdersPanel } from "@/components/dashboard/orders-panel";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: "success" | "failed" | "error" };
}) {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id as string;
  const orders = await getUserOrders(userId);

  return (
    <OrdersPanel
      orders={orders.map((o) => ({
        id: o.id,
        status: o.status,
        totalAmount: o.totalAmount,
        shippingCost: o.shippingCost,
        zarinpalRefId: o.zarinpalRefId,
        createdAt: o.createdAt.toISOString(),
        items: o.items.map((i) => ({
          id: i.id,
          title: i.product.title,
          image: i.product.images[0] ?? null,
          quantity: i.quantity,
          size: i.size,
          priceAtPurchase: i.priceAtPurchase,
        })),
      }))}
      initialStatus={searchParams.status}
    />
  );
}
