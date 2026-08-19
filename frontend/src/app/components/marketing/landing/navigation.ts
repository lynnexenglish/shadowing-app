/** In-page section navigation for the marketing landing page. */

import type { MouseEvent as ReactMouseEvent } from "react";

export function scrollToLandingSection(
  hash: string,
  options?: { delay?: number }
): boolean {
  if (!hash.startsWith("#") || hash.length < 2) return false;

  const el = document.getElementById(hash.slice(1));
  if (!el) return false;

  const run = () => {
    const headerOffset = window.innerWidth >= 900 ? 120 : 60;
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: "auto",
    });
  };

  if (options?.delay) {
    window.setTimeout(run, options.delay);
  } else {
    run();
  }

  return true;
}

/** True when MUI drawer/modal scroll lock is still active on the body. */
export function isBodyScrollLocked() {
  return document.body.style.overflow === "hidden";
}

export function handleLandingHashClick(
  event: ReactMouseEvent<HTMLAnchorElement>,
  options?: { delay?: number; onNavigate?: () => void }
) {
  const hash = event.currentTarget.getAttribute("href");
  if (!hash?.startsWith("#") || hash.length < 2) return false;

  event.preventDefault();
  options?.onNavigate?.();

  const delay = options?.delay ?? (isBodyScrollLocked() ? 320 : 0);

  return scrollToLandingSection(hash, { delay });
}
