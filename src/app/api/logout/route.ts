import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendBaseUrl } from "@/lib/backend-url";
import { clearAuthCookies } from "@/lib/auth-cookies";

export async function POST() {
  const response = NextResponse.json({ success: true });

  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;
    const backendBase = getBackendBaseUrl();

    if (refreshToken) {
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

  clearAuthCookies(response);
  return response;
}
