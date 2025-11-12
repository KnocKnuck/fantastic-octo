/**
 * Infrastructure Module Index
 *
 * Central export point for all infrastructure services.
 * Import from this file for cleaner imports throughout the app.
 *
 * @example
 * import { prisma, redis, inngest } from '@/lib/infrastructure';
 */

// Database
export * from './database';
export { default as prisma } from './database';

// Background Jobs
export * from './jobs';
export { default as inngest } from './jobs';

// Caching & Rate Limiting
export * from './cache';
export { default as redis } from './cache';

// Real-time Communication
export * from './realtime';
export { default as pusher } from './realtime';

// Error Tracking & Monitoring
export * from './monitoring';
export { default as Sentry } from './monitoring';

/**
 * Test all infrastructure connections
 */
export async function testAllConnections(): Promise<{
  database: boolean;
  redis: boolean;
  inngest: boolean;
  pusher: boolean;
  sentry: boolean;
}> {
  const { testDatabaseConnection } = await import('./database');
  const { testRedisConnection } = await import('./cache');
  const { testInngestConnection } = await import('./jobs');
  const { testPusherConnection } = await import('./realtime');
  const { testSentryConnection } = await import('./monitoring');

  console.log('\n🔍 Testing infrastructure connections...\n');

  const results = {
    database: await testDatabaseConnection(),
    redis: await testRedisConnection(),
    inngest: await testInngestConnection(),
    pusher: await testPusherConnection(),
    sentry: testSentryConnection(),
  };

  console.log('\n📊 Infrastructure Status:');
  console.log(`  Database: ${results.database ? '✅' : '❌'}`);
  console.log(`  Redis: ${results.redis ? '✅' : '❌'}`);
  console.log(`  Inngest: ${results.inngest ? '✅' : '❌'}`);
  console.log(`  Pusher: ${results.pusher ? '✅' : '❌'}`);
  console.log(`  Sentry: ${results.sentry ? '✅' : '❌'}`);

  const allHealthy = Object.values(results).every(Boolean);
  console.log(`\n${allHealthy ? '✅ All services healthy' : '⚠️  Some services unavailable'}\n`);

  return results;
}
