# Credentials & Environment Setup Checklist

> **Team Resource** | Collect these credentials for project setup
> **Owner**: DevOps Engineer / Tech Lead
> **Last Updated**: 2025-11-14
> **Status**: 🟡 In Progress

---

## Overview

This document tracks all external services, API keys, OAuth credentials, and environment variables required for the AI Calendar Agent project. Use this checklist to ensure all team members have the necessary access and credentials are properly configured.

**Critical**: ALL credentials must be stored securely and NEVER committed to version control.

---

## Credential Collection Status

| Service | Priority | Status | Owner | Notes |
|---------|----------|--------|-------|-------|
| Supabase | 🔴 Critical | ⬜ Pending | DevOps | Database & Auth |
| Google OAuth | 🔴 Critical | ⬜ Pending | Tech Lead | Authentication & Calendar |
| Upstash Redis | 🟡 High | ⬜ Pending | DevOps | Caching & Rate Limiting |
| Inngest | 🟡 High | ⬜ Pending | DevOps | Background Jobs |
| Resend | 🟡 High | ⬜ Pending | Backend Lead | Email Service |
| Sentry | 🟡 High | ⬜ Pending | DevOps | Error Tracking |
| Pusher | 🟢 Medium | ⬜ Pending | DevOps | Real-time WebSocket |
| OpenAI | 🟢 Medium | ⬜ Pending | ML Engineer | AI Scheduling (Sprint 5+) |
| Vercel | 🟢 Medium | ⬜ Pending | DevOps | Deployment Platform |
| Stripe | 🔵 Low | ⬜ Future | Product | Payments (PI 2) |

**Legend**: ⬜ Pending | 🟡 In Progress | ✅ Complete

---

## 1. Database (Supabase)

### Priority: 🔴 CRITICAL (Sprint 1)

### Service Details
- **Provider**: Supabase (PostgreSQL)
- **Purpose**: Primary database, authentication backend
- **Setup URL**: https://supabase.com/dashboard
- **Documentation**: https://supabase.com/docs

### Required Credentials

#### Database Connection
```bash
# Supabase PostgreSQL Connection String
DATABASE_URL="postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection (for migrations)
DIRECT_URL="postgresql://postgres.[PROJECT_ID]:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres"
```

**Where to Find**:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Settings → Database → Connection string
4. Copy both "Pooler" (DATABASE_URL) and "Direct" (DIRECT_URL) strings

#### Supabase API Keys
```bash
# Public anon key (safe to expose in client)
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Service role key (SECRET - server-side only!)
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Where to Find**:
1. Settings → API
2. Copy "Project URL" → NEXT_PUBLIC_SUPABASE_URL
3. Copy "anon public" key → NEXT_PUBLIC_SUPABASE_ANON_KEY
4. Copy "service_role" key → SUPABASE_SERVICE_ROLE_KEY (NEVER expose this!)

### Setup Steps
1. [ ] Create Supabase account (use company email)
2. [ ] Create new project: "ai-calendar-agent-prod"
3. [ ] Note the auto-generated database password (save to password manager)
4. [ ] Copy DATABASE_URL and DIRECT_URL
5. [ ] Copy API keys (anon + service_role)
6. [ ] Add all values to team password manager
7. [ ] Share with team via secure channel (NOT Slack/Email)

### Security Checklist
- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Set up database backups (automatic in Supabase)
- [ ] Enable 2FA on Supabase account
- [ ] Restrict database access to team IPs only (Production)
- [ ] Never use service_role key in client code

---

## 2. Authentication (Google OAuth)

### Priority: 🔴 CRITICAL (Sprint 1)

### Service Details
- **Provider**: Google Cloud Platform
- **Purpose**: User authentication via Google OAuth, Google Calendar API access
- **Setup URL**: https://console.cloud.google.com/
- **Documentation**: https://developers.google.com/identity/protocols/oauth2

### Required Credentials

```bash
# Google OAuth (for NextAuth.js)
GOOGLE_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abcdefghijklmnop"

# Google Calendar API (same credentials)
GOOGLE_CALENDAR_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
GOOGLE_CALENDAR_CLIENT_SECRET="GOCSPX-abcdefghijklmnop"
GOOGLE_CALENDAR_REDIRECT_URI="https://yourdomain.com/api/calendar/google/callback"

# NextAuth Configuration
NEXTAUTH_SECRET="[GENERATE_WITH_OPENSSL]"
NEXTAUTH_URL="https://yourdomain.com"  # or http://localhost:3000 for dev
```

### Setup Steps

#### Step 1: Create Google Cloud Project
1. [ ] Go to https://console.cloud.google.com/
2. [ ] Create new project: "AI Calendar Agent"
3. [ ] Enable billing (required for OAuth)

#### Step 2: Enable APIs
1. [ ] Go to "APIs & Services" → "Library"
2. [ ] Search and enable:
   - [ ] "Google Calendar API"
   - [ ] "Google+ API" (for profile info)
   - [ ] "People API" (for user data)

#### Step 3: Configure OAuth Consent Screen
1. [ ] Go to "APIs & Services" → "OAuth consent screen"
2. [ ] Choose "External" (for public users)
3. [ ] Fill in:
   - App name: "AI Calendar Agent"
   - User support email: [your-team-email]
   - Developer contact: [your-team-email]
4. [ ] Add scopes:
   - `openid`
   - `profile`
   - `email`
   - `https://www.googleapis.com/auth/calendar` (read/write calendar)
   - `https://www.googleapis.com/auth/calendar.events` (calendar events)
5. [ ] Add test users (your team emails)
6. [ ] Submit for verification (once ready for production)

#### Step 4: Create OAuth Credentials
1. [ ] Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
2. [ ] Application type: "Web application"
3. [ ] Name: "AI Calendar Agent - Production"
4. [ ] Authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
   - `https://yourdomain.vercel.app` (Vercel preview)
5. [ ] Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`
   - `http://localhost:3000/api/calendar/google/callback`
   - `https://yourdomain.com/api/calendar/google/callback`
6. [ ] Click "Create"
7. [ ] Copy Client ID and Client Secret

#### Step 5: Generate NextAuth Secret
```bash
# Run this command to generate a secure secret
openssl rand -base64 32
```
1. [ ] Run the command above
2. [ ] Copy output to NEXTAUTH_SECRET

### Where to Find Credentials
- **Google Cloud Console**: https://console.cloud.google.com/
- **Navigate to**: APIs & Services → Credentials
- **Client ID**: Shows directly in credentials list
- **Client Secret**: Click on credential name → Copy secret

### Security Checklist
- [ ] Enable 2FA on Google Cloud account
- [ ] Restrict OAuth to specific domains only
- [ ] Add only necessary OAuth scopes
- [ ] Rotate client secrets every 90 days
- [ ] Monitor OAuth usage in Google Cloud Console
- [ ] Never commit GOOGLE_CLIENT_SECRET to git
- [ ] Use different credentials for dev/staging/prod

### Important Notes
- **Development**: Use `http://localhost:3000` for testing
- **Production**: Update all URLs to your actual domain
- **Verification**: Google OAuth consent screen needs verification for >100 users
- **Rate Limits**: 10,000 requests/day (Calendar API) - request increase if needed

---

## 3. Email Service (Resend)

### Priority: 🟡 HIGH (Sprint 2)

### Service Details
- **Provider**: Resend
- **Purpose**: Transactional emails (welcome, verification, notifications, password reset)
- **Setup URL**: https://resend.com/
- **Documentation**: https://resend.com/docs

### Required Credentials

```bash
# Resend API
RESEND_API_KEY="re_123456789_ABCDEFGHabcdefgh"

# From email (must be verified domain)
RESEND_FROM_EMAIL="noreply@yourdomain.com"
RESEND_FROM_NAME="AI Calendar Agent"

# Optional: Different emails for different purposes
RESEND_SUPPORT_EMAIL="support@yourdomain.com"
RESEND_NOTIFICATIONS_EMAIL="notifications@yourdomain.com"
```

### Setup Steps
1. [ ] Sign up at https://resend.com/
2. [ ] Verify your sending domain:
   - [ ] Go to Domains → Add Domain
   - [ ] Add your domain (e.g., yourdomain.com)
   - [ ] Add DNS records (SPF, DKIM, DMARC) to your DNS provider
   - [ ] Wait for verification (usually 5-10 minutes)
3. [ ] Create API Key:
   - [ ] Go to API Keys → Create API Key
   - [ ] Name: "AI Calendar Agent - Production"
   - [ ] Copy the key (only shown once!)
4. [ ] Test email sending:
   ```bash
   curl -X POST 'https://api.resend.com/emails' \
     -H 'Authorization: Bearer YOUR_API_KEY' \
     -H 'Content-Type: application/json' \
     -d '{"from": "noreply@yourdomain.com", "to": "test@example.com", "subject": "Test", "html": "<p>Test</p>"}'
   ```

### Where to Find Credentials
- **Dashboard**: https://resend.com/api-keys
- **API Key**: Copy from API Keys page (create new if lost)

### Security Checklist
- [ ] Use separate API keys for dev/staging/prod
- [ ] Enable 2FA on Resend account
- [ ] Set up SPF/DKIM/DMARC on your domain
- [ ] Monitor email sending limits (100 emails/day free tier)
- [ ] Rotate API keys every 90 days

### Free Tier Limits
- 100 emails/day
- 3,000 emails/month
- 1 verified domain

**Upgrade needed when**: >100 daily active users sending emails

---

## 4. Caching & Rate Limiting (Upstash Redis)

### Priority: 🟡 HIGH (Sprint 1)

### Service Details
- **Provider**: Upstash (Serverless Redis)
- **Purpose**: Caching, rate limiting, session storage
- **Setup URL**: https://console.upstash.com/
- **Documentation**: https://docs.upstash.com/redis

### Required Credentials

```bash
# Upstash Redis
UPSTASH_REDIS_REST_URL="https://[REGION]-[ID].upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXXXAbcdefghijklmnopqrstuvwxyz1234567890"
```

### Setup Steps
1. [ ] Sign up at https://console.upstash.com/
2. [ ] Create new Redis database:
   - [ ] Name: "ai-calendar-agent-prod"
   - [ ] Region: Choose closest to your primary users (e.g., us-east-1)
   - [ ] Type: "Regional" (better performance) or "Global" (multi-region)
   - [ ] Eviction: "allkeys-lru" (recommended for caching)
3. [ ] Copy credentials:
   - [ ] UPSTASH_REDIS_REST_URL (on database details page)
   - [ ] UPSTASH_REDIS_REST_TOKEN (on database details page)
4. [ ] Test connection:
   ```bash
   curl https://[REGION]-[ID].upstash.io/set/test/hello \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Where to Find Credentials
- **Dashboard**: https://console.upstash.com/redis/[DATABASE_ID]
- **REST API** section shows both URL and Token

### Security Checklist
- [ ] Enable TLS (automatically enabled in Upstash)
- [ ] Rotate tokens every 90 days
- [ ] Use separate databases for dev/staging/prod
- [ ] Monitor memory usage (10MB free tier)
- [ ] Set appropriate eviction policy

### Free Tier Limits
- 10,000 commands/day
- 10 MB storage
- 1 database

**Upgrade needed when**: >10K requests/day or >10MB cache

---

## 5. Background Jobs (Inngest)

### Priority: 🟡 HIGH (Sprint 1)

### Service Details
- **Provider**: Inngest
- **Purpose**: Background job processing (calendar sync, email sending, AI scheduling)
- **Setup URL**: https://app.inngest.com/
- **Documentation**: https://www.inngest.com/docs

### Required Credentials

```bash
# Inngest
INNGEST_EVENT_KEY="[GENERATED_KEY]"
INNGEST_SIGNING_KEY="signkey-prod-[GENERATED]"

# Environment
INNGEST_ENV="production"  # or "development" for local
```

### Setup Steps
1. [ ] Sign up at https://app.inngest.com/
2. [ ] Create new app: "AI Calendar Agent"
3. [ ] Get Event Key:
   - [ ] Go to Settings → Event Keys
   - [ ] Copy the default event key or create new one
4. [ ] Get Signing Key:
   - [ ] Go to Settings → Signing Keys
   - [ ] Click "Create Signing Key"
   - [ ] Name: "Production"
   - [ ] Copy the key (only shown once!)
5. [ ] Configure webhook endpoint:
   - [ ] Add: `https://yourdomain.com/api/inngest`
   - [ ] Test connection

### Where to Find Credentials
- **Event Key**: Settings → Event Keys
- **Signing Key**: Settings → Signing Keys (create new if lost)

### Security Checklist
- [ ] Use different signing keys for dev/staging/prod
- [ ] Enable webhook signature verification
- [ ] Rotate signing keys every 90 days
- [ ] Monitor job failure rates
- [ ] Set up alerting for failed jobs

### Free Tier Limits
- 10,000 function runs/month
- 100,000 steps/month

**Upgrade needed when**: >10K background jobs/month

---

## 6. Error Tracking (Sentry)

### Priority: 🟡 HIGH (Sprint 1)

### Service Details
- **Provider**: Sentry
- **Purpose**: Error tracking, performance monitoring, debugging
- **Setup URL**: https://sentry.io/
- **Documentation**: https://docs.sentry.io/

### Required Credentials

```bash
# Sentry
SENTRY_DSN="https://abc123def456@o123456.ingest.sentry.io/7654321"
NEXT_PUBLIC_SENTRY_DSN="https://abc123def456@o123456.ingest.sentry.io/7654321"

# Auth token (for source maps upload)
SENTRY_AUTH_TOKEN="sntrys_AbCdEf123456..."

# Organization & Project
SENTRY_ORG="your-org-slug"
SENTRY_PROJECT="ai-calendar-agent"
```

### Setup Steps
1. [ ] Sign up at https://sentry.io/
2. [ ] Create new organization (if needed)
3. [ ] Create new project:
   - [ ] Platform: "Next.js"
   - [ ] Name: "ai-calendar-agent"
   - [ ] Alert frequency: "On every new issue"
4. [ ] Copy DSN:
   - [ ] Go to Settings → Projects → ai-calendar-agent → Client Keys (DSN)
   - [ ] Copy DSN value
5. [ ] Create Auth Token:
   - [ ] Go to Settings → Account → API → Auth Tokens
   - [ ] Create new token with scopes: `project:releases` and `org:read`
   - [ ] Copy token (only shown once!)
6. [ ] Configure PII filtering:
   - [ ] Settings → Security & Privacy
   - [ ] Enable "Data Scrubbing" to remove sensitive data

### Where to Find Credentials
- **DSN**: Project Settings → Client Keys (DSN)
- **Auth Token**: Account Settings → API → Auth Tokens
- **Org Slug**: Your organization URL (`sentry.io/organizations/[ORG_SLUG]/`)

### Security Checklist
- [ ] Enable PII data scrubbing
- [ ] Filter sensitive fields (email, passwords, tokens)
- [ ] Use different projects for dev/staging/prod
- [ ] Set up issue ownership and alerts
- [ ] Rotate auth tokens every 90 days
- [ ] Enable IP allowlist (if possible)

### Free Tier Limits
- 5,000 errors/month
- 10,000 performance transactions/month
- 1 project

**Upgrade needed when**: >5K errors/month or multiple projects

---

## 7. Real-time WebSocket (Pusher)

### Priority: 🟢 MEDIUM (Sprint 2)

### Service Details
- **Provider**: Pusher
- **Purpose**: Real-time WebSocket connections (live updates, notifications)
- **Setup URL**: https://dashboard.pusher.com/
- **Documentation**: https://pusher.com/docs

### Required Credentials

```bash
# Pusher
PUSHER_APP_ID="1234567"
PUSHER_KEY="abcdef123456789"
PUSHER_SECRET="abcdef123456789secret"
PUSHER_CLUSTER="us2"  # or eu, ap3, etc.

# Client-side (safe to expose)
NEXT_PUBLIC_PUSHER_KEY="abcdef123456789"
NEXT_PUBLIC_PUSHER_CLUSTER="us2"
```

### Setup Steps
1. [ ] Sign up at https://dashboard.pusher.com/
2. [ ] Create new app:
   - [ ] Name: "AI Calendar Agent"
   - [ ] Cluster: Choose closest to users (us2, eu, ap3)
   - [ ] Tech stack: "Web" → "React"
3. [ ] Copy App Keys:
   - [ ] Go to App Keys tab
   - [ ] Copy: app_id, key, secret, cluster
4. [ ] Configure settings:
   - [ ] Enable "Client events" (for user-to-user messages)
   - [ ] Enable "Encrypted channels" (for private data)

### Where to Find Credentials
- **Dashboard**: https://dashboard.pusher.com/apps/[APP_ID]
- **App Keys tab** shows all credentials

### Security Checklist
- [ ] Enable private/presence channels only (no public channels for sensitive data)
- [ ] Implement server-side authentication for channels
- [ ] Use encrypted channels for PII
- [ ] Monitor connection limits
- [ ] Rotate secrets every 90 days

### Free Tier Limits
- 200,000 messages/day
- 100 concurrent connections
- Unlimited channels

**Upgrade needed when**: >100 concurrent users or >200K messages/day

---

## 8. AI Service (OpenAI)

### Priority: 🟢 MEDIUM (Sprint 5 - PI 1)

### Service Details
- **Provider**: OpenAI
- **Purpose**: AI scheduling algorithm, intelligent task planning
- **Setup URL**: https://platform.openai.com/
- **Documentation**: https://platform.openai.com/docs

### Required Credentials

```bash
# OpenAI
OPENAI_API_KEY="sk-proj-abcdefghijklmnopqrstuvwxyz123456789"

# Model configuration
OPENAI_MODEL="gpt-4-turbo"  # or gpt-4, gpt-3.5-turbo
OPENAI_MAX_TOKENS="2000"
OPENAI_TEMPERATURE="0.7"
```

### Setup Steps
1. [ ] Sign up at https://platform.openai.com/
2. [ ] Add billing information (required for API access)
3. [ ] Create API key:
   - [ ] Go to API Keys
   - [ ] Create new secret key
   - [ ] Name: "AI Calendar Agent - Production"
   - [ ] Copy key (only shown once!)
4. [ ] Set usage limits:
   - [ ] Go to Billing → Usage limits
   - [ ] Set monthly budget (e.g., $100/month)
   - [ ] Enable email alerts at 50%, 75%, 90%

### Where to Find Credentials
- **API Keys**: https://platform.openai.com/api-keys
- **Create new key if lost** (old keys cannot be recovered)

### Security Checklist
- [ ] Set usage limits to prevent runaway costs
- [ ] Enable usage alerts
- [ ] Use different API keys for dev/staging/prod
- [ ] Monitor token usage daily
- [ ] Rotate API keys every 90 days
- [ ] Never expose API key in client code

### Cost Estimates (GPT-4-Turbo)
- **Input**: $10 per 1M tokens
- **Output**: $30 per 1M tokens
- **Estimated**: ~$0.10 per AI scheduling operation (2K tokens)
- **Budget**: $100/month = ~1,000 AI operations

**Monitor closely**: AI costs can scale quickly with usage

---

## 9. Deployment Platform (Vercel)

### Priority: 🟢 MEDIUM (Sprint 1)

### Service Details
- **Provider**: Vercel
- **Purpose**: Hosting, deployment, CI/CD
- **Setup URL**: https://vercel.com/
- **Documentation**: https://vercel.com/docs

### Required Credentials

```bash
# Vercel (automatically set by platform)
VERCEL="1"
VERCEL_ENV="production"
VERCEL_URL="ai-calendar-agent.vercel.app"

# Optional: Vercel API Token (for CLI deployments)
VERCEL_TOKEN="[GENERATED_TOKEN]"
```

### Setup Steps
1. [ ] Sign up at https://vercel.com/ (use GitHub account)
2. [ ] Connect GitHub repository:
   - [ ] Import project
   - [ ] Select: `your-org/ai-calendar-agent`
   - [ ] Framework: Next.js (auto-detected)
3. [ ] Configure environment variables:
   - [ ] Go to Project Settings → Environment Variables
   - [ ] Add ALL variables from this checklist (see below)
   - [ ] Separate: Production, Preview, Development
4. [ ] Configure domains:
   - [ ] Add custom domain (e.g., app.yourdomain.com)
   - [ ] Update DNS records as instructed
5. [ ] Enable Vercel Analytics (optional):
   - [ ] Analytics → Enable
   - [ ] Speed Insights → Enable

### Environment Variables to Add in Vercel
Copy these from previous sections to Vercel:
- [ ] DATABASE_URL
- [ ] DIRECT_URL
- [ ] NEXTAUTH_SECRET
- [ ] NEXTAUTH_URL
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET
- [ ] UPSTASH_REDIS_REST_URL
- [ ] UPSTASH_REDIS_REST_TOKEN
- [ ] INNGEST_EVENT_KEY
- [ ] INNGEST_SIGNING_KEY
- [ ] RESEND_API_KEY
- [ ] RESEND_FROM_EMAIL
- [ ] SENTRY_DSN
- [ ] SENTRY_AUTH_TOKEN
- [ ] PUSHER_APP_ID
- [ ] PUSHER_KEY
- [ ] PUSHER_SECRET
- [ ] PUSHER_CLUSTER
- [ ] NEXT_PUBLIC_PUSHER_KEY
- [ ] NEXT_PUBLIC_PUSHER_CLUSTER
- [ ] OPENAI_API_KEY (when ready)

### Security Checklist
- [ ] Use different environment variable values for Production vs Preview
- [ ] Enable "Deployment Protection" for production
- [ ] Set up custom domain with SSL (automatic)
- [ ] Enable preview deployments only for team members
- [ ] Review security headers

### Free Tier Limits
- Unlimited deployments
- 100 GB bandwidth/month
- 6,000 build minutes/month

**Upgrade needed when**: >100GB bandwidth or need advanced features

---

## 10. Payment Processing (Stripe)

### Priority: 🔵 LOW (PI 2 - Sprint 7-8)

### Service Details
- **Provider**: Stripe
- **Purpose**: Subscription billing, payment processing
- **Setup URL**: https://dashboard.stripe.com/
- **Documentation**: https://stripe.com/docs

### Required Credentials

```bash
# Stripe
STRIPE_SECRET_KEY="sk_live_[PRODUCTION_KEY]"  # sk_test_[TEST_KEY] for testing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_[PRODUCTION_KEY]"
STRIPE_WEBHOOK_SECRET="whsec_[WEBHOOK_SECRET]"

# Price IDs (from Stripe dashboard)
STRIPE_PRICE_ID_FREE="price_free"
STRIPE_PRICE_ID_PRO="price_1Abc..."
STRIPE_PRICE_ID_TEAM="price_1Def..."
```

### Setup Steps (Do Later in PI 2)
1. [ ] Sign up at https://dashboard.stripe.com/
2. [ ] Complete account verification (required for live mode)
3. [ ] Create products:
   - [ ] Free Plan ($0/month)
   - [ ] Pro Plan ($12/month)
   - [ ] Team Plan ($24/user/month)
4. [ ] Set up webhook endpoint:
   - [ ] Webhooks → Add endpoint
   - [ ] URL: `https://yourdomain.com/api/webhooks/stripe`
   - [ ] Events: `customer.subscription.*`, `invoice.*`, `payment_intent.*`
5. [ ] Copy credentials:
   - [ ] API Keys → Copy secret key and publishable key
   - [ ] Webhooks → Copy webhook signing secret

### Security Checklist
- [ ] Use test mode until ready for production
- [ ] Never expose secret key in client
- [ ] Verify webhook signatures
- [ ] Use Stripe Radar for fraud prevention
- [ ] Enable 2FA on Stripe account
- [ ] Rotate API keys every 90 days

### Not Needed Until
- Sprint 7-8 (PI 2) - Billing & Subscriptions feature

---

## Quick Setup Guide

### For New Team Members

#### 1. Get Access
Ask team lead for access to:
- [ ] GitHub repository
- [ ] Team password manager (1Password, LastPass, etc.)
- [ ] Vercel team
- [ ] Sentry organization

#### 2. Local Development Setup
```bash
# Clone repo
git clone https://github.com/your-org/ai-calendar-agent.git
cd ai-calendar-agent

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Get credentials from team password manager
# Add to .env file (ask DevOps Engineer)

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

#### 3. Verify Setup
```bash
# Test infrastructure
curl http://localhost:3000/api/health

# Should return: {"status": "healthy", ...}
```

---

## Environment Variable Template

Copy this to your `.env` file and fill in the values:

```bash
# ============================================
# DATABASE (Supabase)
# ============================================
DATABASE_URL="[ASK_DEVOPS]"
DIRECT_URL="[ASK_DEVOPS]"

# ============================================
# AUTHENTICATION (Google OAuth + NextAuth)
# ============================================
NEXTAUTH_SECRET="[GENERATE: openssl rand -base64 32]"
NEXTAUTH_URL="http://localhost:3000"  # Update for production
GOOGLE_CLIENT_ID="[ASK_TECH_LEAD]"
GOOGLE_CLIENT_SECRET="[ASK_TECH_LEAD]"

# ============================================
# CACHING & RATE LIMITING (Upstash Redis)
# ============================================
UPSTASH_REDIS_REST_URL="[ASK_DEVOPS]"
UPSTASH_REDIS_REST_TOKEN="[ASK_DEVOPS]"

# ============================================
# BACKGROUND JOBS (Inngest)
# ============================================
INNGEST_EVENT_KEY="[ASK_DEVOPS]"
INNGEST_SIGNING_KEY="[ASK_DEVOPS]"
INNGEST_ENV="development"

# ============================================
# EMAIL (Resend)
# ============================================
RESEND_API_KEY="[ASK_BACKEND_LEAD]"
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# ============================================
# ERROR TRACKING (Sentry)
# ============================================
SENTRY_DSN="[ASK_DEVOPS]"
NEXT_PUBLIC_SENTRY_DSN="[ASK_DEVOPS]"
SENTRY_AUTH_TOKEN="[ASK_DEVOPS]"
SENTRY_ORG="[ASK_DEVOPS]"
SENTRY_PROJECT="ai-calendar-agent"

# ============================================
# REAL-TIME (Pusher)
# ============================================
PUSHER_APP_ID="[ASK_DEVOPS]"
PUSHER_KEY="[ASK_DEVOPS]"
PUSHER_SECRET="[ASK_DEVOPS]"
PUSHER_CLUSTER="us2"
NEXT_PUBLIC_PUSHER_KEY="[ASK_DEVOPS]"
NEXT_PUBLIC_PUSHER_CLUSTER="us2"

# ============================================
# AI (OpenAI) - Sprint 5+
# ============================================
# OPENAI_API_KEY="[ASK_ML_ENGINEER]"
# OPENAI_MODEL="gpt-4-turbo"

# ============================================
# APPLICATION SETTINGS
# ============================================
NODE_ENV="development"
APP_NAME="AI Calendar Agent"
APP_URL="http://localhost:3000"
```

---

## Security Best Practices

### DO ✅
- Store all credentials in team password manager
- Use different credentials for dev/staging/prod
- Enable 2FA on all service accounts
- Rotate secrets every 90 days
- Use environment variables (never hardcode)
- Audit access logs monthly
- Set up usage alerts and budgets
- Use least-privilege access (only give permissions needed)

### DON'T ❌
- Never commit `.env` to git (already in `.gitignore`)
- Never share credentials in Slack, email, or chat
- Never use production credentials in development
- Never expose secret keys in client-side code
- Never share service accounts (each person gets their own)
- Never skip 2FA setup
- Never ignore security alerts

---

## Troubleshooting

### "Database connection failed"
1. Check DATABASE_URL format is correct
2. Verify Supabase project is not paused (free tier auto-pauses)
3. Check IP allowlist settings in Supabase
4. Test connection: `npm run db:studio`

### "Google OAuth redirect_uri_mismatch"
1. Verify NEXTAUTH_URL matches exactly (including http/https)
2. Check authorized redirect URIs in Google Cloud Console
3. Ensure no trailing slashes in URLs
4. Clear browser cookies and try again

### "Redis connection timeout"
1. Check Upstash Redis is active (not deleted)
2. Verify UPSTASH_REDIS_REST_URL format
3. Test with curl: `curl [URL]/ping -H "Authorization: Bearer [TOKEN]"`
4. Check rate limits (free tier: 10K commands/day)

### "Inngest events not processing"
1. Verify webhook endpoint is publicly accessible
2. Check INNGEST_SIGNING_KEY is correct
3. Look at Inngest dashboard → Events for errors
4. Ensure `/api/inngest` route exists

---

## Credential Rotation Schedule

| Service | Frequency | Next Rotation | Owner |
|---------|-----------|---------------|-------|
| Database passwords | 90 days | [DATE] | DevOps |
| OAuth secrets | 90 days | [DATE] | Tech Lead |
| API keys (all) | 90 days | [DATE] | DevOps |
| NEXTAUTH_SECRET | 90 days | [DATE] | Backend Lead |
| Sentry auth token | 90 days | [DATE] | DevOps |
| Stripe webhook secret | 90 days | [DATE] | Backend Lead |

**Calendar Reminder**: Set up recurring calendar event for credential rotation every 90 days.

---

## Contact Information

### Who to Ask for What

| Credential Type | Contact Person | Backup |
|----------------|----------------|--------|
| Database (Supabase) | DevOps Engineer | Tech Lead |
| Google OAuth | Tech Lead | Backend Lead |
| Email (Resend) | Backend Lead | DevOps Engineer |
| All infrastructure | DevOps Engineer | Tech Lead |
| AI/OpenAI | ML Engineer | Backend Lead |
| Payments (Stripe) | Product Manager | Backend Lead |
| Emergency access | Tech Lead | Engineering Manager |

### Support Channels
- **Slack**: #engineering-setup
- **Emergency**: [emergency-contact-email]
- **Documentation**: `/home/user/fantastic-octo/SETUP.md`

---

## Checklist Summary

### Sprint 1 (Critical - Week 1)
- [ ] Supabase setup complete
- [ ] Google OAuth configured
- [ ] Upstash Redis active
- [ ] Inngest configured
- [ ] Sentry tracking enabled
- [ ] All credentials in password manager
- [ ] Team has .env files
- [ ] Vercel deployment working

### Sprint 2 (High Priority - Week 2-3)
- [ ] Resend email configured
- [ ] Pusher WebSocket setup
- [ ] Email templates tested
- [ ] Real-time features working

### PI 1 Later (Medium Priority)
- [ ] OpenAI API setup
- [ ] AI scheduling tested
- [ ] Usage monitoring enabled

### PI 2 (Low Priority - Future)
- [ ] Stripe account verified
- [ ] Payment flows implemented
- [ ] Subscription plans created

---

**Last Updated**: 2025-11-14
**Maintained By**: DevOps Engineer
**Questions**: Contact Tech Lead or #engineering-setup on Slack
