# API Security Best Practices

## Overview

This document outlines security best practices for developing and maintaining secure APIs in the AI Calendar Agent application.

## OWASP API Security Top 10 (2023)

### API1:2023 - Broken Object Level Authorization (BOLA)

**Risk**: Users can access data they shouldn't (e.g., other users' tasks)

**Mitigations**:
```typescript
// WRONG: No authorization check
export async function GET(req: Request) {
  const { taskId } = await req.json();
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  return Response.json(task);
}

// CORRECT: Verify user owns the task
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Unauthorized', { status: 401 });

  const { taskId } = await req.json();
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId: session.user.id,  // Ensure user owns task
    },
  });

  if (!task) return new Response('Not found', { status: 404 });
  return Response.json(task);
}
```

**Key Rules**:
- Always verify the authenticated user owns the resource
- Use `WHERE userId = ?` or `WHERE workspaceId = ?` in queries
- Never trust client-provided IDs without authorization checks
- Return 404 (not 403) for unauthorized resources (prevents enumeration)

### API2:2023 - Broken Authentication

**Risk**: Attackers can compromise authentication mechanisms

**Mitigations**:
- Use NextAuth.js (battle-tested library)
- Never implement custom auth logic
- Always check session on server-side
- Use middleware for route protection
- Implement rate limiting on auth endpoints (5 req/min)

```typescript
// Always verify session on API routes
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Proceed with authenticated logic
}
```

### API3:2023 - Broken Object Property Level Authorization

**Risk**: Exposing sensitive fields or allowing modification of protected fields

**Mitigations**:
```typescript
// WRONG: Expose all user fields
export async function GET(req: Request) {
  const user = await prisma.user.findUnique({ where: { id } });
  return Response.json(user); // Exposes access_token, refresh_token!
}

// CORRECT: Select only safe fields
export async function GET(req: Request) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      // Do NOT include: accounts, sessions, tokens
    },
  });
  return Response.json(user);
}

// WRONG: Allow updating any field
export async function PATCH(req: Request) {
  const data = await req.json();
  await prisma.user.update({ where: { id }, data }); // User could set isAdmin: true!
}

// CORRECT: Whitelist allowed fields
export async function PATCH(req: Request) {
  const data = await req.json();
  const allowedFields = { name: data.name, image: data.image };
  await prisma.user.update({ where: { id }, data: allowedFields });
}
```

**Key Rules**:
- Always use `select` to specify returned fields
- Never return full objects with sensitive data
- Whitelist fields that can be updated
- Validate all input fields with Zod

### API4:2023 - Unrestricted Resource Consumption

**Risk**: API abuse through excessive requests (DoS)

**Mitigations**:
- Implement rate limiting (see `/lib/security/rate-limit.ts`)
- Limit request payload size
- Implement pagination for list endpoints
- Set timeouts on expensive operations

```typescript
// Rate limiting configuration
const rateLimits = {
  public: { requests: 100, window: '1m' },       // 100 req/min per IP
  authenticated: { requests: 1000, window: '1m' }, // 1000 req/min per user
  auth: { requests: 5, window: '15m' },          // 5 req/15min for login
};

// Pagination example
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Max 100

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    take: limit,
    skip: (page - 1) * limit,
  });

  return Response.json({ tasks, page, limit });
}
```

### API5:2023 - Broken Function Level Authorization

**Risk**: Users accessing admin/privileged functions

**Mitigations**:
```typescript
// Separate admin routes
// /app/api/admin/[...]/route.ts

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Unauthorized', { status: 401 });

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== 'ADMIN') {
    return new Response('Forbidden', { status: 403 });
  }

  // Admin-only logic here
}
```

**Key Rules**:
- Separate admin endpoints from user endpoints
- Always verify user role/permissions
- Use middleware for consistent authorization checks
- Log admin actions for audit trail

### API6:2023 - Unrestricted Access to Sensitive Business Flows

**Risk**: Automated abuse of critical flows (signup, purchasing)

**Mitigations**:
- CAPTCHA on signup/contact forms (hCaptcha/reCAPTCHA)
- Rate limiting on signup (5/hour per IP)
- Email verification before activation
- Monitor for suspicious patterns

```typescript
// Signup with rate limiting
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';

  // Check rate limit
  const limited = await rateLimit.check('signup', ip, {
    requests: 5,
    window: '1h',
  });

  if (limited) {
    return new Response('Too many signups', { status: 429 });
  }

  // Proceed with signup
}
```

### API7:2023 - Server Side Request Forgery (SSRF)

**Risk**: Attacker tricks server into making requests to internal resources

**Mitigations**:
```typescript
// WRONG: User controls URL
export async function POST(req: Request) {
  const { url } = await req.json();
  const response = await fetch(url); // SSRF vulnerability!
}

// CORRECT: Whitelist allowed domains
const ALLOWED_DOMAINS = ['api.google.com', 'graph.microsoft.com'];

export async function POST(req: Request) {
  const { url } = await req.json();
  const parsedUrl = new URL(url);

  if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname)) {
    return new Response('Invalid URL', { status: 400 });
  }

  const response = await fetch(url);
}
```

**Key Rules**:
- Never make requests to user-controlled URLs
- Whitelist allowed domains
- Validate and sanitize all URLs
- Use separate network zones for internal services

### API8:2023 - Security Misconfiguration

**Risk**: Insecure default configurations, verbose errors, missing security headers

**Mitigations**:
- Set security headers (see `/lib/security/headers.ts`)
- Never expose stack traces to clients
- Remove debug endpoints in production
- Keep dependencies updated

```typescript
// Error handling
export async function GET(req: Request) {
  try {
    // API logic
  } catch (error) {
    // Log detailed error (Sentry)
    console.error('API Error:', error);

    // Return generic error to client
    return new Response('Internal Server Error', { status: 500 });
    // NEVER: return Response.json({ error: error.stack });
  }
}
```

**Security Headers**:
```typescript
export function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; ...",
  };
}
```

### API9:2023 - Improper Inventory Management

**Risk**: Undocumented or deprecated endpoints exposing vulnerabilities

**Mitigations**:
- Document all API endpoints
- Remove unused/deprecated endpoints
- Version APIs properly
- Maintain API inventory

```typescript
// API documentation structure
// /docs/api/
// - authentication.md
// - tasks.md
// - calendar.md
// - users.md

// Version endpoints
// /api/v1/tasks
// /api/v2/tasks (when breaking changes)
```

### API10:2023 - Unsafe Consumption of APIs

**Risk**: Trusting data from external APIs without validation

**Mitigations**:
```typescript
// WRONG: Trust external API response
const calendarData = await fetch('https://googleapis.com/calendar/v3/...');
const events = await calendarData.json();
await prisma.event.createMany({ data: events }); // Unvalidated!

// CORRECT: Validate external data
import { z } from 'zod';

const GoogleEventSchema = z.object({
  id: z.string(),
  summary: z.string(),
  start: z.object({ dateTime: z.string() }),
  end: z.object({ dateTime: z.string() }),
});

const calendarData = await fetch('https://googleapis.com/calendar/v3/...');
const events = await calendarData.json();

// Validate each event
const validatedEvents = events.items.map((event: any) => {
  const validated = GoogleEventSchema.safeParse(event);
  if (!validated.success) {
    console.error('Invalid event:', validated.error);
    return null;
  }
  return validated.data;
}).filter(Boolean);

await prisma.event.createMany({ data: validatedEvents });
```

## Input Validation

### Use Zod for All Inputs

```typescript
import { z } from 'zod';

// Define schema
const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  estimatedMinutes: z.number().int().min(1).max(480), // Max 8 hours
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: z.string().datetime().optional(),
});

// Validate in API route
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Unauthorized', { status: 401 });

  const body = await req.json();
  const validation = CreateTaskSchema.safeParse(body);

  if (!validation.success) {
    return Response.json({
      error: 'Validation failed',
      details: validation.error.issues,
    }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      ...validation.data,
      userId: session.user.id,
    },
  });

  return Response.json(task);
}
```

### Common Validation Patterns

```typescript
// Email validation
const EmailSchema = z.string().email();

// URL validation
const UrlSchema = z.string().url();

// Date validation
const DateSchema = z.string().datetime();

// Enum validation
const StatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);

// Array with limits
const TagsSchema = z.array(z.string()).min(1).max(10);

// Nested objects
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  zipCode: z.string().regex(/^\d{5}$/),
});

// Conditional fields
const UserSchema = z.object({
  role: z.enum(['USER', 'ADMIN']),
  adminNotes: z.string().optional(),
}).refine(
  (data) => data.role === 'ADMIN' ? !!data.adminNotes : true,
  { message: 'Admin must have notes' }
);
```

## SQL Injection Prevention

### Always Use Prisma

```typescript
// SAFE: Prisma automatically parameterizes queries
const tasks = await prisma.task.findMany({
  where: {
    title: { contains: userInput }, // Safe
    userId: session.user.id,
  },
});

// UNSAFE: Raw SQL with user input (avoid if possible)
const tasks = await prisma.$queryRaw`
  SELECT * FROM tasks WHERE title = ${userInput}
`; // Safe (parameterized) but prefer Prisma methods

// NEVER DO THIS:
const tasks = await prisma.$queryRawUnsafe(
  `SELECT * FROM tasks WHERE title = '${userInput}'`
); // SQL INJECTION VULNERABILITY!
```

### Raw SQL Guidelines

If raw SQL is absolutely necessary:
- Use `$queryRaw` (parameterized), never `$queryRawUnsafe`
- Escape user input
- Review with security team

## XSS Prevention

### React Auto-Escaping

React automatically escapes content:
```typescript
// Safe - React escapes HTML
<div>{userInput}</div>

// UNSAFE - Bypasses escaping
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### Sanitize Rich Text

If you need to allow HTML (e.g., rich text editor):
```typescript
import DOMPurify from 'isomorphic-dompurify';

const sanitized = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p'],
  ALLOWED_ATTR: ['href'],
});

<div dangerouslySetInnerHTML={{ __html: sanitized }} />
```

### Content Security Policy

```typescript
// next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ];
  },
};
```

## CORS Configuration

```typescript
// Strict CORS policy
export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://aicalendaragent.com', // Specific origin
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}

// For API routes
export async function GET(req: Request) {
  const origin = req.headers.get('origin');
  const allowedOrigins = [
    'https://aicalendaragent.com',
    'https://www.aicalendaragent.com',
  ];

  const headers: HeadersInit = {};
  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return Response.json(data, { headers });
}
```

## Rate Limiting

See `/lib/security/rate-limit.ts` for implementation.

```typescript
import { rateLimit } from '@/lib/security/rate-limit';

export async function POST(req: Request) {
  const identifier = session?.user.id || req.headers.get('x-forwarded-for') || 'unknown';

  const limited = await rateLimit({
    identifier,
    limit: 100,
    window: 60, // 60 seconds
  });

  if (limited) {
    return new Response('Too Many Requests', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Date.now() + 60000),
        'Retry-After': '60',
      },
    });
  }

  // Continue with request
}
```

## Error Handling

### Secure Error Responses

```typescript
export async function GET(req: Request) {
  try {
    // API logic
    const data = await fetchData();
    return Response.json(data);
  } catch (error) {
    // Log full error details (Sentry, CloudWatch)
    console.error('API Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: session?.user.id,
      path: req.url,
      timestamp: new Date().toISOString(),
    });

    // Return generic error to client
    return new Response(
      JSON.stringify({
        error: 'An error occurred',
        code: 'INTERNAL_ERROR',
        // Do NOT include: stack trace, file paths, SQL queries
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
```

### Error Code System

```typescript
// Define error codes
export const ErrorCodes = {
  // Authentication (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Authorization (403)
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Client Errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',

  // Server Errors (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
} as const;

// Consistent error response format
interface ApiError {
  error: string;
  code: keyof typeof ErrorCodes;
  message?: string;
  details?: any;
}
```

## Logging Best Practices

### What to Log

- Authentication attempts (success and failure)
- Authorization failures
- Input validation failures
- API errors
- Rate limit hits
- Unusual activity patterns

### What NOT to Log

- Passwords or tokens
- OAuth tokens or secrets
- Credit card numbers
- Social security numbers
- Full request/response bodies with PII

### Logging Example

```typescript
// Good logging
console.log('User login successful', {
  userId: user.id,
  timestamp: new Date().toISOString(),
  ip: req.headers.get('x-forwarded-for'),
});

// Bad logging
console.log('User login', {
  user: user, // Contains access_token, refresh_token!
  password: password, // NEVER LOG PASSWORDS
});
```

## API Testing

### Security Test Cases

```typescript
// __tests__/api/security.test.ts

describe('API Security', () => {
  it('requires authentication', async () => {
    const res = await fetch('/api/tasks');
    expect(res.status).toBe(401);
  });

  it('enforces authorization', async () => {
    // Try accessing another user's task
    const res = await authenticatedFetch('/api/tasks/other-user-task');
    expect(res.status).toBe(404); // Not 403 to prevent enumeration
  });

  it('validates input', async () => {
    const res = await authenticatedFetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: '' }), // Invalid
    });
    expect(res.status).toBe(400);
  });

  it('rate limits requests', async () => {
    const requests = Array(101).fill(null).map(() =>
      fetch('/api/tasks')
    );
    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.status === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });

  it('prevents SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    const res = await authenticatedFetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: maliciousInput }),
    });
    // Should either validate input or safely escape
    expect(res.status).not.toBe(500);
  });
});
```

## Checklist for New API Endpoints

Before deploying a new API endpoint, verify:

- [ ] Authentication required (if protected endpoint)
- [ ] Authorization checks (user can only access their data)
- [ ] Input validation with Zod schema
- [ ] Rate limiting configured
- [ ] Error handling (no sensitive data in errors)
- [ ] Logging (audit trail without PII)
- [ ] Security headers set
- [ ] CORS properly configured
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Tests written (including security tests)
- [ ] Code reviewed by peer
- [ ] Documentation updated

## Resources

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/security)
- [Zod Documentation](https://zod.dev/)
- [Prisma Security](https://www.prisma.io/docs/guides/security)

---

**Last Updated**: 2025-11-12
**Owner**: Security Team
**Review Cycle**: Quarterly
