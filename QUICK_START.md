# Quick Start Checklist

**Goal**: Get the AI Calendar Agent infrastructure running in under 30 minutes.

---

## Prerequisites Check

```bash
# Check Node.js (need 20+)
node --version

# Check npm
npm --version

# Check Git (optional)
git --version
```

✅ All installed? Continue below.

---

## Step 1: Install Dependencies (2 min)

```bash
cd /home/user/fantastic-octo
npm install
```

---

## Step 2: Environment Setup (15 min)

### 2.1 Create .env file

```bash
cp .env.example .env
```

### 2.2 Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output and add to `.env`:
```
NEXTAUTH_SECRET="<paste-the-output-here>"
NEXTAUTH_URL="http://localhost:3000"
```

### 2.3 Quick Setup (Minimal)

For a **quick test** with minimal services, add these to `.env`:

```bash
# Database (use local PostgreSQL or skip for now)
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_calendar_agent"

# Auth (required)
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"

# Skip other services for now - app will run without them
```

---

## Step 3: Database Setup (5 min)

### Option A: Quick (Development)

```bash
# Generate Prisma Client
npm run db:generate

# Push schema (if you have PostgreSQL running)
npm run db:push
```

### Option B: Skip for Now

If you don't have PostgreSQL:
- Comment out database imports in API routes
- Or set up Supabase (see SETUP.md)

---

## Step 4: Start Development Server (1 min)

```bash
npm run dev
```

Visit: http://localhost:3000

---

## Step 5: Verify Setup (5 min)

### Test Health Check

```bash
curl http://localhost:3000/api/health
```

Expected:
```json
{
  "status": "healthy",
  "services": {
    "database": { "status": "up", "latency": 15 },
    ...
  }
}
```

### Test in Browser

1. Open: http://localhost:3000
2. Should see the landing page
3. No errors in browser console

---

## ✅ Success!

If the dev server is running and the landing page loads, you're ready to start development!

---

## Next Steps

### For Full Setup (1-2 hours)

Follow the comprehensive guide:
```bash
./scripts/setup-infrastructure.sh
```

Or read: `SETUP.md`

### For Development

Start building features:
1. Create API routes in `/app/api`
2. Use infrastructure utilities from `/lib/infrastructure`
3. Add components in `/components`

---

## Common Issues

### Port 3000 Already in Use

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Database Connection Error

```bash
# Check PostgreSQL is running
# Or use Supabase (see SETUP.md)
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Documentation

- **Full Setup Guide**: `SETUP.md`
- **Infrastructure Report**: `INFRASTRUCTURE_REPORT.md`
- **Developer Docs**: `lib/infrastructure/README.md`
- **Summary**: `DEVOPS_SPRINT1_SUMMARY.md`

---

**Need Help?**

See `SETUP.md` → Troubleshooting section for detailed solutions.
