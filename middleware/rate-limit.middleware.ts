/**
 * Rate Limiting Middleware
 *
 * THREAT-009: API Rate Limiting (Risk: 12/15)
 *
 * Provides middleware functions to apply rate limiting to Next.js API routes.
 * Protects against:
 * - Denial of Service (DoS) attacks
 * - Brute force attacks
 * - API abuse
 * - Resource exhaustion
 *
 * This middleware automatically:
 * 1. Checks rate limits before processing requests
 * 2. Adds standard rate limit headers to responses
 * 3. Returns 429 Too Many Requests when limits exceeded
 * 4. Supports multiple rate limit strategies (IP-based, user-based, preset-based)
 *
 * Installation:
 * ```bash
 * npm install @upstash/redis @upstash/ratelimit
 * ```
 *
 * Environment Variables:
 * ```env
 * UPSTASH_REDIS_REST_URL=https://...
 * UPSTASH_REDIS_REST_TOKEN=...
 * ```
 *
 * Usage Example:
 * ```typescript
 * // app/api/tasks/route.ts
 * import { withRateLimit, RateLimitPreset } from '@/middleware/rate-limit.middleware';
 *
 * async function handler(req: Request) {
 *   // Your API logic here
 *   return Response.json({ success: true });
 * }
 *
 * // Apply rate limiting: 100 requests per minute
 * export const POST = withRateLimit(handler, RateLimitPreset.AUTHENTICATED);
 * ```
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getClientIp,
  rateLimitByIpWithInfo,
  rateLimitWithInfo,
  RateLimitPresets,
  createRateLimitResponse,
  addRateLimitHeaders,
} from "@/lib/security/rate-limit";
import { getCurrentSession } from "@/lib/auth";

// ============================================================================
// Types
// ============================================================================

/**
 * Rate limit preset names for easy reference
 */
export enum RateLimitPreset {
  PUBLIC = "public",
  AUTHENTICATED = "authenticated",
  AUTH = "auth",
  SIGNUP = "signup",
  PASSWORD_RESET = "passwordReset",
  EMAIL = "email",
  AI = "ai",
  UPLOAD = "upload",
  WEBHOOK = "webhook",
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Number of requests allowed */
  requests: number;
  /** Time window (e.g., '1 m', '1 h') */
  window: string;
  /** Rate limit key prefix */
  keyPrefix: string;
  /** Strategy for identifying users */
  strategy?: "ip" | "user" | "session";
}

/**
 * API route handler type
 */
export type RouteHandler = (req: Request, context?: any) => Promise<Response>;

// ============================================================================
// Core Middleware Functions
// ============================================================================

/**
 * Apply rate limiting to an API route handler
 *
 * This is the main middleware function. It wraps your route handler and
 * automatically checks rate limits before allowing the request to proceed.
 *
 * @param handler - Your API route handler function
 * @param config - Rate limit configuration
 * @returns Wrapped handler with rate limiting
 *
 * @example
 * ```typescript
 * export const POST = withRateLimit(
 *   async (req: Request) => {
 *     const body = await req.json();
 *     // Process request
 *     return Response.json({ success: true });
 *   },
 *   {
 *     requests: 100,
 *     window: '1 m',
 *     keyPrefix: 'api:tasks:create',
 *     strategy: 'user',
 *   }
 * );
 * ```
 */
export function withRateLimit(
  handler: RouteHandler,
  config: RateLimitConfig,
): RouteHandler {
  return async (req: Request, context?: any) => {
    try {
      // Get identifier based on strategy
      const identifier = await getIdentifier(req, config.strategy);

      // Check rate limit
      const info = await rateLimitWithInfo(
        identifier,
        config.keyPrefix,
        config.requests,
        config.window,
      );

      // If rate limited, return 429 response
      if (!info.success) {
        return createRateLimitResponse(info);
      }

      // Process the request
      const response = await handler(req, context);

      // Add rate limit headers to response
      return addRateLimitHeaders(response, info);
    } catch (error) {
      console.error("Rate limit middleware error:", error);
      // If rate limiting fails, allow the request (fail open)
      // In production, you might want to fail closed instead
      return handler(req, context);
    }
  };
}

/**
 * Apply rate limiting using a preset configuration
 *
 * Presets are pre-configured rate limits for common use cases.
 * This is the easiest way to add rate limiting to your routes.
 *
 * @param handler - Your API route handler function
 * @param preset - Rate limit preset name
 * @param keyPrefix - Optional custom key prefix (defaults to route path)
 * @param strategy - Optional strategy override
 * @returns Wrapped handler with rate limiting
 *
 * @example
 * ```typescript
 * // Limit login attempts: 5 per 15 minutes
 * export const POST = withRateLimitPreset(
 *   async (req: Request) => {
 *     // Login logic
 *   },
 *   RateLimitPreset.AUTH,
 *   'api:auth:login'
 * );
 * ```
 */
export function withRateLimitPreset(
  handler: RouteHandler,
  preset: RateLimitPreset,
  keyPrefix?: string,
  strategy?: "ip" | "user" | "session",
): RouteHandler {
  const presetConfig = RateLimitPresets[preset];

  if (!presetConfig) {
    console.error(`Unknown rate limit preset: ${preset}`);
    return handler; // Return unwrapped handler if preset not found
  }

  return withRateLimit(handler, {
    requests: presetConfig.requests,
    window: presetConfig.window,
    keyPrefix: keyPrefix || `api:${preset}`,
    strategy: strategy || (preset === "authenticated" ? "user" : "ip"),
  });
}

/**
 * Apply rate limiting by IP address
 *
 * Use this for public endpoints where users are not authenticated.
 * Rate limits are applied per IP address.
 *
 * @param handler - Your API route handler function
 * @param requests - Number of requests allowed
 * @param window - Time window (e.g., '1 m', '1 h')
 * @param keyPrefix - Rate limit key prefix
 * @returns Wrapped handler with IP-based rate limiting
 *
 * @example
 * ```typescript
 * export const POST = withIpRateLimit(
 *   async (req: Request) => {
 *     // Public API logic
 *   },
 *   100, // 100 requests
 *   '1 m', // per minute
 *   'api:public:search'
 * );
 * ```
 */
export function withIpRateLimit(
  handler: RouteHandler,
  requests: number,
  window: string,
  keyPrefix: string,
): RouteHandler {
  return withRateLimit(handler, {
    requests,
    window,
    keyPrefix,
    strategy: "ip",
  });
}

/**
 * Apply rate limiting by user ID
 *
 * Use this for authenticated endpoints. Rate limits are applied per user.
 * Requires a valid session.
 *
 * @param handler - Your API route handler function
 * @param requests - Number of requests allowed
 * @param window - Time window (e.g., '1 m', '1 h')
 * @param keyPrefix - Rate limit key prefix
 * @returns Wrapped handler with user-based rate limiting
 *
 * @example
 * ```typescript
 * export const POST = withUserRateLimit(
 *   async (req: Request) => {
 *     // Authenticated API logic
 *   },
 *   50, // 50 requests
 *   '1 h', // per hour
 *   'api:ai:generate'
 * );
 * ```
 */
export function withUserRateLimit(
  handler: RouteHandler,
  requests: number,
  window: string,
  keyPrefix: string,
): RouteHandler {
  return withRateLimit(handler, {
    requests,
    window,
    keyPrefix,
    strategy: "user",
  });
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get identifier for rate limiting based on strategy
 */
async function getIdentifier(
  req: Request,
  strategy: "ip" | "user" | "session" | undefined = "ip",
): Promise<string> {
  switch (strategy) {
    case "user":
    case "session": {
      // Try to get user ID from session
      try {
        const session = await getCurrentSession();
        if (session?.user?.id) {
          return `user:${session.user.id}`;
        }
      } catch {
        // Fall back to IP if session fails
      }
      // Fall back to IP if no session
      return `ip:${getClientIp(req)}`;
    }

    case "ip":
    default:
      return `ip:${getClientIp(req)}`;
  }
}

/**
 * Check if rate limit is exceeded without wrapping a handler
 *
 * Use this when you need to manually check rate limits in your route.
 *
 * @param req - Request object
 * @param config - Rate limit configuration
 * @returns Rate limit info with success flag
 *
 * @example
 * ```typescript
 * export async function POST(req: Request) {
 *   const limitInfo = await checkRateLimit(req, {
 *     requests: 100,
 *     window: '1 m',
 *     keyPrefix: 'api:custom',
 *     strategy: 'ip',
 *   });
 *
 *   if (!limitInfo.success) {
 *     return createRateLimitResponse(limitInfo);
 *   }
 *
 *   // Continue processing
 * }
 * ```
 */
export async function checkRateLimit(
  req: Request,
  config: RateLimitConfig,
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const identifier = await getIdentifier(req, config.strategy);

  return rateLimitWithInfo(
    identifier,
    config.keyPrefix,
    config.requests,
    config.window,
  );
}

/**
 * Create a rate limit response with proper headers
 *
 * Use this to manually create a 429 response with rate limit headers.
 *
 * @param info - Rate limit info
 * @param message - Optional custom error message
 * @returns 429 Response with rate limit headers
 *
 * @example
 * ```typescript
 * const limitInfo = await checkRateLimit(req, config);
 * if (!limitInfo.success) {
 *   return createRateLimitError(limitInfo, 'Slow down!');
 * }
 * ```
 */
export function createRateLimitError(
  info: {
    limit: number;
    remaining: number;
    reset: number;
  },
  message?: string,
): Response {
  return createRateLimitResponse(info, message);
}

// ============================================================================
// Next.js Middleware Integration
// ============================================================================

/**
 * Edge middleware for global rate limiting
 *
 * Add this to your middleware.ts file to apply rate limiting at the edge.
 * This runs before your API routes and can protect your entire application.
 *
 * @example
 * ```typescript
 * // middleware.ts
 * import { rateLimitMiddleware } from '@/middleware/rate-limit.middleware';
 *
 * export const middleware = rateLimitMiddleware;
 *
 * export const config = {
 *   matcher: '/api/:path*', // Apply to all API routes
 * };
 * ```
 */
export async function rateLimitMiddleware(req: NextRequest) {
  // Only apply to API routes
  if (!req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Skip rate limiting for health checks
  if (req.nextUrl.pathname === "/api/health") {
    return NextResponse.next();
  }

  try {
    // Apply basic rate limit by IP
    const ip = getClientIp(req);
    const info = await rateLimitByIpWithInfo(
      req,
      "api:global",
      RateLimitPresets.public.requests,
      RateLimitPresets.public.window,
    );

    if (!info.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Too Many Requests",
          code: "RATE_LIMIT_EXCEEDED",
          limit: info.limit,
          remaining: 0,
          reset: new Date(info.reset).toISOString(),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": String(info.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.floor(info.reset / 1000)),
            "Retry-After": String(Math.ceil((info.reset - Date.now()) / 1000)),
          },
        },
      );
    }

    // Continue with the request
    const response = NextResponse.next();

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", String(info.limit));
    response.headers.set("X-RateLimit-Remaining", String(info.remaining));
    response.headers.set(
      "X-RateLimit-Reset",
      String(Math.floor(info.reset / 1000)),
    );

    return response;
  } catch (error) {
    console.error("Rate limit middleware error:", error);
    // Fail open - allow the request if rate limiting fails
    return NextResponse.next();
  }
}

// ============================================================================
// Configuration Helpers
// ============================================================================

/**
 * Create a custom rate limit configuration
 *
 * @param requests - Number of requests allowed
 * @param window - Time window (e.g., '1 m', '1 h', '1 d')
 * @param keyPrefix - Rate limit key prefix
 * @param strategy - Rate limiting strategy
 * @returns Rate limit configuration
 */
export function createRateLimitConfig(
  requests: number,
  window: string,
  keyPrefix: string,
  strategy: "ip" | "user" | "session" = "ip",
): RateLimitConfig {
  return {
    requests,
    window,
    keyPrefix,
    strategy,
  };
}

/**
 * Get preset configuration
 *
 * @param preset - Preset name
 * @returns Rate limit configuration
 */
export function getPresetConfig(preset: RateLimitPreset): RateLimitConfig {
  const presetConfig = RateLimitPresets[preset];
  return {
    requests: presetConfig.requests,
    window: presetConfig.window,
    keyPrefix: `api:${preset}`,
    strategy: preset === RateLimitPreset.AUTHENTICATED ? "user" : "ip",
  };
}

// ============================================================================
// Usage Examples
// ============================================================================

/**
 * EXAMPLE 1: Simple preset-based rate limiting
 *
 * ```typescript
 * // app/api/auth/login/route.ts
 * import { withRateLimitPreset, RateLimitPreset } from '@/middleware/rate-limit.middleware';
 *
 * async function loginHandler(req: Request) {
 *   const body = await req.json();
 *   // Login logic
 *   return Response.json({ success: true });
 * }
 *
 * export const POST = withRateLimitPreset(
 *   loginHandler,
 *   RateLimitPreset.AUTH, // 5 requests per 15 minutes
 *   'api:auth:login'
 * );
 * ```
 *
 * EXAMPLE 2: Custom rate limiting
 *
 * ```typescript
 * // app/api/search/route.ts
 * import { withRateLimit } from '@/middleware/rate-limit.middleware';
 *
 * async function searchHandler(req: Request) {
 *   const { searchParams } = new URL(req.url);
 *   // Search logic
 *   return Response.json({ results: [] });
 * }
 *
 * export const GET = withRateLimit(searchHandler, {
 *   requests: 50,
 *   window: '1 m',
 *   keyPrefix: 'api:search',
 *   strategy: 'ip',
 * });
 * ```
 *
 * EXAMPLE 3: User-based rate limiting
 *
 * ```typescript
 * // app/api/ai/generate/route.ts
 * import { withUserRateLimit } from '@/middleware/rate-limit.middleware';
 *
 * async function generateHandler(req: Request) {
 *   // AI generation logic (expensive operation)
 *   return Response.json({ result: 'AI response' });
 * }
 *
 * export const POST = withUserRateLimit(
 *   generateHandler,
 *   50, // 50 requests
 *   '1 h', // per hour
 *   'api:ai:generate'
 * );
 * ```
 *
 * EXAMPLE 4: Manual rate limit checking
 *
 * ```typescript
 * // app/api/complex/route.ts
 * import { checkRateLimit, createRateLimitError } from '@/middleware/rate-limit.middleware';
 *
 * export async function POST(req: Request) {
 *   // Check rate limit manually
 *   const limitInfo = await checkRateLimit(req, {
 *     requests: 100,
 *     window: '1 m',
 *     keyPrefix: 'api:complex',
 *     strategy: 'user',
 *   });
 *
 *   if (!limitInfo.success) {
 *     return createRateLimitError(limitInfo);
 *   }
 *
 *   // Process request
 *   return Response.json({ success: true });
 * }
 * ```
 *
 * EXAMPLE 5: Different limits for different operations
 *
 * ```typescript
 * // app/api/tasks/route.ts
 * import { checkRateLimit, createRateLimitError } from '@/middleware/rate-limit.middleware';
 *
 * export async function GET(req: Request) {
 *   // More generous limit for reads
 *   const limitInfo = await checkRateLimit(req, {
 *     requests: 1000,
 *     window: '1 m',
 *     keyPrefix: 'api:tasks:read',
 *     strategy: 'user',
 *   });
 *
 *   if (!limitInfo.success) {
 *     return createRateLimitError(limitInfo);
 *   }
 *
 *   // Fetch tasks...
 * }
 *
 * export async function POST(req: Request) {
 *   // Stricter limit for writes
 *   const limitInfo = await checkRateLimit(req, {
 *     requests: 100,
 *     window: '1 m',
 *     keyPrefix: 'api:tasks:create',
 *     strategy: 'user',
 *   });
 *
 *   if (!limitInfo.success) {
 *     return createRateLimitError(limitInfo);
 *   }
 *
 *   // Create task...
 * }
 * ```
 */

// ============================================================================
// Best Practices
// ============================================================================

/**
 * BEST PRACTICES FOR RATE LIMITING:
 *
 * 1. Choose appropriate limits
 *    - Public endpoints: Stricter limits (100/min)
 *    - Authenticated endpoints: More generous (1000/min)
 *    - Expensive operations (AI, email): Very strict (10/hour)
 *    - Authentication: Very strict to prevent brute force (5/15min)
 *
 * 2. Use the right strategy
 *    - IP-based: Public endpoints, unauthenticated users
 *    - User-based: Authenticated endpoints, per-user quotas
 *    - Hybrid: Check both IP and user for sensitive operations
 *
 * 3. Apply rate limiting at multiple levels
 *    - Global: Edge middleware for all API routes
 *    - Route-level: Specific limits for each endpoint
 *    - Operation-level: Different limits for GET vs POST
 *
 * 4. Always return proper headers
 *    - X-RateLimit-Limit: Total requests allowed
 *    - X-RateLimit-Remaining: Requests remaining
 *    - X-RateLimit-Reset: Unix timestamp when limit resets
 *    - Retry-After: Seconds until user can retry
 *
 * 5. Handle rate limit errors gracefully
 *    - Return 429 status code
 *    - Include clear error message
 *    - Provide reset time
 *    - Log for monitoring
 *
 * 6. Monitor and adjust
 *    - Track rate limit violations
 *    - Adjust limits based on usage patterns
 *    - Alert on suspicious patterns (potential attacks)
 *
 * 7. Consider business logic
 *    - Premium users: Higher limits
 *    - Trusted IPs: Whitelist
 *    - Known bad actors: Blacklist
 */
