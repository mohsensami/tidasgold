import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  email: z.string().min(1, "ایمیل را وارد کنید").email("ایمیل معتبر نیست"),
  phone: z
    .string()
    .regex(/^09\d{9}$/, "شماره موبایل معتبر نیست (مثال: 09121234567)")
    .or(z.literal(""))
    .optional(),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "رمز عبور فعلی را وارد کنید"),
    newPassword: z.string().min(6, "رمز عبور جدید باید حداقل ۶ کاراکتر باشد"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "رمز عبور جدید و تکرار آن یکسان نیستند",
    path: ["confirmNewPassword"],
  });
export type PasswordInput = z.infer<typeof passwordSchema>;
