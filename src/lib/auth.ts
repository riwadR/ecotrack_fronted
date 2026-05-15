import { cache } from "react";
import { cookies } from "next/headers";
import { Role } from "@/models/user";
import { backendFetchMe } from "@/lib/backend-auth";

export type SessionUser = {
  email: string;
  /** Public display label (username, or email fallback). */
  name: string;
  username: string;
  role: Role;
};

/**
 * Session issue du backend via JWT (GET /api/users/me).
 * Le cookie `session` n'est utilisé que pour l'affichage / compat ; ne pas s'en servir pour l'autorisation.
 */
export const getSession = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) return null;
  return backendFetchMe(accessToken);
});

/**
 * Vérifie le rôle à partir du profil backend (JWT), pas depuis le cookie session.
 */
export async function hasRole(allowedRoles: Role[]): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  return allowedRoles.includes(session.role);
}
