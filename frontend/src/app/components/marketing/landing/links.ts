/** External destinations and contact details used across the landing page. */

import type { MouseEvent } from "react";

export const CONTACT_EMAIL = "lynnexenglish@gmail.com";
export const CONTACT_PHONE = "821021717660";
export const CONTACT_PHONE_DISPLAY = CONTACT_PHONE;
export const YOUTUBE_URL = "https://www.youtube.com/@FluencyAccentCoach";
export const FACEBOOK_PAGE_URL = "https://www.facebook.com/Analisse84/";
export const FACEBOOK_GROUP_URL =
  "https://www.facebook.com/share/g/18wdNiusvm/";
export const INSTAGRAM_URL = "https://www.instagram.com/analisse88/";
export const NAVER_BLOG_URL = "https://m.blog.naver.com/lynnex84";
export const LISETTE_TESTIMONIAL_VIDEO_ID = "TFCA9MmiAvg";
export const NAVIKX_URL = "https://navikx.com";

/** Brand colors for social icons on the landing page. */
export const SOCIAL_ICON_COLORS = {
  youtube: "#FF0000",
  facebook: "#1877F2",
  instagram: "#E4405F",
  blog: "#03C75A",
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
  {
    href: NAVER_BLOG_URL,
    platform: "blog" as const,
    labelKey: "blog" as const,
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

/** Extracts a pre-filled subject from a mailto href, if present. */
export function subjectFromMailto(href: string) {
  const match = href.match(/[?&]subject=([^&]+)/i);
  return match ? decodeURIComponent(match[1]) : undefined;
}

/** Keeps native browser handoff immediate (email client, phone dialer, new tab). */
export function instantActionLinkProps(href: string) {
  if (!isInstantActionHref(href)) return {};

  if (href.startsWith("mailto:")) {
    return {
      onClick: (event: MouseEvent) => {
        handleSmartEmailClick(event, subjectFromMailto(href));
      },
    } as const;
  }

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

export function gmailCompose(subject?: string) {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: CONTACT_EMAIL,
  });
  if (subject) {
    params.set("su", subject);
  }
  return `https://mail.google.com/mail/?${params.toString()}`;
}

/** Mobile and tablet: native mail app. Desktop: Gmail in the browser. */
export function prefersNativeEmailClient() {
  if (typeof navigator === "undefined") return true;

  const ua = navigator.userAgent;
  if (/Android|iPhone|iPod|Mobile|IEMobile|Opera Mini/i.test(ua)) {
    return true;
  }

  // iPadOS often reports as Mac with touch points.
  if (navigator.maxTouchPoints > 1 && /Macintosh|Mac OS X/i.test(ua)) {
    return true;
  }

  return false;
}

/** mailto fallback href; desktop clicks open Gmail web compose instead. */
export function smartEmailLinkProps(subject?: string) {
  const mailtoHref = mailto(subject);

  return {
    href: mailtoHref,
    ...instantActionLinkProps(mailtoHref),
  } as const;
}

export function handleSmartEmailClick(
  event: MouseEvent<Element, globalThis.MouseEvent>,
  subject?: string
) {
  event.stopPropagation();

  if (prefersNativeEmailClient()) {
    return;
  }

  event.preventDefault();
  window.open(gmailCompose(subject), "_blank", "noopener,noreferrer");
}

/** General "Message Lyn" CTA from hero, nav, about, and closing. */
export function mailtoGeneral() {
  return mailto("ShadowSpeak website enquiry");
}

export function gmailGeneral() {
  return gmailCompose("ShadowSpeak website enquiry");
}

export function mailtoCourse(courseName: string) {
  return mailto(`Course enquiry: ${courseName}`);
}

export function gmailCourse(courseName: string) {
  return gmailCompose(`Course enquiry: ${courseName}`);
}

export function mailtoCoaching(packageName: string) {
  return mailto(`Coaching enquiry: ${packageName}`);
}

export function gmailCoaching(packageName: string) {
  return gmailCompose(`Coaching enquiry: ${packageName}`);
}

export function mailtoPhoneCalls(packageName: string) {
  return mailto(`Phone Calls enquiry: ${packageName}`);
}

export function gmailPhoneCalls(packageName: string) {
  return gmailCompose(`Phone Calls enquiry: ${packageName}`);
}

export function mailtoInterest(productName: string) {
  return mailto(`Interest: ${productName}`);
}

export function gmailInterest(productName: string) {
  return gmailCompose(`Interest: ${productName}`);
}

/** Opens external URLs in a new tab; safe to spread onto anchor elements. */
export function externalLinkProps(href: string) {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return { target: "_blank" as const, rel: "noopener noreferrer" };
  }
  return {};
}
