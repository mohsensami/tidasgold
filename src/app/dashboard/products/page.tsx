import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/require-admin";
import { getAllProductsForAdmin } from "@/lib/data/products";
import { getGoldPrice } from "@/lib/data/settings";
import { Button } from "@/components/ui/button";
import { ProductsTable } from "@/components/dashboard/products-table";
import { Plus } from "lucide-react";

export default async function DashboardProductsPage() {
  const session = await requireAdminSession();
  if (!session) redirect("/dashboard");

  const [products, goldPrice] = await Promise.all([getAllProductsForAdmin(), getGoldPrice()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">مدیریت محصولات</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            افزودن، ویرایش و حذف محصولات فروشگاه ({products.length} محصول)
          </p>
        </div>
        <Button variant="gold" asChild>
          <Link href="/dashboard/products/new">
            <Plus className="h-4 w-4" />
            افزودن محصول
          </Link>
        </Button>
      </div>

      <ProductsTable products={products} pricePerGram={goldPrice.pricePerGram18k} />
    </div>
  );
}
