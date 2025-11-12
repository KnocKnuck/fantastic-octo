/**
 * Authorization & BOLA Prevention
 *
 * Implements authorization checks to prevent Broken Object Level Authorization (BOLA)
 * attacks. BOLA occurs when users can access resources they don't own by manipulating
 * resource IDs in API requests.
 *
 * THREAT-004: BOLA Prevention (Risk: 15/15 - Critical)
 *
 * All API endpoints that access resources MUST verify:
 * 1. User is authenticated (session exists)
 * 2. User has permission to access the specific resource
 * 3. User has the required role for the operation
 *
 * Usage:
 * ```typescript
 * import { authorizeResourceAccess } from '@/lib/security/authorization';
 * import { requireAuth } from '@/lib/auth';
 *
 * export async function DELETE(
 *   req: Request,
 *   { params }: { params: { id: string } }
 * ) {
 *   const session = await requireAuth();
 *
 *   // Fetch resource from database
 *   const task = await prisma.task.findUnique({ where: { id: params.id } });
 *   if (!task) {
 *     return Response.json({ error: 'Task not found' }, { status: 404 });
 *   }
 *
 *   // Verify user owns this resource
 *   const authResult = authorizeResourceAccess(session, task, 'userId');
 *   if (!authResult.authorized) {
 *     return Response.json({ error: authResult.error }, { status: 403 });
 *   }
 *
 *   // Delete task
 *   await prisma.task.delete({ where: { id: params.id } });
 *   return Response.json({ success: true });
 * }
 * ```
 */

import { ExtendedSession, UserRole } from "@/types/auth";

// ============================================================================
// Types
// ============================================================================

/**
 * Authorization error types
 */
export enum AuthorizationError {
  NOT_AUTHENTICATED = "NOT_AUTHENTICATED",
  FORBIDDEN = "FORBIDDEN",
  INSUFFICIENT_ROLE = "INSUFFICIENT_ROLE",
  WORKSPACE_ACCESS_DENIED = "WORKSPACE_ACCESS_DENIED",
  RESOURCE_ACCESS_DENIED = "RESOURCE_ACCESS_DENIED",
  INVALID_SESSION = "INVALID_SESSION",
}

/**
 * Authorization result
 */
export interface AuthorizationResult {
  authorized: boolean;
  error?: string;
  errorCode?: AuthorizationError;
}

/**
 * Resource with ownership information
 */
export interface OwnedResource {
  userId: string;
  [key: string]: any;
}

/**
 * Resource with workspace information
 */
export interface WorkspaceResource {
  workspaceId: string;
  [key: string]: any;
}

/**
 * Workspace membership
 */
export interface WorkspaceMembership {
  userId: string;
  workspaceId: string;
  role?: string;
  [key: string]: any;
}

// ============================================================================
// Core Authorization Functions
// ============================================================================

/**
 * Verify user owns a resource
 *
 * Prevents BOLA attacks by ensuring users can only access their own resources.
 * Use this for resources that belong to a single user (tasks, preferences, etc.).
 *
 * @param session - Current user session
 * @param resource - Resource to check (must have userId field)
 * @param ownerField - Field name containing owner ID (defaults to 'userId')
 * @returns Authorization result
 *
 * @example
 * ```typescript
 * const session = await requireAuth();
 * const task = await prisma.task.findUnique({ where: { id: taskId } });
 *
 * const authResult = authorizeResourceAccess(session, task);
 * if (!authResult.authorized) {
 *   return Response.json({ error: authResult.error }, { status: 403 });
 * }
 * ```
 */
export function authorizeResourceAccess<T extends Record<string, any>>(
  session: ExtendedSession | null,
  resource: T | null,
  ownerField: keyof T = "userId" as keyof T,
): AuthorizationResult {
  // Check session exists
  if (!session?.user?.id) {
    return {
      authorized: false,
      error: "Authentication required",
      errorCode: AuthorizationError.NOT_AUTHENTICATED,
    };
  }

  // Check resource exists
  if (!resource) {
    return {
      authorized: false,
      error: "Resource not found",
      errorCode: AuthorizationError.RESOURCE_ACCESS_DENIED,
    };
  }

  // Check user owns resource
  const ownerId = resource[ownerField];
  if (ownerId !== session.user.id) {
    return {
      authorized: false,
      error: "You do not have permission to access this resource",
      errorCode: AuthorizationError.RESOURCE_ACCESS_DENIED,
    };
  }

  return {
    authorized: true,
  };
}

/**
 * Verify user has access to a workspace
 *
 * Prevents BOLA attacks in multi-tenant scenarios. Checks if user is a member
 * of the workspace before allowing access to workspace resources.
 *
 * @param session - Current user session
 * @param workspaceId - Workspace ID to check
 * @param memberships - Array of user's workspace memberships
 * @param requiredRole - Optional: Required role in workspace
 * @returns Authorization result
 *
 * @example
 * ```typescript
 * const session = await requireAuth();
 *
 * // Fetch user's workspace memberships
 * const memberships = await prisma.workspaceMember.findMany({
 *   where: { userId: session.user.id },
 * });
 *
 * const authResult = authorizeWorkspaceAccess(
 *   session,
 *   params.workspaceId,
 *   memberships
 * );
 *
 * if (!authResult.authorized) {
 *   return Response.json({ error: authResult.error }, { status: 403 });
 * }
 * ```
 */
export function authorizeWorkspaceAccess(
  session: ExtendedSession | null,
  workspaceId: string,
  memberships: WorkspaceMembership[],
  requiredRole?: "ADMIN" | "MEMBER",
): AuthorizationResult {
  // Check session exists
  if (!session?.user?.id) {
    return {
      authorized: false,
      error: "Authentication required",
      errorCode: AuthorizationError.NOT_AUTHENTICATED,
    };
  }

  // Check workspace ID provided
  if (!workspaceId) {
    return {
      authorized: false,
      error: "Workspace ID required",
      errorCode: AuthorizationError.WORKSPACE_ACCESS_DENIED,
    };
  }

  // Find membership in workspace
  const membership = memberships.find((m) => m.workspaceId === workspaceId);

  if (!membership) {
    return {
      authorized: false,
      error: "You do not have access to this workspace",
      errorCode: AuthorizationError.WORKSPACE_ACCESS_DENIED,
    };
  }

  // Check role if required
  if (
    requiredRole &&
    membership.role !== requiredRole &&
    membership.role !== "ADMIN"
  ) {
    return {
      authorized: false,
      error: `Workspace ${requiredRole} role required`,
      errorCode: AuthorizationError.INSUFFICIENT_ROLE,
    };
  }

  return {
    authorized: true,
  };
}

/**
 * Verify user has required role
 *
 * Checks if user has a specific application-level role (USER, PREMIUM, ADMIN).
 * Use this for operations that require elevated privileges.
 *
 * @param session - Current user session
 * @param requiredRole - Required user role
 * @returns Authorization result
 *
 * @example
 * ```typescript
 * const session = await requireAuth();
 *
 * const authResult = requireRole(session, UserRole.ADMIN);
 * if (!authResult.authorized) {
 *   return Response.json({ error: authResult.error }, { status: 403 });
 * }
 *
 * // User is admin, proceed with operation
 * ```
 */
export function requireRole(
  session: ExtendedSession | null,
  requiredRole: UserRole,
): AuthorizationResult {
  // Check session exists
  if (!session?.user) {
    return {
      authorized: false,
      error: "Authentication required",
      errorCode: AuthorizationError.NOT_AUTHENTICATED,
    };
  }

  // Check session is active
  if (!session.user.isActive) {
    return {
      authorized: false,
      error: "User account is inactive",
      errorCode: AuthorizationError.INVALID_SESSION,
    };
  }

  // Check user has required role
  if (session.user.role !== requiredRole) {
    return {
      authorized: false,
      error: `${requiredRole} role required`,
      errorCode: AuthorizationError.INSUFFICIENT_ROLE,
    };
  }

  return {
    authorized: true,
  };
}

/**
 * Verify user has one of the required roles
 *
 * Checks if user has any of the specified roles. Useful for operations
 * that can be performed by multiple role levels.
 *
 * @param session - Current user session
 * @param requiredRoles - Array of acceptable roles
 * @returns Authorization result
 *
 * @example
 * ```typescript
 * const session = await requireAuth();
 *
 * const authResult = requireAnyRole(session, [UserRole.ADMIN, UserRole.PREMIUM]);
 * if (!authResult.authorized) {
 *   return Response.json({ error: authResult.error }, { status: 403 });
 * }
 * ```
 */
export function requireAnyRole(
  session: ExtendedSession | null,
  requiredRoles: UserRole[],
): AuthorizationResult {
  // Check session exists
  if (!session?.user) {
    return {
      authorized: false,
      error: "Authentication required",
      errorCode: AuthorizationError.NOT_AUTHENTICATED,
    };
  }

  // Check session is active
  if (!session.user.isActive) {
    return {
      authorized: false,
      error: "User account is inactive",
      errorCode: AuthorizationError.INVALID_SESSION,
    };
  }

  // Check user has one of the required roles
  if (!requiredRoles.includes(session.user.role as UserRole)) {
    return {
      authorized: false,
      error: `One of these roles required: ${requiredRoles.join(", ")}`,
      errorCode: AuthorizationError.INSUFFICIENT_ROLE,
    };
  }

  return {
    authorized: true,
  };
}

// ============================================================================
// Convenience Helpers
// ============================================================================

/**
 * Verify user can modify a resource
 *
 * Combines ownership check with role check. Admins can modify any resource,
 * regular users can only modify their own resources.
 *
 * @param session - Current user session
 * @param resource - Resource to check
 * @param ownerField - Field name containing owner ID
 * @returns Authorization result
 *
 * @example
 * ```typescript
 * const session = await requireAuth();
 * const task = await prisma.task.findUnique({ where: { id: taskId } });
 *
 * const authResult = authorizeModifyResource(session, task);
 * if (!authResult.authorized) {
 *   return Response.json({ error: authResult.error }, { status: 403 });
 * }
 * ```
 */
export function authorizeModifyResource<T extends Record<string, any>>(
  session: ExtendedSession | null,
  resource: T | null,
  ownerField: keyof T = "userId" as keyof T,
): AuthorizationResult {
  // Check session exists
  if (!session?.user?.id) {
    return {
      authorized: false,
      error: "Authentication required",
      errorCode: AuthorizationError.NOT_AUTHENTICATED,
    };
  }

  // Admins can modify anything
  if (session.user.role === UserRole.ADMIN) {
    return {
      authorized: true,
    };
  }

  // Regular users must own the resource
  return authorizeResourceAccess(session, resource, ownerField);
}

/**
 * Verify user can delete a resource
 *
 * Stricter than modify - only resource owner or admins can delete.
 *
 * @param session - Current user session
 * @param resource - Resource to check
 * @param ownerField - Field name containing owner ID
 * @returns Authorization result
 *
 * @example
 * ```typescript
 * const session = await requireAuth();
 * const workspace = await prisma.workspace.findUnique({
 *   where: { id: workspaceId },
 * });
 *
 * const authResult = authorizeDeleteResource(session, workspace, 'ownerId');
 * if (!authResult.authorized) {
 *   return Response.json({ error: authResult.error }, { status: 403 });
 * }
 * ```
 */
export function authorizeDeleteResource<T extends Record<string, any>>(
  session: ExtendedSession | null,
  resource: T | null,
  ownerField: keyof T = "userId" as keyof T,
): AuthorizationResult {
  // Same as modify for now, but can be made stricter in future
  return authorizeModifyResource(session, resource, ownerField);
}

// ============================================================================
// Error Response Helpers
// ============================================================================

/**
 * Create standard authorization error response
 *
 * @param result - Authorization result
 * @returns Response object
 *
 * @example
 * ```typescript
 * const authResult = authorizeResourceAccess(session, task);
 * if (!authResult.authorized) {
 *   return createAuthErrorResponse(authResult);
 * }
 * ```
 */
export function createAuthErrorResponse(result: AuthorizationResult): Response {
  const statusCode =
    result.errorCode === AuthorizationError.NOT_AUTHENTICATED ? 401 : 403;

  return Response.json(
    {
      error: result.error,
      code: result.errorCode,
    },
    { status: statusCode },
  );
}

/**
 * Type guard to check if authorization failed
 */
export function isAuthorizationError(
  result: AuthorizationResult,
): result is Required<AuthorizationResult> & { authorized: false } {
  return !result.authorized;
}

// ============================================================================
// Batch Authorization
// ============================================================================

/**
 * Verify user owns multiple resources
 *
 * Efficiently checks ownership of multiple resources at once.
 * Use for bulk operations.
 *
 * @param session - Current user session
 * @param resources - Array of resources to check
 * @param ownerField - Field name containing owner ID
 * @returns Object with authorized flag and list of unauthorized IDs
 *
 * @example
 * ```typescript
 * const session = await requireAuth();
 * const tasks = await prisma.task.findMany({
 *   where: { id: { in: taskIds } },
 * });
 *
 * const authResult = authorizeMultipleResources(session, tasks);
 * if (!authResult.authorized) {
 *   return Response.json({
 *     error: 'Some resources are not accessible',
 *     unauthorizedIds: authResult.unauthorizedIds,
 *   }, { status: 403 });
 * }
 * ```
 */
export function authorizeMultipleResources<T extends Record<string, any>>(
  session: ExtendedSession | null,
  resources: T[],
  ownerField: keyof T = "userId" as keyof T,
): AuthorizationResult & { unauthorizedIds?: string[] } {
  // Check session exists
  if (!session?.user?.id) {
    return {
      authorized: false,
      error: "Authentication required",
      errorCode: AuthorizationError.NOT_AUTHENTICATED,
    };
  }

  // Find resources not owned by user
  const unauthorizedIds = resources
    .filter((resource) => resource[ownerField] !== session.user.id)
    .map((resource) => resource.id as string)
    .filter(Boolean);

  if (unauthorizedIds.length > 0) {
    return {
      authorized: false,
      error: "Some resources are not accessible",
      errorCode: AuthorizationError.RESOURCE_ACCESS_DENIED,
      unauthorizedIds,
    };
  }

  return {
    authorized: true,
  };
}

// ============================================================================
// Usage Examples & Best Practices
// ============================================================================

/**
 * BEST PRACTICES:
 *
 * 1. Always check authorization AFTER fetching the resource from database
 *    ❌ Bad: Assume user owns resource based on URL parameter
 *    ✅ Good: Fetch resource, verify ownership, then proceed
 *
 * 2. Use the most specific authorization check for your use case
 *    - User-owned resources: authorizeResourceAccess()
 *    - Workspace resources: authorizeWorkspaceAccess()
 *    - Admin operations: requireRole(UserRole.ADMIN)
 *    - Bulk operations: authorizeMultipleResources()
 *
 * 3. Return appropriate HTTP status codes
 *    - 401 Unauthorized: Not authenticated (no valid session)
 *    - 403 Forbidden: Authenticated but insufficient permissions
 *    - 404 Not Found: Resource doesn't exist OR user can't access it
 *      (prevents leaking resource existence)
 *
 * 4. For sensitive operations, consider returning 404 instead of 403
 *    to avoid leaking information about resource existence
 *
 * 5. Always authorize at the API route level, never trust client-side checks
 *
 * EXAMPLE: Complete API route with authorization
 *
 * ```typescript
 * import { requireAuth } from '@/lib/auth';
 * import { authorizeResourceAccess, createAuthErrorResponse } from '@/lib/security/authorization';
 * import { prisma } from '@/lib/prisma';
 *
 * export async function DELETE(
 *   req: Request,
 *   { params }: { params: { id: string } }
 * ) {
 *   try {
 *     // 1. Require authentication
 *     const session = await requireAuth();
 *
 *     // 2. Fetch resource
 *     const task = await prisma.task.findUnique({
 *       where: { id: params.id },
 *     });
 *
 *     // 3. Check resource exists (return 404 to prevent resource existence leaking)
 *     if (!task) {
 *       return Response.json({ error: 'Task not found' }, { status: 404 });
 *     }
 *
 *     // 4. Authorize access
 *     const authResult = authorizeResourceAccess(session, task);
 *     if (!authResult.authorized) {
 *       // Return 404 instead of 403 to prevent leaking resource existence
 *       return Response.json({ error: 'Task not found' }, { status: 404 });
 *     }
 *
 *     // 5. Perform operation
 *     await prisma.task.delete({ where: { id: params.id } });
 *
 *     return Response.json({ success: true });
 *   } catch (error) {
 *     console.error('Delete task error:', error);
 *     return Response.json(
 *       { error: 'Internal server error' },
 *       { status: 500 }
 *     );
 *   }
 * }
 * ```
 */
