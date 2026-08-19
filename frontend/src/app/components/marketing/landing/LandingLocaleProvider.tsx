"use client";

import * as React from "react";
import { NextIntlClientProvider, useLocale } from "next-intl";
import { usePathname } from "@/i18n/routing";

import {
  isLandingLocale,
  landingMessages,
  type LandingLocale,
} from "./landingMessages";

type LandingLocaleContextValue = {
  locale: LandingLocale;
  switchLocale: (locale: LandingLocale) => void;
};

const LandingLocaleContext =
  React.createContext<LandingLocaleContextValue | null>(null);

export function useLandingLocaleSwitch() {
  const context = React.useContext(LandingLocaleContext);
  if (!context) {
    throw new Error(
      "useLandingLocaleSwitch must be used within LandingLocaleProvider"
    );
  }
  return context;
}

function syncLocaleCookie(locale: LandingLocale) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

function syncLocaleUrl(pathname: string, locale: LandingLocale) {
  const suffix = pathname === "/" ? "" : pathname;
  window.history.replaceState(null, "", `/${locale}${suffix}`);
}

/** Swaps landing copy instantly without a route transition or message refetch. */
export default function LandingLocaleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const serverLocale = useLocale();
  const pathname = usePathname();
  const initialLocale = isLandingLocale(serverLocale) ? serverLocale : "en";

  const [locale, setLocale] = React.useState<LandingLocale>(initialLocale);

  const switchLocale = React.useCallback(
    (nextLocale: LandingLocale) => {
      if (nextLocale === locale) return;

      setLocale(nextLocale);
      syncLocaleUrl(pathname, nextLocale);
      syncLocaleCookie(nextLocale);
      document.documentElement.lang = nextLocale;
    },
    [locale, pathname]
  );

  const value = React.useMemo(
    () => ({ locale, switchLocale }),
    [locale, switchLocale]
  );

  return (
    <LandingLocaleContext.Provider value={value}>
      <NextIntlClientProvider
        locale={locale}
        messages={landingMessages[locale]}
        timeZone="Asia/Seoul"
      >
        {children}
      </NextIntlClientProvider>
    </LandingLocaleContext.Provider>
  );
}
