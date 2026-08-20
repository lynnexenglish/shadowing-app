"use client";

import { useEffect, useRef, useState } from "react";
import OneSignal from "react-onesignal";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useAuthContext } from "../../AuthContext";
import decodeToken from "../../helpers/decodeToken";

let initPromise: Promise<void> | null = null;

async function ensureOneSignalInitialized(appId: string) {
  if (!initPromise) {
    const safariWebId = process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID;
    initPromise = OneSignal.init({
      appId,
      ...(safariWebId ? { safari_web_id: safariWebId } : {}),
      allowLocalhostAsSecureOrigin: true,
      serviceWorkerPath: "OneSignalSDKWorker.js",
      welcomeNotification: {
        disable: true,
        message: "",
      },
      // OneSignal subscription bell (teacher panel only — this component only mounts there)
      notifyButton: {
        enable: true,
        prenotify: true,
        showCredit: false,
        position: "bottom-right",
        size: "medium",
        text: {
          "tip.state.unsubscribed": "Subscribe to homework alerts",
          "tip.state.subscribed": "Homework alerts enabled",
          "tip.state.blocked": "Notifications blocked — check browser settings",
          "message.prenotify": "Click to enable homework notifications",
          "message.action.subscribing": "Subscribing…",
          "message.action.subscribed": "Thanks! You'll get homework alerts.",
          "message.action.resubscribed": "Homework alerts re-enabled",
          "message.action.unsubscribed": "You won't receive homework alerts",
          "dialog.main.title": "Homework notifications",
          "dialog.main.button.subscribe": "Enable",
          "dialog.main.button.unsubscribe": "Disable",
          "dialog.blocked.title": "Unblock notifications",
          "dialog.blocked.message":
            "Allow notifications for this site in your browser settings, then refresh.",
        },
      },
      // Soft slide prompt → user clicks Allow → native browser permission (works with browsers)
      promptOptions: {
        slidedown: {
          prompts: [
            {
              type: "push",
              autoPrompt: true,
              delay: { pageViews: 1, timeDelay: 1 },
              text: {
                actionMessage:
                  "Allow notifications so you get alerts when students submit homework.",
                acceptButton: "Allow",
                cancelButton: "Not now",
              },
            },
          ],
        },
      },
    }).then(() => undefined);
  }
  await initPromise;
}

async function isTeacherSubscribed(): Promise<boolean> {
  try {
    const permission = OneSignal.Notifications.permission;
    const optedIn = OneSignal.User.PushSubscription.optedIn;
    return Boolean(permission && optedIn);
  } catch {
    return false;
  }
}

/**
 * Teacher-only: init OneSignal Web Push, show subscribe prompts, and login with
 * users.id as External ID so the backend can target this teacher on lesson submit.
 */
export default function TeacherOneSignalInit() {
  const { token } = useAuthContext();
  const loggedInExternalId = useRef<string | null>(null);
  const [showEnableButton, setShowEnableButton] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    if (!appId || typeof window === "undefined") {
      return;
    }

    if (!token) {
      if (loggedInExternalId.current) {
        OneSignal.logout().catch(() => {});
        loggedInExternalId.current = null;
      }
      setIsTeacher(false);
      setShowEnableButton(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const user = decodeToken(token);
        if (user.role !== "teacher") {
          setIsTeacher(false);
          return;
        }
        setIsTeacher(true);

        await ensureOneSignalInitialized(appId);
        if (cancelled) {
          return;
        }

        await OneSignal.login(user.id);
        loggedInExternalId.current = user.id;

        if (cancelled) {
          return;
        }

        const subscribed = await isTeacherSubscribed();
        if (subscribed) {
          setShowEnableButton(false);
          return;
        }

        setShowEnableButton(true);

        // Soft prompt first (user click → native permission). force bypasses backoff.
        try {
          await OneSignal.Slidedown.promptPush({ force: true });
        } catch (promptError) {
          console.warn("[OneSignal] Slidedown prompt:", promptError);
        }
      } catch (error) {
        console.error("[OneSignal] Teacher init failed:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleEnableClick() {
    try {
      const granted = await OneSignal.Notifications.requestPermission();
      if (granted) {
        await OneSignal.User.PushSubscription.optIn();
        setShowEnableButton(false);
      } else {
        // Still show soft prompt / bell path if native was blocked without gesture history
        await OneSignal.Slidedown.promptPush({ force: true });
      }
    } catch (error) {
      console.error("[OneSignal] Enable notifications failed:", error);
    }
  }

  if (!isTeacher || !showEnableButton) {
    return null;
  }

  // Fallback CTA tied to a real user click (browsers require this for native prompt)
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 24,
        left: 24,
        zIndex: (theme) => theme.zIndex.snackbar,
      }}
    >
      <Button
        variant="contained"
        color="primary"
        onClick={handleEnableClick}
        sx={{ textTransform: "none", boxShadow: 3 }}
      >
        Enable homework notifications
      </Button>
    </Box>
  );
}
