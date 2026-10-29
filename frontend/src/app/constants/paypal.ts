/**
 * PayPal subscription (ShadowSpeak monthly membership, $10/month).
 * The Client ID is public by design — no secret is needed for the Subscribe button.
 */
export const PAYPAL_CLIENT_ID =
  "BAAbyYst-iwaaskW-f9-Jfh8EO-g_9ACNsVsZhbkchlzprLIjzN4_w6ODfQ9VsyVzrSzQyA7rt_LJTuIww";

export const PAYPAL_MEMBERSHIP_PLAN_ID = "P-7U746877XE8163131NLO2TYI";

export const PAYPAL_SDK_SRC = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
