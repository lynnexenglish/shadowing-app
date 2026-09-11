"use client";

/**
 * FastSpring checkout temporarily disabled.
 * Original implementation is commented below for easy re-enable.
 */

/*
import { useCallback, useState } from "react";
import { FiArrowRight } from "react-icons/fi";

import { openFastSpringCheckout } from "@/app/helpers/fastspringCheckout";
import { useLandingLocaleSwitch } from "./LandingLocaleProvider";
import { GhostButton, GoldButton } from "./primitives";

export function FastSpringCheckoutButton({
  productPath,
  label,
  featured = false,
  fullWidth = true,
}: {
  productPath: string;
  label: string;
  featured?: boolean;
  fullWidth?: boolean;
}) {
  const { locale } = useLandingLocaleSwitch();
  const [loading, setLoading] = useState(false);
  const Primary = featured ? GoldButton : GhostButton;

  const handleClick = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const opened = await openFastSpringCheckout(productPath, locale);
      if (!opened) {
        await new Promise((resolve) => window.setTimeout(resolve, 800));
        const retry = await openFastSpringCheckout(productPath, locale);
        if (!retry) {
          window.alert(
            "Checkout is still loading. Please wait a moment and try again.",
          );
        }
      }
    } finally {
      setLoading(false);
    }
  }, [productPath, locale, loading]);

  return (
    <Primary
      fullWidth={fullWidth}
      onClick={handleClick}
      endIcon={<FiArrowRight size={15} />}
      sx={{ width: fullWidth ? "100%" : undefined }}
    >
      {label}
    </Primary>
  );
}
*/

type FastSpringCheckoutButtonProps = {
  productPath: string;
  label: string;
  featured?: boolean;
  fullWidth?: boolean;
};

export function FastSpringCheckoutButton(
  _props: FastSpringCheckoutButtonProps
): null {
  void _props;
  return null;
}
