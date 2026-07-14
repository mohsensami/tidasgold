import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "ایمیل را وارد کنید").email("ایمیل معتبر نیست"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
    email: z.string().min(1, "ایمیل را وارد کنید").email("ایمیل معتبر نیست"),
    phone: z
      .string()
      .regex(/^09\d{9}$/, "شماره موبایل معتبر نیست (مثال: 09121234567)"),
    password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تکرار آن یکسان نیستند",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;
