"use client";

import * as React from "react";
import { useRouter } from "@/i18n/routing";

/** Warm the login route bundle while the visitor reads the landing page. */
export default function LandingLoginPrefetch() {
  const router = useRouter();

  React.useEffect(() => {
    router.prefetch("/login");
  }, [router]);

  return null;
}
