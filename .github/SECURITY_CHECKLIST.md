# Security Checklist for Pull Requests

## Overview

This checklist must be completed for every pull request that touches security-sensitive areas. Use this as a code review guide to ensure consistent security practices across the codebase.

## When to Use This Checklist

Use this checklist when your PR includes:
- New API endpoints
- Authentication/authorization logic
- Database queries
- User input handling
- File uploads
- External API integrations
- Environment variable changes
- Dependency updates

## Pre-Deployment Security Checklist

### Authentication & Authorization

- [ ] **Authentication Required**: All protected endpoints check session/authentication
- [ ] **Authorization Checks**: Users can only access their own data (userId/workspaceId checks)
- [ ] **Session Validation**: Session tokens validated on server-side (not client-side)
- [ ] **No Auth Bypass**: Cannot bypass authentication with direct URL access
- [ ] **Role Checks**: Admin endpoints verify user role
- [ ] **Token Security**: OAuth tokens never exposed to client-side JavaScript

**Code Example**:
```typescript
// ✅ CORRECT
const session = await getServerSession(authOptions);
if (!session) return new Response('Unauthorized', { status: 401 });

const task = await prisma.task.findFirst({
  where: {
    id: taskId,
    userId: session.user.id, // Ensure user owns the resource
  },
});

// ❌ WRONG
const task = await prisma.task.findUnique({ where: { id: taskId } });
// Missing authorization check!
```

---

### Input Validation

- [ ] **All Inputs Validated**: Every user input validated with Zod schema
- [ ] **Type Safety**: Using TypeScript types from Zod schemas
- [ ] **Boundary Checks**: Min/max length, min/max values enforced
- [ ] **Email Validation**: Email addresses validated with proper regex
- [ ] **URL Validation**: URLs validated and sanitized
- [ ] **Array Limits**: Arrays have max length limits
- [ ] **Enum Validation**: Enum values validated against whitelist

**Code Example**:
```typescript
// ✅ CORRECT
import { CreateTaskSchema } from '@/lib/security/validation';

const result = CreateTaskSchema.safeParse(body);
if (!result.success) {
  return Response.json({ error: result.error }, { status: 400 });
}

// ❌ WRONG
const { title, estimatedMinutes } = body;
// No validation!
```

---

### SQL Injection Prevention

- [ ] **Using Prisma**: All database queries use Prisma ORM
- [ ] **No Raw SQL**: Avoiding `$queryRawUnsafe` (use `$queryRaw` if necessary)
- [ ] **Parameterized Queries**: All user inputs parameterized
- [ ] **No String Concatenation**: Not building SQL queries with string concatenation

**Code Example**:
```typescript
// ✅ CORRECT
const tasks = await prisma.task.findMany({
  where: {
    title: { contains: searchTerm }, // Safe
    userId: session.user.id,
  },
});

// ❌ WRONG
const tasks = await prisma.$queryRawUnsafe(
  `SELECT * FROM tasks WHERE title LIKE '%${searchTerm}%'`
);
// SQL injection vulnerability!
```

---

### XSS Prevention

- [ ] **React Auto-Escaping**: Using React's built-in escaping (no `dangerouslySetInnerHTML` without sanitization)
- [ ] **No Inline HTML**: Not injecting HTML strings
- [ ] **Sanitize Rich Text**: Rich text content sanitized with DOMPurify
- [ ] **CSP Headers**: Content Security Policy headers configured
- [ ] **User Content Escaped**: All user-generated content properly escaped

---

### API Security

- [ ] **Rate Limiting**: Endpoint has appropriate rate limits
- [ ] **CORS Configured**: CORS headers properly set (if needed)
- [ ] **Security Headers**: Security headers applied (CSP, X-Frame-Options, etc.)
- [ ] **Error Handling**: Errors don't leak sensitive information
- [ ] **No Stack Traces**: Stack traces not exposed to client
- [ ] **Logging Safe**: No sensitive data logged (passwords, tokens, PII)

**Code Example**:
```typescript
// ✅ CORRECT
import { rateLimitByIp } from '@/lib/security/rate-limit';

export async function POST(req: Request) {
  const limited = await rateLimitByIp(req, 'api:tasks', 100, '1 m');
  if (limited) {
    return new Response('Too Many Requests', { status: 429 });
  }

  try {
    // API logic
  } catch (error) {
    console.error('API Error:', error); // Log for debugging
    return new Response('Internal Server Error', { status: 500 }); // Generic error
  }
}

// ❌ WRONG
export async function POST(req: Request) {
  try {
    // API logic
  } catch (error) {
    return Response.json({ error: error.stack }, { status: 500 });
    // Exposes stack trace to client!
  }
}
```

---

### Data Protection

- [ ] **No Sensitive Data Client-Side**: Tokens, secrets never sent to client
- [ ] **No Secrets in Code**: API keys in environment variables only
- [ ] **httpOnly Cookies**: Session cookies are httpOnly, secure, sameSite
- [ ] **No localStorage Tokens**: Tokens not stored in localStorage
- [ ] **Minimal Data Exposure**: Only necessary fields returned in API responses
- [ ] **Field Whitelisting**: Using Prisma `select` to limit exposed fields

**Code Example**:
```typescript
// ✅ CORRECT
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

// ❌ WRONG
const user = await prisma.user.findUnique({ where: { id } });
// Exposes all fields including sensitive data!
```

---

### CSRF Protection

- [ ] **CSRF Tokens**: State-changing operations use CSRF tokens (NextAuth.js handles this)
- [ ] **SameSite Cookies**: Cookies have `sameSite=lax` or `sameSite=strict`
- [ ] **Origin Validation**: Origin header validated for sensitive requests

---

### File Upload Security (if applicable)

- [ ] **File Type Validation**: Only allowed file types accepted
- [ ] **File Size Limits**: Maximum file size enforced
- [ ] **Malware Scanning**: Files scanned for malware (if handling uploads)
- [ ] **Secure Storage**: Files stored outside web root
- [ ] **Sanitized Filenames**: Filenames sanitized to prevent path traversal

---

### External API Integration (if applicable)

- [ ] **Response Validation**: External API responses validated with Zod
- [ ] **Error Handling**: External API errors handled gracefully
- [ ] **Timeout Set**: Requests have timeouts
- [ ] **No Sensitive Data in URLs**: Secrets not in query parameters
- [ ] **HTTPS Only**: Only HTTPS endpoints called
- [ ] **Domain Whitelist**: Only whitelisted domains accessed

**Code Example**:
```typescript
// ✅ CORRECT
import { z } from 'zod';

const GoogleEventSchema = z.object({
  id: z.string(),
  summary: z.string(),
  start: z.object({ dateTime: z.string() }),
});

const response = await fetch('https://googleapis.com/calendar/v3/events');
const data = await response.json();

const validated = GoogleEventSchema.safeParse(data);
if (!validated.success) {
  throw new Error('Invalid response from Google API');
}

// ❌ WRONG
const response = await fetch('https://googleapis.com/calendar/v3/events');
const data = await response.json();
await prisma.event.create({ data }); // Unvalidated external data!
```

---

### Environment Variables

- [ ] **No Secrets Committed**: No `.env` files committed to Git
- [ ] **Environment Variables Documented**: New variables documented in `.env.example`
- [ ] **Secure Defaults**: Sensible defaults for development
- [ ] **Production Secrets Set**: Verified production environment variables configured

---

### Dependencies

- [ ] **No Known Vulnerabilities**: `npm audit` passes with no critical/high vulnerabilities
- [ ] **Minimal Dependencies**: Only necessary dependencies added
- [ ] **Trusted Sources**: Dependencies from trusted sources (npm, not random GitHub repos)
- [ ] **Lock File Updated**: `package-lock.json` committed

**Run before PR**:
```bash
npm audit
npm audit fix
```

---

### Testing

- [ ] **Unit Tests Written**: Core logic covered by unit tests
- [ ] **Security Tests**: Authorization, validation, rate limiting tested
- [ ] **Integration Tests**: API endpoints tested end-to-end
- [ ] **Error Cases Tested**: Error handling tested
- [ ] **Tests Pass**: All tests passing (`npm test`)

**Security Test Example**:
```typescript
describe('Authorization', () => {
  it('prevents accessing other users data', async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const task = await createTask(user1);

    const response = await authenticatedFetch(user2, `/api/tasks/${task.id}`);
    expect(response.status).toBe(404);
  });
});
```

---

### Documentation

- [ ] **Security Implications Documented**: Security-sensitive changes documented
- [ ] **API Changes Documented**: New endpoints documented in `/docs/api`
- [ ] **Environment Variables Documented**: New variables in `.env.example`
- [ ] **Migration Guide**: Breaking changes have migration guide

---

## Code Review Security Checklist

### For Reviewers

When reviewing a PR, verify:

**General**
- [ ] PR description explains security implications
- [ ] No TODOs left for security-critical code
- [ ] No debug/console.log statements in production code
- [ ] No commented-out security checks

**Authentication & Authorization**
- [ ] Every protected route checks authentication
- [ ] Every data access checks authorization (user owns resource)
- [ ] No hardcoded credentials or API keys
- [ ] Sessions managed securely

**Input Validation**
- [ ] All user inputs validated
- [ ] Validation happens server-side (not just client-side)
- [ ] Validation errors don't leak information
- [ ] Edge cases handled (null, undefined, empty, very long strings)

**Data Access**
- [ ] Database queries include userId/workspaceId filters
- [ ] No N+1 queries (performance)
- [ ] Sensitive fields not exposed
- [ ] Prisma `select` used to limit fields

**Error Handling**
- [ ] Errors caught and handled gracefully
- [ ] Generic error messages to client
- [ ] Detailed errors logged (Sentry) but not exposed
- [ ] No information leakage in error messages

**Security Headers & CORS**
- [ ] Security headers applied
- [ ] CORS properly configured (not `*` in production)
- [ ] Rate limiting configured

---

## API Endpoint Checklist

For new API endpoints, verify ALL of the following:

```typescript
// Template for secure API endpoint

import { getServerSession } from 'next-auth';
import { rateLimitByIp } from '@/lib/security/rate-limit';
import { validateRequest, CreateTaskSchema } from '@/lib/security/validation';
import { applySecurityHeaders } from '@/lib/security/headers';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  // 1. Rate limiting
  const limited = await rateLimitByIp(req, 'api:tasks:create', 100, '1 m');
  if (limited) {
    return new Response('Too Many Requests', { status: 429 });
  }

  // 2. Authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 3. Input validation
  const result = await validateRequest(req, CreateTaskSchema);
  if (!result.success) {
    return Response.json(result.error, { status: 400 });
  }

  try {
    // 4. Authorization & data access
    const task = await prisma.task.create({
      data: {
        ...result.data,
        userId: session.user.id, // Associate with authenticated user
      },
      select: {
        // 5. Limit exposed fields
        id: true,
        title: true,
        estimatedMinutes: true,
        createdAt: true,
        // Don't expose: userId, internal fields
      },
    });

    // 6. Security headers
    const response = Response.json(task, { status: 201 });
    return applySecurityHeaders(response);

  } catch (error) {
    // 7. Error handling
    console.error('Failed to create task:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
```

---

## Pre-Merge Checklist

Before merging your PR:

- [ ] All CI/CD checks passing
- [ ] Code reviewed by at least one other developer
- [ ] Security checklist completed
- [ ] Tests written and passing
- [ ] No console warnings in tests
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] Commits squashed/cleaned up (if needed)

---

## Emergency Rollback Procedure

If a security issue is discovered after merge:

1. **Immediately revert** the PR if it introduces a critical vulnerability
2. **Notify security team**: security@aicalendaragent.com
3. **Assess impact**: Determine if user data was exposed
4. **Follow incident response plan**: See `/docs/security/incident-response.md`
5. **Fix in isolation**: Create new PR with fix
6. **Test thoroughly**: Verify fix before re-deploying
7. **Post-mortem**: Document what went wrong and how to prevent

---

## Resources

- [SECURITY.md](/SECURITY.md) - Main security documentation
- [Authentication Security](/docs/security/authentication.md)
- [API Security Best Practices](/docs/security/api-security.md)
- [Threat Model](/docs/security/threat-model.md)
- [Incident Response Plan](/docs/security/incident-response.md)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)

---

## Acknowledgment

By submitting this PR, I confirm that:
- [ ] I have completed the relevant items in this security checklist
- [ ] I have tested the code for security vulnerabilities
- [ ] I have not committed any secrets or sensitive data
- [ ] I understand the security implications of my changes

**PR Author**: @username
**Date**: YYYY-MM-DD
**Reviewed By**: @reviewer
