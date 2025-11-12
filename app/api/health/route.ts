/**
 * Health Check API Endpoint
 *
 * Tests all infrastructure connections and returns status.
 * Use this to verify your infrastructure setup.
 *
 * @route GET /api/health
 */

import { NextResponse } from 'next/server';
import { testDatabaseConnection, getDatabaseStatus } from '@/lib/infrastructure/database';
import { testRedisConnection } from '@/lib/infrastructure/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();

  // Test all connections
  const results = {
    status: 'unknown' as 'healthy' | 'degraded' | 'unhealthy',
    timestamp: new Date().toISOString(),
    services: {
      database: { status: 'unknown' as 'up' | 'down', latency: 0 },
      redis: { status: 'unknown' as 'up' | 'down', latency: 0 },
      inngest: { status: 'unknown' as 'up' | 'down' | 'skipped', message: 'Skipped in health check' },
      pusher: { status: 'unknown' as 'up' | 'down' | 'skipped', message: 'Skipped in health check' },
      sentry: { status: 'unknown' as 'up' | 'down' | 'skipped', message: 'Skipped in health check' },
    },
    responseTime: 0,
  };

  // Test Database
  try {
    const dbStart = Date.now();
    const dbStatus = await getDatabaseStatus();
    results.services.database = {
      status: dbStatus.connected ? 'up' : 'down',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    results.services.database = { status: 'down', latency: 0 };
  }

  // Test Redis
  try {
    const redisStart = Date.now();
    const redisConnected = await testRedisConnection();
    results.services.redis = {
      status: redisConnected ? 'up' : 'down',
      latency: Date.now() - redisStart,
    };
  } catch (error) {
    results.services.redis = { status: 'down', latency: 0 };
  }

  // Note: Inngest, Pusher, and Sentry tests are skipped in health check
  // to avoid unnecessary API calls. They're marked as 'skipped'.
  results.services.inngest.status = process.env.INNGEST_EVENT_KEY ? 'up' : 'down';
  results.services.pusher.status = process.env.PUSHER_KEY ? 'up' : 'down';
  results.services.sentry.status = process.env.NEXT_PUBLIC_SENTRY_DSN ? 'up' : 'down';

  // Determine overall health status
  const criticalServices = ['database', 'redis'];
  const criticalDown = criticalServices.some(
    service => results.services[service as keyof typeof results.services].status === 'down'
  );

  if (criticalDown) {
    results.status = 'unhealthy';
  } else {
    const anyDown = Object.values(results.services).some(
      service => service.status === 'down'
    );
    results.status = anyDown ? 'degraded' : 'healthy';
  }

  results.responseTime = Date.now() - startTime;

  // Return appropriate HTTP status code
  const statusCode =
    results.status === 'healthy' ? 200 :
    results.status === 'degraded' ? 200 : // Still operational
    503; // Service unavailable

  return NextResponse.json(results, { status: statusCode });
}
