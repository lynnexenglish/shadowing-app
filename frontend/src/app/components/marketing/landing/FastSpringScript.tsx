"use client";

import { useEffect } from "react";
import Script from "next/script";

import {
  FASTSPRING_SBL_SRC,
  FASTSPRING_STOREFRONT,
} from "@/app/constants/fastspring";
import { registerFastSpringPopupHandler } from "@/app/helpers/fastspringCheckout";

if (typeof window !== "undefined") {
  registerFastSpringPopupHandler();
}

/** Store Builder Library — popup checkout on the marketing landing page. */
export default function FastSpringScript() {
  useEffect(() => {
    registerFastSpringPopupHandler();
  }, []);

  if (!FASTSPRING_STOREFRONT) return null;

  return (
    <Script
      id="fsc-api"
      src={FASTSPRING_SBL_SRC}
      strategy="afterInteractive"
      data-storefront={FASTSPRING_STOREFRONT}
      data-popup-closed="onFSPopupClosed"
    />
  );
}
