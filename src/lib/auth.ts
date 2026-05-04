import { cookies } from "next/headers";
import { Role } from "@/models/user";

export type SessionUser = {
  email: string;
  name: string;
  role: Role;
};

/**
 * Récupère la session de l'utilisateur connecté depuis le cookie httpOnly.
 * Retourne null si pas de token ou token invalide.
 * À utiliser uniquement dans les Server Components et les Route Handlers.
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session");

  if (!token?.value) return null;

  try {
    const decoded = Buffer.from(token.value, "base64").toString("utf-8");
    const session = JSON.parse(decoded) as SessionUser;

    // Vérification minimale de la structure
    if (!session.email || !session.role || !session.name) return null;

    return session;
  } catch {
    return null;
  }
}

/**
 * Vérifie si l'utilisateur connecté a l'un des rôles autorisés.
 * Pratique pour les vérifications rapides dans les pages.
 */
export async function hasRole(allowedRoles: Role[]): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  return allowedRoles.includes(session.role);
}