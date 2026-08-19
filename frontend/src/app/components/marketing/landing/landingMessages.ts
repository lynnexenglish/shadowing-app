import en from "../../../../../messages/en.json";
import ko from "../../../../../messages/ko.json";
import { routing } from "@/i18n/routing";

/** Landing page only needs the `landing` namespace — keep both locales ready for instant switching. */
export const landingMessages = {
  en: { landing: en.landing },
  ko: { landing: ko.landing },
} as const;

export type LandingLocale = (typeof routing.locales)[number];

export function isLandingLocale(value: string): value is LandingLocale {
  return routing.locales.includes(value as LandingLocale);
}
