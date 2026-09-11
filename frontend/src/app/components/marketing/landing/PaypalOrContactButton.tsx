"use client";

import { useCallback, useEffect, useState } from "react";
import { FiArrowRight } from "react-icons/fi";

import type { PaypalOnlineProductKey } from "@/app/constants/paypal";
import {
  buildPaypalCheckoutUrl,
  detectBuyerCountry,
  isKoreanBuyer,
} from "@/app/helpers/paypalCheckout";
import { EmailEnquiryButton } from "./EmailContactActions";
import { useLandingLocaleSwitch } from "./LandingLocaleProvider";
import { GhostButton, GoldButton } from "./primitives";

/**
 * Online courses only:
 * - Korean students → Contact Lyn
 * - International → PayPal hosted checkout (merchant email)
 */
export function PaypalOrContactButton({
  productKey,
  courseTitle,
  paypalLabel,
  contactLabel,
  featured = false,
  fullWidth = true,
}: {
  productKey: PaypalOnlineProductKey;
  courseTitle: string;
  paypalLabel: string;
  contactLabel: string;
  featured?: boolean;
  fullWidth?: boolean;
}) {
  const { locale } = useLandingLocaleSwitch();
  const [korean, setKorean] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    detectBuyerCountry().then((country) => {
      if (!cancelled) setKorean(isKoreanBuyer(country, locale));
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const handlePaypal = useCallback(() => {
    const url = buildPaypalCheckoutUrl(productKey, {
      locale,
      origin: window.location.origin,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  }, [productKey, locale]);

  // While detecting, default to PayPal for en / contact for ko to avoid wrong CTA flash
  const useContact = korean === null ? locale === "ko" : korean;

  if (useContact) {
    return (
      <EmailEnquiryButton
        subject={`Purchase enquiry: ${courseTitle}`}
        signUpLabel={contactLabel}
        featured={featured}
        fullWidth={fullWidth}
      />
    );
  }

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
