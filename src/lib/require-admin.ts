import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * فقط جلسه‌ی کاربر با role=admin را برمی‌گرداند، وگرنه null.
 * برای هر Server Action یا صفحه‌ی مدیریتی (مثل /dashboard/products و
 * src/app/dashboard/products/actions.ts) استفاده می‌شود تا هم رول‌های
 * غیرادمین و هم مهمان‌ها رد شوند.
 */
export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "admin") return null;
  return session;
}
