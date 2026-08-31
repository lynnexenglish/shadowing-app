"use client";

import { useCallback, useState } from "react";
import { FiArrowRight } from "react-icons/fi";

import { openFastSpringCheckout } from "@/app/helpers/fastspringCheckout";
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
  const [loading, setLoading] = useState(false);
  const Primary = featured ? GoldButton : GhostButton;

  const handleClick = useCallback(() => {
    if (loading) return;
    setLoading(true);
    const opened = openFastSpringCheckout(productPath);
    if (!opened) {
      window.setTimeout(() => {
        const retry = openFastSpringCheckout(productPath);
        if (!retry) {
          window.alert(
            "Checkout is still loading. Please wait a moment and try again."
          );
        }
        setLoading(false);
      }, 800);
      return;
    }
    setLoading(false);
  }, [productPath, loading]);

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
