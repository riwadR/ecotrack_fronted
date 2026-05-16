import type { User } from "@/models/user";
import type { ContainerType } from "@/models/container";
import { resolvePublicUsername } from "@/lib/user/displayUsername";

export type AdminUserUpdatePayload = {
  firstName: string;
  lastName: string;
  email: string;
  role: User["role"];
  accountLocked: boolean;
  receivesAlerts: boolean;
};

export type AlertThresholdRecord = {
  id: string;
  containerType: ContainerType;
  warningThreshold: number;
  criticalThreshold: number;
};

export type ThresholdUpdatePayload = {
  warningThreshold: number;
  criticalThreshold: number;
};

export async function readFrenchErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  if (!text.trim()) {
    return "Une erreur est survenue.";
  }
  try {
    const data = JSON.parse(text) as Record<string, unknown>;
    if (typeof data.message === "string") return data.message;
    const parts = Object.values(data).filter((v): v is string => typeof v === "string");
    if (parts.length) return parts.join(" ");
  } catch {
    return text;
  }
  return "Une erreur est survenue.";
}

function mapProfileRecord(u: {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role: User["role"];
  accountLocked?: boolean;
  receivesAlerts?: boolean;
}): User {
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    accountLocked: u.accountLocked ?? false,
    receivesAlerts: u.receivesAlerts ?? false,
    username: resolvePublicUsername({
      username: u.username,
      email: u.email,
      fallback: "—",
    }),
    firstName: u.firstName?.trim() ?? "",
    lastName: u.lastName?.trim() ?? "",
  };
}

export async function putAdminUserUpdate(
  userId: string,
  body: AdminUserUpdatePayload
): Promise<User> {
  const res = await fetch(`/api/backend/users/${encodeURIComponent(userId)}/admin-update`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await readFrenchErrorMessage(res));
  }
  const raw = (await res.json()) as {
    id: string;
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    role: User["role"];
    accountLocked?: boolean;
    receivesAlerts?: boolean;
  };
  return mapProfileRecord(raw);
}

export async function getAlertThresholds(): Promise<AlertThresholdRecord[]> {
  const res = await fetch(`/api/backend/thresholds`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(await readFrenchErrorMessage(res));
  }
  return (await res.json()) as AlertThresholdRecord[];
}

export async function putAlertThreshold(
  containerType: ContainerType,
  body: ThresholdUpdatePayload
): Promise<AlertThresholdRecord> {
  const res = await fetch(
    `/api/backend/thresholds/${encodeURIComponent(containerType)}`,
    {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    throw new Error(await readFrenchErrorMessage(res));
  }
  return (await res.json()) as AlertThresholdRecord;
}
