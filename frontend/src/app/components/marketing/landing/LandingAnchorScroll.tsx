"use client";

import * as React from "react";

import { isBodyScrollLocked, scrollToLandingSection } from "./navigation";

/**
 * Delegates in-page hash navigation on the landing page so section targets
 * scroll reliably under the fixed header and after the mobile drawer closes.
 */
export default function LandingAnchorScroll() {
  React.useEffect(() => {
    const previousRestoration =
      "scrollRestoration" in history ? history.scrollRestoration : "auto";

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    // Always open at the top on refresh or first visit, even if the URL has a hash
    // or the browser cached a lower scroll position.
    window.scrollTo(0, 0);

    if (window.location.hash) {
      history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`
      );
    }

    return () => {
      if ("scrollRestoration" in history) {
        history.scrollRestoration = previousRestoration;
      }
    };
  }, []);

  React.useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;

      const anchor = (event.target as Element | null)?.closest("a[href^='#']");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!anchor.closest(".landing-page")) return;

      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;
      if (/^(mailto:|tel:|https?:)/i.test(hash)) return;

      event.preventDefault();

      const delay = isBodyScrollLocked() ? 320 : 0;
      scrollToLandingSection(hash, { delay });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
