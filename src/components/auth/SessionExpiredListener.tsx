"use client";

import { useEffect, useState } from "react";
import {
  AUTH_UI_MESSAGES,
  onSessionExpired,
  SESSION_EXPIRED_EVENT,
  type SessionExpiredDetail,
} from "@/lib/api/authSession";

/**
 * Optional: mount once in a client layout (e.g. dashboard) to show a French expiry notice
 * before redirect when silent refresh fails.
 */
export default function SessionExpiredListener() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const show = (detail: SessionExpiredDetail) => setMessage(detail.message);

    const unsubscribe = onSessionExpired(show);
    const onWindowEvent = (event: Event) => {
      const custom = event as CustomEvent<SessionExpiredDetail>;
      if (custom.detail?.message) show(custom.detail);
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, onWindowEvent);
    return () => {
      unsubscribe();
      window.removeEventListener(SESSION_EXPIRED_EVENT, onWindowEvent);
    };
  }, []);

  if (!message) return null;

  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        maxWidth: "360px",
        padding: "14px 16px",
        borderRadius: "10px",
        background: "#7f1d1d",
        color: "#fff",
        fontSize: "14px",
        fontWeight: 600,
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
      }}
    >
      {message || AUTH_UI_MESSAGES.sessionExpired}
    </div>
  );
}
