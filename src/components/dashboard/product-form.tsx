"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, X, ImagePlus } from "lucide-react";
import { productSchema, type ProductInput } from "@/lib/validations/product";
import { createProduct, updateProduct } from "@/app/dashboard/products/actions";
import { UploadDropzone } from "@/lib/uploadthing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/types";
import type { AdminProduct } from "@/lib/data/products";
import { KARAT_OPTIONS } from "@/lib/constants";

interface ProductFormProps {
  categories: Category[];
  /** اگر پر باشد یعنی حالت ویرایش است */
  product?: AdminProduct;
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          slug: product.slug,
          title: product.title,
          description: product.description,
          categoryId: product.categoryId,
          karat: product.karat,
          weightGrams: product.weightGrams,
          wage: product.wage,
          profitPercent: product.profitPercent,
          taxPercent: product.taxPercent,
          stock: product.stock,
          images: product.images,
          sizes: product.sizes ?? [],
          isFeatured: product.isFeatured ?? false,
          isNew: product.isNew ?? false,
        }
      : {
          images: [],
          sizes: [],
          stock: 0,
          isFeatured: false,
          isNew: false,
        },
  });

  const images = watch("images") ?? [];
  const sizes = watch("sizes") ?? [];

  function removeImage(url: string) {
    setValue(
      "images",
      images.filter((i) => i !== url),
      { shouldValidate: true }
    );
  }

  async function onSubmit(data: ProductInput) {
    setSubmitting(true);
    try {
      const result = isEdit ? await updateProduct(product!.id, data) : await createProduct(data);

      if (result.error) {
        toast.error(result.error);
        setSubmitting(false);
        return;
      }

      toast.success(isEdit ? "محصول ویرایش شد" : "محصول با موفقیت اضافه شد");
      router.push("/dashboard/products");
      router.refresh();
    } catch {
      toast.error("خطایی رخ داد، دوباره تلاش کنید");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">اطلاعات پایه</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">عنوان محصول</Label>
              <Input id="title" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">اسلاگ (برای آدرس صفحه، انگلیسی)</Label>
              <Input id="slug" dir="ltr" placeholder="mens-gold-ring-01" {...register("slug")} />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">توضیحات</Label>
            <Textarea id="description" rows={4} {...register("description")} />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>دسته‌بندی</Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="یک دسته‌بندی انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && (
                <p className="text-xs text-destructive">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>عیار</Label>
              <Controller
                control={control}
                name="karat"
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="عیار را انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      {KARAT_OPTIONS.map((k) => (
                        <SelectItem key={k} value={String(k)}>
                          عیار {k}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.karat && <p className="text-xs text-destructive">{errors.karat.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">قیمت‌گذاری و موجودی</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="weightGrams">وزن (گرم)</Label>
            <Input id="weightGrams" type="number" step="0.01" {...register("weightGrams")} />
            {errors.weightGrams && (
              <p className="text-xs text-destructive">{errors.weightGrams.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wage">اجرت ساخت (تومان)</Label>
            <Input id="wage" type="number" {...register("wage")} />
            {errors.wage && <p className="text-xs text-destructive">{errors.wage.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stock">موجودی (عدد)</Label>
            <Input id="stock" type="number" {...register("stock")} />
            {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profitPercent">درصد سود (اختیاری)</Label>
            <Input id="profitPercent" type="number" step="0.1" placeholder="پیش‌فرض سایت" {...register("profitPercent")} />
            {errors.profitPercent && (
              <p className="text-xs text-destructive">{errors.profitPercent.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="taxPercent">درصد مالیات (اختیاری)</Label>
            <Input id="taxPercent" type="number" step="0.1" placeholder="پیش‌فرض سایت" {...register("taxPercent")} />
            {errors.taxPercent && (
              <p className="text-xs text-destructive">{errors.taxPercent.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sizesInput">سایزها (با کاما جدا کنید، اختیاری)</Label>
            <Input
              id="sizesInput"
              placeholder="مثلاً: 6,7,8"
              defaultValue={sizes.join(",")}
              onChange={(e) =>
                setValue(
                  "sizes",
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">تصاویر محصول</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {images.map((url) => (
                <div key={url} className="group relative aspect-square overflow-hidden rounded-md border border-border bg-muted">
                  <Image src={url} alt="تصویر محصول" fill sizes="150px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute top-1 left-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="حذف تصویر"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <UploadDropzone
            endpoint="productImage"
            onClientUploadComplete={(res) => {
              const urls = res.map((f) => f.url);
              setValue("images", [...images, ...urls], { shouldValidate: true });
              toast.success("تصاویر با موفقیت آپلود شدند");
            }}
            onUploadError={(err) => {
              toast.error(`خطا در آپلود تصویر: ${err.message}`);
            }}
            appearance={{
              container: "rounded-md border-2 border-dashed border-input py-6",
              label: "text-sm text-foreground",
              allowedContent: "text-xs text-muted-foreground",
              button: "bg-secondary text-secondary-foreground ut-uploading:bg-secondary/70",
            }}
            content={{
              label: "برای آپلود تصویر کلیک کنید یا فایل را بکشید و رها کنید",
              allowedContent: "حداکثر ۶ تصویر، هرکدام تا ۴ مگابایت",
            }}
          />
          {errors.images && <p className="text-xs text-destructive">{errors.images.message as string}</p>}
          {images.length === 0 && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ImagePlus className="h-3.5 w-3.5" /> هنوز تصویری برای این محصول آپلود نشده.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">برچسب‌ها</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" className="h-4 w-4 rounded border-input" {...register("isFeatured")} />
            پرفروش / ویژه
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" className="h-4 w-4 rounded border-input" {...register("isNew")} />
            جدید
          </label>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" variant="gold" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "در حال ذخیره..." : isEdit ? "ذخیره تغییرات" : "افزودن محصول"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/products")}>
          انصراف
        </Button>
      </div>
    </form>
  );
}
