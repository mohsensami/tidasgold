# طلاگستر (TalaGold) — فروشگاه آنلاین طلا و جواهر

استک: Next.js 14 (App Router) · TypeScript · Prisma ORM · NextAuth · Tailwind CSS · shadcn/ui · react-hook-form + zod · uploadthing · @bprogress/next

## وضعیت فعلی

✅ همه‌چیز از دیتابیس Neon Postgres می‌آید — محصولات، دسته‌بندی‌ها، قیمت طلا، کاربران و سبد خرید. هیچ داده تجاری‌ای دیگر در کد هاردکد نیست.
✅ سبد خرید برای کاربر لاگین‌کرده در دیتابیس پایدار است (با خروج/ورود یا عوض کردن مرورگر از بین نمی‌رود). کاربر مهمان هنوز از localStorage استفاده می‌کند تا لاگین کند، بعد خودکار با سبد دیتابیسش ادغام می‌شود.
✅ هر فراخوانی به دیتابیس چند بار (با تاخیر افزایشی) تلاش مجدد می‌کند؛ اگر همه تلاش‌ها شکست بخورد یک صفحه خطای «تلاش مجدد» نشان داده می‌شود (نه یک صفحه سفید یا کرش خام).
⏳ فقط درگاه پرداخت زرین‌پال هنوز کامل وایر نشده (سفارش واقعاً در دیتابیس ثبت می‌شود، فقط ریدایرکت به درگاه پرداخت باقی مانده).

## نصب و اجرا

```bash
npm install
npx prisma db push     # ساخت جدول‌ها روی نئون طبق schema.prisma
npm run db:seed        # پر کردن دیتابیس با دسته‌بندی‌ها، محصولات نمونه، تنظیمات قیمت طلا و کاربر تستی
npm run dev
```

فایل `.env` از قبل با مقادیر واقعی (Neon, NextAuth, uploadthing, زرین‌پال) پر شده.

### ورود آزمایشی
- مشتری: `demo@talagold.ir` / `123456`
- ادمین: `admin@talagold.ir` / `admin123`

اگه خواستی دیتابیس رو با چشم ببینی: `npm run db:studio`

## ساختار پروژه

```
prisma/schema.prisma         اسکیمای کامل: User, Category, Product, Setting, Cart, Order, ...
prisma/seed.ts                سیدر — داده اولیه (دسته‌بندی، محصول، قیمت طلا، کاربر تستی)
src/lib/db-retry.ts           تلاش مجدد + timeout برای هر کوئری دیتابیس
src/lib/data/products.ts      محصولات از Prisma (retry + cache)
src/lib/data/categories.ts    دسته‌بندی‌ها از Prisma
src/lib/data/settings.ts      قیمت طلا از جدول Setting (نه یک عدد ثابت در کد)
src/lib/price.ts              فرمول محاسبه قیمت نهایی طلا
src/lib/auth.ts               next-auth با Prisma + bcrypt
src/app/api/products/         لیست محصولات + قیمت نهایی محاسبه‌شده (برای کلاینت)
src/app/api/cart/             گرفتن/جایگزینی سبد خرید کاربر لاگین‌کرده
src/app/api/cart/merge/       ادغام سبد مهمان با سبد دیتابیس هنگام ورود
src/app/api/checkout/create-order/  ثبت سفارش واقعی (قیمت دوباره سمت سرور محاسبه می‌شود)
src/app/api/register/         ثبت‌نام واقعی با هش bcrypt
src/app/error.tsx             صفحه خطای سراسری با دکمه «تلاش مجدد»
src/app/**/loading.tsx        اسکلت لودینگ صفحات اصلی/لیست/جزئیات محصول
src/context/cart-context.tsx  سبد خرید: localStorage برای مهمان + سینک با DB برای کاربر لاگین
```

## بروزرسانی قیمت طلا

قیمت طلا در جدول `Setting` است، نه در کد. برای عوض‌کردنش:

```bash
npx prisma studio
# جدول Setting → ردیف singleton → goldPricePerGram18k را ویرایش کن
```

یا با کد (مثلاً از یک API روت ادمین که بعداً می‌سازی):
```ts
import { updateGoldPrice } from "@/lib/data/settings";
await updateGoldPrice(6_900_000, 1.2); // (قیمت هر گرم، درصد تغییر)
```

قیمت نهایی هر محصول با فرمول رایج ایران محاسبه می‌شود (`src/lib/price.ts`):
```
قیمت‌کل = (قیمت‌گرم × وزن + اجرت) × (۱ + سود٪) × (۱ + مالیات٪)
```

## دسته‌بندی‌ها

دیگر enum ثابت نیستند — جدول `Category` هستند، پس بعداً از پنل ادمین می‌توانی دسته جدید اضافه/ویرایش/حذف کنی بدون نیاز به دیپلوی مجدد.

## مدیریت خطای دیتابیس

هر کوئری Prisma با `withRetry` (در `src/lib/db-retry.ts`) پوشیده شده: تا ۳ بار با فاصله افزایشی (۴۰۰ms، ۸۰۰ms، ...) و timeout ۸ ثانیه‌ای برای هر تلاش. اگر همه تلاش‌ها شکست بخورند:
- در Server Component‌ها (صفحات) → خطا به نزدیک‌ترین `error.tsx` می‌رود که یک صفحه «تلاش مجدد» نشان می‌دهد.
- در API Route‌ها → پاسخ `503` با پیام فارسی برمی‌گردد؛ سمت کلاینت (`cart-context.tsx`) هم خودش با `fetchWithRetry` چند بار تلاش می‌کند و در صورت شکست نهایی، دکمه «تلاش مجدد» نشان می‌دهد (نه کرش).
- بین هر صفحه، اسکلت `loading.tsx` نمایش داده می‌شود تا کاربر صفحه سفید نبیند.

## کیف پول و پنل کاربری (`/dashboard`)

هر کاربر لاگین‌کرده یک کیف پول دارد (`Wallet` + تاریخچه در `WalletTransaction`). از `/dashboard/wallet` می‌تواند مبلغ دلخواه (بین `WALLET.minCharge` و `WALLET.maxCharge` در `constants.ts`) وارد کند، به درگاه واقعی زرین‌پال برود، و بعد از پرداخت موفق کیف پولش خودکار شارژ شود.

جریان کامل:
1. `POST /api/wallet/charge` → یک `WalletTransaction` با status=`PENDING` می‌سازد، از `src/lib/zarinpal.ts` یک `authority` می‌گیرد و روی همان تراکنش ذخیره می‌کند، آدرس درگاه را برمی‌گرداند.
2. کاربر به `https://payment.zarinpal.com/pg/StartPay/{authority}` می‌رود و پرداخت می‌کند.
3. زرین‌پال کاربر را به `GET /api/wallet/verify` برمی‌گرداند؛ این روت با `verifyPayment` تایید می‌کند و در یک تراکنش دیتابیسی (`prisma.$transaction`) هم وضعیت تراکنش را `SUCCESS` می‌کند هم `Wallet.balance` را افزایش می‌دهد — با چک idempotency (اگر کاربر صفحه را رفرش کند، دوباره شارژ نمی‌شود).
4. کاربر به `/dashboard/wallet?status=success|failed|error` برمی‌گردد و toast مناسب می‌بیند.

کاربر `admin@talagold.ir` نقش `ADMIN` دارد ولی پنل ادمین هنوز ساخته نشده (فقط پنل مشتری `/dashboard`).

⚠️ چون `ZARINPAL_SANDBOX="false"` است، این اتصال به درگاه **واقعی** زرین‌پال می‌زند و پول واقعی جابه‌جا می‌شود. برای تست بی‌خطر بدون تراکنش واقعی، `ZARINPAL_SANDBOX` را در `.env` به `"true"` تغییر بده تا درخواست‌ها به محیط sandbox زرین‌پال بروند (جزئیات: https://www.zarinpal.com/docs).



سفارش الان واقعاً با `POST /api/checkout/create-order` در دیتابیس ثبت می‌شود (status=`PENDING_PAYMENT`). فقط باقی مانده:
1. بعد از ساخت سفارش، با API زرین‌پال (`PaymentRequest`) یک `authority` بگیر.
2. کاربر را به `https://www.zarinpal.com/pg/StartPay/{authority}` بفرست.
3. بعد از بازگشت، در یک روت جدید مثل `GET /api/checkout/verify` با `PaymentVerification` وضعیت سفارش را `PROCESSING` کن.

مرچنت‌کد در `.env` تحت `ZARINPAL_MERCHANT_ID` از قبل ست شده.

## uploadthing

آپلودر تصویر محصول/آواتار از قبل در `src/app/api/uploadthing/core.ts` تعریف شده. فقط باقی مانده یک پنل مدیریت محصول بسازی که از `UploadButton` (در `src/lib/uploadthing.ts`) استفاده کند.

## پنل ادمین

فعلاً ساخته نشده. کاربر `admin@talagold.ir` از قبل با نقش `ADMIN` در دیتابیس هست. پیشنهاد صفحات بعدی: `/admin/products` (CRUD با react-hook-form + zod + uploadthing)، `/admin/categories`، `/admin/settings` (فرم تغییر قیمت طلا)، `/admin/orders`.

## نکات طراحی

- تم رنگی: طلایی (gold-50 تا gold-900) + سرمه‌ای (navy-50 تا navy-900) — هدر با نوار قیمت طلا، هیرو و فوتر سرمه‌ای، دکمه‌های اصلی طلایی با گرادینت و شیمر.
- نوار پیشرفت بالای صفحه هنگام جابه‌جایی بین صفحات با `@bprogress/next`.
- فونت Vazirmatn، تمام صفحات RTL.
