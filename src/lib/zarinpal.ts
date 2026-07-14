/**
 * کلاینت ساده زرین‌پال (REST v4). واحد پول همه‌جای این پروژه تومان است،
 * پس صریحاً currency: "IRT" می‌فرستیم تا زرین‌پال هم مبلغ را تومان بخواند
 * (وگرنه پیش‌فرض API ریال است و ۱۰ برابر اشتباه محاسبه می‌شود).
 * مستندات: https://www.zarinpal.com/docs/paymentGateway/
 */

const isSandbox = process.env.ZARINPAL_SANDBOX === "true";
const merchantId = process.env.ZARINPAL_MERCHANT_ID ?? "";

const BASE_URL = isSandbox ? "https://sandbox.zarinpal.com" : "https://payment.zarinpal.com";
const REQUEST_URL = `${BASE_URL}/pg/v4/payment/request.json`;
const VERIFY_URL = `${BASE_URL}/pg/v4/payment/verify.json`;
const STARTPAY_URL = (authority: string) => `${BASE_URL}/pg/StartPay/${authority}`;

export class ZarinpalError extends Error {
  code?: number;
  constructor(message: string, code?: number) {
    super(message);
    this.name = "ZarinpalError";
    this.code = code;
  }
}

interface RequestPaymentParams {
  amountToman: number;
  description: string;
  callbackUrl: string;
  mobile?: string;
  email?: string;
}

export async function requestPayment({
  amountToman,
  description,
  callbackUrl,
  mobile,
  email,
}: RequestPaymentParams): Promise<{ authority: string; paymentUrl: string }> {
  if (!merchantId) {
    throw new ZarinpalError("ZARINPAL_MERCHANT_ID تنظیم نشده است");
  }

  const res = await fetch(REQUEST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      merchant_id: merchantId,
      currency: "IRT", // تومان
      amount: amountToman,
      callback_url: callbackUrl,
      description,
      metadata: { mobile, email },
    }),
  });

  const json = await res.json();

  if (json?.data?.code !== 100 || !json?.data?.authority) {
    const message = json?.errors?.message || "خطا در ایجاد درخواست پرداخت زرین‌پال";
    throw new ZarinpalError(message, json?.errors?.code);
  }

  return {
    authority: json.data.authority,
    paymentUrl: STARTPAY_URL(json.data.authority),
  };
}

export async function verifyPayment(
  authority: string,
  amountToman: number
): Promise<{ refId: string; alreadyVerified: boolean }> {
  const res = await fetch(VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      merchant_id: merchantId,
      amount: amountToman,
      authority,
    }),
  });

  const json = await res.json();
  const code = json?.data?.code;

  // 100 یعنی تایید موفق تازه؛ 101 یعنی این تراکنش قبلاً هم تایید شده بود (idempotent)
  if (code === 100 || code === 101) {
    return { refId: String(json.data.ref_id ?? ""), alreadyVerified: code === 101 };
  }

  const message = json?.errors?.message || "پرداخت تایید نشد";
  throw new ZarinpalError(message, json?.errors?.code);
}
