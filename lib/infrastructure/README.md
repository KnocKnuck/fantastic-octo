# Infrastructure Module

This directory contains all infrastructure service integrations for the AI Calendar Agent.

## Overview

The infrastructure layer provides core services that the application depends on:

- **Database** - PostgreSQL via Prisma ORM
- **Caching** - Redis via Upstash for fast data access
- **Jobs** - Background task processing via Inngest
- **Real-time** - WebSocket communication via Pusher
- **Monitoring** - Error tracking via Sentry

## Files

### `database.ts`
Prisma Client singleton for database operations.

```typescript
import { prisma } from '@/lib/infrastructure/database';

// Query example
const users = await prisma.user.findMany();

// Test connection
import { testDatabaseConnection } from '@/lib/infrastructure/database';
await testDatabaseConnection();
```

### `cache.ts`
Redis client for caching and rate limiting via Upstash.

```typescript
import { getCached, setCached, checkRateLimit } from '@/lib/infrastructure/cache';

// Caching
await setCached('user:123:prefs', preferences, 300); // 5 min TTL
const cached = await getCached('user:123:prefs');

// Rate limiting
const { allowed, remaining } = await checkRateLimit('user:123', 100, 60);
if (!allowed) {
  throw new Error('Rate limit exceeded');
}
```

### `jobs.ts`
Inngest client for background job processing.

```typescript
import { sendEvent, scheduleCalendarSync } from '@/lib/infrastructure/jobs';

// Schedule a background job
await scheduleCalendarSync(userId, calendarId, workspaceId);

// Send custom event
await sendEvent('email/send.requested', {
  to: 'user@example.com',
  subject: 'Welcome!',
  template: 'welcome',
  data: { name: 'John' }
});
```

### `realtime.ts`
Pusher client for real-time WebSocket communication.

```typescript
import {
  triggerEvent,
  notifyCalendarSyncCompleted,
  Channels,
  Events
} from '@/lib/infrastructure/realtime';

// Send real-time notification
await notifyCalendarSyncCompleted(userId, calendarId, 50);

// Custom event
await triggerEvent(
  Channels.userPrivate(userId),
  Events.TASK_CREATED,
  { task: newTask }
);
```

### `monitoring.ts`
Sentry integration for error tracking and monitoring.

```typescript
import {
  captureException,
  addBreadcrumb,
  setUserContext,
  ErrorTracking
} from '@/lib/infrastructure/monitoring';

// Track errors
try {
  await riskyOperation();
} catch (error) {
  captureException(error, { context: 'additional info' });
}

// Add breadcrumbs
addBreadcrumb('User clicked button', 'user-action', 'info');

// Track specific error types
ErrorTracking.apiError('/api/tasks', error, 500);
```

### `index.ts`
Central export point for all infrastructure services.

```typescript
// Import everything from one place
import {
  prisma,
  redis,
  inngest,
  pusher,
  testAllConnections
} from '@/lib/infrastructure';

// Test all connections
await testAllConnections();
```

## Usage Patterns

### Database Queries with Caching

```typescript
import { prisma, getCached, setCached } from '@/lib/infrastructure';

async function getUserPreferences(userId: string) {
  // Try cache first
  const cached = await getCached(`user:${userId}:prefs`);
  if (cached) return cached;

  // Query database
  const prefs = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      timezone: true,
      workHoursStart: true,
      workHoursEnd: true,
      workDays: true,
    }
  });

  // Cache for 5 minutes
  await setCached(`user:${userId}:prefs`, prefs, 300);
  return prefs;
}
```

### Background Job with Real-time Updates

```typescript
import { sendEvent, triggerEvent } from '@/lib/infrastructure';

async function syncCalendar(userId: string, calendarId: string) {
  // Start sync in background
  await sendEvent('calendar/sync.requested', {
    userId,
    calendarId,
    workspaceId: user.workspaceId
  });

  // Notify user that sync started
  await triggerEvent(
    `private-user-${userId}`,
    'calendar.sync.started',
    { calendarId }
  );
}
```

### API Route with Rate Limiting

```typescript
import { checkRateLimit } from '@/lib/infrastructure';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';

  // Check rate limit
  const { allowed } = await checkRateLimit(ip, 100, 60);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // Process request...
}
```

### Error Handling with Monitoring

```typescript
import { captureException, addBreadcrumb } from '@/lib/infrastructure';

async function processPayment(userId: string, amount: number) {
  addBreadcrumb('Processing payment', 'payment', 'info', { userId, amount });

  try {
    const result = await stripe.charges.create({
      amount,
      currency: 'usd',
      customer: userId,
    });
    return result;
  } catch (error) {
    captureException(error, {
      userId,
      amount,
      operation: 'payment',
    });
    throw error;
  }
}
```

## Testing

### Test Individual Services

```bash
# Database
npm run db:studio

# All services
curl http://localhost:3000/api/test-infrastructure
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

### Programmatic Tests

```typescript
import { testAllConnections } from '@/lib/infrastructure';

const results = await testAllConnections();
console.log(results);
// {
//   database: true,
//   redis: true,
//   inngest: true,
//   pusher: true,
//   sentry: true
// }
```

## Environment Variables

All services require environment variables. See `.env.example` for the complete list.

Critical variables:
- `DATABASE_URL` - PostgreSQL connection string
- `UPSTASH_REDIS_REST_URL` - Redis URL
- `INNGEST_EVENT_KEY` - Inngest event key
- `PUSHER_KEY` - Pusher app key
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN

## Security Best Practices

1. **Never commit secrets** - Use `.env` files (in `.gitignore`)
2. **Rotate secrets regularly** - Every 90 days for critical services
3. **Enable 2FA** - On all service accounts
4. **Use least privilege** - Only grant necessary permissions
5. **Monitor usage** - Set up alerts for unusual patterns
6. **Encrypt at rest** - Enable on database and Redis
7. **Use TLS** - All services should use HTTPS/TLS

## Troubleshooting

### Database Connection Issues

```typescript
// Test connection
import { testDatabaseConnection } from '@/lib/infrastructure/database';
await testDatabaseConnection();

// Check connection pooling
import { prisma } from '@/lib/infrastructure/database';
await prisma.$queryRaw`SELECT 1`;
```

### Redis Timeout

```typescript
// Check Redis with custom timeout
import { redis } from '@/lib/infrastructure/cache';

try {
  const result = await Promise.race([
    redis.ping(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 5000)
    )
  ]);
  console.log('Redis connected');
} catch (error) {
  console.error('Redis timeout');
}
```

### Inngest Events Not Processing

1. Check Inngest dashboard for errors
2. Verify `INNGEST_SIGNING_KEY` is correct
3. Ensure functions are registered in `/api/inngest/route.ts`
4. Check function logs in Inngest UI

### Pusher Connection Fails

1. Verify `NEXT_PUBLIC_PUSHER_KEY` (must have `NEXT_PUBLIC_` prefix)
2. Check cluster matches your Pusher app
3. Ensure auth endpoint `/api/pusher/auth` exists
4. Check Pusher dashboard for connection logs

## Performance Tips

### Database
- Use indexes on frequently queried fields
- Limit result sets with `take` and `skip`
- Use `select` to fetch only needed fields
- Consider read replicas for high traffic

### Redis
- Set appropriate TTLs (don't cache forever)
- Use batch operations when possible
- Invalidate cache on updates
- Monitor memory usage

### Background Jobs
- Use job priorities for critical tasks
- Set reasonable timeouts
- Implement idempotency
- Monitor queue length

### Real-time
- Use private channels for sensitive data
- Batch events when possible
- Consider presence channels for online status
- Monitor connection count

## Additional Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Upstash Redis Docs](https://upstash.com/docs/redis)
- [Inngest Docs](https://www.inngest.com/docs)
- [Pusher Docs](https://pusher.com/docs)
- [Sentry Docs](https://docs.sentry.io/)

## Support

For infrastructure issues:
1. Check service status dashboards
2. Review application logs
3. Contact DevOps team
4. Open GitHub issue with `infrastructure` label
