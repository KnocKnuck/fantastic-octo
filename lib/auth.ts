import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { ExtendedSession, UserRole } from "@/types/auth";

/**
 * Get the current session on the server side
 * This is a wrapper around NextAuth's getServerSession
 * Use this in Server Components, API routes, and Server Actions
 *
 * @returns The current session or null if not authenticated
 * @example
 * ```tsx
 * import { getCurrentSession } from "@/lib/auth";
 *
 * export default async function ProtectedPage() {
 *   const session = await getCurrentSession();
 *   if (!session) {
 *     redirect("/signin");
 *   }
 *   return <div>Welcome {session.user.email}</div>;
 * }
 * ```
 */
export async function getCurrentSession(): Promise<ExtendedSession | null> {
  const session = await getServerSession(authOptions);
  return session as ExtendedSession | null;
}

/**
 * Get the current user on the server side
 * Convenience wrapper that extracts just the user from the session
 *
 * @returns The current user or null if not authenticated
 * @example
 * ```tsx
 * import { getCurrentUser } from "@/lib/auth";
 *
 * export default async function ProfilePage() {
 *   const user = await getCurrentUser();
 *   if (!user) {
 *     redirect("/signin");
 *   }
 *   return <div>Email: {user.email}</div>;
 * }
 * ```
 */
export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

/**
 * Check if the current user is authenticated
 *
 * @returns true if authenticated, false otherwise
 * @example
 * ```tsx
 * import { isAuthenticated } from "@/lib/auth";
 *
 * export async function POST(request: Request) {
 *   if (!await isAuthenticated()) {
 *     return new Response("Unauthorized", { status: 401 });
 *   }
 *   // Handle request
 * }
 * ```
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return !!session?.user && !!session.user.isActive;
}

/**
 * Require authentication - throws error if not authenticated
 * Use this in API routes and Server Actions where you want to fail fast
 *
 * @throws Error if not authenticated
 * @returns The current session
 * @example
 * ```tsx
 * import { requireAuth } from "@/lib/auth";
 *
 * export async function POST(request: Request) {
 *   const session = await requireAuth();
 *   // Session is guaranteed to exist here
 *   const userId = session.user.id;
 * }
 * ```
 */
export async function requireAuth(): Promise<ExtendedSession> {
  const session = await getCurrentSession();

  if (!session?.user) {
    throw new Error("Unauthorized - No session found");
  }

  if (!session.user.isActive) {
    throw new Error("Unauthorized - User account is inactive");
  }

  if (session.error) {
    throw new Error(`Unauthorized - ${session.error}`);
  }

  return session;
}

/**
 * Check if the current user has a specific role
 *
 * @param role - The role to check
 * @returns true if user has the role, false otherwise
 * @example
 * ```tsx
 * import { hasRole } from "@/lib/auth";
 * import { UserRole } from "@/types/auth";
 *
 * export async function DELETE(request: Request) {
 *   if (!await hasRole(UserRole.ADMIN)) {
 *     return new Response("Forbidden", { status: 403 });
 *   }
 *   // Handle admin-only operation
 * }
 * ```
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const session = await getCurrentSession();
  return session?.user?.role === role;
}

/**
 * Require a specific role - throws error if user doesn't have the role
 *
 * @param role - The required role
 * @throws Error if user doesn't have the required role
 * @returns The current session
 * @example
 * ```tsx
 * import { requireRole } from "@/lib/auth";
 * import { UserRole } from "@/types/auth";
 *
 * export async function POST(request: Request) {
 *   const session = await requireRole(UserRole.ADMIN);
 *   // User is guaranteed to be admin here
 * }
 * ```
 */
export async function requireRole(role: UserRole): Promise<ExtendedSession> {
  const session = await requireAuth();

  if (session.user.role !== role) {
    throw new Error(`Forbidden - Required role: ${role}`);
  }

  return session;
}

/**
 * Check if the current user has any of the specified roles
 *
 * @param roles - Array of roles to check
 * @returns true if user has any of the roles, false otherwise
 * @example
 * ```tsx
 * import { hasAnyRole } from "@/lib/auth";
 * import { UserRole } from "@/types/auth";
 *
 * export async function GET(request: Request) {
 *   if (!await hasAnyRole([UserRole.ADMIN, UserRole.PREMIUM])) {
 *     return new Response("Forbidden", { status: 403 });
 *   }
 *   // Handle request
 * }
 * ```
 */
export async function hasAnyRole(roles: UserRole[]): Promise<boolean> {
  const session = await getCurrentSession();
  return roles.includes(session?.user?.role as UserRole);
}

/**
 * Get the user's access token for API calls
 *
 * @returns The access token or null if not available
 * @example
 * ```tsx
 * import { getAccessToken } from "@/lib/auth";
 *
 * export async function GET() {
 *   const accessToken = await getAccessToken();
 *   if (!accessToken) {
 *     return new Response("No access token", { status: 401 });
 *   }
 *   // Use token to call Google Calendar API
 * }
 * ```
 */
export async function getAccessToken(): Promise<string | null> {
  const session = await getCurrentSession();
  return session?.accessToken ?? null;
}

/**
 * Validate that a session exists and is active
 * Returns structured result instead of throwing
 *
 * @returns Object with valid flag and session or error
 * @example
 * ```tsx
 * import { validateSession } from "@/lib/auth";
 *
 * export async function POST(request: Request) {
 *   const { valid, session, error } = await validateSession();
 *   if (!valid) {
 *     return Response.json({ error }, { status: 401 });
 *   }
 *   // Use session
 * }
 * ```
 */
export async function validateSession(): Promise<{
  valid: boolean;
  session?: ExtendedSession;
  error?: string;
}> {
  try {
    const session = await getCurrentSession();

    if (!session?.user) {
      return { valid: false, error: "No session found" };
    }

    if (!session.user.isActive) {
      return { valid: false, error: "User account is inactive" };
    }

    if (session.error) {
      return { valid: false, error: session.error };
    }

    return { valid: true, session };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
