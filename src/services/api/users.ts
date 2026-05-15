import { User } from "@/models/user";
import { headers } from "next/headers";

type UsersApiRecord = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: User["role"];
};

function mapUsersApiRecords(records: UsersApiRecord[]): User[] {
  return records.map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email,
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
