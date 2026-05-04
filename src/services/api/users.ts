import { User } from "@/models/user";
import { cookies } from "next/headers";

function getBackendBaseUrl() {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is missing (expected e.g. http://localhost:8080)"
    );
  }
  return base.replace(/\/+$/, "");
}

export async function getUsers(): Promise<User[]> {
  // Server Components: forward JWT explicitly (Node fetch won't attach browser cookies).
  if (typeof window === "undefined") {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    if (!accessToken) {
      throw new Error("Session expirée ou token manquant. Reconnecte-toi.");
    }

    const res = await fetch(`${getBackendBaseUrl()}/api/users`, {
      cache: "no-store",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Session expirée ou token invalide. Reconnecte-toi.");
      }
      if (res.status === 403) {
        throw new Error(
          "Accès refusé par l’API (403). Si tu es bien ADMIN, reconnecte-toi pour rafraîchir le JWT."
        );
      }
      throw new Error("Erreur API");
    }

    const data = (await res.json()) as Array<{
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      role: User["role"];
    }>;

    return data.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email,
    }));
  }

  // Client: use same-origin proxy (browser will attach cookies automatically).
  const res = await fetch(`/api/backend/users`, {
    cache: "no-store",
    credentials: "include",
    headers: {
      accept: "application/json",
    },
  });
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Session expirée ou token manquant. Reconnecte-toi.");
    }
    if (res.status === 403) {
      throw new Error(
        "Accès refusé par l’API (403). Si tu es bien ADMIN, reconnecte-toi pour rafraîchir le JWT."
      );
    }
    throw new Error("Erreur API");
  }

  const data = (await res.json()) as Array<{
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: User["role"];
  }>;

  return data.map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email,
  }));
}