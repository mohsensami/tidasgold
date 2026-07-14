import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateWallet } from "@/lib/data/wallet";
import { toToman } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id as string;
  const wallet = await getOrCreateWallet(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">خوش آمدید، {session!.user!.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">{session!.user!.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">موجودی کیف پول</CardTitle>
            <Wallet className="h-5 w-5 text-gold-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-secondary">{toToman(wallet.balance)}</p>
            <Button variant="link" className="px-0 mt-2" asChild>
              <Link href="/dashboard/wallet">شارژ کیف پول ←</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">سفارش‌ها</CardTitle>
            <ShoppingBag className="h-5 w-5 text-gold-500" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">تاریخچه سفارش‌ها به‌زودی اینجا اضافه می‌شود.</p>
            <Button variant="link" className="px-0 mt-2" asChild>
              <Link href="/products">ادامه خرید ←</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
