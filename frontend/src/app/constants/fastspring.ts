/** FastSpring product paths — must match Catalog > One-Time Products in FastSpring. */
export const FASTSPRING_PRODUCTS = {
  online: {
    membership: "online-accent-membership",
    phrasalVerbs: "online-phrasal-verbs",
    shadowing: "online-shadowing-10",
  },
  offline: {
    starter: "offline-class-1",
    intermediate: "offline-class-2",
    advanced: "offline-class-3",
  },
  phoneCalls: {
    basic: "phone-calls-basic",
    standard: "phone-calls-standard",
    plus: "phone-calls-plus",
    premium: "phone-calls-premium",
    intensive: "phone-calls-intensive",
  },
} as const;

export const FASTSPRING_STOREFRONT =
  process.env.NEXT_PUBLIC_FASTSPRING_STOREFRONT ??
  "shadowspeaklearn.test.onfastspring.com/popup-shadowspeaklearn";

export const FASTSPRING_SBL_SRC =
  "https://sbl.onfastspring.com/sbl/1.0.9/fastspring-builder.min.js";
