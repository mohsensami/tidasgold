import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/dashboard/profile-form";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id as string;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { name: true, email: true, phone: true, image: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">اطلاعات حساب کاربری</h1>
        <p className="mt-1 text-sm text-muted-foreground">تصویر، اطلاعات تماس و رمز عبور خود را مدیریت کنید.</p>
      </div>
      <ProfileForm user={user} />
    </div>
  );
}
