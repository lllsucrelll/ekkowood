import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, MERCHANT_SESSION_COOKIE } from "@/lib/auth/constants";

/**
 * Coarse, cookie-presence-only guard (Edge runtime, no DB access here).
 * The authoritative check — session validity, expiry, merchant
 * status/suspension — happens in each protected layout via
 * getAdminSession()/getMerchantSession(), which do hit the database.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const isAuthPage =
      pathname.startsWith("/dashboard/login") ||
      pathname.startsWith("/dashboard/forgot-password") ||
      pathname.startsWith("/dashboard/reset-password");
    const hasSession = request.cookies.has(MERCHANT_SESSION_COOKIE);

    // Redirecting away from the login page when a cookie is merely present
    // (without checking the database) risks a redirect loop if the cookie
    // is stale — the DB-backed check in the layout would bounce back to
    // login, which this proxy would then bounce away from again. Login
    // pages check the real session themselves instead (see their page.tsx).
    if (!isAuthPage && !hasSession) {
      return NextResponse.redirect(new URL("/dashboard/login", request.url));
    }
  }

  if (pathname.startsWith("/ivy")) {
    const isAuthPage = pathname.startsWith("/ivy/login");
    const hasSession = request.cookies.has(ADMIN_SESSION_COOKIE);

    if (!isAuthPage && !hasSession) {
      return NextResponse.redirect(new URL("/ivy/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/ivy/:path*"],
};
