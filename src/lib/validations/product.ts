import { z } from "zod";

/**
 * اسکیمای اعتبارسنجی فرم افزودن/ویرایش محصول در پنل مدیریت.
 * دقیقاً منطبق با مدل Product در prisma/schema.prisma است.
 */
export const productSchema = z.object({
  slug: z
    .string()
    .min(2, "اسلاگ باید حداقل ۲ کاراکتر باشد")
    .regex(/^[a-z0-9-]+$/, "اسلاگ فقط می‌تواند شامل حروف انگلیسی کوچک، عدد و خط تیره باشد"),
  title: z.string().min(3, "عنوان را کامل وارد کنید"),
  description: z.string().min(10, "توضیحات را کامل‌تر بنویسید"),
  categoryId: z.string().min(1, "دسته‌بندی را انتخاب کنید"),
  karat: z.coerce.number().refine((v) => [18, 21, 24].includes(v), "عیار نامعتبر است"),
  weightGrams: z.coerce.number({ invalid_type_error: "وزن را وارد کنید" }).positive("وزن باید بزرگتر از صفر باشد"),
  wage: z.coerce.number({ invalid_type_error: "اجرت را وارد کنید" }).int().min(0, "اجرت نمی‌تواند منفی باشد"),
  profitPercent: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number().min(0).max(100).optional()
  ),
  taxPercent: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number().min(0).max(100).optional()
  ),
  stock: z.coerce.number().int().min(0, "موجودی نمی‌تواند منفی باشد"),
  images: z.array(z.string().url()).min(1, "حداقل یک تصویر آپلود کنید"),
  sizes: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
