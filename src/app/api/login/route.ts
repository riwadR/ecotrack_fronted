import { NextResponse } from "next/server";

function getBackendBaseUrl() {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is missing (expected e.g. http://localhost:8080)"
    );
  }
  return base.replace(/\/+$/, "");
}

export async function POST(request: Request) {
  const reqUrl = new URL(request.url);
  const isHttps = reqUrl.protocol === "https:";

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

  const profileRes = await fetch(
    `${backendBase}/api/users/email/${encodeURIComponent(email)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
      cache: "no-store",
    }
  );

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
  const sessionPayload = Buffer.from(
    JSON.stringify({
      email: profile.email,
      name: name || profile.email,
      role: profile.role,
    })
  ).toString("base64");

  // IMPORTANT: cookies must be set on the returned NextResponse
  // (using cookies().set(...) may not emit Set-Cookie reliably).
  const response = NextResponse.json({ success: true, role: profile.role });
  response.cookies.set("accessToken", auth.accessToken, {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  response.cookies.set("refreshToken", auth.refreshToken, {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  response.cookies.set("session", sessionPayload, {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}