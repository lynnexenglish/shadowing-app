import {
  PAYPAL_BUSINESS_EMAIL,
  PAYPAL_ONLINE_PRODUCTS,
  type PaypalOnlineProductKey,
} from "@/app/constants/paypal";

/** Detect buyer country (ISO 3166-1 alpha-2) from IP. Returns null if unknown. */
export async function detectBuyerCountry(): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 2500);
    const res = await fetch("https://api.country.is/", {
      signal: controller.signal,
      cache: "no-store",
    });
    window.clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as { country?: string };
    const code = data.country?.trim().toUpperCase();
    return code && /^[A-Z]{2}$/.test(code) ? code : null;
  } catch {
    return null;
  }
}

/** Korean students pay by contacting Lyn — no PayPal. */
export function isKoreanBuyer(
  country: string | null,
  locale: "en" | "ko"
): boolean {
  if (country === "KR") return true;
  if (!country && locale === "ko") return true;
  return false;
}

/**
 * Classic PayPal "Buy Now" link using only the merchant email.
 * Opens PayPal hosted checkout — no Client ID / Secret needed.
 */
export function buildPaypalCheckoutUrl(
  productKey: PaypalOnlineProductKey,
  options?: { locale?: "en" | "ko"; origin?: string }
): string {
  const product = PAYPAL_ONLINE_PRODUCTS[productKey];
  const origin =
    options?.origin ??
    (typeof window !== "undefined" ? window.location.origin : "");
  const locale = options?.locale ?? "en";

  const params = new URLSearchParams({
    cmd: "_xclick",
    business: PAYPAL_BUSINESS_EMAIL,
    item_name: product.itemName,
    amount: product.amount,
    currency_code: "USD",
    no_shipping: "1",
    no_note: "0",
    lc: locale === "ko" ? "ko_KR" : "en_US",
  });

  if (origin) {
    params.set("return", `${origin}/${locale}/register`);
    params.set("cancel_return", `${origin}/${locale}`);
  }

  return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
}
