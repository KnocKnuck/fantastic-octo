/**
 * Workspace Context Utilities
 *
 * Provides workspace context for multi-tenancy support.
 * Every user belongs to a workspace (personal or team), and all data is scoped to workspaces.
 *
 * Features:
 * - Workspace context extraction from requests
 * - Row-level security helpers for database queries
 * - Workspace validation and access control
 * - Performance optimized (< 50ms overhead)
 *
 * Security:
 * - All queries MUST include workspaceId to prevent data leaks
 * - Enforces workspace isolation at the query level
 * - Prevents N+1 query problems with proper indexing
 *
 * @example
 * ```typescript
 * // Get workspace context from session
 * const workspace = await getWorkspaceFromSession(session);
 *
 * // Use in queries
 * const tasks = await prisma.task.findMany({
 *   where: withWorkspaceId(workspaceId, { status: 'active' })
 * });
 * ```
 */

import { Session } from 'next-auth';
import { prisma } from '@/lib/infrastructure/database';
import { cache } from 'react';

export interface WorkspaceContext {
  id: string;
  name: string;
  slug: string;
  type: 'PERSONAL' | 'TEAM' | 'ENTERPRISE';
  plan: string;
  userId: string; // Current user ID in this workspace
}

/**
 * Get workspace context from NextAuth session
 *
 * This is the primary way to get workspace context in API routes and server components.
 * Results are cached per request to avoid repeated database queries.
 *
 * @param session NextAuth session object
 * @returns Workspace context or null if not found
 *
 * @example
 * ```typescript
 * import { getServerSession } from 'next-auth';
 * import { authOptions } from '@/lib/auth-options';
 *
 * const session = await getServerSession(authOptions);
 * const workspace = await getWorkspaceFromSession(session);
 * ```
 */
export const getWorkspaceFromSession = cache(
  async (session: Session | null): Promise<WorkspaceContext | null> => {
    if (!session?.user?.email) {
      return null;
    }

    try {
      // Find user with workspace
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          workspaceId: true,
          workspace: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              plan: true,
            },
          },
        },
      });

      if (!user || !user.workspace) {
        return null;
      }

      return {
        id: user.workspace.id,
        name: user.workspace.name,
        slug: user.workspace.slug,
        type: user.workspace.type,
        plan: user.workspace.plan,
        userId: user.id,
      };
    } catch (error) {
      console.error('[Workspace Context] Error fetching workspace:', error);
      return null;
    }
  }
);

/**
 * Get workspace by ID with authorization check
 *
 * Verifies that the user has access to the requested workspace.
 *
 * @param workspaceId Workspace ID to fetch
 * @param userId User ID requesting access
 * @returns Workspace or null if not found/unauthorized
 */
export async function getWorkspaceById(
  workspaceId: string,
  userId: string
): Promise<WorkspaceContext | null> {
  try {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        users: {
          some: {
            id: userId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        plan: true,
      },
    });

    if (!workspace) {
      return null;
    }

    return {
      ...workspace,
      userId,
    };
  } catch (error) {
    console.error('[Workspace Context] Error fetching workspace by ID:', error);
    return null;
  }
}

/**
 * Add workspaceId to database query filters (Row-Level Security)
 *
 * This helper ensures all queries are scoped to the current workspace.
 * Use this for ALL database queries to prevent data leaks between workspaces.
 *
 * @param workspaceId Current workspace ID
 * @param additionalFilters Additional Prisma where filters
 * @returns Combined where clause with workspaceId
 *
 * @example
 * ```typescript
 * // Find active tasks in current workspace
 * const tasks = await prisma.task.findMany({
 *   where: withWorkspaceId(workspaceId, {
 *     status: 'active',
 *     userId: currentUserId
 *   })
 * });
 *
 * // Update task in workspace
 * await prisma.task.update({
 *   where: { id: taskId },
 *   data: { title: 'New title' }
 * });
 * // ❌ BAD: No workspace check!
 *
 * await prisma.task.updateMany({
 *   where: withWorkspaceId(workspaceId, { id: taskId }),
 *   data: { title: 'New title' }
 * });
 * // ✅ GOOD: Ensures task belongs to workspace
 * ```
 */
export function withWorkspaceId<T extends Record<string, any>>(
  workspaceId: string,
  additionalFilters?: T
): T & { workspaceId: string } {
  return {
    workspaceId,
    ...additionalFilters,
  } as T & { workspaceId: string };
}

/**
 * Verify user has access to workspace
 *
 * @param userId User ID
 * @param workspaceId Workspace ID
 * @returns true if user has access, false otherwise
 */
export async function verifyWorkspaceAccess(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        workspaceId: workspaceId,
      },
      select: { id: true },
    });

    return !!user;
  } catch (error) {
    console.error('[Workspace Context] Error verifying workspace access:', error);
    return false;
  }
}

/**
 * Create personal workspace for new user
 *
 * Called during user registration to set up a personal workspace.
 *
 * @param userId User ID
 * @param userName User name (for workspace name)
 * @param userEmail User email (for generating slug)
 * @returns Created workspace
 */
export async function createPersonalWorkspace(
  userId: string,
  userName: string | null,
  userEmail: string
): Promise<WorkspaceContext> {
  try {
    // Generate unique slug from email
    const baseSlug = userEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique
    while (await prisma.workspace.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create workspace
    const workspace = await prisma.workspace.create({
      data: {
        name: `${userName || 'My'} Workspace`,
        slug,
        type: 'PERSONAL',
        plan: 'free',
        users: {
          connect: { id: userId },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        plan: true,
      },
    });

    return {
      ...workspace,
      userId,
    };
  } catch (error) {
    console.error('[Workspace Context] Error creating personal workspace:', error);
    throw new Error('Failed to create personal workspace');
  }
}

/**
 * Switch user to different workspace
 *
 * Updates user's active workspace. Used for team members switching between workspaces.
 *
 * @param userId User ID
 * @param newWorkspaceId Target workspace ID
 * @returns true if successful, false if unauthorized or error
 */
export async function switchWorkspace(
  userId: string,
  newWorkspaceId: string
): Promise<boolean> {
  try {
    // Verify access to target workspace
    const hasAccess = await verifyWorkspaceAccess(userId, newWorkspaceId);
    if (!hasAccess) {
      console.warn(`[Workspace Context] User ${userId} denied access to workspace ${newWorkspaceId}`);
      return false;
    }

    // Update user's workspace
    await prisma.user.update({
      where: { id: userId },
      data: { workspaceId: newWorkspaceId },
    });

    return true;
  } catch (error) {
    console.error('[Workspace Context] Error switching workspace:', error);
    return false;
  }
}

/**
 * Get all workspaces for a user
 *
 * Returns list of workspaces the user has access to.
 * Used for workspace switcher UI.
 *
 * @param userId User ID
 * @returns Array of workspaces
 */
export async function getUserWorkspaces(userId: string): Promise<WorkspaceContext[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            plan: true,
          },
        },
      },
    });

    if (!user || !user.workspace) {
      return [];
    }

    // For now, users only have one workspace
    // In future sprints (team features), this will return multiple workspaces
    return [
      {
        ...user.workspace,
        userId: user.id,
      },
    ];
  } catch (error) {
    console.error('[Workspace Context] Error fetching user workspaces:', error);
    return [];
  }
}

/**
 * Workspace-scoped database client wrapper
 *
 * Provides a Prisma client with automatic workspace filtering.
 * Use this in API routes to ensure all queries are workspace-scoped.
 *
 * @example
 * ```typescript
 * const db = createWorkspaceClient(workspaceId);
 *
 * // All queries automatically include workspaceId
 * const tasks = await db.task.findMany({
 *   where: { status: 'active' } // workspaceId added automatically
 * });
 * ```
 */
export function createWorkspaceClient(workspaceId: string) {
  // Note: This is a simplified version
  // For production, consider using Prisma middleware or extensions
  return {
    task: {
      findMany: (args: any) =>
        prisma.task.findMany({
          ...args,
          where: withWorkspaceId(workspaceId, args?.where),
        }),
      findFirst: (args: any) =>
        prisma.task.findFirst({
          ...args,
          where: withWorkspaceId(workspaceId, args?.where),
        }),
      findUnique: (args: any) =>
        prisma.task.findFirst({
          where: withWorkspaceId(workspaceId, { id: args.where.id }),
        }),
      create: (args: any) =>
        prisma.task.create({
          ...args,
          data: { ...args.data, workspaceId },
        }),
      update: (args: any) =>
        prisma.task.updateMany({
          where: withWorkspaceId(workspaceId, { id: args.where.id }),
          data: args.data,
        }),
      delete: (args: any) =>
        prisma.task.deleteMany({
          where: withWorkspaceId(workspaceId, { id: args.where.id }),
        }),
    },
    calendar: {
      findMany: (args: any) =>
        prisma.calendar.findMany({
          ...args,
          where: withWorkspaceId(workspaceId, args?.where),
        }),
      findFirst: (args: any) =>
        prisma.calendar.findFirst({
          ...args,
          where: withWorkspaceId(workspaceId, args?.where),
        }),
      create: (args: any) =>
        prisma.calendar.create({
          ...args,
          data: { ...args.data, workspaceId },
        }),
    },
    schedule: {
      findMany: (args: any) =>
        prisma.schedule.findMany({
          ...args,
          where: withWorkspaceId(workspaceId, args?.where),
        }),
      create: (args: any) =>
        prisma.schedule.create({
          ...args,
          data: { ...args.data, workspaceId },
        }),
    },
  };
}

/**
 * Performance monitoring for workspace queries
 *
 * Logs slow queries (>50ms) for optimization.
 */
export async function monitorWorkspaceQuery<T>(
  queryName: string,
  workspaceId: string,
  query: () => Promise<T>
): Promise<T> {
  const start = Date.now();

  try {
    const result = await query();
    const duration = Date.now() - start;

    if (duration > 50) {
      console.warn(
        `[Workspace Context] Slow query detected: ${queryName} (${duration}ms) for workspace ${workspaceId}`
      );
    }

    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(
      `[Workspace Context] Query failed: ${queryName} (${duration}ms) for workspace ${workspaceId}`,
      error
    );
    throw error;
  }
}

export default {
  getWorkspaceFromSession,
  getWorkspaceById,
  withWorkspaceId,
  verifyWorkspaceAccess,
  createPersonalWorkspace,
  switchWorkspace,
  getUserWorkspaces,
  createWorkspaceClient,
  monitorWorkspaceQuery,
};
