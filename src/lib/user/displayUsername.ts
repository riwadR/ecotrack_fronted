/**
 * Resolves the public pseudo shown in citizen-facing UI.
 * Falls back to the email local-part for legacy accounts without a username.
 */
export function emailLocalPart(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.indexOf("@");
  if (at <= 0) {
    return trimmed;
  }
  return trimmed.slice(0, at);
}

export function resolvePublicUsername(options: {
  username?: string | null;
  email?: string | null;
  fallback?: string;
}): string {
  const trimmedUsername = options.username?.trim();
  if (trimmedUsername) {
    return trimmedUsername;
  }

  const trimmedEmail = options.email?.trim();
  if (trimmedEmail) {
    return emailLocalPart(trimmedEmail);
  }

  return options.fallback ?? "Citoyen";
}
