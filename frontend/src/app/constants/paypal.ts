/** PayPal merchant email — hosted checkout links (no Client ID required). */
export const PAYPAL_BUSINESS_EMAIL = "adelynrodriguez63@gmail.com";

/** Online course prices in USD — must match landing page. Offline has no PayPal. */
export const PAYPAL_ONLINE_PRODUCTS = {
  membership: {
    itemName: "Accent Training Membership",
    amount: "150.00",
  },
  shadowing: {
    itemName: "Shadowing & Conversational English (10 classes)",
    amount: "300.00",
  },
  phrasalVerbs: {
    itemName: "100 Phrasal Verbs",
    amount: "100.00",
  },
} as const;

export type PaypalOnlineProductKey = keyof typeof PAYPAL_ONLINE_PRODUCTS;
