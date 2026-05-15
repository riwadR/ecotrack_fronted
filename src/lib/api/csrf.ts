/**
 * Optional CSRF header for Spring Security cookie-based CSRF (XSRF-TOKEN).
 * EcoTrack Spring config disables CSRF for JWT APIs; this stays available if enabled later.
 */

const XSRF_COOKIE_NAME = "XSRF-TOKEN";
const XSRF_HEADER_NAME = "X-XSRF-TOKEN";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]*)`));
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function getCsrfTokenFromCookie(): string | null {
  return readCookie(XSRF_COOKIE_NAME);
}

export function applyCsrfHeader(
  headers: Record<string, string>
): Record<string, string> {
  const token = getCsrfTokenFromCookie();
  if (!token) return headers;
  return { ...headers, [XSRF_HEADER_NAME]: token };
}
