import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes réservées à certains rôles
const ROLE_PROTECTED: Record<string, string[]> = {
  "/dashboard/users": ["ADMIN", "GESTIONNAIRE"],
};

function decodeToken(token: string) {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    return JSON.parse(decoded) as { role: string };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const { pathname } = request.nextUrl;

  const isProtected = pathname.startsWith("/dashboard");
  const isAuth = pathname.startsWith("/login") || pathname.startsWith("/register");

  // Pas de token → /login
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Déjà connecté → /dashboard
  if (isAuth && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Vérification RBAC par route
  if (token) {
    const session = decodeToken(token.value);

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