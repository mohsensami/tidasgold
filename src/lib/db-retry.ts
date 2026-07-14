/**
 * هلپر تلاش مجدد (retry) + timeout برای هر فراخوانی که به دیتابیس نئون می‌زند.
 *
 * چرا لازم است: نئون یک دیتابیس serverless است و ممکن است کانکشن اول
 * به‌خاطر «کلد استارت» (بیدار شدن دیتابیس بعد از بی‌کاری) کند باشد یا
 * شبکه موقتاً قطع شود. به‌جای این‌که کاربر بلافاصله صفحه سفید یا ارور
 * ببیند، چند بار با فاصله زمانی afزایشی (exponential backoff) دوباره
 * تلاش می‌کنیم و فقط اگر همه تلاش‌ها شکست خورد، خطا را بالا می‌فرستیم
 * تا error.tsx صفحه «تلاش مجدد» را نشان دهد.
 */

export class DatabaseUnavailableError extends Error {
  constructor(message = "در حال حاضر امکان اتصال به سرور برقرار نیست") {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

interface RetryOptions {
  attempts?: number; // تعداد کل تلاش‌ها
  timeoutMs?: number; // حداکثر زمان انتظار برای هر تلاش
  baseDelayMs?: number; // تاخیر پایه بین تلاش‌ها (exponential backoff)
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`عملیات بیش از ${ms}ms طول کشید`)), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  { attempts = 3, timeoutMs = 8000, baseDelayMs = 400 }: RetryOptions = {}
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      return await withTimeout(fn(), timeoutMs);
    } catch (err) {
      lastError = err;
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[withRetry] تلاش ${i + 1}/${attempts} شکست خورد:`, err);
      }
      // اگر تلاش آخر بود، دیگر صبر نکن و همان‌جا خطا بده
      if (i < attempts - 1) {
        await delay(baseDelayMs * Math.pow(2, i)); // 400ms, 800ms, 1600ms, ...
      }
    }
  }

  throw new DatabaseUnavailableError(
    lastError instanceof Error ? lastError.message : "خطای ناشناخته در ارتباط با دیتابیس"
  );
}
