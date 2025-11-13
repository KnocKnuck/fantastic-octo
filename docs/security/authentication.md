# Authentication Security

## Overview

This document details the security implementation of our authentication system using NextAuth.js and Google OAuth 2.0.

## Authentication Architecture

### OAuth 2.0 Flow

```
User -> App -> Google OAuth -> User grants permission -> Google redirects back
-> App exchanges code for tokens -> App creates session -> User authenticated
```

### Components

1. **NextAuth.js**: Authentication library handling OAuth flows
2. **Google OAuth Provider**: Identity provider
3. **Prisma**: Database adapter for session storage
4. **PostgreSQL**: Session and user data storage

## Security Measures

### 1. OAuth Token Security

**Access Tokens**:
- Stored encrypted in database (Account model)
- Never exposed to client-side JavaScript
- Used only on server-side for API calls
- Refreshed automatically when expired

**Refresh Tokens**:
- Stored encrypted in database
- Used to obtain new access tokens
- Long-lived but securely stored
- Rotated on each use (if supported by provider)

**ID Tokens**:
- JWT signed by Google
- Verified by NextAuth.js
- Used to establish user identity
- Not stored client-side

### 2. Session Security

**Session Tokens**:
- Cryptographically random (256-bit)
- Stored in httpOnly cookies (XSS protection)
- Secure flag (HTTPS only)
- SameSite=Lax (CSRF protection)
- 30-day expiration
- Stored hashed in database

**Cookie Configuration**:
```typescript
{
  httpOnly: true,      // Prevents JavaScript access
  secure: true,        // HTTPS only (Vercel enforces)
  sameSite: 'lax',     // CSRF protection
  maxAge: 30 * 24 * 60 * 60, // 30 days
  path: '/',
}
```

### 3. CSRF Protection

**NextAuth.js Built-in Protection**:
- CSRF token automatically generated
- Validated on all POST requests
- Prevents cross-site request forgery attacks

**How it works**:
1. CSRF token generated on first visit
2. Token stored in cookie (encrypted)
3. Token included in all auth forms
4. Server validates token matches cookie
5. Requests rejected if mismatch

### 4. Session Fixation Prevention

**Mitigations**:
- New session token generated on login
- Old session tokens invalidated on logout
- Session token regenerated on privilege change
- No session token in URL (always in cookies)

### 5. Account Takeover Prevention

**Rate Limiting**:
- 5 login attempts per IP per 15 minutes
- Temporary lockout after failed attempts
- Alerts on suspicious activity

**Email Verification** (Future):
- Verify email ownership on signup
- Prevent account creation with others' emails

**2FA** (Future):
- TOTP-based two-factor authentication
- Backup codes for account recovery

## OAuth Security Best Practices

### Google OAuth Configuration

**Consent Screen**:
- App name clearly displayed
- Scopes requested: email, profile, calendar (when needed)
- Privacy policy linked
- Terms of service linked

**Redirect URIs**:
- Whitelist only trusted domains
- Production: `https://aicalendaragent.com/api/auth/callback/google`
- Staging: `https://staging.aicalendaragent.com/api/auth/callback/google`
- Development: `http://localhost:3000/api/auth/callback/google`
- No wildcard URIs allowed

**Scopes**:
- Request minimum necessary scopes
- `email`: User's email address
- `profile`: User's name and picture
- `https://www.googleapis.com/auth/calendar.readonly`: Calendar access (Phase 2)

### Security Headers

```typescript
// Applied to all auth routes
{
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
}
```

## Database Schema Security

### User Model

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?

  accounts      Account[]
  sessions      Session[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([email])  // Fast email lookups
}
```

**Security considerations**:
- Email is unique (prevents duplicate accounts)
- No password field (OAuth only)
- Minimal PII stored
- Indexes for performance (not security)

### Account Model

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text  // Encrypted
  access_token      String? @db.Text  // Encrypted
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text  // JWT from provider
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])  // One account per provider
  @@index([userId])
}
```

**Security considerations**:
- Tokens stored in Text fields (can be long)
- OnDelete: Cascade (delete accounts when user deleted)
- Unique constraint on provider + providerAccountId

### Session Model

```prisma
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

**Security considerations**:
- sessionToken is unique (prevents collisions)
- Expires field enforces timeout
- OnDelete: Cascade (delete sessions when user deleted)
- Index on userId for fast queries

## Middleware Protection

### Protected Routes

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const path = req.nextUrl.pathname;

      // Public routes
      if (path === '/' || path.startsWith('/auth')) {
        return true;
      }

      // Protected routes require authentication
      if (path.startsWith('/dashboard') || path.startsWith('/settings')) {
        return !!token;
      }

      return true;
    }
  }
});

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*']
};
```

**How it works**:
1. Middleware runs on every request
2. Checks if route requires authentication
3. Validates session token from cookie
4. Redirects to `/auth/signin` if not authenticated
5. Saves original URL for post-login redirect

## Authentication Flow Security

### Sign In Flow

1. **User clicks "Sign in with Google"**
   - Client-side: No sensitive data
   - CSRF token included in request

2. **App redirects to Google OAuth**
   - State parameter prevents CSRF
   - Nonce prevents replay attacks
   - Redirect URI validated by Google

3. **User grants permission**
   - User authenticates with Google (not our app)
   - User consents to requested scopes
   - Google generates authorization code

4. **Google redirects back to app**
   - Authorization code in URL (single use, short-lived)
   - State parameter validated
   - Code exchanged for tokens (server-side only)

5. **App exchanges code for tokens**
   - Server-to-server request (secure)
   - Client secret proves app identity
   - Access token, refresh token, ID token received

6. **App creates session**
   - User record created/updated in database
   - Session token generated (cryptographically random)
   - Session stored in database with expiration
   - Session cookie set (httpOnly, secure, sameSite)

7. **User redirected to dashboard**
   - Session cookie automatically sent with requests
   - Middleware validates session on protected routes

### Sign Out Flow

1. **User clicks "Sign out"**
   - Client sends POST request to `/api/auth/signout`
   - CSRF token validated

2. **Session invalidated**
   - Session deleted from database
   - Session cookie cleared (expires immediately)

3. **User redirected to homepage**
   - No longer authenticated
   - Cannot access protected routes

## Common Vulnerabilities & Mitigations

### 1. Session Hijacking

**Attack**: Attacker steals session cookie

**Mitigations**:
- httpOnly cookies (can't be read by JavaScript)
- Secure flag (HTTPS only)
- SameSite=Lax (limits cross-site requests)
- Session expiration (30 days max)
- IP address validation (future)
- User agent validation (future)

### 2. CSRF (Cross-Site Request Forgery)

**Attack**: Malicious site tricks user into making authenticated request

**Mitigations**:
- CSRF token on all state-changing requests
- SameSite cookie attribute
- Origin header validation
- Referer header validation

### 3. XSS (Cross-Site Scripting)

**Attack**: Inject malicious script to steal cookies

**Mitigations**:
- httpOnly cookies (JavaScript can't access)
- React auto-escaping of user content
- Content Security Policy (CSP) headers
- Input validation and sanitization

### 4. Open Redirect

**Attack**: Redirect user to malicious site after login

**Mitigations**:
- Validate redirect URLs against whitelist
- Only allow relative URLs
- No user-controlled redirects

### 5. OAuth Token Leakage

**Attack**: Tokens exposed in logs, URLs, or client-side

**Mitigations**:
- Never log tokens
- Tokens never in URLs
- Tokens never sent to client
- Tokens encrypted in database

## Security Monitoring

### Alerts

Set up alerts for:
- Multiple failed login attempts from same IP
- Unusual login locations
- Session token validation failures
- OAuth errors
- Database connection errors

### Audit Logging

Log securely (without sensitive data):
- Successful logins (user ID, timestamp, IP)
- Failed login attempts (IP, timestamp, reason)
- Logouts
- Session expirations
- Password changes (future)
- 2FA events (future)

### Metrics

Track:
- Login success rate
- Login failure rate
- Average session duration
- Sessions per user
- OAuth error rate

## Testing Security

### Manual Testing

- [ ] Cannot access `/dashboard` without authentication
- [ ] Session persists across page refreshes
- [ ] Session expires after 30 days
- [ ] Logout clears session
- [ ] Cannot steal session cookie with JavaScript
- [ ] CSRF token prevents cross-site requests
- [ ] OAuth redirect URI validation works

### Automated Testing

```typescript
// __tests__/security/auth.test.ts

describe('Authentication Security', () => {
  it('rejects requests without CSRF token', async () => {
    const res = await fetch('/api/auth/signout', {
      method: 'POST',
      // No CSRF token
    });
    expect(res.status).toBe(403);
  });

  it('rejects expired sessions', async () => {
    // Create session with past expiration
    // Attempt to use session
    // Should be rejected
  });

  it('httpOnly cookies cannot be read by JavaScript', () => {
    // Verify document.cookie doesn't contain session
  });
});
```

## Compliance

### GDPR

- Users can delete their account (and all data)
- Users can export their data
- Minimal data collection
- Clear privacy policy
- Consent for data processing

### CCPA

- Users can request data deletion
- Users can opt-out of data sale (we don't sell data)
- Privacy policy clearly states data use

## Future Enhancements

1. **Email Verification**: Verify email addresses on signup
2. **2FA**: Two-factor authentication with TOTP
3. **Account Recovery**: Reset access if locked out
4. **Session Management**: View and revoke active sessions
5. **Login Notifications**: Email on new device login
6. **IP Whitelisting**: Restrict login to known IPs (enterprise)
7. **SSO**: SAML/OIDC for enterprise customers

## Resources

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [NextAuth.js Security](https://next-auth.js.org/configuration/options#security)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)

---

**Last Updated**: 2025-11-12
**Owner**: Security Team
**Review Cycle**: Quarterly
