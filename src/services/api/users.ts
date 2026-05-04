import { User } from "@/models/user";
import { headers } from "next/headers";

export async function getUsers(): Promise<User[]> {
  if (typeof window === "undefined") {
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
