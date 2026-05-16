import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAMES,
  clearAuthCookies,
  setAuthCookiesOnResponse,
} from "@/lib/auth-cookies";
import { backendFetchMe, backendRefreshAndSessionUser } from "@/lib/backend-auth";
import { accessTokenNeedsRefresh } from "@/lib/jwt-access";

const ROLE_PROTECTED: Record<string, string[]> = {
  "/dashboard/admin": ["ADMIN"],
  "/dashboard/infrastructure/nouveau": ["ADMIN", "MANAGER"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = pathname.startsWith("/dashboard");
  const isAuth = pathname.startsWith("/login") || pathname.startsWith("/register");

  let access = request.cookies.get(AUTH_COOKIE_NAMES.access)?.value;
  const refresh = request.cookies.get(AUTH_COOKIE_NAMES.refresh)?.value;

  const res = NextResponse.next({ request });

  if (refresh && accessTokenNeedsRefresh(access)) {
    const out = await backendRefreshAndSessionUser(refresh);
    if (!out) {
      const redirect = NextResponse.redirect(new URL("/login", request.url));
      clearAuthCookies(redirect);
      return redirect;
    }
    setAuthCookiesOnResponse(res, out.accessToken, out.refreshToken, out.sessionUser);
    access = out.accessToken;
  }

  const me = access ? await backendFetchMe(access) : null;

  if (isProtected && !me) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isProtected && me) {
    for (const [route, allowedRoles] of Object.entries(ROLE_PROTECTED)) {
      if (pathname.startsWith(route) && !allowedRoles.includes(me.role)) {
        return NextResponse.redirect(
          new URL("/dashboard/unauthorized", request.url)
        );
      }
    }
  }

  if (isAuth && me) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
