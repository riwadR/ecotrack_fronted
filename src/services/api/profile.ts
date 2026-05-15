import type { Role } from "@/models/user";
import { backendApiClient } from "@/lib/api/apiClient";
import { toApiError } from "@/lib/api/apiErrors";

export type UserProfileResponse = {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string | number[] | null;
  emailVerified?: boolean;
  mfaEnabled?: boolean;
  createdAt?: string;
  role: Role;
};

export async function getUserByEmail(email: string): Promise<UserProfileResponse> {
  try {
    const { data } = await backendApiClient.get<UserProfileResponse>(
      `users/email/${encodeURIComponent(email)}`
    );
    return data;
  } catch (error) {
    throw toApiError(error, "Impossible de charger le profil utilisateur.");
  }
}

export async function updateUserProfile(
  id: string,
  payload: {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth?: string | null;
  }
): Promise<UserProfileResponse> {
  try {
    const { data } = await backendApiClient.put<UserProfileResponse>(
      `users/${encodeURIComponent(id)}`,
      payload
    );
    return data;
  } catch (error) {
    throw toApiError(error, "Impossible de mettre à jour le profil.");
  }
}

export async function changeUserPassword(
  id: string,
  payload: { oldPassword: string; newPassword: string }
): Promise<void> {
  try {
    await backendApiClient.patch(
      `users/${encodeURIComponent(id)}/password`,
      payload
    );
  } catch (error) {
    throw toApiError(error, "Impossible de changer le mot de passe.");
  }
}
