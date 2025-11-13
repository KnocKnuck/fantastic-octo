/**
 * Caching & Rate Limiting Infrastructure - Upstash Redis
 *
 * This module provides Redis caching and rate limiting functionality.
 *
 * Features:
 * - Cache expensive queries
 * - Rate limiting per IP/user
 * - Session storage
 * - Real-time data invalidation
 *
 * Security:
 * - All data encrypted in transit (TLS)
 * - Rate limiting prevents abuse
 * - Graceful degradation if Redis unavailable
 *
 * @see https://upstash.com/docs/redis
 */

import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Cache TTL (Time To Live) constants in seconds
 */
export const CacheTTL = {
  USER_PREFERENCES: 300, // 5 minutes
  CALENDAR_EVENTS: 60,   // 1 minute
  TASK_LISTS: 30,        // 30 seconds
  SCHEDULE_CALCULATIONS: 300, // 5 minutes
  SESSION: 3600,         // 1 hour
  RATE_LIMIT: 60,        // 1 minute
} as const;

/**
 * Rate limiting configurations
 */
export const RateLimits = {
  PUBLIC: parseInt(process.env.RATE_LIMIT_PUBLIC || '100'),
  AUTHENTICATED: parseInt(process.env.RATE_LIMIT_AUTHENTICATED || '1000'),
  AUTH_ENDPOINTS: parseInt(process.env.RATE_LIMIT_AUTH_ENDPOINTS || '5'),
} as const;

/**
 * Get cached data
 * @param key Cache key
 * @returns Cached data or null
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    return data as T | null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Set cached data with TTL
 * @param key Cache key
 * @param value Data to cache
 * @param ttl Time to live in seconds
 */
export async function setCached<T>(
  key: string,
  value: T,
  ttl: number = CacheTTL.USER_PREFERENCES
): Promise<boolean> {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
}

/**
 * Delete cached data
 * @param key Cache key
 */
export async function deleteCached(key: string): Promise<boolean> {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
}

/**
 * Invalidate multiple cache keys by pattern
 * @param pattern Key pattern (e.g., "user:123:*")
 */
export async function invalidatePattern(pattern: string): Promise<number> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;
    await redis.del(...keys);
    return keys.length;
  } catch (error) {
    console.error('Cache invalidate error:', error);
    return 0;
  }
}

/**
 * Rate limiting check
 * @param identifier IP address or user ID
 * @param limit Max requests per window
 * @param window Window duration in seconds
 * @returns Object with allowed status and remaining requests
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = RateLimits.PUBLIC,
  window: number = 60
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
}> {
  try {
    const key = `ratelimit:${identifier}`;
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, window);
    }

    const ttl = await redis.ttl(key);
    const resetAt = Date.now() + (ttl * 1000);

    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetAt,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow request if Redis is unavailable
    return {
      allowed: true,
      remaining: limit,
      resetAt: Date.now() + (window * 1000),
    };
  }
}

/**
 * Cache helper for user preferences
 */
export async function cacheUserPreferences(
  userId: string,
  preferences: any
): Promise<void> {
  await setCached(
    `user:${userId}:preferences`,
    preferences,
    CacheTTL.USER_PREFERENCES
  );
}

export async function getCachedUserPreferences(
  userId: string
): Promise<any | null> {
  return getCached(`user:${userId}:preferences`);
}

/**
 * Cache helper for calendar events
 */
export async function cacheCalendarEvents(
  calendarId: string,
  events: any[]
): Promise<void> {
  await setCached(
    `calendar:${calendarId}:events`,
    events,
    CacheTTL.CALENDAR_EVENTS
  );
}

export async function getCachedCalendarEvents(
  calendarId: string
): Promise<any[] | null> {
  return getCached(`calendar:${calendarId}:events`);
}

/**
 * Invalidate all cache for a user
 */
export async function invalidateUserCache(userId: string): Promise<number> {
  return invalidatePattern(`user:${userId}:*`);
}

/**
 * Test Redis connection
 */
export async function testRedisConnection(): Promise<boolean> {
  try {
    const testKey = `test:${Date.now()}`;
    await redis.set(testKey, 'test');
    const value = await redis.get(testKey);
    await redis.del(testKey);

    console.log('✅ Redis connection successful');
    return value === 'test';
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
}

export default redis;
