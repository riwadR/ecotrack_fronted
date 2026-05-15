/** Matches `UserRegistrationDTO.username` in the backend. */
export const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]{5,15}$/;

export const USERNAME_VALIDATION_MESSAGE =
  "Le pseudo doit contenir entre 5 et 15 caractères (lettres, chiffres, tirets, underscores ou points uniquement, sans espace).";

/** Must stay aligned with `UserService.FORBIDDEN_USERNAMES` (backend). */
export const FORBIDDEN_USERNAMES = new Set([
  "admin",
  "moderator",
  "ecotrack",
  "system",
  "hitler",
  "nazi",
  "nigger",
  "nigga",
  "heil",
  "supremacy",
]);

export const USERNAME_FORBIDDEN_MESSAGE =
  "Ce nom d'utilisateur n'est pas autorisé.";

export function isForbiddenUsername(value: string): boolean {
  const key = value.trim().toLowerCase();
  return key.length > 0 && FORBIDDEN_USERNAMES.has(key);
}

export function isValidUsername(value: string): boolean {
  const t = value.trim();
  return USERNAME_PATTERN.test(t) && !isForbiddenUsername(t);
}

/** First matching error for forms and API route (French copy matches backend where possible). */
export function getUsernameFieldError(value: string): string | null {
  const t = value.trim();
  if (!t) {
    return "Le pseudo est obligatoire.";
  }
  if (!USERNAME_PATTERN.test(t)) {
    return USERNAME_VALIDATION_MESSAGE;
  }
  if (isForbiddenUsername(t)) {
    return USERNAME_FORBIDDEN_MESSAGE;
  }
  return null;
}
