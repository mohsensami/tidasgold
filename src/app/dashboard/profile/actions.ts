"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRetry, DatabaseUnavailableError } from "@/lib/db-retry";
import { profileSchema, passwordSchema, type ProfileInput, type PasswordInput } from "@/lib/validations/profile";
import { Prisma } from "@prisma/client";

type ActionResult = { error?: string; ok?: boolean };

async function requireUserId() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  return userId ?? null;
}

export async function updateProfile(input: ProfileInput): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { error: "ابتدا وارد حساب کاربری شوید" };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر است" };

  try {
    await withRetry(() =>
      prisma.user.update({
        where: { id: userId },
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone || null,
        },
      })
    );
    revalidatePath("/dashboard/profile");
    return { ok: true };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "این ایمیل قبلاً برای حساب دیگری استفاده شده است" };
    }
    const isDbError = err instanceof DatabaseUnavailableError;
    return { error: isDbError ? err.message : "خطا در بروزرسانی اطلاعات" };
  }
}

export async function updateAvatar(url: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { error: "ابتدا وارد حساب کاربری شوید" };

  try {
    await withRetry(() => prisma.user.update({ where: { id: userId }, data: { image: url } }));
    revalidatePath("/dashboard/profile");
    return { ok: true };
  } catch (err) {
    const isDbError = err instanceof DatabaseUnavailableError;
    return { error: isDbError ? err.message : "خطا در بروزرسانی تصویر" };
  }
}

export async function changePassword(input: PasswordInput): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { error: "ابتدا وارد حساب کاربری شوید" };

  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر است" };

  try {
    const user = await withRetry(() => prisma.user.findUnique({ where: { id: userId } }));
    if (!user?.password) return { error: "این حساب رمز عبوری برای تغییر ندارد" };

    const isValid = await bcrypt.compare(parsed.data.currentPassword, user.password);
    if (!isValid) return { error: "رمز عبور فعلی اشتباه است" };

    const newHash = await bcrypt.hash(parsed.data.newPassword, 10);
    await withRetry(() => prisma.user.update({ where: { id: userId }, data: { password: newHash } }));
    return { ok: true };
  } catch (err) {
    const isDbError = err instanceof DatabaseUnavailableError;
    return { error: isDbError ? err.message : "خطا در تغییر رمز عبور" };
  }
}
