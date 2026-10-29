"use client";

import * as React from "react";
import { FiArrowRight } from "react-icons/fi";

import {
  PAYPAL_BUSINESS_EMAIL,
  PAYPAL_ONLINE_PRODUCTS,
  type PaypalOnlineProductKey,
} from "@/app/constants/paypal";
import { useLandingLocaleSwitch } from "./LandingLocaleProvider";
import { GhostButton, GoldButton } from "./primitives";

/** Classic PayPal "Buy Now" hosted checkout using only the merchant email. */
function buildPaypalCheckoutUrl(
  productKey: PaypalOnlineProductKey,
  locale: "en" | "ko"
): string {
  const product = PAYPAL_ONLINE_PRODUCTS[productKey];
  const origin = window.location.origin;
  const params = new URLSearchParams({
    cmd: "_xclick",
    business: PAYPAL_BUSINESS_EMAIL,
    item_name: product.itemName,
    amount: product.amount,
    currency_code: "USD",
    no_shipping: "1",
    lc: locale === "ko" ? "ko_KR" : "en_US",
    return: `${origin}/${locale}`,
    cancel_return: `${origin}/${locale}`,
  });
  return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
}

/** One-time PayPal payment button for a self-paced course. */
export function PaypalBuyNowButton({
  productKey,
  label,
  featured = false,
}: {
  productKey: PaypalOnlineProductKey;
  label: string;
  featured?: boolean;
}) {
  const { locale } = useLandingLocaleSwitch();
  const Primary = featured ? GoldButton : GhostButton;

  const handleClick = React.useCallback(() => {
    window.open(
      buildPaypalCheckoutUrl(productKey, locale),
      "_blank",
      "noopener,noreferrer"
    );
  }, [productKey, locale]);

  return (
    <Primary
      fullWidth
      onClick={handleClick}
      endIcon={<FiArrowRight size={15} />}
      sx={{ width: "100%" }}
    >
      {label}
    </Primary>
  );
}
