# Phase 1 Specification: User Authentication

**Status**: Draft
**Priority**: P0 (Critical)
**Estimate**: 5 days
**Dependencies**: None
**Assigned**: Full Stack Developer

## Overview
Implement secure user authentication using Google OAuth 2.0, allowing users to sign up and log in to the AI Calendar Agent platform.

## Problem Statement
Users need a way to create accounts and securely access the application. We want a frictionless onboarding experience that leverages existing Google accounts to minimize friction and increase conversion.

## Goals
1. Users can sign up with Google in < 2 minutes
2. Authentication is secure and follows OAuth 2.0 best practices
3. Session management is robust
4. User data is properly stored and protected

## User Stories

### US-1: Sign Up with Google
**As a** new user
**I want to** sign up using my Google account
**So that** I can quickly create an account without remembering another password

**Acceptance Criteria**:
- [ ] "Sign up with Google" button visible on homepage
- [ ] Clicking button initiates Google OAuth flow
- [ ] User is redirected to Google consent screen
- [ ] After consent, user is redirected back to app
- [ ] User account is created in database
- [ ] User is logged in automatically
- [ ] User is redirected to onboarding flow
- [ ] Process takes < 2 minutes end-to-end

### US-2: Sign In with Google
**As a** returning user
**I want to** sign in with my Google account
**So that** I can access my calendar and tasks

**Acceptance Criteria**:
- [ ] "Sign in with Google" button visible on sign-in page
- [ ] Clicking button initiates Google OAuth flow
- [ ] User authenticates with Google
- [ ] User is logged in automatically
- [ ] User is redirected to dashboard
- [ ] Session persists across browser refreshes

### US-3: Sign Out
**As a** logged-in user
**I want to** sign out of the application
**So that** I can secure my account on shared devices

**Acceptance Criteria**:
- [ ] "Sign out" button visible in navigation menu
- [ ] Clicking button logs user out
- [ ] Session is terminated
- [ ] User is redirected to homepage
- [ ] User cannot access protected pages after sign out

### US-4: Protected Routes
**As a** system
**I want to** protect authenticated routes
**So that** only logged-in users can access them

**Acceptance Criteria**:
- [ ] Unauthenticated users cannot access `/dashboard`
- [ ] Unauthenticated users cannot access `/settings`
- [ ] Unauthenticated users redirected to `/auth/signin`
- [ ] After sign in, users redirected to originally requested page

## Functional Requirements

### Must Have
- [ ] Google OAuth 2.0 integration
- [ ] User database schema (User, Account, Session models)
- [ ] Secure session management
- [ ] Protected route middleware
- [ ] Sign in page
- [ ] Sign out functionality
- [ ] Error handling for auth failures

### Should Have
- [ ] "Remember me" functionality
- [ ] Session timeout after 30 days inactivity
- [ ] Email verification (nice-to-have for v1)
- [ ] Loading states during OAuth flow

### Nice to Have
- [ ] Microsoft OAuth (Outlook) - Phase 2
- [ ] Magic link authentication
- [ ] 2FA support

## Non-Functional Requirements

### Security
- OAuth 2.0 compliance
- HTTPS only (enforced by Vercel)
- Secure session cookies (httpOnly, secure, sameSite)
- CSRF protection
- No sensitive data in client-side storage
- Secrets stored in environment variables only

### Performance
- Sign-in flow completes in < 5 seconds
- Session check < 100ms
- Database queries optimized

### Scalability
- Support 10,000 concurrent users
- Session store can handle growth

### Compliance
- GDPR compliant (user can delete account)
- Store minimal user data
- Clear privacy policy

## Technical Specifications

### Tech Stack
- **Auth Library**: NextAuth.js v5 (Auth.js)
- **OAuth Provider**: Google
- **Database**: PostgreSQL via Prisma
- **Session Storage**: Database (Prisma adapter)

### Database Schema

```prisma
// prisma/schema.prisma

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

  @@index([email])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### API Routes

#### GET/POST /api/auth/[...nextauth]
NextAuth.js catch-all route for authentication

**Configuration**:
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Frontend Components

#### Sign In Page
**Location**: `app/auth/signin/page.tsx`

**Features**:
- Google sign-in button
- Loading state during OAuth flow
- Error messages
- Link to privacy policy

**UI Requirements**:
- Centered card layout
- Shadcn UI Button component
- Google logo icon
- "Sign in with Google" text
- Professional, clean design

#### Protected Route Wrapper
**Location**: `components/auth/ProtectedRoute.tsx`

**Features**:
- Checks authentication status
- Redirects unauthenticated users
- Shows loading state during check

### Middleware
**Location**: `middleware.ts`

**Purpose**: Protect routes that require authentication

```typescript
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      // Protect dashboard routes
      if (req.nextUrl.pathname.startsWith('/dashboard')) {
        return !!token;
      }
      // Protect settings routes
      if (req.nextUrl.pathname.startsWith('/settings')) {
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

### Environment Variables

```env
# .env.example

# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

## User Flows

### Flow 1: First-Time Sign Up
1. User visits homepage
2. User clicks "Join Beta" or "Try for Free"
3. User redirected to `/auth/signin`
4. User clicks "Sign in with Google"
5. System redirects to Google OAuth consent screen
6. User logs in to Google (if not already)
7. User grants permissions (email, profile)
8. Google redirects back to app with auth code
9. NextAuth exchanges code for tokens
10. System creates user in database
11. System creates session
12. User redirected to `/onboarding` (Phase 1.2)

### Flow 2: Returning User Sign In
1. User visits homepage or app
2. User clicks "Sign In"
3. User redirected to `/auth/signin`
4. User clicks "Sign in with Google"
5. System redirects to Google OAuth
6. Google recognizes user (instant if already logged in to Google)
7. Google redirects back to app
8. System validates session
9. User redirected to `/dashboard`

### Flow 3: Sign Out
1. User clicks profile menu in navbar
2. User clicks "Sign Out"
3. System terminates session
4. System clears cookies
5. User redirected to homepage
6. Success toast: "You've been signed out"

## Edge Cases & Error Handling

### OAuth Failures
**Scenario**: Google OAuth fails or user denies consent
**Handling**:
- Show error message: "Sign in cancelled or failed"
- Provide "Try again" button
- Log error to Sentry

### Network Failures
**Scenario**: Network error during OAuth flow
**Handling**:
- Show error message: "Network error. Please try again."
- Retry button
- Don't lose user's place

### Account Already Exists
**Scenario**: User signs up with Google, but email already exists
**Handling**:
- NextAuth handles this automatically
- User is signed in to existing account
- Show message: "Welcome back!"

### Session Expiration
**Scenario**: User's session expires while using app
**Handling**:
- Middleware detects expired session
- Redirect to sign-in page
- Show message: "Your session has expired. Please sign in again."
- After sign-in, redirect back to where they were

## Design Specifications

### Sign In Page Design
- Clean, centered card (max-width: 400px)
- White card on gradient background (blue → violet)
- Logo at top
- Heading: "Welcome to AI Calendar Agent"
- Subheading: "Sign in to start planning your day"
- Google button (full width, with Google logo)
- Footer text: "By signing in, you agree to our Privacy Policy"
- Responsive on mobile

### Components Needed
- `GoogleSignInButton.tsx` - Custom button with Google branding
- `AuthCard.tsx` - Wrapper card for auth pages
- `AuthError.tsx` - Error message component

### Shadcn Components Used
- Button
- Card, CardHeader, CardContent
- Input (for future email forms)

## Testing Plan

### Unit Tests
```typescript
// __tests__/lib/auth.test.ts
describe('Authentication', () => {
  it('creates user on first sign in', async () => {
    // Test user creation
  });

  it('retrieves existing user on subsequent sign in', async () => {
    // Test user retrieval
  });

  it('handles OAuth errors gracefully', async () => {
    // Test error handling
  });
});
```

### Integration Tests
```typescript
// __tests__/api/auth.test.ts
describe('Auth API', () => {
  it('POST /api/auth/callback/google creates session', async () => {
    // Test OAuth callback
  });

  it('GET /api/auth/session returns user data', async () => {
    // Test session endpoint
  });
});
```

### E2E Tests
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can sign in with Google', async ({ page }) => {
  await page.goto('/auth/signin');
  await page.click('text=Sign in with Google');
  // Note: E2E OAuth is tricky, consider mocking or test accounts
  await expect(page).toHaveURL('/dashboard');
});

test('unauthenticated user redirected from protected route', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/auth\/signin/);
});
```

### Manual Testing Checklist
- [ ] Sign up with new Google account
- [ ] Sign in with existing Google account
- [ ] Sign out and confirm session terminated
- [ ] Try accessing `/dashboard` without authentication
- [ ] Try accessing `/dashboard` with authentication
- [ ] Deny OAuth consent and see error
- [ ] Test on mobile device
- [ ] Test on different browsers (Chrome, Firefox, Safari)

## Security Checklist
- [ ] NEXTAUTH_SECRET is strong random value
- [ ] Google OAuth credentials not committed to Git
- [ ] Cookies are httpOnly, secure, sameSite=lax
- [ ] CSRF protection enabled
- [ ] No user tokens stored in localStorage
- [ ] Sessions expire after 30 days
- [ ] Rate limiting on auth endpoints (future)

## Rollout Plan

### Phase 1.1: Development
- Set up NextAuth.js
- Configure Google OAuth
- Create database schema
- Implement sign-in page
- Add protected routes middleware

### Phase 1.2: Testing
- Write and run unit tests
- Write and run integration tests
- Manual testing on staging
- Security review

### Phase 1.3: Deployment
- Deploy to staging environment
- Beta test with 10 users
- Monitor errors and performance
- Fix critical issues
- Deploy to production

### Phase 1.4: Monitoring
- Track authentication success rate
- Monitor error rates
- Measure sign-in duration
- Collect user feedback

## Success Metrics

### KPIs
- **Sign-up conversion**: 70% of visitors who start sign-up complete it
- **Sign-in success rate**: 99% of sign-in attempts succeed
- **Sign-in duration**: < 5 seconds average
- **Error rate**: < 1% of authentication attempts fail
- **Session stability**: < 0.1% unexpected sign-outs

### Analytics to Track
- Number of sign-ups per day
- Sign-in method distribution (100% Google for now)
- Time to complete sign-in
- Error frequency and types
- Browser/device breakdown

## Dependencies

### External Services
- **Google Cloud Console**: OAuth credentials
- **Vercel**: Hosting and environment variables
- **Supabase/Railway**: PostgreSQL database

### Environment Setup Required
1. Create Google Cloud project
2. Configure OAuth consent screen
3. Generate OAuth credentials
4. Add credentials to Vercel environment variables
5. Set up production database

## Documentation Required
- [ ] README section on authentication
- [ ] Environment variables documentation
- [ ] How to set up Google OAuth (for developers)
- [ ] Privacy policy
- [ ] Terms of service

## Open Questions
- [ ] Should we support multiple OAuth providers in Phase 1? **Decision: No, Google only. Microsoft in Phase 2.**
- [ ] Do we need email verification? **Decision: Not required for v1, nice-to-have.**
- [ ] Session duration: 30 days or configurable? **Decision: 30 days fixed for v1.**

## Timeline

### Week 1 (Days 1-2)
- Set up NextAuth.js
- Configure Google OAuth
- Create database schema
- Run migrations

### Week 1 (Days 3-4)
- Implement sign-in page UI
- Create protected route middleware
- Add sign-out functionality

### Week 1 (Day 5)
- Testing
- Bug fixes
- Code review
- Deploy to staging

### Week 2
- Beta testing
- Monitoring
- Production deployment

## Notes from PM
- This is the foundation for the entire app - get it right
- Security is non-negotiable - follow all best practices
- User experience should be frictionless
- Document everything for future developers
- Consider privacy implications of Google OAuth

## References
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Prisma Adapter](https://authjs.dev/getting-started/adapters/prisma)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Spec Version**: 1.0
**Last Updated**: 2025-11-12
**Status**: Ready for Review
**Next**: UX/UI to design sign-in page
