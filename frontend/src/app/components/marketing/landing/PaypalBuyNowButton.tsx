"use client";

import * as React from "react";
import ButtonBase from "@mui/material/ButtonBase";
import Box from "@mui/material/Box";

import {
  PAYPAL_BUSINESS_EMAIL,
  PAYPAL_ONLINE_PRODUCTS,
  type PaypalOnlineProductKey,
} from "@/app/constants/paypal";
import { useLandingLocaleSwitch } from "./LandingLocaleProvider";

/** PayPal's smart-button gold theme, so this matches the Subscribe button. */
const PAYPAL_GOLD = "#FFC439";
const PAYPAL_NAVY = "#003087";
const PAYPAL_LABEL_COLOR = "#2C2E2F";
const PAYPAL_FONT =
  'PayPalOpen-Regular, "Helvetica Neue", Arial, "Liberation Sans", sans-serif';
/** Same wordmark the PayPal JS SDK draws (paypalobjects js-sdk-logos). */
const PAYPAL_LOGO_SRC = "/images/paypal-logo.svg";

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
}: {
  productKey: PaypalOnlineProductKey;
  label: string;
}) {
  const { locale } = useLandingLocaleSwitch();

  const handleClick = React.useCallback(() => {
    window.open(
      buildPaypalCheckoutUrl(productKey, locale),
      "_blank",
      "noopener,noreferrer"
    );
  }, [productKey, locale]);

  return (
    <ButtonBase
      onClick={handleClick}
      aria-label={`PayPal ${label}`}
      sx={{
        width: "100%",
        height: 45,
        borderRadius: "4px",
        bgcolor: PAYPAL_GOLD,
        gap: "6px",
        fontFamily: PAYPAL_FONT,
        transition: "filter 0.15s ease",
        "&:hover": { filter: "brightness(0.95)" },
        "&:focus-visible": {
          outline: `2px solid ${PAYPAL_NAVY}`,
          outlineOffset: 2,
        },
      }}
    >
      <Box
        component="img"
        src={PAYPAL_LOGO_SRC}
        alt=""
        aria-hidden
        sx={{ height: 22, width: "auto", display: "block" }}
      />
      <Box
        component="span"
        aria-hidden
        sx={{
          fontFamily: PAYPAL_FONT,
          fontSize: "16px",
          fontWeight: 500,
          lineHeight: 1,
          color: PAYPAL_LABEL_COLOR,
          letterSpacing: 0,
          textTransform: "none",
        }}
      >
        {label}
      </Box>
    </ButtonBase>
  );
}
