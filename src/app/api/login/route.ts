import { NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/backend-url";
import { setAuthCookiesOnResponse } from "@/lib/auth-cookies";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const backendBase = getBackendBaseUrl();

  const authRes = await fetch(`${backendBase}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!authRes.ok) {
    const message = await authRes.text().catch(() => "");
    return NextResponse.json(
      { message: message || "Email ou mot de passe incorrect." },
      { status: authRes.status }
    );
  }

  const auth = (await authRes.json()) as {
    accessToken: string;
    refreshToken: string;
    tokenType?: string;
  };

  const profileRes = await fetch(`${backendBase}/api/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
    },
    cache: "no-store",
  });

  if (!profileRes.ok) {
    return NextResponse.json(
      { message: "Connexion OK, mais profil introuvable." },
      { status: 500 }
    );
  }

  const profile = (await profileRes.json()) as {
    email: string;
    firstName?: string;
    lastName?: string;
    role: "ADMIN" | "MANAGER" | "AGENT" | "CITIZEN";
  };

  const name = `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim();
  const sessionUser = {
    email: profile.email,
    name: name || profile.email,
    role: profile.role,
  };

  const response = NextResponse.json({ success: true, role: profile.role });
  setAuthCookiesOnResponse(
    response,
    auth.accessToken,
    auth.refreshToken,
    sessionUser
  );

  return response;
}
