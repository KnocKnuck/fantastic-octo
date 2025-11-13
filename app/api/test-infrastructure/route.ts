/**
 * Infrastructure Test API Endpoint
 *
 * Runs comprehensive tests on all infrastructure services.
 * WARNING: This performs actual operations (not just checks).
 * Use this sparingly to avoid rate limits.
 *
 * @route GET /api/test-infrastructure
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is disabled in production' },
      { status: 403 }
    );
  }

  const results = {
    timestamp: new Date().toISOString(),
    tests: [] as Array<{
      service: string;
      test: string;
      status: 'pass' | 'fail' | 'skip';
      message?: string;
      error?: string;
    }>,
  };

  // Test Database
  try {
    const { testDatabaseConnection } = await import('@/lib/infrastructure/database');
    const success = await testDatabaseConnection();
    results.tests.push({
      service: 'Database',
      test: 'Connection',
      status: success ? 'pass' : 'fail',
      message: success ? 'Connected successfully' : 'Connection failed',
    });
  } catch (error: any) {
    results.tests.push({
      service: 'Database',
      test: 'Connection',
      status: 'fail',
      error: error.message,
    });
  }

  // Test Redis
  try {
    const { testRedisConnection } = await import('@/lib/infrastructure/cache');
    const success = await testRedisConnection();
    results.tests.push({
      service: 'Redis',
      test: 'Connection',
      status: success ? 'pass' : 'fail',
      message: success ? 'Connected successfully' : 'Connection failed',
    });
  } catch (error: any) {
    results.tests.push({
      service: 'Redis',
      test: 'Connection',
      status: 'fail',
      error: error.message,
    });
  }

  // Test Redis Caching
  try {
    const { setCached, getCached, deleteCached } = await import('@/lib/infrastructure/cache');
    const testKey = `test:${Date.now()}`;
    const testValue = { test: true, timestamp: Date.now() };

    await setCached(testKey, testValue, 10);
    const retrieved = await getCached(testKey);
    const deleted = await deleteCached(testKey);

    const success = retrieved !== null && deleted;
    results.tests.push({
      service: 'Redis',
      test: 'Caching',
      status: success ? 'pass' : 'fail',
      message: success ? 'Set, get, and delete operations successful' : 'Cache operations failed',
    });
  } catch (error: any) {
    results.tests.push({
      service: 'Redis',
      test: 'Caching',
      status: 'fail',
      error: error.message,
    });
  }

  // Test Rate Limiting
  try {
    const { checkRateLimit } = await import('@/lib/infrastructure/cache');
    const testId = `test:${Date.now()}`;
    const result = await checkRateLimit(testId, 5, 60);

    results.tests.push({
      service: 'Redis',
      test: 'Rate Limiting',
      status: result.allowed ? 'pass' : 'fail',
      message: `Allowed: ${result.allowed}, Remaining: ${result.remaining}`,
    });
  } catch (error: any) {
    results.tests.push({
      service: 'Redis',
      test: 'Rate Limiting',
      status: 'fail',
      error: error.message,
    });
  }

  // Test Inngest (only check if configured)
  if (process.env.INNGEST_EVENT_KEY) {
    try {
      const { testInngestConnection } = await import('@/lib/infrastructure/jobs');
      const success = await testInngestConnection();
      results.tests.push({
        service: 'Inngest',
        test: 'Connection',
        status: success ? 'pass' : 'fail',
        message: success ? 'Event sent successfully' : 'Failed to send event',
      });
    } catch (error: any) {
      results.tests.push({
        service: 'Inngest',
        test: 'Connection',
        status: 'fail',
        error: error.message,
      });
    }
  } else {
    results.tests.push({
      service: 'Inngest',
      test: 'Connection',
      status: 'skip',
      message: 'INNGEST_EVENT_KEY not configured',
    });
  }

  // Test Pusher (only check if configured)
  if (process.env.PUSHER_KEY) {
    try {
      const { testPusherConnection } = await import('@/lib/infrastructure/realtime');
      const success = await testPusherConnection();
      results.tests.push({
        service: 'Pusher',
        test: 'Connection',
        status: success ? 'pass' : 'fail',
        message: success ? 'Event triggered successfully' : 'Failed to trigger event',
      });
    } catch (error: any) {
      results.tests.push({
        service: 'Pusher',
        test: 'Connection',
        status: 'fail',
        error: error.message,
      });
    }
  } else {
    results.tests.push({
      service: 'Pusher',
      test: 'Connection',
      status: 'skip',
      message: 'PUSHER_KEY not configured',
    });
  }

  // Test Sentry (only check if configured)
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    try {
      const { testSentryConnection } = await import('@/lib/infrastructure/monitoring');
      const success = testSentryConnection();
      results.tests.push({
        service: 'Sentry',
        test: 'Connection',
        status: success ? 'pass' : 'fail',
        message: success ? 'Test message sent' : 'Failed to send message',
      });
    } catch (error: any) {
      results.tests.push({
        service: 'Sentry',
        test: 'Connection',
        status: 'fail',
        error: error.message,
      });
    }
  } else {
    results.tests.push({
      service: 'Sentry',
      test: 'Connection',
      status: 'skip',
      message: 'NEXT_PUBLIC_SENTRY_DSN not configured',
    });
  }

  // Calculate summary
  const summary = {
    total: results.tests.length,
    passed: results.tests.filter(t => t.status === 'pass').length,
    failed: results.tests.filter(t => t.status === 'fail').length,
    skipped: results.tests.filter(t => t.status === 'skip').length,
  };

  return NextResponse.json({
    ...results,
    summary,
  });
}
