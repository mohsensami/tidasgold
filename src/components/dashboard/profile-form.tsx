"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, User as UserIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileSchema, passwordSchema, type ProfileInput, type PasswordInput } from "@/lib/validations/profile";
import { updateProfile, updateAvatar, changePassword } from "@/app/dashboard/profile/actions";
import { UploadButton } from "@/lib/uploadthing";

interface ProfileFormProps {
  user: {
    name: string | null;
    email: string;
    phone: string | null;
    image: string | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name ?? "", email: user.email, phone: user.phone ?? "" },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordInput>({ resolver: zodResolver(passwordSchema) });

  async function onProfileSubmit(data: ProfileInput) {
    setSavingProfile(true);
    const result = await updateProfile(data);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("اطلاعات حساب با موفقیت بروزرسانی شد");
      router.refresh();
    }
    setSavingProfile(false);
  }

  async function onPasswordSubmit(data: PasswordInput) {
    setSavingPassword(true);
    const result = await changePassword(data);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("رمز عبور با موفقیت تغییر کرد");
      resetPassword();
    }
    setSavingPassword(false);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">تصویر پروفایل</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
            {user.image ? (
              <Image src={user.image} alt={user.name ?? "پروفایل"} fill sizes="64px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <UserIcon className="h-7 w-7" />
              </div>
            )}
          </div>
          <div>
            <UploadButton
              endpoint="avatar"
              appearance={{
                button: "bg-secondary text-secondary-foreground text-xs px-3 py-1.5 h-9 ut-uploading:bg-secondary/70",
                allowedContent: "text-xs text-muted-foreground mt-1",
              }}
              content={{ button: avatarUploading ? "در حال آپلود..." : "تغییر تصویر", allowedContent: "حداکثر ۲ مگابایت" }}
              onUploadBegin={() => setAvatarUploading(true)}
              onClientUploadComplete={async (res) => {
                setAvatarUploading(false);
                const url = res[0]?.url;
                if (!url) return;
                const result = await updateAvatar(url);
                if (result.error) toast.error(result.error);
                else {
                  toast.success("تصویر پروفایل بروزرسانی شد");
                  router.refresh();
                }
              }}
              onUploadError={(err) => {
                setAvatarUploading(false);
                toast.error(`خطا در آپلود تصویر: ${err.message}`);
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">اطلاعات حساب کاربری</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">نام و نام‌خانوادگی</Label>
                <Input id="name" {...registerProfile("name")} />
                {profileErrors.name && <p className="text-xs text-destructive">{profileErrors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">شماره موبایل</Label>
                <Input id="phone" placeholder="09121234567" {...registerProfile("phone")} />
                {profileErrors.phone && <p className="text-xs text-destructive">{profileErrors.phone.message}</p>}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="email">ایمیل</Label>
                <Input id="email" type="email" dir="ltr" {...registerProfile("email")} />
                {profileErrors.email && <p className="text-xs text-destructive">{profileErrors.email.message}</p>}
              </div>
            </div>
            <Button type="submit" variant="gold" disabled={savingProfile}>
              {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
              {savingProfile ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">تغییر رمز عبور</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="currentPassword">رمز عبور فعلی</Label>
                <Input id="currentPassword" type="password" {...registerPassword("currentPassword")} />
                {passwordErrors.currentPassword && (
                  <p className="text-xs text-destructive">{passwordErrors.currentPassword.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">رمز عبور جدید</Label>
                <Input id="newPassword" type="password" {...registerPassword("newPassword")} />
                {passwordErrors.newPassword && (
                  <p className="text-xs text-destructive">{passwordErrors.newPassword.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmNewPassword">تکرار رمز عبور جدید</Label>
                <Input id="confirmNewPassword" type="password" {...registerPassword("confirmNewPassword")} />
                {passwordErrors.confirmNewPassword && (
                  <p className="text-xs text-destructive">{passwordErrors.confirmNewPassword.message}</p>
                )}
              </div>
            </div>
            <Button type="submit" variant="outline" disabled={savingPassword}>
              {savingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
              {savingPassword ? "در حال ذخیره..." : "تغییر رمز عبور"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
