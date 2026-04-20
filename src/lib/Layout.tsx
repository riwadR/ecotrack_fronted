import { cookies } from "next/headers";

export type SessionUser = {
  email: string;
  name: string;
  role: "ADMIN" | "GESTIONNAIRE" | "AGENT" | "CITOYEN";
};

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token?.value) return null;

  try {
    const decoded = Buffer.from(token.value, "base64").toString("utf-8");
    return JSON.parse(decoded) as SessionUser;
  } catch {
    return null;
  }
}