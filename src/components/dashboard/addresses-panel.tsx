"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MapPin, Pencil, Trash2, Plus, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { addressBookSchema, type AddressBookInput } from "@/lib/validations/address";
import { createAddress, updateAddress, deleteAddress, setDefaultAddress } from "@/app/dashboard/addresses/actions";

export interface AddressRecord {
  id: string;
  fullName: string;
  province: string;
  city: string;
  addressLine: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

function AddressForm({
  initial,
  onDone,
  onCancel,
}: {
  initial?: AddressRecord;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressBookInput>({
    resolver: zodResolver(addressBookSchema),
    defaultValues: initial
      ? {
          fullName: initial.fullName,
          province: initial.province,
          city: initial.city,
          addressLine: initial.addressLine,
          postalCode: initial.postalCode,
          phone: initial.phone,
          isDefault: initial.isDefault,
        }
      : { isDefault: false },
  });

  async function onSubmit(data: AddressBookInput) {
    setSaving(true);
    const result = initial ? await updateAddress(initial.id, data) : await createAddress(data);
    if (result.error) {
      toast.error(result.error);
      setSaving(false);
      return;
    }
    toast.success(initial ? "آدرس ویرایش شد" : "آدرس جدید اضافه شد");
    onDone();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-dashed border-input p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">نام و نام‌خانوادگی گیرنده</Label>
          <Input id="fullName" {...register("fullName")} />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">شماره موبایل</Label>
          <Input id="phone" placeholder="09121234567" {...register("phone")} />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="province">استان</Label>
          <Input id="province" {...register("province")} />
          {errors.province && <p className="text-xs text-destructive">{errors.province.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city">شهر</Label>
          <Input id="city" {...register("city")} />
          {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="addressLine">آدرس کامل</Label>
          <Input id="addressLine" {...register("addressLine")} />
          {errors.addressLine && <p className="text-xs text-destructive">{errors.addressLine.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="postalCode">کد پستی</Label>
          <Input id="postalCode" {...register("postalCode")} />
          {errors.postalCode && <p className="text-xs text-destructive">{errors.postalCode.message}</p>}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" className="h-4 w-4 rounded border-input" {...register("isDefault")} />
        تنظیم به‌عنوان آدرس پیش‌فرض
      </label>

      <div className="flex items-center gap-3">
        <Button type="submit" variant="gold" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "در حال ذخیره..." : "ذخیره آدرس"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          انصراف
        </Button>
      </div>
    </form>
  );
}

export function AddressesPanel({ addresses }: { addresses: AddressRecord[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "new" | string>("idle");
  const [busyId, setBusyId] = useState<string | null>(null);

  function refreshAndClose() {
    setMode("idle");
    router.refresh();
  }

  async function handleDelete(address: AddressRecord) {
    if (!confirm(`آیا از حذف آدرس «${address.fullName}» مطمئن هستید؟`)) return;
    setBusyId(address.id);
    const result = await deleteAddress(address.id);
    if (result.error) toast.error(result.error);
    else {
      toast.success("آدرس حذف شد");
      router.refresh();
    }
    setBusyId(null);
  }

  async function handleSetDefault(address: AddressRecord) {
    setBusyId(address.id);
    const result = await setDefaultAddress(address.id);
    if (result.error) toast.error(result.error);
    else {
      toast.success("آدرس پیش‌فرض بروزرسانی شد");
      router.refresh();
    }
    setBusyId(null);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="h-5 w-5 text-gold-500" />
          آدرس‌های من
        </CardTitle>
        {mode === "idle" && (
          <Button size="sm" variant="gold" onClick={() => setMode("new")}>
            <Plus className="h-4 w-4" />
            افزودن آدرس
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {mode === "new" && (
          <AddressForm onDone={refreshAndClose} onCancel={() => setMode("idle")} />
        )}

        {addresses.length === 0 && mode !== "new" ? (
          <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            هنوز آدرسی ثبت نکرده‌اید. برای شروع از دکمه «افزودن آدرس» استفاده کنید.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map((address) =>
              mode === address.id ? (
                <div key={address.id} className="sm:col-span-2">
                  <AddressForm initial={address} onDone={refreshAndClose} onCancel={() => setMode("idle")} />
                </div>
              ) : (
                <div key={address.id} className="relative rounded-lg border border-border p-4 text-sm">
                  {address.isDefault && (
                    <Badge variant="gold" className="absolute -top-2 right-3 flex items-center gap-1">
                      <Star className="h-3 w-3" /> پیش‌فرض
                    </Badge>
                  )}
                  <p className="font-bold">{address.fullName}</p>
                  <p className="mt-1 text-muted-foreground">
                    {address.province}، {address.city}
                  </p>
                  <p className="text-muted-foreground">{address.addressLine}</p>
                  <p className="text-muted-foreground">کد پستی: {address.postalCode}</p>
                  <p className="text-muted-foreground" dir="ltr">
                    {address.phone}
                  </p>

                  <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                    <Button variant="ghost" size="sm" onClick={() => setMode(address.id)}>
                      <Pencil className="h-3.5 w-3.5" /> ویرایش
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busyId === address.id}
                      onClick={() => handleDelete(address)}
                    >
                      {busyId === address.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      )}
                      حذف
                    </Button>
                    {!address.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busyId === address.id}
                        onClick={() => handleSetDefault(address)}
                      >
                        <Star className="h-3.5 w-3.5" /> پیش‌فرض کن
                      </Button>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
