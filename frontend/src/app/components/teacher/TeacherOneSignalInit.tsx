"use client";

import { useEffect, useRef } from "react";
import OneSignal from "react-onesignal";
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
      // Intentionally no notifyButton — teacher-only prompt via requestPermission()
    }).then(() => undefined);
  }
  await initPromise;
}

/**
 * Teacher-only: init OneSignal Web Push and login with users.id as External ID
 * so the backend can target this teacher on lesson submit.
 */
export default function TeacherOneSignalInit() {
  const { token } = useAuthContext();
  const loggedInExternalId = useRef<string | null>(null);

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
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const user = decodeToken(token);
        if (user.role !== "teacher") {
          return;
        }

        await ensureOneSignalInitialized(appId);
        if (cancelled) {
          return;
        }

        await OneSignal.login(user.id);
        loggedInExternalId.current = user.id;

        await OneSignal.Notifications.requestPermission();
      } catch (error) {
        console.error("[OneSignal] Teacher init failed:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return null;
}
