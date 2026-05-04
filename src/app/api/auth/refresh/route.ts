import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendRefreshAndSessionUser } from "@/lib/backend-auth";
import {
  clearAuthCookies,
  setAuthCookiesOnResponse,
} from "@/lib/auth-cookies";

/**
 * Rafraîchit access + refresh (rotation) + cookie session à partir du refresh HttpOnly.
 * Appelable par le client (credentials) ou en chaîne interne avec les cookies transmis.
 */
export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "Non authentifié." }, { status: 401 });
  }

  const out = await backendRefreshAndSessionUser(refreshToken);
  if (!out) {
    const res = NextResponse.json({ message: "Session invalide." }, { status: 401 });
    clearAuthCookies(res);
    return res;
  }

  const res = NextResponse.json({ success: true });
  setAuthCookiesOnResponse(res, out.accessToken, out.refreshToken, out.sessionUser);
  return res;
}
