import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  const cookieHeader = response.cookies;

  // Best-effort: revoke refresh token in backend (so re-login won't conflict).
  try {
    const cookieStr = (await import("next/headers")).cookies;
    const cookieStore = await cookieStr();
    const refreshToken = cookieStore.get("refreshToken")?.value;
    const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

    if (refreshToken && backendBase) {
      await fetch(`${backendBase}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });
    }
  } catch {
    // ignore logout revocation errors
  }

  cookieHeader.set("accessToken", "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  cookieHeader.set("refreshToken", "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  cookieHeader.set("session", "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}