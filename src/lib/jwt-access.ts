/**
 * Lecture de l'expiration JWT **sans vérification de signature** (indicatif uniquement).
 * Ne sert qu'à décider d'un rafraîchissement proactif ; l'autorisation repose sur le backend.
 */
export function jwtExpSeconds(accessToken: string): number | null {
  try {
    const part = accessToken.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const pad = (4 - (base64.length % 4)) % 4;
    const padded = base64 + "=".repeat(pad);
    const json = JSON.parse(atob(padded)) as { exp?: number };
    return typeof json.exp === "number" ? json.exp : null;
  } catch {
    return null;
  }
}

/** true si absent, illisible, ou expiré dans moins de skewSec secondes. */
export function accessTokenNeedsRefresh(
  accessToken: string | undefined,
  skewSec = 90
): boolean {
  if (!accessToken) return true;
  const exp = jwtExpSeconds(accessToken);
  if (exp == null) return true;
  const now = Math.floor(Date.now() / 1000);
  return exp <= now + skewSec;
}
