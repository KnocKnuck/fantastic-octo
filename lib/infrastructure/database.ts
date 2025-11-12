/**
 * Database Infrastructure - Prisma Client Singleton
 *
 * This module provides a singleton instance of the Prisma Client to prevent
 * multiple instances in development (due to hot reloading).
 *
 * Security:
 * - Connection pooling configured
 * - Query logging disabled in production
 * - Prepared statements used by default
 *
 * @see https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
 */

import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Prisma Client Options
const prismaOptions = {
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn'] as const
    : ['error'] as const,
};

// Singleton pattern for Prisma Client
export const prisma = global.prisma || new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Test database connection
 * @returns Promise<boolean> - True if connection successful
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

/**
 * Disconnect from database (useful for cleanup in tests)
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Get database connection status
 */
export async function getDatabaseStatus(): Promise<{
  connected: boolean;
  latency: number;
}> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    return { connected: true, latency };
  } catch (error) {
    return { connected: false, latency: -1 };
  }
}

export default prisma;
