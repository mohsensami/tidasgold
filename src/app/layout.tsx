import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/constants";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CompareBar } from "@/components/product/compare-bar";

const vazir = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazir",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: { default: SITE.name + " | فروشگاه طلا و جواهر", template: `%s | ${SITE.name}` },
  description: SITE.description,
};

/**
 * بدون این خط، Next.js چون هیچ‌کدام از صفحات از cookies/headers استفاده
 * نمی‌کنند، کل سایت (از جمله Header و GoldPriceBar) را موقع build یک‌بار
 * استاتیک رندر می‌کند و همان HTML را برای همه نمایش می‌دهد — یعنی قیمت
 * و «آخرین بروزرسانی» بالای هدر برای همیشه همان لحظه‌ی build می‌ماند،
 * حتی اگر میدلور مقدار را در دیتابیس آپدیت کند. force-dynamic یعنی هر
 * درخواست، Header/GoldPriceBar و صفحات محصولات را دوباره از دیتابیس
 * می‌خوانند و قیمت نمایش داده‌شده همیشه با مقدار واقعی دیتابیس یکی است.
 */
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <Providers>
          <Header />
          <main className="flex-1 pb-16">{children}</main>
          <Footer />
          <CompareBar />
        </Providers>
      </body>
    </html>
  );
}
