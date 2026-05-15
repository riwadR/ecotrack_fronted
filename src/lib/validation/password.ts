/** Mirrors `UserRegistrationDTO.password` in the backend. */
export const PASSWORD_PATTERN =
  /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&]).{8,}$/;

export const PASSWORD_REQUIREMENTS_MESSAGE =
  "Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&).";

export function isValidPassword(value: string): boolean {
  return PASSWORD_PATTERN.test(value);
}
