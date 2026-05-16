import { backendApiClient } from "@/lib/api/apiClient";
import { toApiError } from "@/lib/api/apiErrors";
import type { User } from "@/models/user";
import { resolvePublicUsername } from "@/lib/user/displayUsername";

type UserProfileWire = {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role: User["role"];
  accountLocked?: boolean;
  receivesAlerts?: boolean;
};

function mapUserProfile(record: UserProfileWire): User {
  return {
    id: record.id,
    email: record.email,
    role: record.role,
    accountLocked: record.accountLocked ?? false,
    receivesAlerts: record.receivesAlerts ?? false,
    username: resolvePublicUsername({
      username: record.username,
      email: record.email,
      fallback: "—",
    }),
    firstName: record.firstName?.trim() ?? "",
    lastName: record.lastName?.trim() ?? "",
  };
}

/** Client-side list of users (requires ADMIN). */
export async function listUsersClient(): Promise<User[]> {
  try {
    const { data } = await backendApiClient.get<UserProfileWire[]>("users");
    return data.map(mapUserProfile);
  } catch (error) {
    throw toApiError(error, "Impossible de charger les utilisateurs.");
  }
}

/** Active collection agents for tour planning (MANAGER / ADMIN). */
export async function getActiveAgents(): Promise<User[]> {
  try {
    const { data } = await backendApiClient.get<UserProfileWire[]>("users/agents");
    return data.map(mapUserProfile);
  } catch (error) {
    throw toApiError(error, "Impossible de charger les agents de collecte.");
  }
}
