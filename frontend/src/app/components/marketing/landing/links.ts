/** External destinations and contact details used across the landing page. */

import type { MouseEvent } from "react";

export const CONTACT_EMAIL = "lynnexenglish@gmail.com";
export const CONTACT_PHONE = "821021717660";
export const CONTACT_PHONE_DISPLAY = CONTACT_PHONE;
export const YOUTUBE_URL = "https://www.youtube.com/@FluencyAccentCoach";
export const FACEBOOK_PAGE_URL = "https://www.facebook.com/Analisse84/";
export const FACEBOOK_GROUP_URL =
  "https://www.facebook.com/share/g/18wdNiusvm/";
export const INSTAGRAM_URL = "https://www.instagram.com/fluencyaccentcoach/";
export const NAVIKX_URL = "https://navikx.com";

/** Brand colors for social icons on the landing page. */
export const SOCIAL_ICON_COLORS = {
  youtube: "#FF0000",
  facebook: "#1877F2",
  instagram: "#E4405F",
  location: "#FF5252",
  email: "#FFC107",
  phone: "#4CAF50",
} as const;

export const LANDING_SOCIAL_LINKS = [
  {
    href: YOUTUBE_URL,
    platform: "youtube" as const,
    labelKey: "youtube" as const,
  },
  {
    href: FACEBOOK_PAGE_URL,
    platform: "facebook" as const,
    labelKey: "facebookPage" as const,
  },
  {
    href: INSTAGRAM_URL,
    platform: "instagram" as const,
    labelKey: "instagram" as const,
  },
] as const;

/** Hero social-proof avatars — maps to testimonials student1–3 authors. */
export const HERO_PROOF_AVATARS = [
  "/images/avatars/student-1.jpg",
  "/images/avatars/student-2.jpg",
  "/images/avatars/student-3.jpg",
] as const;

/**
 * Builds a mailto for Lyn, optionally pre-filling the subject with the course
 * or package the visitor clicked from, so she knows what the enquiry is about.
 */
export function telKorea() {
  return `tel:+${CONTACT_PHONE}`;
}

/** mailto:, tel:, and absolute http(s) links should bypass SPA/delegated handlers. */
export function isInstantActionHref(href: string) {
  return /^(mailto:|tel:|https?:)/i.test(href);
}

/** Keeps native browser handoff immediate (email client, phone dialer, new tab). */
export function instantActionLinkProps(href: string) {
  if (!isInstantActionHref(href)) return {};

  return {
    onClick: (event: MouseEvent) => {
      event.stopPropagation();
    },
  } as const;
}

export function mailto(subject?: string) {
  return subject
    ? `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`
    : `mailto:${CONTACT_EMAIL}`;
}

/** General "Message Lyn" CTA from hero, nav, about, and closing. */
export function mailtoGeneral() {
  return mailto("ShadowSpeak website enquiry");
}

export function mailtoCourse(courseName: string) {
  return mailto(`Course enquiry: ${courseName}`);
}

export function mailtoCoaching(packageName: string) {
  return mailto(`Coaching enquiry: ${packageName}`);
}

export function mailtoInterest(productName: string) {
  return mailto(`Interest: ${productName}`);
}

/** Opens external URLs in a new tab; safe to spread onto anchor elements. */
export function externalLinkProps(href: string) {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return { target: "_blank" as const, rel: "noopener noreferrer" };
  }
  return {};
}
