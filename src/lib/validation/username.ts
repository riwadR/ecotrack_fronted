/** Matches backend username rules (letters, digits, -, _, . ; no spaces). */
export const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]{5,15}$/;

export const USERNAME_VALIDATION_MESSAGE =
  "Le pseudo doit contenir entre 5 et 15 caractères (lettres, chiffres, tirets, underscores ou points uniquement, sans espace).";

export function isValidUsername(value: string): boolean {
  return USERNAME_PATTERN.test(value.trim());
}
