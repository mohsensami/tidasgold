/**
 * ─────────────────────────────────────────────────────────────────────────
 *  قیمت لحظه‌ای طلا — TODO
 * ─────────────────────────────────────────────────────────────────────────
 * فعلاً چون به هیچ API قیمت طلا وصل نیستیم، مقدار زیر را باید هر بار
 * دستی آپدیت کنیم. وقتی API آماده شد، تابع getGoldPricePerGram را
 * جایگزین با یک فراخوانی fetch به آن سرویس کن (مثلاً در
 * src/lib/gold-price.ts با revalidate کوتاه، یا یک Route Handler
 * که هر چند دقیقه کش را تازه می‌کند).
 *
 * واحد: تومان به ازای هر گرم طلای ۱۸ عیار (بدون اجرت/سود/مالیات)
 * تاریخ آخرین بروزرسانی دستی را هم نگه می‌داریم تا در UI نمایش داده شود.
 */
export const GOLD_PRICE = {
    // قیمت هر گرم طلای ۱۸ عیار به تومان — این عدد را دستی آپدیت کن
    pricePerGram18k: 17_850_000,
    // درصد تغییر نسبت به روز قبل (برای نمایش فلش سبز/قرمز در تیکر)
    changePercent: 0.8,
    lastUpdatedAt: '2026-07-13T09:30:00+03:30',
} as const;

/**
 * فرمول رایج محاسبهٔ قیمت نهایی طلا در ایران:
 * قیمت‌کل = (قیمت‌گرم × وزن + اجرت) × (۱ + سود) × (۱ + مالیات)
 * این ضرایب پیش‌فرض هستند و می‌توانند برای هر محصول override شوند.
 */
export const PRICE_FORMULA_DEFAULTS = {
    profitPercent: 7, // درصد سود فروشنده
    taxPercent: 9, // مالیات بر ارزش افزوده روی اجرت + سود
} as const;

export const SITE = {
    name: 'تیداس گلد',
    nameEn: 'TalaGold',
    description:
        'فروشگاه آنلاین طلا و جواهر — خرید امن گردنبند، دستبند، انگشتر و گوشواره با گارانتی اصالت و قیمت لحظه‌ای طلا',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    phone: '021-91234567',
    supportPhone: '0912-000-0000',
    address: 'تهران، خیابان طلافروش‌ها، پاساژ نگین، طبقه دوم',
    instagram: 'https://instagram.com/talagold',
    workHours: 'شنبه تا پنج‌شنبه، ۱۰ تا ۲۰',
} as const;

export const SHIPPING = {
    freeShippingThreshold: 5_000_000, // تومان
    standardCost: 150_000,
    expressCost: 350_000,
} as const;

export const CATEGORIES = [
    { slug: 'rings', title: 'انگشتر', titleEn: 'Rings' },
    { slug: 'necklaces', title: 'گردنبند', titleEn: 'Necklaces' },
    { slug: 'bracelets', title: 'دستبند', titleEn: 'Bracelets' },
    { slug: 'earrings', title: 'گوشواره', titleEn: 'Earrings' },
    { slug: 'sets', title: 'سرویس', titleEn: 'Sets' },
    { slug: 'coins', title: 'سکه و شمش', titleEn: 'Coins & Bullion' },
] as const;

export const KARAT_OPTIONS = [18, 21, 24] as const;

export const SORT_OPTIONS = [
    { value: 'newest', label: 'جدیدترین' },
    { value: 'price-asc', label: 'ارزان‌ترین' },
    { value: 'price-desc', label: 'گران‌ترین' },
    { value: 'weight-asc', label: 'کم‌وزن‌ترین' },
    { value: 'popular', label: 'پرفروش‌ترین' },
] as const;
