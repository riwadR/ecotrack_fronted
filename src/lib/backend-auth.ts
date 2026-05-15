import type { Role } from "@/models/user";
import type { SessionUser } from "@/lib/auth";
import { getBackendBaseUrl } from "@/lib/backend-url";
import { resolvePublicUsername } from "@/lib/user/displayUsername";

type BackendAuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
};

type UserProfileMe = {
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role: Role;
};

function buildSessionUser(profile: UserProfileMe): SessionUser {
  const email = profile.email;
  const username = resolvePublicUsername({
    username: profile.username,
    email,
    fallback: "Utilisateur",
  });

  return {
    email,
    name: username,
    username,
    role: profile.role,
  };
}

/**
 * Rafraîchit les tokens (rotation côté Spring) et charge le profil via JWT (source de vérité pour le rôle).
 */
export async function backendRefreshAndSessionUser(
  refreshToken: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  sessionUser: SessionUser;
} | null> {
  const backendBase = getBackendBaseUrl();

  const authRes = await fetch(`${backendBase}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });

  if (!authRes.ok) return null;

  const auth = (await authRes.json()) as BackendAuthResponse;

  const meRes = await fetch(`${backendBase}/api/auth/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${auth.accessToken}` },
    cache: "no-store",
  });

  if (!meRes.ok) return null;

  const profile = (await meRes.json()) as UserProfileMe;
  const sessionUser = buildSessionUser(profile);

  return {
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    sessionUser,
  };
}

export async function backendFetchMe(
  accessToken: string
): Promise<SessionUser | null> {
  const backendBase = getBackendBaseUrl();
  const meRes = await fetch(`${backendBase}/api/auth/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!meRes.ok) return null;
  const profile = (await meRes.json()) as UserProfileMe;
  return buildSessionUser(profile);
}
