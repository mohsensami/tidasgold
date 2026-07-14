import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().min(3, "نام و نام‌خانوادگی را کامل وارد کنید"),
  province: z.string().min(1, "استان را انتخاب کنید"),
  city: z.string().min(1, "شهر را وارد کنید"),
  addressLine: z.string().min(10, "آدرس را کامل‌تر بنویسید"),
  postalCode: z
    .string()
    .regex(/^\d{10}$/, "کد پستی باید ۱۰ رقم باشد"),
  phone: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست"),
});
export type AddressInput = z.infer<typeof addressSchema>;
