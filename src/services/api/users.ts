import { User } from "@/models/user";
import { headers } from "next/headers";
import { resolvePublicUsername } from "@/lib/user/displayUsername";

type UsersApiRecord = {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role: User["role"];
  accountLocked?: boolean;
  receivesAlerts?: boolean;
};

function mapUsersApiRecords(records: UsersApiRecord[]): User[] {
  return records.map((u) => ({
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
  }));
}

/**
 * Server-only: loads users via the BFF with forwarded HttpOnly cookies.
 * Do not call from Client Components — use a dedicated client service if needed later.
 */
export async function getUsers(): Promise<User[]> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";

  if (!host) {
    throw new Error("Hôte inconnu pour l’appel interne vers l’API.");
  }

  const res = await fetch(`${proto}://${host}/api/backend/users`, {
    cache: "no-store",
    headers: {
      accept: "application/json",
      cookie: h.get("cookie") ?? "",
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Session expirée. Veuillez vous reconnecter.");
    }
    if (res.status === 403) {
      throw new Error("Accès refusé à cette ressource.");
    }
    throw new Error("Impossible de charger les utilisateurs.");
  }

  const data = (await res.json()) as UsersApiRecord[];
  return mapUsersApiRecords(data);
}
