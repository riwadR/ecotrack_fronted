/**
 * Client-side session helpers for HttpOnly cookie auth.
 * Tokens are never readable from JavaScript; this module only tracks UI/session flags.
 */

export const AUTH_UI_MESSAGES = {
  sessionExpired: "Votre session a expiré. Veuillez vous reconnecter.",
} as const;

export const SESSION_EXPIRED_EVENT = "ecotrack:session-expired";

export type SessionExpiredDetail = {
  message: string;
};

type SessionExpiredListener = (detail: SessionExpiredDetail) => void;

let sessionExpiredHandled = false;
const listeners = new Set<SessionExpiredListener>();

/**
 * Subscribe to session-expired notifications (e.g. toast in a client layout).
 */
export function onSessionExpired(listener: SessionExpiredListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifySessionExpired(message: string): void {
  const detail: SessionExpiredDetail = { message };
  listeners.forEach((listener) => listener(detail));
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<SessionExpiredDetail>(SESSION_EXPIRED_EVENT, { detail })
    );
  }
}

/**
 * Clears server cookies via logout, resets client flags, and redirects to login.
 */
export async function handleSessionExpired(): Promise<void> {
  if (typeof window === "undefined") return;
  if (sessionExpiredHandled) return;
  sessionExpiredHandled = true;

  notifySessionExpired(AUTH_UI_MESSAGES.sessionExpired);

  try {
    const { apiClient } = await import("@/lib/api/apiClient");
    await apiClient.post("/api/logout");
  } catch {
    // Best-effort; refresh failure may have already cleared cookies server-side.
  }

  window.location.assign("/login");
}

/**
 * Call after a successful login so a future expiry can trigger redirect again.
 */
export function resetSessionExpiredGuard(): void {
  sessionExpiredHandled = false;
}
