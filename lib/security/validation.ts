/**
 * Input Validation Schemas
 *
 * Centralized Zod schemas for validating user inputs across the application.
 * All API routes should use these schemas to prevent injection attacks and
 * ensure data integrity.
 *
 * Usage:
 * ```typescript
 * import { CreateTaskSchema } from '@/lib/security/validation';
 *
 * const result = CreateTaskSchema.safeParse(data);
 * if (!result.success) {
 *   return Response.json({ error: result.error }, { status: 400 });
 * }
 * ```
 */

import { z } from "zod";

// ============================================================================
// Common Validators
// ============================================================================

/**
 * Validates a non-empty string with min/max length
 */
export const NonEmptyString = (min = 1, max = 255) =>
  z
    .string()
    .trim()
    .min(min, `Must be at least ${min} characters`)
    .max(max, `Must be at most ${max} characters`);

/**
 * Validates an email address
 */
export const Email = z.string().email("Invalid email address").toLowerCase();

/**
 * Validates a URL
 */
export const Url = z.string().url("Invalid URL");

/**
 * Validates a date string (ISO 8601)
 */
export const DateString = z.string().datetime("Invalid date format");

/**
 * Validates a positive integer
 */
export const PositiveInt = z
  .number()
  .int("Must be an integer")
  .positive("Must be positive");

/**
 * Validates a non-negative integer
 */
export const NonNegativeInt = z
  .number()
  .int("Must be an integer")
  .nonnegative("Must be non-negative");

/**
 * Validates an array with size limits
 */
export const BoundedArray = <T extends z.ZodTypeAny>(
  schema: T,
  min = 0,
  max = 100,
) =>
  z
    .array(schema)
    .min(min, `Must have at least ${min} items`)
    .max(max, `Must have at most ${max} items`);

// ============================================================================
// User Schemas
// ============================================================================

/**
 * User profile update schema
 */
export const UpdateUserProfileSchema = z
  .object({
    name: NonEmptyString(1, 100).optional(),
    image: Url.optional(),
  })
  .strict(); // Reject unknown fields

/**
 * User preferences schema
 */
export const UpdateUserPreferencesSchema = z
  .object({
    timezone: z.string().min(1).max(50).optional(),
    workHoursStart: z.number().int().min(0).max(23).optional(), // 0-23 hours
    workHoursEnd: z.number().int().min(0).max(23).optional(),
    workDays: BoundedArray(
      z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
      1,
      7,
    ).optional(),
    breakDuration: PositiveInt.max(120).optional(), // Max 2 hours
  })
  .strict();

/**
 * Combined user profile and preferences update schema
 * For PATCH /api/v1/user/profile endpoint
 */
export const UpdateUserProfileAndPreferencesSchema = z
  .object({
    name: NonEmptyString(1, 100).optional(),
    timezone: z.string().min(1).max(50).optional(),
    workHoursStart: z.number().int().min(0).max(23).optional(),
    workHoursEnd: z.number().int().min(0).max(23).optional(),
    workDays: BoundedArray(
      z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
      1,
      7,
    ).optional(),
    breakDuration: PositiveInt.max(120).optional(),
  })
  .strict()
  .refine(
    (data) => {
      // If both work hours are provided, start must be before end
      if (
        data.workHoursStart !== undefined &&
        data.workHoursEnd !== undefined
      ) {
        return data.workHoursStart < data.workHoursEnd;
      }
      return true;
    },
    {
      message: "Work hours start must be before work hours end",
      path: ["workHoursEnd"],
    },
  );

/**
 * Account deletion confirmation schema
 */
export const DeleteAccountSchema = z
  .object({
    confirmationToken: z.string().min(1, "Confirmation token required"),
    email: Email,
  })
  .strict();

// ============================================================================
// Task Schemas
// ============================================================================

/**
 * Priority levels for tasks
 */
export const TaskPriority = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

/**
 * Task status
 */
export const TaskStatus = z.enum(["TODO", "IN_PROGRESS", "DONE", "CANCELLED"]);

/**
 * Create task schema
 */
export const CreateTaskSchema = z
  .object({
    title: NonEmptyString(1, 200),
    description: z.string().max(5000).optional(),
    estimatedMinutes: PositiveInt.max(480), // Max 8 hours
    priority: TaskPriority.default("MEDIUM"),
    dueDate: DateString.optional(),
    tags: BoundedArray(NonEmptyString(1, 50), 0, 20).optional(),
    categoryId: z.string().cuid().optional(),
  })
  .strict();

/**
 * Update task schema
 */
export const UpdateTaskSchema = z
  .object({
    title: NonEmptyString(1, 200).optional(),
    description: z.string().max(5000).optional(),
    estimatedMinutes: PositiveInt.max(480).optional(),
    priority: TaskPriority.optional(),
    status: TaskStatus.optional(),
    dueDate: DateString.optional().nullable(),
    completedAt: DateString.optional().nullable(),
    tags: BoundedArray(NonEmptyString(1, 50), 0, 20).optional(),
    categoryId: z.string().cuid().optional().nullable(),
  })
  .strict();

/**
 * Task ID param schema
 */
export const TaskIdSchema = z.object({
  id: z.string().cuid("Invalid task ID"),
});

// ============================================================================
// Calendar Schemas
// ============================================================================

/**
 * Calendar event schema
 */
export const CreateCalendarEventSchema = z
  .object({
    title: NonEmptyString(1, 200),
    description: z.string().max(5000).optional(),
    startTime: DateString,
    endTime: DateString,
    location: NonEmptyString(1, 200).optional(),
    isAllDay: z.boolean().default(false),
    calendarId: z.string().optional(),
  })
  .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  });

/**
 * Update calendar event schema
 */
export const UpdateCalendarEventSchema = z
  .object({
    title: NonEmptyString(1, 200).optional(),
    description: z.string().max(5000).optional(),
    startTime: DateString.optional(),
    endTime: DateString.optional(),
    location: NonEmptyString(1, 200).optional(),
    isAllDay: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return new Date(data.startTime) < new Date(data.endTime);
      }
      return true;
    },
    { message: "End time must be after start time", path: ["endTime"] },
  );

// ============================================================================
// Workspace Schemas
// ============================================================================

/**
 * Create workspace schema
 */
export const CreateWorkspaceSchema = z
  .object({
    name: NonEmptyString(1, 100),
    description: z.string().max(500).optional(),
  })
  .strict();

/**
 * Update workspace schema
 */
export const UpdateWorkspaceSchema = z
  .object({
    name: NonEmptyString(1, 100).optional(),
    description: z.string().max(500).optional(),
  })
  .strict();

/**
 * Invite user to workspace schema
 */
export const InviteUserSchema = z
  .object({
    email: Email,
    role: z.enum(["MEMBER", "ADMIN"]).default("MEMBER"),
  })
  .strict();

// ============================================================================
// Pagination & Filtering
// ============================================================================

/**
 * Pagination query schema
 */
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20), // Max 100 items per page
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

/**
 * Task filter schema
 */
export const TaskFilterSchema = PaginationSchema.extend({
  status: TaskStatus.optional(),
  priority: TaskPriority.optional(),
  categoryId: z.string().cuid().optional(),
  search: z.string().max(100).optional(),
  dueBefore: DateString.optional(),
  dueAfter: DateString.optional(),
});

// ============================================================================
// API Response Helpers
// ============================================================================

/**
 * Standard API error response
 */
export interface ApiError {
  error: string;
  code: string;
  message?: string;
  details?: z.ZodError;
}

/**
 * Create validation error response
 */
export function validationError(zodError: z.ZodError<any>): ApiError {
  return {
    error: "Validation failed",
    code: "VALIDATION_ERROR",
    message: zodError.issues[0]?.message || "Invalid input",
    details: zodError,
  };
}

/**
 * Validate request body with schema
 *
 * @example
 * ```typescript
 * export async function POST(req: Request) {
 *   const result = await validateRequest(req, CreateTaskSchema);
 *   if (!result.success) {
 *     return Response.json(result.error, { status: 400 });
 *   }
 *
 *   const task = await prisma.task.create({ data: result.data });
 *   return Response.json(task);
 * }
 * ```
 */
export async function validateRequest<T extends z.ZodTypeAny>(
  req: Request,
  schema: T,
): Promise<
  { success: true; data: z.infer<T> } | { success: false; error: ApiError }
> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return {
        success: false,
        error: validationError(result.error),
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        error: "Invalid JSON",
        code: "INVALID_JSON",
        message: "Request body must be valid JSON",
      },
    };
  }
}

/**
 * Validate URL search params with schema
 *
 * @example
 * ```typescript
 * export async function GET(req: Request) {
 *   const { searchParams } = new URL(req.url);
 *   const result = validateSearchParams(searchParams, TaskFilterSchema);
 *
 *   if (!result.success) {
 *     return Response.json(result.error, { status: 400 });
 *   }
 *
 *   const tasks = await prisma.task.findMany({
 *     where: { status: result.data.status },
 *     take: result.data.limit,
 *     skip: (result.data.page - 1) * result.data.limit,
 *   });
 *   return Response.json(tasks);
 * }
 * ```
 */
export function validateSearchParams<T extends z.ZodTypeAny>(
  searchParams: URLSearchParams,
  schema: T,
): { success: true; data: z.infer<T> } | { success: false; error: ApiError } {
  const params: Record<string, any> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const result = schema.safeParse(params);

  if (!result.success) {
    return {
      success: false,
      error: validationError(result.error),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

// ============================================================================
// Sanitization Helpers
// ============================================================================

/**
 * Sanitize user input to prevent XSS attacks
 *
 * Removes HTML tags, script tags, and potentially dangerous characters.
 * Use this for any user-provided text that will be stored or displayed.
 *
 * THREAT-010: Input Validation (Risk: 12/15)
 *
 * @param input - User input string
 * @param options - Sanitization options
 * @returns Sanitized string
 *
 * @example
 * ```typescript
 * const userInput = req.body.comment;
 * const safe = sanitizeInput(userInput);
 * await prisma.comment.create({ data: { text: safe } });
 * ```
 */
export function sanitizeInput(
  input: string,
  options: {
    /** Allow basic formatting tags (b, i, em, strong) */
    allowFormatting?: boolean;
    /** Maximum length (truncate if longer) */
    maxLength?: number;
    /** Remove all non-ASCII characters */
    asciiOnly?: boolean;
  } = {},
): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  let sanitized = input;

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");

  // Remove script tags and their content
  sanitized = sanitized.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    "",
  );

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, "");

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, "");

  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, "");

  // Handle HTML tags
  if (options.allowFormatting) {
    // Allow only safe formatting tags
    const allowedTags = ["b", "i", "em", "strong", "u", "br"];
    sanitized = sanitized.replace(
      /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
      (match, tag) => {
        if (allowedTags.includes(tag.toLowerCase())) {
          return `<${tag}>`;
        }
        return "";
      },
    );
  } else {
    // Remove all HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, "");
  }

  // Decode HTML entities to prevent double-encoding attacks
  sanitized = sanitized
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&amp;/g, "&");

  // Then re-encode to prevent XSS
  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");

  // Remove non-ASCII if requested
  if (options.asciiOnly) {
    sanitized = sanitized.replace(/[^\x00-\x7F]/g, "");
  }

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }

  return sanitized;
}

/**
 * Sanitize HTML string (for rich text editors)
 *
 * Note: Install `isomorphic-dompurify` first:
 * ```bash
 * npm install isomorphic-dompurify
 * ```
 */
export function sanitizeHtml(html: string): string {
  // TODO: Implement with DOMPurify when rich text is needed
  // import DOMPurify from 'isomorphic-dompurify';
  // return DOMPurify.sanitize(html, {
  //   ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
  //   ALLOWED_ATTR: ['href', 'target'],
  // });

  // For now, use sanitizeInput
  return sanitizeInput(html, { allowFormatting: false });
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, "_") // Replace special chars with underscore
    .replace(/_{2,}/g, "_") // Replace multiple underscores with single
    .substring(0, 255); // Limit length
}

/**
 * Sanitize and validate URL
 */
export function sanitizeUrl(
  url: string,
  allowedDomains?: string[],
): string | null {
  try {
    const parsed = new URL(url);

    // Only allow http/https
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }

    // Check allowed domains if provided
    if (allowedDomains && !allowedDomains.includes(parsed.hostname)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

// ============================================================================
// Type Exports
// ============================================================================

export type UpdateUserProfileAndPreferencesInput = z.infer<
  typeof UpdateUserProfileAndPreferencesSchema
>;
export type DeleteAccountInput = z.infer<typeof DeleteAccountSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type TaskFilterInput = z.infer<typeof TaskFilterSchema>;
export type CreateCalendarEventInput = z.infer<
  typeof CreateCalendarEventSchema
>;
export type UpdateCalendarEventInput = z.infer<
  typeof UpdateCalendarEventSchema
>;
export type CreateWorkspaceInput = z.infer<typeof CreateWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof UpdateWorkspaceSchema>;
export type InviteUserInput = z.infer<typeof InviteUserSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
