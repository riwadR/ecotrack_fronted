import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes réservées à certains rôles
const ROLE_PROTECTED: Record<string, string[]> = {
  "/dashboard/users": ["ADMIN"],
};

function decodeSession(session: string) {
  try {
    // Middleware runs on Edge runtime: prefer atob over Buffer.
    const decoded = atob(session);
    return JSON.parse(decoded) as { role: string };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("session");
  const { pathname } = request.nextUrl;

  const isProtected = pathname.startsWith("/dashboard");
  const isAuth = pathname.startsWith("/login") || pathname.startsWith("/register");

  // Pas de session → /login
  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Déjà connecté → /dashboard
  if (isAuth && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Vérification RBAC par route
  if (sessionCookie) {
    const session = decodeSession(sessionCookie.value);

    for (const [route, allowedRoles] of Object.entries(ROLE_PROTECTED)) {
      if (pathname.startsWith(route)) {
        if (!session || !allowedRoles.includes(session.role)) {
          return NextResponse.redirect(new URL("/dashboard/unauthorized", request.url));
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};