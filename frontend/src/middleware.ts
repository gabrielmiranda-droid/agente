import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { TOKEN_COOKIE } from "@/lib/constants/app";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith("/login");
  const isDashboardRoute = !isAuthRoute;

  if (isDashboardRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/companies/:path*",
    "/users/:path*",
    "/whatsapp/:path*",
    "/agents/:path*",
    "/knowledge/:path*",
    "/conversations/:path*",
    "/metrics/:path*",
    "/billing/:path*",
    "/settings/:path*",
    "/login"
  ]
};
