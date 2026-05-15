import type {
  Badge,
  GamificationProfile,
  LeaderboardEntry,
} from "@/models/gamification";
import type { Role } from "@/models/user";
import {
  normalizeGamificationProfile,
  normalizeLeaderboardEntries,
} from "@/lib/gamification/profileMapper";
import { backendApiClient } from "@/lib/api/apiClient";
import { toApiError } from "@/lib/api/apiErrors";

type UserProfileResponse = {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  gamification?: GamificationProfile | null;
};

async function fetchBackendJson<T>(
  path: string,
  fallbackMessage: string
): Promise<T> {
  try {
    const { data } = await backendApiClient.get<T>(path);
    return data;
  } catch (error) {
    throw toApiError(error, fallbackMessage);
  }
}

export async function fetchCurrentUserProfile(): Promise<UserProfileResponse> {
  return fetchBackendJson<UserProfileResponse>(
    "auth/me",
    "Impossible de charger le profil utilisateur."
  );
}

export async function fetchBadgeCatalog(): Promise<Badge[]> {
  return fetchBackendJson<Badge[]>(
    "badges",
    "Impossible de charger le catalogue de badges."
  );
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const payload = await fetchBackendJson<unknown>(
    "gamification/leaderboard",
    "Impossible de charger le classement."
  );
  return normalizeLeaderboardEntries(payload);
}

export async function fetchCitizenGamificationProfile(): Promise<GamificationProfile> {
  const payload = await fetchBackendJson<unknown>(
    "gamification/profile",
    "Impossible de charger ton profil de gamification."
  );
  return normalizeGamificationProfile(payload);
}

export async function fetchGamificationProfile(): Promise<GamificationProfile> {
  const currentUser = await fetchCurrentUserProfile();

  if (currentUser.role !== "CITIZEN") {
    return normalizeGamificationProfile(currentUser.gamification);
  }

  if (currentUser.gamification) {
    return normalizeGamificationProfile(currentUser.gamification);
  }

  return fetchCitizenGamificationProfile();
}
