import Link from "next/link";
import { SITE, CATEGORIES } from "@/lib/constants";
import { ShieldCheck, Truck, Undo2, Headset } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const trustItems = [
  { icon: ShieldCheck, title: "گارانتی اصالت کالا", desc: "همراه با برگه اصالت و ضمانت بازخرید" },
  { icon: Truck, title: "ارسال ایمن و بیمه‌شده", desc: "تحویل درب منزل با پیک مطمئن" },
  { icon: Undo2, title: "۷ روز ضمانت بازگشت", desc: "در صورت عدم رضایت، بازگشت وجه" },
  { icon: Headset, title: "پشتیبانی ۷ روز هفته", desc: SITE.supportPhone },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-muted/40">
      <div className="container py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {trustItems.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <item.icon className="h-8 w-8 shrink-0 text-gold-600" />
            <div>
              <p className="text-sm font-bold">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Separator />

      <div className="container py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-display text-lg font-bold gold-shimmer mb-3">{SITE.name}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{SITE.description}</p>
        </div>
        <div>
          <h4 className="font-bold text-sm mb-3">دسته‌بندی‌ها</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/products?category=${c.slug}`} className="hover:text-secondary">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-sm mb-3">راهنما</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/faq" className="hover:text-secondary">سوالات متداول</Link></li>
            <li><Link href="/guide/size" className="hover:text-secondary">راهنمای سایز انگشتر</Link></li>
            <li><Link href="/guide/returns" className="hover:text-secondary">شرایط بازگشت کالا</Link></li>
            <li><Link href="/contact" className="hover:text-secondary">تماس با ما</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-sm mb-3">تماس با ما</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>{SITE.address}</li>
            <li dir="ltr" className="text-right">{SITE.phone}</li>
            <li>{SITE.workHours}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-4">
        <p className="container text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} تمامی حقوق برای {SITE.name} محفوظ است.
        </p>
      </div>
    </footer>
  );
}
