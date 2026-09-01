import { NextRequest, NextResponse } from "next/server";

/**
 * Edge-runtime, cookie-presence-only redirect — NOT the authoritative auth
 * check (Prisma/SQLite can't run in the Edge runtime, so this can't verify
 * the session signature or look up the user/role). It exists purely so an
 * unauthenticated request bounces to /login before any page even starts
 * rendering, instead of waiting for the server component in (app)/layout.tsx
 * to do it. That server component's getSession() call is the real gate —
 * see its comment for why. A forged/expired cookie still gets past this
 * middleware; it does NOT get past the layout's check.
 */
export function proxy(request: NextRequest) {
  const hasSessionCookie = request.cookies.has("session");
  if (!hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/audit/:path*", "/cases/:path*"],
};
