"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FiCheckCircle } from "react-icons/fi";

import {
  PAYPAL_MEMBERSHIP_PLAN_ID,
  PAYPAL_SDK_SRC,
} from "@/app/constants/paypal";
import { INK, TEXT } from "./tokens";

type PaypalButtons = {
  render: (container: HTMLElement) => Promise<void>;
  close?: () => Promise<void>;
};

type PaypalNamespace = {
  Buttons: (options: {
    style: Record<string, string>;
    createSubscription: (
      data: unknown,
      actions: {
        subscription: { create: (o: { plan_id: string }) => Promise<string> };
      }
    ) => Promise<string>;
    onApprove: (data: { subscriptionID?: string | null }) => void;
    onError: (err: unknown) => void;
  }) => PaypalButtons;
};

declare global {
  interface Window {
    paypal?: PaypalNamespace;
  }
}

/** Load the PayPal SDK once per page, even if several buttons mount. */
let sdkPromise: Promise<PaypalNamespace> | null = null;

function loadPaypalSdk(): Promise<PaypalNamespace> {
  if (window.paypal) return Promise.resolve(window.paypal);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<PaypalNamespace>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = PAYPAL_SDK_SRC;
    script.async = true;
    script.setAttribute("data-sdk-integration-source", "button-factory");
    script.onload = () =>
      window.paypal
        ? resolve(window.paypal)
        : reject(new Error("PayPal SDK missing"));
    script.onerror = () => {
      sdkPromise = null;
      script.remove();
      reject(new Error("PayPal SDK failed to load"));
    };
    document.body.appendChild(script);
  });

  return sdkPromise;
}

/** PayPal Subscribe button for the monthly membership plan. */
export function PaypalSubscribeButton({
  successTitle,
  successMessage,
  subscriptionIdLabel,
  errorMessage,
}: {
  successTitle: string;
  successMessage: string;
  subscriptionIdLabel: string;
  errorMessage: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [subscriptionId, setSubscriptionId] = React.useState<string | null>(
    null
  );
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    if (subscriptionId) return;
    let cancelled = false;
    let buttons: PaypalButtons | null = null;

    loadPaypalSdk()
      .then((paypal) => {
        const container = containerRef.current;
        if (cancelled || !container) return;
        container.innerHTML = "";
        buttons = paypal.Buttons({
          style: {
            shape: "rect",
            color: "gold",
            layout: "vertical",
            label: "subscribe",
          },
          createSubscription: (_data, actions) =>
            actions.subscription.create({ plan_id: PAYPAL_MEMBERSHIP_PLAN_ID }),
          onApprove: (data) => {
            setSubscriptionId(data.subscriptionID ?? "");
          },
          onError: () => setFailed(true),
        });
        return buttons.render(container);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      buttons?.close?.().catch(() => undefined);
    };
  }, [subscriptionId]);

  if (subscriptionId !== null) {
    return (
      <Box
        role="status"
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: "rgba(34, 160, 90, 0.08)",
          border: "1px solid rgba(34, 160, 90, 0.35)",
          textAlign: "center",
        }}
      >
        <Box sx={{ color: "rgb(34, 140, 80)", mb: 0.75 }}>
          <FiCheckCircle size={22} />
        </Box>
        <Typography
          sx={{ fontWeight: 700, fontSize: "0.95rem", color: INK[800] }}
        >
          {successTitle}
        </Typography>
        <Typography
          sx={{
            mt: 0.5,
            fontSize: "0.82rem",
            lineHeight: 1.55,
            color: TEXT.secondary,
          }}
        >
          {successMessage}
        </Typography>
        {subscriptionId && (
          <Typography sx={{ mt: 1, fontSize: "0.72rem", color: TEXT.muted }}>
            {subscriptionIdLabel} {subscriptionId}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <>
      <Box ref={containerRef} sx={{ minHeight: failed ? 0 : 45 }} />
      {failed && (
        <Typography
          role="alert"
          sx={{
            fontSize: "0.8rem",
            lineHeight: 1.55,
            color: TEXT.muted,
            textAlign: "center",
          }}
        >
          {errorMessage}
        </Typography>
      )}
    </>
  );
}
