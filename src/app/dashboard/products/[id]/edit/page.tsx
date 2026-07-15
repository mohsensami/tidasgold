import { redirect, notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/require-admin";
import { getAllCategories } from "@/lib/data/categories";
import { getProductByIdForAdmin } from "@/lib/data/products";
import { ProductForm } from "@/components/dashboard/product-form";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const session = await requireAdminSession();
  if (!session) redirect("/dashboard");

  const [categories, product] = await Promise.all([
    getAllCategories(),
    getProductByIdForAdmin(params.id),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">ویرایش محصول</h1>
        <p className="mt-1 text-sm text-muted-foreground">{product.title}</p>
      </div>

      <ProductForm categories={categories} product={product} />
    </div>
  );
}
