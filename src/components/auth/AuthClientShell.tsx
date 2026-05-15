"use client";

import SessionExpiredListener from "@/components/auth/SessionExpiredListener";

/**
 * Client-only auth UX (session-expired toast). Mount once under an authenticated layout.
 */
export default function AuthClientShell() {
  return <SessionExpiredListener />;
}
