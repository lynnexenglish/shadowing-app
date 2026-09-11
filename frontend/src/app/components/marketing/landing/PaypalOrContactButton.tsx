"use client";

import { useCallback } from "react";
import { FiArrowRight } from "react-icons/fi";

import type { PaypalOnlineProductKey } from "@/app/constants/paypal";
import { buildPaypalCheckoutUrl } from "@/app/helpers/paypalCheckout";
import { useLandingLocaleSwitch } from "./LandingLocaleProvider";
import { GhostButton, GoldButton } from "./primitives";

/**
 * Online courses: always show Purchase → PayPal hosted checkout.
 * Korean bank-transfer contact stays as the note under the button.
 */
export function PaypalOrContactButton({
  productKey,
  paypalLabel,
  featured = false,
  fullWidth = true,
}: {
  productKey: PaypalOnlineProductKey;
  courseTitle?: string;
  paypalLabel: string;
  contactLabel?: string;
  featured?: boolean;
  fullWidth?: boolean;
}) {
  const { locale } = useLandingLocaleSwitch();

  const handlePaypal = useCallback(() => {
    const url = buildPaypalCheckoutUrl(productKey, {
      locale,
      origin: window.location.origin,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  }, [productKey, locale]);

  const Primary = featured ? GoldButton : GhostButton;

  return (
    <Primary
      fullWidth={fullWidth}
      onClick={handlePaypal}
      endIcon={<FiArrowRight size={15} />}
      sx={{ width: fullWidth ? "100%" : undefined }}
    >
      {paypalLabel}
    </Primary>
  );
}
