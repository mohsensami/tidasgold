"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    const res = await signIn("credentials", { ...data, redirect: false });
    if (res?.error) {
      toast.error("ایمیل یا رمز عبور اشتباه است");
      return;
    }
    toast.success("خوش آمدید");
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold text-center mb-1">ورود به حساب کاربری</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          کاربر نمونه: demo@talagold.ir / 123456
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">ایمیل</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">رمز عبور</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "در حال ورود..." : "ورود"}
          </Button>
        </form>
        <p className="text-sm text-center mt-6 text-muted-foreground">
          حساب کاربری ندارید؟{" "}
          <Link href="/register" className="text-secondary font-medium hover:underline">
            ثبت‌نام
          </Link>
        </p>
      </div>
    </div>
  );
}
