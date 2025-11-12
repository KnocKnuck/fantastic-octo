/**
 * User Profile API Endpoint
 *
 * Endpoints:
 * - GET /api/v1/user/profile - Get user profile with preferences
 * - PATCH /api/v1/user/profile - Update user profile and preferences
 *
 * Features:
 * - User can only access/modify their own profile
 * - Validates all inputs with Zod schemas
 * - Returns complete user profile including workspace info
 * - Logs profile updates in audit log
 *
 * Security:
 * - Requires authentication
 * - Authorization: User can only modify their own profile
 * - Input validation with Zod
 * - Rate limiting applied
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/infrastructure/database";
import {
  UpdateUserProfileAndPreferencesSchema,
  validateRequest,
  validationError,
} from "@/lib/security/validation";
import { authorizeResourceAccess } from "@/lib/security/authorization";

// ============================================================================
// GET /api/v1/user/profile - Get user profile
// ============================================================================

/**
 * Get user profile with preferences
 *
 * Returns:
 * - User info (name, email, avatar)
 * - Workspace info
 * - User preferences (timezone, work hours, work days)
 * - Connected accounts (Google Calendar, etc.)
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/v1/user/profile', {
 *   headers: { 'Authorization': 'Bearer ...' }
 * });
 * const data = await response.json();
 * ```
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Require authentication
    const session = await requireAuth();

    // 2. Fetch user profile with related data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        timezone: true,
        workHoursStart: true,
        workHoursEnd: true,
        workDays: true,
        breakDuration: true,
        workspaceId: true,
        createdAt: true,
        updatedAt: true,
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            plan: true,
          },
        },
        accounts: {
          select: {
            id: true,
            provider: true,
            providerAccountId: true,
            // Don't return tokens for security
          },
        },
      },
    });

    // 3. Check user exists
    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
          code: "USER_NOT_FOUND",
        },
        { status: 404 },
      );
    }

    // 4. Return profile data
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      preferences: {
        timezone: user.timezone,
        workHoursStart: user.workHoursStart,
        workHoursEnd: user.workHoursEnd,
        workDays: user.workDays,
        breakDuration: user.breakDuration,
      },
      workspace: user.workspace,
      connectedAccounts: user.accounts.map((account) => ({
        id: account.id,
        provider: account.provider,
        accountId: account.providerAccountId,
      })),
    });
  } catch (error) {
    console.error("Get profile error:", error);

    // Handle auth errors
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        {
          error: error.message,
          code: "UNAUTHORIZED",
        },
        { status: 401 },
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: "Failed to fetch profile",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}

// ============================================================================
// PATCH /api/v1/user/profile - Update user profile
// ============================================================================

/**
 * Update user profile and preferences
 *
 * Allowed updates:
 * - name: User's display name
 * - timezone: User's timezone (e.g., "America/New_York")
 * - workHoursStart: Work hours start (0-23)
 * - workHoursEnd: Work hours end (0-23)
 * - workDays: Array of work days (e.g., ["Mon", "Tue", "Wed", "Thu", "Fri"])
 * - breakDuration: Break duration in minutes
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/v1/user/profile', {
 *   method: 'PATCH',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'Authorization': 'Bearer ...'
 *   },
 *   body: JSON.stringify({
 *     name: 'John Doe',
 *     timezone: 'America/New_York',
 *     workHoursStart: 9,
 *     workHoursEnd: 17,
 *     workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
 *     breakDuration: 15
 *   })
 * });
 * ```
 */
export async function PATCH(req: NextRequest) {
  try {
    // 1. Require authentication
    const session = await requireAuth();

    // 2. Validate request body
    const validation = await validateRequest(
      req,
      UpdateUserProfileAndPreferencesSchema,
    );

    if (!validation.success) {
      return NextResponse.json(validation.error, { status: 400 });
    }

    const data = validation.data;

    // 3. Fetch current user to verify they exist
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, workspaceId: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          error: "User not found",
          code: "USER_NOT_FOUND",
        },
        { status: 404 },
      );
    }

    // 4. Authorization check (user can only update their own profile)
    const authResult = authorizeResourceAccess(session, existingUser, "id");
    if (!authResult.authorized) {
      return NextResponse.json(
        {
          error: authResult.error,
          code: authResult.errorCode,
        },
        { status: 403 },
      );
    }

    // 5. Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.timezone && { timezone: data.timezone }),
        ...(data.workHoursStart !== undefined && {
          workHoursStart: data.workHoursStart,
        }),
        ...(data.workHoursEnd !== undefined && {
          workHoursEnd: data.workHoursEnd,
        }),
        ...(data.workDays && { workDays: data.workDays }),
        ...(data.breakDuration !== undefined && {
          breakDuration: data.breakDuration,
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        timezone: true,
        workHoursStart: true,
        workHoursEnd: true,
        workDays: true,
        breakDuration: true,
        updatedAt: true,
      },
    });

    // 6. Log the update in audit log
    await prisma.auditLog.create({
      data: {
        workspaceId: existingUser.workspaceId,
        userId: session.user.id,
        action: "user.profile.updated",
        resource: "User",
        resourceId: session.user.id,
        changes: {
          updated: data,
        },
        ipAddress:
          req.headers.get("x-forwarded-for") ||
          req.headers.get("x-real-ip") ||
          "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
      },
    });

    // 7. Return updated profile
    return NextResponse.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        updatedAt: updatedUser.updatedAt,
      },
      preferences: {
        timezone: updatedUser.timezone,
        workHoursStart: updatedUser.workHoursStart,
        workHoursEnd: updatedUser.workHoursEnd,
        workDays: updatedUser.workDays,
        breakDuration: updatedUser.breakDuration,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    // Handle auth errors
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        {
          error: error.message,
          code: "UNAUTHORIZED",
        },
        { status: 401 },
      );
    }

    // Handle validation errors
    if (error instanceof Error && error.message.includes("Validation")) {
      return NextResponse.json(
        {
          error: error.message,
          code: "VALIDATION_ERROR",
        },
        { status: 400 },
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: "Failed to update profile",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}
