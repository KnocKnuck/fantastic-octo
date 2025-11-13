/**
 * Rate Limiting Middleware
 *
 * Implements rate limiting using Upstash Redis to prevent API abuse and DoS attacks.
 * Supports different rate limits for different endpoint types.
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
 * Usage:
 * ```typescript
 * import { rateLimit, rateLimitByIp } from '@/lib/security/rate-limit';
 *
 * export async function POST(req: Request) {
 *   const limited = await rateLimitByIp(req, 'api:tasks:create', 100, '1m');
 *   if (limited) {
 *     return new Response('Too Many Requests', { status: 429 });
 *   }
 *   // Continue with request
 * }
 * ```
 */

// Uncomment when Upstash is configured:
// import { Redis } from '@upstash/redis';
// import { Ratelimit } from '@upstash/ratelimit';

// ============================================================================
// Configuration
// ============================================================================

/**
 * Rate limit presets for different endpoint types
 */
export const RateLimitPresets = {
  // Public endpoints (unauthenticated)
  public: {
    requests: 100,
    window: '1 m', // 100 requests per minute
  },

  // Authenticated endpoints
  authenticated: {
    requests: 1000,
    window: '1 m', // 1000 requests per minute
  },

  // Authentication endpoints (login, signup)
  auth: {
    requests: 5,
    window: '15 m', // 5 requests per 15 minutes
  },

  // Signup/registration
  signup: {
    requests: 3,
    window: '1 h', // 3 signups per hour per IP
  },

  // Password reset
  passwordReset: {
    requests: 3,
    window: '1 h', // 3 password resets per hour
  },

  // Email sending
  email: {
    requests: 10,
    window: '1 h', // 10 emails per hour per user
  },

  // AI/expensive operations
  ai: {
    requests: 50,
    window: '1 h', // 50 AI requests per hour
  },

  // File uploads
  upload: {
    requests: 20,
    window: '1 h', // 20 uploads per hour
  },

  // Webhooks
  webhook: {
    requests: 1000,
    window: '1 m', // 1000 webhook calls per minute
  },
} as const;

// ============================================================================
// Redis Client (when configured)
// ============================================================================

/**
 * Initialize Redis client
 * Uncomment when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set
 */
let redis: any = null;
let ratelimitCache: Map<string, any> = new Map();

function getRedisClient() {
  if (!redis && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    // Uncomment when Upstash is configured:
    // redis = new Redis({
    //   url: process.env.UPSTASH_REDIS_REST_URL!,
    //   token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    // });
  }
  return redis;
}

/**
 * Get or create rate limiter for a specific configuration
 */
function getRateLimiter(key: string, limit: number, window: string) {
  const cacheKey = `${key}:${limit}:${window}`;

  if (ratelimitCache.has(cacheKey)) {
    return ratelimitCache.get(cacheKey);
  }

  const redis = getRedisClient();
  if (!redis) {
    // Fallback: no rate limiting if Redis not configured (development)
    console.warn('Redis not configured - rate limiting disabled');
    return null;
  }

  // Uncomment when Upstash is configured:
  // const ratelimiter = new Ratelimit({
  //   redis,
  //   limiter: Ratelimit.slidingWindow(limit, window),
  //   analytics: true,
  //   prefix: `ratelimit:${key}`,
  // });

  // ratelimitCache.set(cacheKey, ratelimiter);
  // return ratelimiter;

  return null; // Placeholder
}

// ============================================================================
// Rate Limiting Functions
// ============================================================================

/**
 * Check rate limit for a given identifier
 *
 * @param identifier - Unique identifier (user ID, IP address, etc.)
 * @param key - Rate limit key (e.g., 'api:tasks:create')
 * @param limit - Number of requests allowed
 * @param window - Time window (e.g., '1 m', '1 h')
 * @returns true if rate limited, false otherwise
 *
 * @example
 * ```typescript
 * const limited = await rateLimit(session.user.id, 'api:tasks:create', 100, '1 m');
 * if (limited) {
 *   return new Response('Too Many Requests', { status: 429 });
 * }
 * ```
 */
export async function rateLimit(
  identifier: string,
  key: string,
  limit: number,
  window: string
): Promise<boolean> {
  const ratelimiter = getRateLimiter(key, limit, window);

  if (!ratelimiter) {
    // Redis not configured - allow request (development mode)
    return false;
  }

  // Uncomment when Upstash is configured:
  // const { success } = await ratelimiter.limit(identifier);
  // return !success;

  return false; // Placeholder
}

/**
 * Check rate limit with detailed response
 *
 * @returns Object with rate limit info
 */
export async function rateLimitWithInfo(
  identifier: string,
  key: string,
  limit: number,
  window: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const ratelimiter = getRateLimiter(key, limit, window);

  if (!ratelimiter) {
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + 60000,
    };
  }

  // Uncomment when Upstash is configured:
  // const result = await ratelimiter.limit(identifier);
  // return result;

  return {
    success: true,
    limit,
    remaining: limit,
    reset: Date.now() + 60000,
  };
}

// ============================================================================
// Request-Based Rate Limiting
// ============================================================================

/**
 * Extract IP address from request
 */
export function getClientIp(req: Request): string {
  // Try various headers (Vercel, Cloudflare, etc.)
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return 'unknown';
}

/**
 * Rate limit by IP address
 *
 * @example
 * ```typescript
 * export async function POST(req: Request) {
 *   const limited = await rateLimitByIp(req, 'api:auth:login', 5, '15 m');
 *   if (limited) {
 *     return new Response('Too Many Requests', { status: 429 });
 *   }
 * }
 * ```
 */
export async function rateLimitByIp(
  req: Request,
  key: string,
  limit: number,
  window: string
): Promise<boolean> {
  const ip = getClientIp(req);
  return rateLimit(ip, key, limit, window);
}

/**
 * Rate limit by IP with detailed response
 */
export async function rateLimitByIpWithInfo(
  req: Request,
  key: string,
  limit: number,
  window: string
) {
  const ip = getClientIp(req);
  return rateLimitWithInfo(ip, key, limit, window);
}

/**
 * Rate limit by user ID (from session)
 */
export async function rateLimitByUser(
  userId: string,
  key: string,
  limit: number,
  window: string
): Promise<boolean> {
  return rateLimit(userId, key, limit, window);
}

// ============================================================================
// Middleware Helpers
// ============================================================================

/**
 * Create rate limit response with headers
 */
export function createRateLimitResponse(
  info: {
    limit: number;
    remaining: number;
    reset: number;
  },
  message = 'Too Many Requests'
): Response {
  return new Response(
    JSON.stringify({
      error: message,
      code: 'RATE_LIMIT_EXCEEDED',
      limit: info.limit,
      remaining: 0,
      reset: new Date(info.reset).toISOString(),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': String(info.limit),
        'X-RateLimit-Remaining': String(Math.max(0, info.remaining)),
        'X-RateLimit-Reset': String(Math.floor(info.reset / 1000)),
        'Retry-After': String(Math.ceil((info.reset - Date.now()) / 1000)),
      },
    }
  );
}

/**
 * Add rate limit headers to successful response
 */
export function addRateLimitHeaders(
  response: Response,
  info: {
    limit: number;
    remaining: number;
    reset: number;
  }
): Response {
  const headers = new Headers(response.headers);
  headers.set('X-RateLimit-Limit', String(info.limit));
  headers.set('X-RateLimit-Remaining', String(info.remaining));
  headers.set('X-RateLimit-Reset', String(Math.floor(info.reset / 1000)));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Rate limit middleware wrapper
 *
 * @example
 * ```typescript
 * export const POST = withRateLimit(
 *   async (req: Request) => {
 *     // Your API logic
 *     return Response.json({ success: true });
 *   },
 *   'api:tasks:create',
 *   100,
 *   '1 m'
 * );
 * ```
 */
export function withRateLimit(
  handler: (req: Request) => Promise<Response>,
  key: string,
  limit: number,
  window: string,
  identifierFn: (req: Request) => Promise<string> = async (req) => getClientIp(req)
) {
  return async (req: Request) => {
    const identifier = await identifierFn(req);
    const info = await rateLimitWithInfo(identifier, key, limit, window);

    if (!info.success) {
      return createRateLimitResponse(info);
    }

    const response = await handler(req);
    return addRateLimitHeaders(response, info);
  };
}

/**
 * Preset-based rate limit middleware
 *
 * @example
 * ```typescript
 * export const POST = withPresetRateLimit(
 *   async (req: Request) => {
 *     // Your API logic
 *   },
 *   'auth', // Use auth preset (5 req / 15 min)
 *   'api:auth:login'
 * );
 * ```
 */
export function withPresetRateLimit(
  handler: (req: Request) => Promise<Response>,
  preset: keyof typeof RateLimitPresets,
  key: string,
  identifierFn?: (req: Request) => Promise<string>
) {
  const config = RateLimitPresets[preset];
  return withRateLimit(handler, key, config.requests, config.window, identifierFn);
}

// ============================================================================
// In-Memory Fallback (Development Only)
// ============================================================================

/**
 * Simple in-memory rate limiter for development
 * DO NOT USE IN PRODUCTION - not shared across instances
 */
const memoryStore = new Map<string, { count: number; reset: number }>();

export async function rateLimitMemory(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const key = `${identifier}`;
  const now = Date.now();

  const existing = memoryStore.get(key);

  if (!existing || now > existing.reset) {
    // New window
    memoryStore.set(key, {
      count: 1,
      reset: now + windowMs,
    });
    return false;
  }

  if (existing.count >= limit) {
    return true; // Rate limited
  }

  existing.count++;
  return false;
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Clean up expired entries from memory store (for development)
 * Call this periodically if using in-memory fallback
 */
export function cleanupMemoryStore() {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (now > value.reset) {
      memoryStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof global !== 'undefined' && !global.rateLimitCleanupInterval) {
  global.rateLimitCleanupInterval = setInterval(cleanupMemoryStore, 5 * 60 * 1000);
}

// ============================================================================
// Type Declarations
// ============================================================================

declare global {
  var rateLimitCleanupInterval: NodeJS.Timeout | undefined;
}

// ============================================================================
// Usage Examples
// ============================================================================

/**
 * Example 1: Simple rate limiting by IP
 *
 * ```typescript
 * export async function POST(req: Request) {
 *   const limited = await rateLimitByIp(req, 'api:tasks', 100, '1 m');
 *   if (limited) {
 *     return new Response('Too Many Requests', { status: 429 });
 *   }
 *   // Continue...
 * }
 * ```
 *
 * Example 2: Rate limiting with detailed info
 *
 * ```typescript
 * export async function POST(req: Request) {
 *   const info = await rateLimitByIpWithInfo(req, 'api:tasks', 100, '1 m');
 *   if (!info.success) {
 *     return createRateLimitResponse(info);
 *   }
 *   const response = Response.json({ success: true });
 *   return addRateLimitHeaders(response, info);
 * }
 * ```
 *
 * Example 3: Using middleware wrapper
 *
 * ```typescript
 * export const POST = withRateLimit(
 *   async (req: Request) => {
 *     return Response.json({ success: true });
 *   },
 *   'api:tasks',
 *   100,
 *   '1 m'
 * );
 * ```
 *
 * Example 4: Using preset
 *
 * ```typescript
 * export const POST = withPresetRateLimit(
 *   async (req: Request) => {
 *     // Login logic
 *   },
 *   'auth',
 *   'api:auth:login'
 * );
 * ```
 */
