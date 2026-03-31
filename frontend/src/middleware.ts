import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { REFRESH_COOKIE, TOKEN_COOKIE } from "@/lib/constants/app";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith("/login");
  const isProtectedRoute = !isAuthRoute;

  // Allow access when a refresh token still exists. The app can recover the
  // session client-side without forcing the user back to login on route change.
  if (isProtectedRoute && !token && !refreshToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/companies/:path*",
    "/users/:path*",
    "/whatsapp/:path*",
    "/agents/:path*",
    "/knowledge/:path*",
    "/conversations/:path*",
    "/orders/:path*",
    "/menu/:path*",
    "/inventory/:path*",
    "/finance/:path*",
    "/business/:path*",
    "/hours/:path*",
    "/promotions/:path*",
    "/metrics/:path*",
    "/billing/:path*",
    "/logs/:path*",
    "/settings/:path*",
    "/login"
  ]
};
