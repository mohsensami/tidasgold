# طلاگستر (TalaGold) — فروشگاه آنلاین طلا و جواهر

استک: Next.js 14 (App Router) · TypeScript · Prisma ORM · NextAuth · Tailwind CSS · shadcn/ui · react-hook-form + zod · uploadthing

## وضعیت فعلی

✅ به Neon Postgres وصل است — محصولات و کاربران واقعاً از دیتابیس خوانده می‌شوند.
⏳ فقط درگاه پرداخت زرین‌پال هنوز به‌صورت کامل وایر نشده (بخش «مرحله بعد» را ببین).

## نصب و اجرا

```bash
npm install
npx prisma db push     # ساخت جدول‌ها روی نئون طبق schema.prisma
npm run db:seed        # پر کردن دیتابیس با محصولات نمونه و کاربر تستی
npm run dev
```

فایل `.env` از قبل با مقادیر واقعی (Neon, NextAuth, uploadthing, زرین‌پال) پر شده.

### ورود آزمایشی
- مشتری: `demo@talagold.ir` / `123456`
- ادمین: `admin@talagold.ir` / `admin123`

## ساختار پروژه

```
prisma/schema.prisma        اسکیمای کامل دیتابیس (User, Product, Order, ...)
src/lib/constants.ts        ← قیمت طلا + تنظیمات سایت (پایین توضیح داده شده)
src/lib/data/products.ts    داده استاتیک محصولات (جایگزین موقت جدول Product)
src/lib/data/users.ts       کاربر نمونه (جایگزین موقت جدول User)
src/lib/price.ts            فرمول محاسبه قیمت نهایی طلا
src/lib/auth.ts             تنظیمات next-auth
src/app/api/uploadthing/    روت‌های آپلود تصویر
src/components/ui/          کامپوننت‌های shadcn (button, input, card, ...)
src/components/product/     کارت محصول، گالری، فرم افزودن به سبد، ...
src/context/cart-context.tsx سبد خرید (ذخیره در localStorage)
```

## بروزرسانی دستی قیمت طلا

فایل `src/lib/constants.ts` را باز کن:

```ts
export const GOLD_PRICE = {
  pricePerGram18k: 6_850_000, // ← این عدد را با قیمت روز طلای ۱۸ عیار (تومان) عوض کن
  changePercent: 0.8,
  lastUpdatedAt: "2026-07-13T09:30:00+03:30",
};
```

قیمت نهایی هر محصول با فرمول رایج ایران محاسبه می‌شود (در `src/lib/price.ts`):

```
قیمت‌کل = (قیمت‌گرم × وزن + اجرت) × (۱ + سود٪) × (۱ + مالیات٪)
```

وقتی بعداً به یک API قیمت طلا وصل شدیم، کافی‌ست `GOLD_PRICE.pricePerGram18k` را به‌جای مقدار ثابت، از یک fetch (با `revalidate` کوتاه، مثلاً هر ۵ دقیقه) بخوانیم.

## مرحله بعد — وصل کردن سرویس‌های واقعی

### ۱) دیتابیس Neon Postgres
1. در [neon.tech](https://neon.tech) یک پروژه بساز.
2. مقدار `DATABASE_URL` (pooled) و `DIRECT_URL` (unpooled) را در `.env` بگذار.
3. اجرا کن:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
4. در `src/lib/auth.ts` طبق کامنت‌های داخل فایل، `PrismaAdapter` را فعال کن و `authorize()` را به‌جای `STATIC_USERS` به `prisma.user.findUnique` وصل کن.
5. در `src/lib/data/products.ts`، توابع `getAllProducts` و بقیه را به‌جای خواندن از آرایه `PRODUCTS`، به `prisma.product.findMany()` وصل کن (ساختار مدل‌ها از قبل یکی است، پس این تغییر خیلی کوچک خواهد بود).
6. فایل `src/lib/data/users.ts` را می‌توانی بعد از این مرحله حذف کنی.

### ۲) uploadthing
1. در [uploadthing.com](https://uploadthing.com) اپ بساز و `UPLOADTHING_TOKEN` را در `.env` بگذار.
2. آپلودر از قبل در `src/app/api/uploadthing/core.ts` تعریف شده (برای تصویر محصول و آواتار کاربر). فقط کافی‌ست کامپوننت `UploadButton` از `src/lib/uploadthing.ts` را در پنل مدیریت محصول (که باید بسازی) استفاده کنی.

### ۳) زرین‌پال
1. مرچنت‌کد را از پنل زرین‌پال بگیر و در `ZARINPAL_MERCHANT_ID` بگذار.
2. طبق کامنت‌های داخل `src/app/checkout/page.tsx`، دو Route Handler بساز:
   - `POST /api/checkout/create-order` → سفارش را با Prisma ثبت کند و با API زرین‌پال (`PaymentRequest`) یک `authority` بگیرد، بعد کاربر را به `https://www.zarinpal.com/pg/StartPay/{authority}` بفرستد.
   - `GET /api/checkout/verify` → بعد از بازگشت کاربر از درگاه، با `PaymentVerification` وضعیت را چک کند و سفارش را `PROCESSING` کند.

## پنل ادمین

فعلاً ساخته نشده. وقتی دیتابیس وصل شد، پیشنهاد می‌شود صفحات زیر اضافه شوند: `/admin/products` (CRUD محصول با فرم react-hook-form + zod + آپلود تصویر با uploadthing)، `/admin/orders` (تغییر وضعیت سفارش).

## نکات

- تمام صفحات و متن‌ها فارسی و RTL هستند (فونت Vazirmatn).
- پالت رنگی: زمینه عاجی گرم، طلایی عتیقه (gold-400 تا gold-900) و لعابی شرابی (wine) برای دکمه‌های ثانویه/تخفیف — الهام‌گرفته از حس یک جواهرفروشی، نه رنگ‌های پیش‌فرض قالب‌های آماده.
- سبد خرید فعلاً در `localStorage` مرورگر ذخیره می‌شود؛ بعد از اتصال دیتابیس می‌توان آن را per-user در جدول `Order` هم پایدار کرد.
