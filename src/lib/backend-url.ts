/**
 * URL du backend Spring (sans slash final).
 * Utilisé par les route handlers et le middleware Edge (NEXT_PUBLIC_*).
 */
export function getBackendBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is missing (expected e.g. http://localhost:8080)"
    );
  }
  return base.replace(/\/+$/, "");
}
