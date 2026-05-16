import type { NextResponse } from "next/server";
import { encodeSessionPayload } from "@/lib/session-cookie";

export const AUTH_COOKIE_NAMES = {
  access: "accessToken",
  refresh: "refreshToken",
  session: "session",
} as const;

/**
 * Durée de vie du cookie access token (secondes).
 * Doit rester alignée avec `application.security.jwt.expiration` côté Spring (ms).
 */
export const ACCESS_TOKEN_MAX_AGE_SEC = 10 * 60;

/** Aligné sur RefreshTokenService (7 jours). */
export const REFRESH_TOKEN_MAX_AGE_SEC = 7 * 24 * 60 * 60;

/**
 * secure: true en production ou si COOKIE_SECURE=true (reverse proxy HTTPS).
 * sameSite: "lax" — cookies envoyés en navigation top-level GET ; limite le CSRF sur les POST cross-site.
 */
export function authCookieFlags(): { secure: boolean; sameSite: "lax" } {
  const isProd = process.env.NODE_ENV === "production";
  const secure = isProd || process.env.COOKIE_SECURE === "true";
  return { secure, sameSite: "lax" as const };
}

export function clearAuthCookies(response: NextResponse): void {
  const { secure, sameSite } = authCookieFlags();
  const opts = { httpOnly: true, secure, sameSite, path: "/", maxAge: 0 } as const;
  response.cookies.set(AUTH_COOKIE_NAMES.access, "", opts);
  response.cookies.set(AUTH_COOKIE_NAMES.refresh, "", opts);
  response.cookies.set(AUTH_COOKIE_NAMES.session, "", opts);
}

export function setAuthCookiesOnResponse(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
  session: { email: string; name: string; username?: string; role: string; id?: string }
): void {
  const { secure, sameSite } = authCookieFlags();
  const base = { httpOnly: true, secure, sameSite, path: "/" } as const;

  response.cookies.set(AUTH_COOKIE_NAMES.access, accessToken, {
    ...base,
    maxAge: ACCESS_TOKEN_MAX_AGE_SEC,
  });
  response.cookies.set(AUTH_COOKIE_NAMES.refresh, refreshToken, {
    ...base,
    maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
  });
  response.cookies.set(AUTH_COOKIE_NAMES.session, encodeSessionPayload(session), {
    ...base,
    maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
  });
}
