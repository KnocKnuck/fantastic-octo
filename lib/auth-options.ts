import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { ExtendedJWT, ExtendedSession, AuthEvent, AuthEventLog, UserRole } from "@/types/auth";

/**
 * Rate limiting store (in-memory for now, should be Redis in production)
 * TODO: Replace with Redis when infrastructure is ready
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number; blockedUntil?: number }>();

/**
 * Rate limiting configuration
 * 5 attempts per 15 minutes as per security requirements
 */
const RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000, // 30 minutes
};

/**
 * Check rate limit for a given identifier (IP or email)
 */
export function checkRateLimit(identifier: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // Check if blocked
  if (record?.blockedUntil && record.blockedUntil > now) {
    return { allowed: false, resetTime: record.blockedUntil };
  }

  // Reset if window expired
  if (!record || record.resetTime < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return { allowed: true };
  }

  // Increment count
  record.count++;

  // Block if exceeded
  if (record.count > RATE_LIMIT.maxAttempts) {
    record.blockedUntil = now + RATE_LIMIT.blockDurationMs;
    return { allowed: false, resetTime: record.blockedUntil };
  }

  return { allowed: true };
}

/**
 * Log authentication events
 * TODO: Send to monitoring service (e.g., DataDog, Sentry) when infrastructure is ready
 */
export function logAuthEvent(log: AuthEventLog): void {
  // For now, just console log. In production, send to logging service
  const logEntry = {
    ...log,
    timestamp: log.timestamp.toISOString(),
  };

  if (log.success) {
    console.info("[AUTH EVENT]", logEntry);
  } else {
    console.error("[AUTH EVENT]", logEntry);
  }

  // TODO: Send to monitoring service
  // await sendToMonitoring(logEntry);
}

/**
 * NextAuth configuration options
 * Implements security best practices and OAuth flow
 */
export const authOptions: NextAuthOptions = {
  // Configure authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          // Request calendar scopes for integration
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/calendar.readonly",
            "https://www.googleapis.com/auth/calendar.events",
          ].join(" "),
        },
      },
    }),
    // TODO: Add Microsoft provider for Outlook integration
    // MicrosoftProvider({
    //   clientId: process.env.MICROSOFT_CLIENT_ID || "",
    //   clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
    //   authorization: {
    //     params: {
    //       scope: "openid email profile offline_access Calendars.ReadWrite",
    //     },
    //   },
    // }),
  ],

  // Configure session strategy
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  // Secure cookie configuration
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.callback-url"
        : "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Host-next-auth.csrf-token"
        : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  // Custom pages
  pages: {
    signIn: "/signin",
    error: "/signin",
    signOut: "/",
  },

  // Callbacks for JWT and session handling
  callbacks: {
    /**
     * JWT callback - called whenever JWT is created or updated
     * This is where we add custom fields to the token
     */
    async jwt({ token, user, account, trigger }): Promise<ExtendedJWT> {
      const extendedToken = token as ExtendedJWT;

      // Initial sign in
      if (user && account) {
        extendedToken.id = user.id;
        extendedToken.email = user.email || "";
        extendedToken.role = UserRole.USER;
        extendedToken.isActive = true;
        extendedToken.accessToken = account.access_token;
        extendedToken.refreshToken = account.refresh_token;
        extendedToken.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600 * 1000;

        // Log successful sign-in
        logAuthEvent({
          event: AuthEvent.SIGNIN_SUCCESS,
          userId: user.id,
          email: user.email || "",
          provider: account.provider,
          timestamp: new Date(),
          success: true,
        });

        // TODO: Create/update user in database
        // const dbUser = await createOrUpdateUser({
        //   id: user.id,
        //   email: user.email,
        //   name: user.name,
        //   image: user.image,
        //   provider: account.provider,
        //   providerAccountId: account.providerAccountId,
        // });
      }

      // Token refresh logic
      if (extendedToken.accessTokenExpires && Date.now() < extendedToken.accessTokenExpires) {
        return extendedToken;
      }

      // TODO: Implement token refresh
      // return refreshAccessToken(extendedToken);
      return extendedToken;
    },

    /**
     * Session callback - called whenever session is checked
     * This is where we add custom fields to the session
     */
    async session({ session, token }): Promise<ExtendedSession> {
      const extendedToken = token as ExtendedJWT;
      const extendedSession = session as ExtendedSession;

      if (extendedSession.user && extendedToken) {
        extendedSession.user.id = extendedToken.id || "";
        extendedSession.user.email = extendedToken.email || "";
        extendedSession.user.role = extendedToken.role;
        extendedSession.user.isActive = extendedToken.isActive;
        extendedSession.accessToken = extendedToken.accessToken;
        extendedSession.error = extendedToken.error;
      }

      // TODO: Verify user is still active in database
      // const dbUser = await getUserById(extendedSession.user.id);
      // if (!dbUser || !dbUser.isActive) {
      //   extendedSession.error = "UserInactive";
      //   extendedSession.user.isActive = false;
      // }

      return extendedSession;
    },

    /**
     * Sign-in callback - control if user is allowed to sign in
     */
    async signIn({ user, account, profile }) {
      try {
        // Get identifier for rate limiting
        const identifier = user.email || "unknown";

        // Check rate limit
        const rateLimitCheck = checkRateLimit(identifier);
        if (!rateLimitCheck.allowed) {
          logAuthEvent({
            event: AuthEvent.RATE_LIMIT_EXCEEDED,
            email: identifier,
            timestamp: new Date(),
            success: false,
            error: `Rate limit exceeded. Try again after ${new Date(rateLimitCheck.resetTime || 0).toISOString()}`,
          });
          return false;
        }

        // Validate email exists
        if (!user.email) {
          logAuthEvent({
            event: AuthEvent.SIGNIN_FAILURE,
            timestamp: new Date(),
            success: false,
            error: "No email provided",
          });
          return false;
        }

        // TODO: Check if user is allowed to sign in (e.g., not banned)
        // const dbUser = await getUserByEmail(user.email);
        // if (dbUser && !dbUser.isActive) {
        //   return false;
        // }

        return true;
      } catch (error) {
        console.error("Sign-in error:", error);
        logAuthEvent({
          event: AuthEvent.SIGNIN_FAILURE,
          email: user.email || "unknown",
          timestamp: new Date(),
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        return false;
      }
    },

    /**
     * Redirect callback - control where user is redirected after sign-in
     */
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  // Event handlers
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      logAuthEvent({
        event: AuthEvent.SIGNIN_SUCCESS,
        userId: user.id,
        email: user.email || "",
        provider: account?.provider,
        timestamp: new Date(),
        success: true,
        metadata: { isNewUser },
      });
    },
    async signOut({ token }) {
      const extendedToken = token as ExtendedJWT;
      logAuthEvent({
        event: AuthEvent.SIGNOUT,
        userId: extendedToken?.id,
        email: extendedToken?.email,
        timestamp: new Date(),
        success: true,
      });
    },
    async session({ session, token }) {
      // Session checked event (can be used for analytics)
      // Don't log every session check to avoid spam
    },
  },

  // Enable debug in development
  debug: process.env.NODE_ENV === "development",

  // Secret for JWT encryption
  secret: process.env.NEXTAUTH_SECRET,
};
