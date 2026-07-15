import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { LayoutDashboard, Wallet, LogOut, Gem } from "lucide-react";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

const navItems = [
  { href: "/dashboard", label: "نمای کلی", icon: LayoutDashboard },
  { href: "/dashboard/wallet", label: "کیف پول", icon: Wallet },
];

const adminNavItems = [{ href: "/dashboard/products", label: "محصولات", icon: Gem }];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");

  const isAdmin = (session.user as any).role === "admin";
  const items = isAdmin ? [...navItems, ...adminNavItems] : navItems;

  return (
    <div className="container grid gap-8 py-8 md:grid-cols-[220px_1fr]">
      <aside className="h-fit rounded-lg border border-border p-4">
        <p className="mb-4 truncate text-sm font-bold">{session.user.name ?? session.user.email}</p>
        <nav className="space-y-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-secondary"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <SignOutButton />
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
