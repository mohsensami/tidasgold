import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserAddresses } from "@/lib/data/addresses";
import { AddressesPanel } from "@/components/dashboard/addresses-panel";

export default async function AddressesPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id as string;
  const addresses = await getUserAddresses(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">آدرس‌های ارسال</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          آدرس‌هایی که هنگام خرید استفاده می‌شوند را اینجا مدیریت کنید.
        </p>
      </div>
      <AddressesPanel
        addresses={addresses.map((a) => ({
          id: a.id,
          fullName: a.fullName,
          province: a.province,
          city: a.city,
          addressLine: a.addressLine,
          postalCode: a.postalCode,
          phone: a.phone,
          isDefault: a.isDefault,
        }))}
      />
    </div>
  );
}
