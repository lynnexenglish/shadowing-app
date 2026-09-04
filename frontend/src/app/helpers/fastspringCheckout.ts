type FastSpringOrderReference = {
  id?: string;
  reference?: string;
};

declare global {
  interface Window {
    fastspring?: {
      builder: {
        reset: () => void;
        add: (productPath: string) => void;
        language: (languageCode: string) => void;
        country: (countryCode: string) => void;
        checkout: () => void;
      };
    };
    onFSPopupClosed?: (orderReference: FastSpringOrderReference | null) => void;
  }
}

function landingLocale(): "en" | "ko" {
  if (typeof window === "undefined") return "en";
  return window.location.pathname.match(/^\/(en|ko)(?:\/|$)/)?.[1] === "ko"
    ? "ko"
    : "en";
}

function registerPathFromLocation(): string {
  return `/${landingLocale()}/register`;
}

/** Detect buyer country (ISO 3166-1 alpha-2) from IP. Returns null if unknown. */
async function detectBuyerCountry(): Promise<string | null> {
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

/** Called by FastSpring SBL when popup closes (Continue / X). Redirects after paid orders. */
export function registerFastSpringPopupHandler() {
  window.onFSPopupClosed = (orderReference) => {
    if (!orderReference?.id) return;
    window.fastspring?.builder.reset();
    window.location.assign(registerPathFromLocation());
  };
}

/**
 * Opens FastSpring checkout.
 * - Language: landing page (en/ko)
 * - Country: detected buyer location (for address/tax); if unknown, FastSpring uses IP
 * - Payment methods: NOT filtered in code — FastSpring shows whatever is
 *   enabled in the dashboard and eligible for that country/currency
 */
export async function openFastSpringCheckout(
  productPath: string,
  language?: "en" | "ko"
): Promise<boolean> {
  const builder = window.fastspring?.builder;
  if (!builder) return false;

  const lang = language ?? landingLocale();
  const buyerCountry = await detectBuyerCountry();

  builder.reset();
  builder.language(lang);
  if (buyerCountry) {
    builder.country(buyerCountry);
  }
  builder.add(productPath);
  builder.checkout();
  return true;
}
