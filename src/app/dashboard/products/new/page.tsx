import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/require-admin";
import { getAllCategories } from "@/lib/data/categories";
import { ProductForm } from "@/components/dashboard/product-form";

export default async function NewProductPage() {
  const session = await requireAdminSession();
  if (!session) redirect("/dashboard");

  const categories = await getAllCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">افزودن محصول جدید</h1>
        <p className="mt-1 text-sm text-muted-foreground">اطلاعات محصول را کامل کنید و تصاویر آن را آپلود کنید.</p>
      </div>

      {categories.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
          ابتدا باید حداقل یک دسته‌بندی در دیتابیس ثبت شود.
        </p>
      ) : (
        <ProductForm categories={categories} />
      )}
    </div>
  );
}
