# AI Calendar Agent - Infrastructure Setup Guide

Complete step-by-step guide for setting up all infrastructure services for Sprint 1.

**Estimated Time**: 4-6 hours
**Last Updated**: November 2025
**Target Team**: DevOps Engineers, Full-Stack Developers

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Service Setup](#service-setup)
   - [Database (Supabase/PostgreSQL)](#1-database-supabasepostgresql)
   - [Authentication (Google OAuth)](#2-authentication-google-oauth)
   - [Caching & Rate Limiting (Upstash Redis)](#3-caching--rate-limiting-upstash-redis)
   - [Background Jobs (Inngest)](#4-background-jobs-inngest)
   - [Real-time (Pusher)](#5-real-time-pusher)
   - [Monitoring (Sentry)](#6-monitoring-sentry)
   - [Deployment (Vercel)](#7-deployment-vercel)
4. [Testing Infrastructure](#testing-infrastructure)
5. [Troubleshooting](#troubleshooting)
6. [Security Checklist](#security-checklist)
7. [Production Deployment](#production-deployment)

---

## Prerequisites

Before starting, ensure you have:

- **Node.js 20+** ([Download](https://nodejs.org/))
- **npm or yarn** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **A code editor** (VS Code recommended)
- **Credit card** for service sign-ups (most have free tiers)

### System Requirements

- **OS**: macOS, Linux, or Windows (WSL recommended)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space

---

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd fantastic-octo

# Run automated setup script
./scripts/setup-infrastructure.sh

# Or manual setup:
npm install
cp .env.example .env
npm run db:generate
```

### 2. Configure Environment

Edit `.env` file with your credentials (see detailed steps below).

### 3. Start Development

```bash
# Push database schema
npm run db:push

# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

---

## Service Setup

### 1. Database (Supabase/PostgreSQL)

**What it's for**: Primary data storage for users, tasks, calendars, schedules.

#### Option A: Supabase (Recommended)

**Free Tier**: 500MB database, 50,000 monthly active users

1. **Create Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up with GitHub/Google

2. **Create Project**
   - Click "New Project"
   - Name: `ai-calendar-agent-dev`
   - Region: Choose closest to your users
   - Database Password: Generate strong password (save it!)

3. **Get Connection String**
   - Go to: Project Settings → Database
   - Copy "Connection string" (Transaction mode)
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`

4. **Configure Environment**
   ```bash
   # Add to .env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"
   ```

5. **Push Schema**
   ```bash
   npm run db:push
   ```

6. **Verify in Supabase**
   - Go to: Table Editor
   - You should see: users, workspaces, accounts, sessions, etc.

#### Option B: Local PostgreSQL

**For offline development**

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql@16
   brew services start postgresql@16

   # Ubuntu
   sudo apt install postgresql-16
   sudo systemctl start postgresql

   # Windows: Download from postgresql.org
   ```

2. **Create Database**
   ```bash
   createdb ai_calendar_agent
   ```

3. **Configure Environment**
   ```bash
   # Add to .env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_calendar_agent"
   DIRECT_URL="postgresql://postgres:password@localhost:5432/ai_calendar_agent"
   ```

#### Database Commands

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (for dev)
npm run db:push

# Create migration (for production)
npm run db:migrate

# Open Prisma Studio (GUI)
npm run db:studio
```

**Status**: ✅ Complete when you can run `npm run db:studio` successfully

---

### 2. Authentication (Google OAuth)

**What it's for**: User sign-in with Google accounts.

#### Step 1: Google Cloud Console Setup

1. **Go to**: [console.cloud.google.com](https://console.cloud.google.com)

2. **Create Project**
   - Click "Select a project" → "New Project"
   - Name: `AI Calendar Agent`
   - Click "Create"

3. **Enable APIs**
   - Go to: "APIs & Services" → "Library"
   - Enable:
     - Google Calendar API
     - Google People API (for profile info)

4. **Create OAuth Consent Screen**
   - Go to: "APIs & Services" → "OAuth consent screen"
   - User Type: **External** (or Internal if Google Workspace)
   - App name: `AI Calendar Agent`
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
   - Scopes: Add these scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `.../auth/calendar.readonly`
     - `.../auth/calendar.events`
   - Save and Continue

5. **Create OAuth Client ID**
   - Go to: "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: `AI Calendar Agent Web Client`
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://yourdomain.com/api/auth/callback/google`
   - Click "Create"

6. **Copy Credentials**
   - Copy the Client ID and Client Secret

#### Step 2: Environment Configuration

```bash
# Add to .env
GOOGLE_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-secret-here"

# Calendar API (same as above)
GOOGLE_CALENDAR_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com"
GOOGLE_CALENDAR_CLIENT_SECRET="GOCSPX-your-secret-here"
GOOGLE_CALENDAR_REDIRECT_URI="http://localhost:3000/api/calendar/google/callback"
```

#### Step 3: NextAuth.js Configuration

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Add to .env
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

#### Step 4: Test Authentication

1. Start dev server: `npm run dev`
2. Visit: `http://localhost:3000/api/auth/signin`
3. Click "Sign in with Google"
4. You should be redirected to Google login

**Status**: ✅ Complete when you can sign in with Google successfully

---

### 3. Caching & Rate Limiting (Upstash Redis)

**What it's for**: Fast caching, rate limiting, session storage.

#### Step 1: Create Upstash Database

1. **Sign up**: [console.upstash.com](https://console.upstash.com)

2. **Create Database**
   - Click "Create Database"
   - Name: `ai-calendar-agent-dev`
   - Type: **Regional** (cheaper for dev)
   - Region: Choose closest to your app
   - TLS: ✅ Enabled (always)
   - Eviction: **No eviction** (or LRU if needed)

3. **Get Credentials**
   - Go to database details
   - Copy:
     - REST URL: `https://xxx.upstash.io`
     - REST Token: `AXXXaaaBBBccc...`

#### Step 2: Environment Configuration

```bash
# Add to .env
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token-here"
```

#### Step 3: Test Connection

```bash
# In Node.js console or create test script
node -e "
const { redis } = require('./lib/infrastructure/cache');
redis.set('test', 'hello').then(() => {
  return redis.get('test');
}).then(result => {
  console.log('Redis test:', result);
});
"
```

#### Rate Limiting Configuration

```bash
# Add to .env (optional, has defaults)
RATE_LIMIT_PUBLIC="100"           # requests per minute for unauthenticated
RATE_LIMIT_AUTHENTICATED="1000"   # requests per minute for authenticated
RATE_LIMIT_AUTH_ENDPOINTS="5"     # requests per minute for auth endpoints
```

**Status**: ✅ Complete when test connection succeeds

---

### 4. Background Jobs (Inngest)

**What it's for**: Async processing (calendar sync, email, AI scheduling).

#### Step 1: Create Inngest Account

1. **Sign up**: [app.inngest.com](https://app.inngest.com)

2. **Create App**
   - Click "Create App"
   - Name: `AI Calendar Agent`
   - Environment: `development`

3. **Get Keys**
   - Go to: Settings → Keys
   - Copy:
     - Event Key: `inngest_event_key_...`
     - Signing Key: `signkey_prod_...` (or dev)

#### Step 2: Environment Configuration

```bash
# Add to .env
INNGEST_EVENT_KEY="inngest_event_key_xxx"
INNGEST_SIGNING_KEY="signkey_prod_xxx"
INNGEST_ENV="development"
```

#### Step 3: Create Inngest API Route

Create `/app/api/inngest/route.ts`:

```typescript
import { serve } from 'inngest/next';
import { inngest } from '@/lib/infrastructure';

// Import your Inngest functions here
// import { calendarSyncFunction } from '@/lib/jobs/calendar-sync';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // calendarSyncFunction,
    // Add your functions here
  ],
});
```

#### Step 4: Test Job

```bash
# Send test event
node -e "
const { sendEvent } = require('./lib/infrastructure/jobs');
sendEvent('test/connection', { timestamp: new Date().toISOString() })
  .then(() => console.log('Job sent!'));
"
```

**Status**: ✅ Complete when you see events in Inngest dashboard

---

### 5. Real-time (Pusher)

**What it's for**: Live updates (calendar sync, task changes, notifications).

#### Step 1: Create Pusher Account

1. **Sign up**: [dashboard.pusher.com](https://dashboard.pusher.com)

2. **Create Channel**
   - Click "Create app"
   - Name: `ai-calendar-agent-dev`
   - Cluster: Choose closest (e.g., `us2`, `eu`)
   - Frontend: **React**
   - Backend: **Node.js**

3. **Get Credentials**
   - Go to: App Keys
   - Copy:
     - app_id
     - key
     - secret
     - cluster

#### Step 2: Environment Configuration

```bash
# Add to .env
PUSHER_APP_ID="1234567"
PUSHER_KEY="abc123def456"
PUSHER_SECRET="xyz789secret"
PUSHER_CLUSTER="us2"

# Client-side keys (safe to expose)
NEXT_PUBLIC_PUSHER_KEY="abc123def456"
NEXT_PUBLIC_PUSHER_CLUSTER="us2"
```

#### Step 3: Create Pusher Auth Route

Create `/app/api/pusher/auth/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { authenticateChannel } from '@/lib/infrastructure/realtime';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.formData();
  const socketId = data.get('socket_id') as string;
  const channel = data.get('channel_name') as string;

  try {
    const auth = authenticateChannel(socketId, channel, session.user.id);
    return NextResponse.json(auth);
  } catch (error) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
}
```

#### Step 4: Test Real-time

```bash
# Send test event
node -e "
const { triggerEvent } = require('./lib/infrastructure/realtime');
triggerEvent('test-channel', 'test-event', { message: 'Hello!' })
  .then(() => console.log('Event sent!'));
"
```

**Status**: ✅ Complete when events appear in Pusher debug console

---

### 6. Monitoring (Sentry)

**What it's for**: Error tracking, performance monitoring, debugging.

#### Step 1: Create Sentry Account

1. **Sign up**: [sentry.io](https://sentry.io)

2. **Create Project**
   - Platform: **Next.js**
   - Project name: `ai-calendar-agent`
   - Alert frequency: **On every new issue**

3. **Get DSN**
   - Copy the DSN: `https://xxx@yyy.ingest.sentry.io/zzz`

4. **Create Auth Token**
   - Go to: Settings → Account → API → Auth Tokens
   - Click "Create New Token"
   - Scopes: `project:releases`, `org:read`
   - Copy token

#### Step 2: Environment Configuration

```bash
# Add to .env
SENTRY_DSN="https://xxx@yyy.ingest.sentry.io/zzz"
NEXT_PUBLIC_SENTRY_DSN="https://xxx@yyy.ingest.sentry.io/zzz"
SENTRY_AUTH_TOKEN="your-auth-token"
SENTRY_ORG="your-org-slug"
SENTRY_PROJECT="ai-calendar-agent"
```

#### Step 3: Create Sentry Config Files

Create `sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
});
```

Create `sentry.server.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
});
```

Create `sentry.edge.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
});
```

#### Step 4: Test Error Tracking

```bash
# Trigger test error
node -e "
const { captureMessage } = require('./lib/infrastructure/monitoring');
captureMessage('Test error from setup', 'info');
console.log('Test error sent to Sentry');
"
```

**Status**: ✅ Complete when error appears in Sentry dashboard

---

### 7. Deployment (Vercel)

**What it's for**: Hosting, CI/CD, automatic deployments.

#### Step 1: Create Vercel Account

1. **Sign up**: [vercel.com](https://vercel.com)
2. Sign up with GitHub

#### Step 2: Connect Repository

1. **Import Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Framework: **Next.js** (auto-detected)
   - Root Directory: `./`

2. **Configure Environment Variables**
   - Add all variables from `.env` file
   - Mark sensitive variables as "Secret"
   - Create separate environments:
     - Production
     - Preview
     - Development

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - You'll get a URL: `https://your-project.vercel.app`

#### Step 3: Custom Domain (Optional)

1. **Add Domain**
   - Go to: Project Settings → Domains
   - Add your domain
   - Update DNS records as instructed

#### Step 4: Enable Analytics

```bash
# Automatically enabled on Vercel
# View at: https://vercel.com/yourname/project/analytics
```

**Status**: ✅ Complete when you can access your deployed app

---

## Testing Infrastructure

### Automated Test Script

Create `scripts/test-infrastructure.ts`:

```typescript
import { testAllConnections } from '@/lib/infrastructure';

async function main() {
  console.log('🔍 Testing all infrastructure connections...\n');
  const results = await testAllConnections();

  const failed = Object.entries(results)
    .filter(([_, success]) => !success)
    .map(([service]) => service);

  if (failed.length > 0) {
    console.error(`\n❌ Failed services: ${failed.join(', ')}`);
    process.exit(1);
  }

  console.log('\n✅ All infrastructure services connected!');
}

main();
```

Run tests:

```bash
npm run dev
# Then in another terminal:
curl http://localhost:3000/api/health
```

### Manual Tests

#### Database
```bash
npm run db:studio
# Should open Prisma Studio at http://localhost:5555
```

#### Redis
```bash
# In node console
const { redis } = require('./lib/infrastructure');
redis.set('test', 'value').then(() => redis.get('test')).then(console.log);
```

#### Pusher
```bash
# Check Pusher Debug Console
# Send test event and watch it appear
```

#### Sentry
```bash
# Trigger error and check Sentry dashboard
```

---

## Troubleshooting

### Database Connection Issues

**Problem**: `Can't reach database server`

**Solutions**:
- Check DATABASE_URL format
- Verify password doesn't contain special characters (encode with `%XX`)
- For Supabase: Use connection pooling URL with `?pgbouncer=true`
- Check firewall/network settings

### Authentication Not Working

**Problem**: OAuth redirect fails

**Solutions**:
- Verify redirect URI exactly matches Google Console
- Check NEXTAUTH_URL matches your domain
- Ensure NEXTAUTH_SECRET is set and 32+ characters
- Clear browser cookies and try again

### Redis Connection Fails

**Problem**: `ECONNREFUSED` or timeout

**Solutions**:
- Check UPSTASH_REDIS_REST_URL format (must start with `https://`)
- Verify token is correct
- Check Upstash dashboard for database status
- Ensure TLS is enabled

### Pusher Events Not Received

**Problem**: Client doesn't receive events

**Solutions**:
- Check NEXT_PUBLIC_PUSHER_KEY is set (with `NEXT_PUBLIC_` prefix)
- Verify cluster matches (us2, eu, etc.)
- Check Pusher dashboard for connection status
- Ensure auth endpoint `/api/pusher/auth` exists

### Inngest Jobs Not Running

**Problem**: Events sent but functions don't execute

**Solutions**:
- Check Inngest dev server is running: `npx inngest-cli dev`
- Verify INNGEST_EVENT_KEY and SIGNING_KEY
- Check functions are registered in `/api/inngest/route.ts`
- Look for errors in Inngest dashboard

---

## Security Checklist

### Before Production

- [ ] All `.env` secrets are unique (not from `.env.example`)
- [ ] `NEXTAUTH_SECRET` is 32+ random characters
- [ ] Database password is strong (16+ chars, mixed case, numbers, symbols)
- [ ] 2FA enabled on all service accounts (Supabase, Google, Upstash, etc.)
- [ ] OAuth redirect URIs are production URLs only
- [ ] Sentry PII filtering is enabled
- [ ] Rate limiting is configured and tested
- [ ] API routes have authentication checks
- [ ] Environment variables are in Vercel (not `.env` in repo)
- [ ] `.env` is in `.gitignore` (never commit secrets!)

### Secret Rotation Schedule

- **NEXTAUTH_SECRET**: Every 90 days
- **Database Password**: Every 180 days
- **API Keys**: Every 90 days
- **OAuth Secrets**: Annually or after breach

---

## Production Deployment

### Pre-deployment Checklist

- [ ] All tests passing
- [ ] Database migrations applied
- [ ] Environment variables set in Vercel
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Error tracking enabled (Sentry)
- [ ] Analytics enabled (Vercel)
- [ ] Rate limiting tested
- [ ] Backup strategy in place

### Deployment Steps

1. **Merge to Main Branch**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

2. **Vercel Auto-deploys**
   - Watch deployment at: `https://vercel.com/yourname/project`
   - Check deployment logs for errors

3. **Run Production Database Migrations**
   ```bash
   # Connect to production database
   DATABASE_URL="your-production-url" npm run db:migrate
   ```

4. **Verify Production**
   - Visit production URL
   - Test user sign-in
   - Check Sentry for errors
   - Monitor performance

5. **Post-deployment**
   - Monitor error rates in Sentry
   - Check performance metrics in Vercel
   - Test critical user flows
   - Announce deployment to team

### Rollback Plan

If deployment fails:

```bash
# Revert to previous deployment in Vercel dashboard
# Or redeploy previous commit
git revert HEAD
git push origin main
```

---

## Support & Resources

### Documentation
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- NextAuth.js: https://next-auth.js.org/
- Upstash: https://upstash.com/docs/redis
- Inngest: https://www.inngest.com/docs
- Pusher: https://pusher.com/docs
- Sentry: https://docs.sentry.io/

### Community
- Discord: (Add project Discord link)
- GitHub Issues: (Add repo link)
- Team Slack: (Add Slack invite)

### Need Help?
- Email: support@yourdomain.com
- Slack: #devops channel
- GitHub: Open an issue

---

**Last Updated**: November 2025
**Maintained By**: DevOps Team
**Version**: 1.0 (Sprint 1)
