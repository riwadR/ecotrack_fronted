import type { Role } from "@/models/user";
import type { SessionUser } from "@/lib/auth";
import { getBackendBaseUrl } from "@/lib/backend-url";

type BackendAuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
};

type UserProfileMe = {
  email: string;
  firstName?: string;
  lastName?: string;
  role: Role;
};

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
  const name =
    `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() ||
    profile.email;

  return {
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    sessionUser: {
      email: profile.email,
      name,
      role: profile.role,
    },
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
  const name =
    `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() ||
    profile.email;
  return {
    email: profile.email,
    name,
    role: profile.role,
  };
}
