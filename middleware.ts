import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Middleware for protecting routes with authentication
 *
 * This middleware runs at the edge (before the request reaches your pages/API routes)
 * providing fast authentication checks without server overhead.
 *
 * Protected routes:
 * - /dashboard/* - User dashboard and main app
 * - /api/v1/* - API routes (except auth)
 * - /settings/* - User settings
 * - /calendar/* - Calendar views
 *
 * Public routes:
 * - / - Landing page
 * - /signin - Sign-in page
 * - /api/auth/* - NextAuth routes
 * - /_next/* - Next.js static files
 * - /public/* - Public assets
 *
 * Security features:
 * - Edge runtime for fast authentication checks
 * - Automatic redirect to sign-in for unauthenticated users
 * - Preserves callback URL for post-login redirect
 * - Checks session token validity
 *
 * @see https://next-auth.js.org/configuration/nextjs#middleware
 */
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Allow request to continue if authenticated
    if (token) {
      // Check if user is active
      if (!token.isActive) {
        // Redirect to sign-in with error if account is inactive
        const signInUrl = new URL("/signin", req.url);
        signInUrl.searchParams.set("error", "SessionRequired");
        signInUrl.searchParams.set("message", "Your account is inactive");
        return NextResponse.redirect(signInUrl);
      }

      // Check for token errors (e.g., refresh failed)
      if (token.error) {
        const signInUrl = new URL("/signin", req.url);
        signInUrl.searchParams.set("error", "SessionRequired");
        return NextResponse.redirect(signInUrl);
      }

      // Add custom headers for downstream use
      const response = NextResponse.next();
      response.headers.set("x-user-id", String(token.id || ""));
      response.headers.set("x-user-email", String(token.email || ""));
      return response;
    }

    // If no token, withAuth will redirect to sign-in
    return NextResponse.next();
  },
  {
    callbacks: {
      /**
       * Determines if the request is authorized
       * Return true to allow, false to redirect to sign-in
       */
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Always allow access to auth routes
        if (path.startsWith("/api/auth")) {
          return true;
        }

        // Check if route requires authentication
        const protectedPaths = [
          "/dashboard",
          "/settings",
          "/calendar",
          "/api/v1",
        ];

        const isProtectedRoute = protectedPaths.some((protectedPath) =>
          path.startsWith(protectedPath)
        );

        // If protected route, require token
        if (isProtectedRoute) {
          return !!token;
        }

        // Allow access to public routes
        return true;
      },
    },
    pages: {
      signIn: "/signin",
    },
  }
);

/**
 * Matcher configuration
 * Defines which routes this middleware applies to
 *
 * Performance optimization: Exclude static files and Next.js internals
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (public assets)
     * - api/auth (NextAuth routes - handled by NextAuth itself)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
