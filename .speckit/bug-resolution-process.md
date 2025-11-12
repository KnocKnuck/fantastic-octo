# AI Calendar Agent - Bug Resolution Process & Plan

> **Owner**: Engineering Manager + QA Lead
> **Team Size**: 40 people (20 engineering, 2 QA)
> **Product Stage**: Pre-beta (launching Q1 2026)
> **Last Updated**: 2025-11-12

---

## 📋 Table of Contents

1. [Bug Severity Levels](#-bug-severity-levels)
2. [Bug Triage Process](#-bug-triage-process)
3. [SLAs for Fixes](#-slas-for-fixes)
4. [Bug Sprint Allocation](#-bug-sprint-allocation)
5. [Hotfix Process](#-hotfix-process)
6. [Bug Tracking](#-bug-tracking)
7. [Bug Prevention](#-bug-prevention)
8. [Bug Metrics](#-bug-metrics)
9. [Bug Backlog Management](#-bug-backlog-management)
10. [Roles & Responsibilities](#-roles--responsibilities)

---

## 🚨 Bug Severity Levels

### P0 - Critical (Production Down)
**Definition**: Complete service outage or data loss affecting all or majority of users

**Examples**:
- Authentication service completely down (no one can log in)
- Database corruption or data loss
- Payment processing completely broken (no one can upgrade/subscribe)
- Calendar sync failing for 100% of users
- Security vulnerability actively being exploited
- Complete website/app crash (500 errors on all pages)
- API gateway down (all API calls failing)

**Impact**:
- Business-critical functionality unavailable
- Revenue directly impacted
- Security breach or data loss
- Affects >80% of users

**Response**: Immediate (24/7 on-call)

---

### P1 - High (Major Feature Broken)
**Definition**: Core feature completely broken for all users, or critical feature broken for significant subset

**Examples**:
- AI scheduling engine not generating schedules at all
- Google Calendar sync broken for all users
- Task creation failing for all users
- Payment processing failing for specific payment methods (e.g., all credit cards)
- Onboarding flow completely broken (new users can't complete signup)
- Email notifications not sending at all
- Critical UI bug preventing access to main features
- Calendar view showing incorrect data for all users

**Impact**:
- Core product functionality unavailable
- Major user experience degradation
- Affects 50-80% of users or critical user segment
- Workaround not readily available

**Response**: Within business hours, escalate immediately

---

### P2 - Medium (Minor Issue, Partial Breakage)
**Definition**: Feature partially broken, or minor feature completely broken, with reasonable workaround

**Examples**:
- AI scheduling sometimes produces suboptimal results (but still works)
- Calendar sync delayed (works but with 30+ minute lag)
- Task filters not working (but tasks still accessible)
- Specific browser compatibility issue (works in Chrome, broken in Safari)
- UI rendering issue on mobile devices
- Notification sent with incorrect formatting
- Search function returns incomplete results
- Export feature occasionally fails
- Integration with specific app (e.g., Todoist) intermittently failing

**Impact**:
- Partial functionality loss with workaround available
- Affects 10-50% of users
- Annoying but not blocking
- User can still accomplish their goal with extra steps

**Response**: Within 2 business days

---

### P3 - Low (Minor Bug, Cosmetic)
**Definition**: Small bug with minimal user impact, cosmetic issue, or edge case

**Examples**:
- Button text misaligned
- Tooltip text has typo
- Color scheme incorrect in specific context
- Animation stuttering occasionally
- Console warning messages (not causing functional issues)
- Footer links broken on help docs
- Spacing issues in UI
- Non-critical accessibility issue (color contrast slightly off)
- Empty state illustration not displaying

**Impact**:
- Minimal or no functional impact
- Affects <10% of users
- Polish and quality issues
- Easy workaround or ignorable

**Response**: Next sprint or next release

---

### P4 - Trivial (Nice-to-Fix)
**Definition**: Enhancement request masquerading as a bug, or extremely minor issue

**Examples**:
- "Button should be blue instead of green" (design preference)
- "Would be nice if..." feature requests
- Extremely rare edge case (affects 1-2 users per year)
- Performance improvement that's already acceptable
- Documentation typos

**Impact**:
- No functional impact
- Subjective improvement
- Extremely rare occurrence

**Response**: Backlog (fix when convenient, may close as "won't fix")

---

## 🔍 Bug Triage Process

### Triage Schedule
- **Daily Triage**: Every morning at 9:30 AM (30 minutes after standup)
- **Participants**: QA Lead, Engineering Manager, On-call Engineer, Support Engineer
- **Duration**: 15-30 minutes

### Triage Workflow

```
┌─────────────────────┐
│  Bug Reported       │
│  (Linear, Slack,    │
│   Customer Support) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Support Engineer   │
│  Initial Screening  │
│  (5 min)            │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │ Valid Bug?   │
    └──────┬───────┘
           │
      ┌────┴────┐
      │         │
    YES        NO
      │         │
      │         └─► Close as "Not a Bug" / "Feature Request"
      │
      ▼
┌─────────────────────┐
│  QA Lead Triage     │
│  - Reproduce        │
│  - Assign Severity  │
│  - Add Labels       │
│  - Assign to Squad  │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │ Severity?    │
    └──────┬───────┘
           │
      ┌────┴────┬────────┬────────┐
      │         │        │        │
     P0        P1       P2       P3/P4
      │         │        │        │
      │         │        │        │
      ▼         ▼        ▼        ▼
   Immediate  Same     Next     Backlog
   Escalation  Day    Sprint
```

### Triage Checklist

**For every bug, the QA Lead must:**

1. ✅ **Reproduce the bug** (or mark as "Cannot Reproduce")
2. ✅ **Assign severity** (P0, P1, P2, P3, P4)
3. ✅ **Add labels**:
   - Type: `bug`, `regression`, `security`, `data-loss`
   - Component: `auth`, `calendar`, `tasks`, `ai`, `admin`, `ui`, `api`
   - Environment: `production`, `staging`, `development`
   - Browser/Platform: `chrome`, `safari`, `firefox`, `mobile-ios`, `mobile-android`
4. ✅ **Assign to squad** (Alpha, Beta, Gamma, Delta, Epsilon, Zeta)
5. ✅ **Estimate effort** (Small: <4hrs, Medium: 1-2 days, Large: 3-5 days)
6. ✅ **Identify owner** (specific engineer or squad lead)
7. ✅ **Set due date** (based on SLA)
8. ✅ **Add to sprint** (or backlog)

### Severity Assignment Criteria

Use this decision tree:

```
Is production completely down or data being lost?
├─ YES → P0
└─ NO
    │
    Is a core feature completely broken for all users?
    ├─ YES → P1
    └─ NO
        │
        Is there partial functionality loss or affects many users?
        ├─ YES → P2
        └─ NO
            │
            Is it cosmetic, minor, or affects very few users?
            ├─ YES → P3
            └─ NO → P4
```

### Escalation Process

**P0 Escalation (Immediate)**:
1. QA Lead or Support Engineer identifies P0 bug
2. Immediately post to `#incidents` Slack channel
3. Page on-call engineer (PagerDuty)
4. Notify Engineering Manager, Tech Lead, Product Owner
5. Start incident response (see Hotfix Process below)

**P1 Escalation (Same Day)**:
1. QA Lead assigns P1 bug
2. Post to `#engineering` Slack channel
3. Notify squad lead and Engineering Manager
4. Squad lead assigns to engineer immediately
5. Engineer starts work within 2 hours

---

## ⏱️ SLAs for Fixes

### Response Time vs Fix Time

- **Response Time**: Time from bug reported to engineer assigned and investigation started
- **Fix Time**: Time from assignment to fix deployed to production

### SLA Table

| Severity | Response Time | Fix Time | Total Time |
|----------|---------------|----------|------------|
| **P0 - Critical** | Immediate (<15 min) | 2-4 hours | **< 4 hours** |
| **P1 - High** | Within 2 hours | 1-2 business days | **< 2 days** |
| **P2 - Medium** | Within 1 business day | 1-2 weeks | **< 2 weeks** |
| **P3 - Low** | Within 1 week | Next release (2-4 weeks) | **< 1 month** |
| **P4 - Trivial** | No SLA | Backlog (fix when convenient) | **No SLA** |

### SLA Exceptions

SLAs may be extended if:
- Fix requires significant architectural changes
- Waiting for external dependency (e.g., third-party API fix)
- Acceptable workaround available
- Bug only affects beta users (pre-launch)

**Process**: Engineering Manager must approve SLA extension in writing (Linear comment + Slack notification)

### SLA Tracking

**Tools**:
- Linear automation: Auto-calculate time to resolution
- Weekly SLA report: % of bugs meeting SLA by severity
- Escalate SLA misses to Engineering Manager

**Consequences of SLA Misses**:
- 1 P0 SLA miss: Post-mortem required
- 2 P1 SLA misses in a month: Review sprint capacity allocation
- 5+ P2 SLA misses: Review bug prevention process

---

## 📊 Bug Sprint Allocation

### Capacity Allocation by Sprint Phase

#### Pre-Beta (Now - Q1 2026)
**Focus**: Shipping features fast, building product

| Category | % Capacity | Notes |
|----------|-----------|-------|
| **New Features** | 70% | Shipping core product |
| **Bug Fixes** | 20% | Only P0, P1, critical P2 |
| **Tech Debt** | 10% | Critical issues only |

**Total Story Points**: 240/sprint (across 6 squads)
- Features: 168 points
- Bugs: 48 points
- Tech Debt: 24 points

---

#### Beta (Q1-Q2 2026)
**Focus**: Stability, user feedback, iterating

| Category | % Capacity | Notes |
|----------|-----------|-------|
| **New Features** | 60% | Still shipping, but slower |
| **Bug Fixes** | 30% | Fix all P0, P1, P2 bugs |
| **Tech Debt** | 10% | Paying down debt |

**Total Story Points**: 240/sprint
- Features: 144 points
- Bugs: 72 points
- Tech Debt: 24 points

---

#### Post-Launch (Q2+ 2026)
**Focus**: Sustainable velocity, quality, stability

| Category | % Capacity | Notes |
|----------|-----------|-------|
| **New Features** | 50% | Balanced approach |
| **Bug Fixes** | 30% | All severities addressed |
| **Tech Debt** | 20% | Invest in quality |

**Total Story Points**: 240/sprint
- Features: 120 points
- Bugs: 72 points
- Tech Debt: 48 points

---

### Bug Capacity per Squad

Each squad (6 squads total) has ~40 points/sprint capacity.

**Bug allocation per squad**:
- **Pre-Beta**: 8 points/sprint for bugs
- **Beta**: 12 points/sprint for bugs
- **Post-Launch**: 12 points/sprint for bugs

### Bug Backlog Size Targets

**Healthy backlog**:
- P0: 0 bugs (must be fixed immediately)
- P1: <5 bugs (fix within 2 days)
- P2: <20 bugs (fix within 2 weeks)
- P3: <50 bugs (fix next release)
- P4: <100 bugs (backlog, prune regularly)

**Unhealthy backlog** (triggers corrective action):
- P0: >0 for more than 4 hours
- P1: >10 bugs
- P2: >50 bugs
- P3: >100 bugs

**Corrective Actions**:
1. Increase bug sprint allocation by 10% (decrease feature allocation)
2. Run "bug bash" sprint (100% bugs, 0% features)
3. Re-evaluate quality processes (see Bug Prevention)

---

## 🚑 Hotfix Process

### When to Use Hotfix Process

Use hotfix process for:
- **P0 bugs**: Production completely down, data loss, security breach
- **Critical P1 bugs**: Major feature broken, revenue-impacting

Do NOT use hotfix process for:
- P2 or lower bugs (use normal sprint process)
- Feature requests (even if urgent)
- Non-critical bugs with workarounds

---

### Hotfix Workflow

```
┌─────────────────────┐
│  P0 Bug Detected    │
│  (Production)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  INCIDENT DECLARED  │
│  - Post #incidents  │
│  - Page on-call     │
│  - Notify leadership│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  War Room Created   │
│  - Slack huddle     │
│  - Zoom call        │
│  - Assign Incident  │
│    Commander        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Investigation      │
│  - Review logs      │
│  - Identify root    │
│    cause            │
│  - Estimate fix time│
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │ Can we       │
    │ rollback?    │
    └──────┬───────┘
           │
      ┌────┴────┐
      │         │
    YES        NO
      │         │
      │         └─► Continue to Fix Development
      │
      ▼
┌─────────────────────┐
│  Rollback Deploy    │
│  - Deploy previous  │
│    version          │
│  - Verify working   │
│  - Fix offline      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Fix Development    │
│  - Create hotfix    │
│    branch           │
│  - Write fix        │
│  - Add regression   │
│    test             │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Expedited Review   │
│  - Senior engineer  │
│    review (required)│
│  - QA smoke test    │
│  - Security check   │
│    (if applicable)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Hotfix Deploy      │
│  - Deploy to staging│
│  - Smoke test       │
│  - Deploy to prod   │
│  - Monitor closely  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Incident Resolved  │
│  - Update status    │
│  - Notify users     │
│  - Schedule post-   │
│    mortem           │
└─────────────────────┘
```

---

### Hotfix Git Workflow

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/fix-auth-service-down

# 2. Make fix and write regression test
# ... code changes ...

# 3. Commit with specific format
git commit -m "[HOTFIX] Fix auth service crash on invalid token

- Fixed null pointer exception in auth middleware
- Added null check and error handling
- Added regression test

Closes BUG-123 (P0)"

# 4. Push and create PR
git push origin hotfix/fix-auth-service-down

# 5. Get expedited review (required: 1 senior engineer)

# 6. Merge to main
git checkout main
git merge hotfix/fix-auth-service-down

# 7. Deploy to production immediately
# (via CI/CD pipeline or manual deploy)

# 8. Merge back to develop branch
git checkout develop
git merge main
```

---

### Hotfix Approval Authority

**Who can approve hotfixes?**

| Severity | Required Approvers | Notes |
|----------|-------------------|-------|
| **P0** | 1 Senior Engineer + Engineering Manager | EM can be bypassed if unavailable after 30 min |
| **P1** | 1 Senior Engineer | EM notification required |

**Bypass approval** only if:
- Production completely down
- Engineering Manager unreachable for 30+ minutes
- On-call engineer is a Senior Engineer

**Post-bypass requirement**: Notify EM within 1 hour of deploy

---

### Hotfix Communication

**During Incident**:
- Update `#incidents` Slack channel every 15 minutes
- Update status page (status.aicalendar.com) every 30 minutes
- Email affected customers if incident >1 hour

**Post-Incident**:
- Send incident resolution email (if users were notified)
- Post-mortem within 24 hours
- Share learnings in next all-hands

---

### Hotfix Deployment Process

**Pre-Deploy Checklist**:
- [ ] Fix reviewed by senior engineer
- [ ] Regression test added and passing
- [ ] Deployed to staging and smoke tested
- [ ] Rollback plan documented
- [ ] EM or Tech Lead notified

**Deploy Steps**:
1. Deploy to staging: `./scripts/deploy-staging.sh hotfix/branch-name`
2. Run smoke tests on staging
3. Deploy to production: `./scripts/deploy-production.sh hotfix/branch-name`
4. Monitor for 30 minutes:
   - Error rate in Sentry
   - API latency in Datadog
   - User login success rate
5. If errors spike: Rollback immediately
6. If stable: Close incident

**Rollback Process**:
```bash
# Rollback to previous version
./scripts/rollback-production.sh

# Or deploy specific version
./scripts/deploy-production.sh v1.2.3
```

---

### Post-Incident Post-Mortem

**Required for**: All P0 incidents, P1 incidents that took >4 hours to resolve

**Template**: See `.speckit/templates/incident-postmortem.md`

**Post-Mortem Agenda** (1 hour meeting within 24 hours):
1. **Timeline** (5 min): What happened when?
2. **Root Cause** (10 min): Why did it happen?
3. **Impact** (5 min): Who was affected? How bad?
4. **Resolution** (5 min): How did we fix it?
5. **What Went Well** (10 min): What did we do right?
6. **What Went Wrong** (10 min): What could we improve?
7. **Action Items** (15 min): What will we do to prevent this?

**Action Items Must Include**:
- Specific owner
- Due date
- Success criteria
- Link to Linear task

**Follow-Up**: Engineering Manager tracks action items to completion

---

## 🏷️ Bug Tracking

### Tools

**Primary**: Linear (https://linear.app)
- **Why**: Fast, keyboard-first, great for engineering teams
- **Workspace**: AI Calendar Agent
- **Projects**: One project per squad + "Bugs" project

**Secondary**:
- **GitHub Issues**: For open-source components only
- **Sentry**: Auto-creates issues for errors (syncs to Linear)
- **Customer Support**: Intercom (creates Linear issues via integration)

---

### Linear Workflow States

| State | Description | Who Moves | Next State |
|-------|-------------|-----------|------------|
| **Triage** | Newly reported, needs investigation | Support/QA | In Progress or Backlog |
| **Backlog** | Triaged, not in current sprint | QA Lead | To Do |
| **To Do** | In current sprint, not started | Scrum Master | In Progress |
| **In Progress** | Engineer actively working | Engineer | In Review |
| **In Review** | PR open, awaiting review | Engineer | QA Testing |
| **QA Testing** | QA verifying fix on staging | QA Engineer | Closed or In Progress |
| **Closed** | Verified fixed in production | QA Engineer | - |

**Abandoned States** (also terminal):
- **Duplicate**: Same as another issue
- **Won't Fix**: Out of scope or not actually a bug
- **Cannot Reproduce**: Unable to verify bug exists

---

### Linear Labels & Organization

#### Issue Type Labels (required)
- `bug` - Bug report
- `regression` - Broke something that worked before
- `security` - Security vulnerability
- `data-loss` - User data loss or corruption
- `tech-debt` - Technical debt masquerading as bug

#### Severity Labels (required)
- `p0-critical` - Production down
- `p1-high` - Major feature broken
- `p2-medium` - Minor issue
- `p3-low` - Cosmetic/minor
- `p4-trivial` - Nice-to-fix

#### Component Labels (required)
- `auth` - Authentication/authorization
- `calendar` - Calendar integration
- `tasks` - Task management
- `ai` - AI scheduling engine
- `admin` - Admin panel
- `ui` - Frontend/UI issues
- `api` - Backend API issues
- `integrations` - Third-party integrations
- `billing` - Payment/subscription
- `mobile` - Mobile app issues

#### Environment Labels
- `production` - Affects live users
- `staging` - Staging environment only
- `development` - Dev environment

#### Platform Labels
- `chrome`, `safari`, `firefox`, `edge`
- `mobile-ios`, `mobile-android`
- `desktop`, `tablet`

#### Squad Labels
- `squad-alpha`, `squad-beta`, `squad-gamma`, `squad-delta`, `squad-epsilon`, `squad-zeta`

---

### Bug Report Template

All bugs must include:

```markdown
## Bug Description
[Clear, concise description of the bug]

## Severity
[P0 / P1 / P2 / P3 / P4]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Screenshots/Videos
[If applicable, add screenshots or Loom video]

## Environment
- **Browser**: [e.g., Chrome 120]
- **OS**: [e.g., macOS 14.1]
- **Device**: [e.g., MacBook Pro, iPhone 15]
- **User Account**: [email or user ID if relevant]

## Additional Context
- **Error Message**: [from console or Sentry]
- **Sentry Link**: [if available]
- **First Seen**: [date/time]
- **Frequency**: [Always / Sometimes / Rarely]

## Possible Fix
[If you have suggestions]
```

---

### Sentry Integration

**Auto-Create Linear Issues for**:
- Errors affecting >10 users in 1 hour
- New error types (never seen before)
- Errors with >100 occurrences/hour

**Sentry → Linear Mapping**:
- Sentry error → Linear issue
- Auto-label: `bug`, `production`
- Auto-assign: To squad based on error source (e.g., auth errors → Squad Alpha)
- Auto-severity: Based on error frequency
  - >1000 users: P1
  - >100 users: P2
  - <100 users: P3

---

## 🛡️ Bug Prevention

> "An ounce of prevention is worth a pound of cure"

### Pre-Commit: Developer Responsibility

**Every engineer must**:
1. ✅ Write unit tests (target: 80% code coverage)
2. ✅ Run tests locally before committing (`npm test`)
3. ✅ Run linter and fix issues (`npm run lint`)
4. ✅ Test manually in local environment
5. ✅ Review own code before creating PR

---

### Code Review: Senior Engineer Responsibility

**Every PR must**:
1. ✅ Be reviewed by at least 1 other engineer
2. ✅ Pass all CI checks (tests, linting, build)
3. ✅ Include tests for new features/bug fixes
4. ✅ Update documentation if needed
5. ✅ No "LGTM" without actual review

**Code Review Checklist**:
- [ ] Does the code solve the problem?
- [ ] Are there any obvious bugs?
- [ ] Is the code readable and maintainable?
- [ ] Are there tests?
- [ ] Are there edge cases not covered?
- [ ] Does it follow our coding standards?
- [ ] Is it performant? (no N+1 queries, unnecessary loops)
- [ ] Are there security concerns? (SQL injection, XSS, etc.)

---

### CI/CD: Automated Checks

**GitHub Actions Pipeline** (must pass before merge):

1. **Linting** (`eslint`, `prettier`)
2. **Type Checking** (`tsc --noEmit`)
3. **Unit Tests** (`jest`)
4. **Integration Tests** (`jest` with DB)
5. **E2E Tests** (`playwright` - critical paths only)
6. **Build** (`next build`)
7. **Security Scan** (`npm audit`, `snyk`)
8. **Bundle Size Check** (fail if >20% increase)

**Pipeline Duration**: <10 minutes (optimize for speed)

---

### QA: Pre-Production Testing

**Manual Testing** (QA Engineer):
- **Smoke tests** (20 minutes): Test critical paths on staging
- **Regression tests** (1 hour): Test related features
- **Exploratory testing** (30 minutes): Break things creatively

**When to run**:
- Before every production deploy
- After every hotfix
- For every P1+ bug fix

**Staging Environment Requirements**:
- Mirrors production exactly (same DB, same services)
- Contains realistic test data
- Reset weekly to production snapshot

---

### E2E Test Automation

**Playwright Tests** (critical user paths):
1. User signup and onboarding
2. Google Calendar OAuth and sync
3. Task creation and editing
4. AI schedule generation
5. Payment flow (Stripe test mode)

**Test Pyramid**:
- **70% Unit Tests** (fast, cheap, many)
- **20% Integration Tests** (medium speed, medium cost)
- **10% E2E Tests** (slow, expensive, few)

**Run Frequency**:
- Unit tests: Every commit (local + CI)
- Integration tests: Every PR (CI)
- E2E tests: Every deploy to staging + nightly

---

### Feature Flags

**Use feature flags for**:
- New features (gradual rollout)
- Risky changes (easy rollback)
- A/B tests

**Flag Strategy**:
- **Development**: Flag ON for devs, OFF for users
- **Beta**: Flag ON for 10% of users
- **Launch**: Gradually increase to 100%
- **Cleanup**: Remove flag after 2 weeks of stability

**Tool**: LaunchDarkly or PostHog

---

### Production Monitoring

**Real-Time Alerts** (Datadog + Sentry):
- Error rate >1% → Alert #incidents
- API latency >2s p95 → Alert #incidents
- Login success rate <95% → Alert #incidents
- Payment success rate <90% → Alert #incidents
- Calendar sync failure rate >10% → Alert #incidents

**Dashboards** (Grafana):
- System health (uptime, latency, error rate)
- User activity (DAU, MAU, activation rate)
- Business metrics (MRR, conversion rate)

---

### Weekly Quality Review

**Every Friday** (30 minutes):
- Engineering Manager + QA Lead + Tech Lead
- Review:
  - Bugs created this week (count by severity)
  - Bugs resolved this week
  - SLA performance
  - Bug backlog size
  - Test coverage changes
  - Production incidents

**Output**: Action items if quality trends downward

---

### Bug Bash Events

**Frequency**: Once per quarter (or when bug backlog >100)

**Format**:
- **Duration**: 1 day (full team participation)
- **Goal**: Find and fix as many bugs as possible
- **Incentives**: Pizza, leaderboard, prizes for most bugs found/fixed
- **Rules**:
  - No new features
  - All bugs must be P2 or higher
  - Fixes must include regression test

**Preparation**:
1. Week before: All devs update local environments
2. Day before: QA Lead prepares "bug hunting guide"
3. Day of: Start with 30-min kickoff, end with 30-min retro

---

## 📈 Bug Metrics

### Key Metrics (Track Weekly)

#### 1. Bug Creation Rate
**Definition**: Number of new bugs reported per week

**Targets**:
- **Pre-Beta**: <10 bugs/week (small user base)
- **Beta**: 20-30 bugs/week (finding issues)
- **Post-Launch**: <15 bugs/week (stabilizing)

**Trend**: Should decrease over time as product stabilizes

---

#### 2. Bug Resolution Rate
**Definition**: Number of bugs closed per week

**Target**:
- Resolution rate ≥ Creation rate (don't let backlog grow)
- **Ideal**: Resolution rate 1.2x creation rate (reducing backlog)

---

#### 3. Mean Time to Resolution (MTTR)
**Definition**: Average time from bug reported to bug closed (in production)

**Targets by Severity**:
- **P0**: <4 hours
- **P1**: <2 days
- **P2**: <2 weeks
- **P3**: <1 month

**Calculation**:
```
MTTR = Sum(Resolution Time for All Bugs) / Total Bugs Closed
```

---

#### 4. Bug Escape Rate
**Definition**: % of bugs found in production vs caught in staging/testing

**Formula**:
```
Bug Escape Rate = (Bugs Found in Prod) / (Total Bugs Found) × 100%
```

**Targets**:
- **Pre-Beta**: <60% (acceptable, moving fast)
- **Beta**: <40% (improving processes)
- **Post-Launch**: <20% (high quality bar)

**Lower is better** (means we're catching bugs before users see them)

---

#### 5. Bug Backlog Size
**Definition**: Total number of open bugs at end of week

**Targets** (by severity):
- **P0**: 0 (always)
- **P1**: <5
- **P2**: <20
- **P3**: <50
- **P4**: <100

**Trend**: Should remain stable or decrease

---

#### 6. SLA Compliance Rate
**Definition**: % of bugs resolved within SLA

**Formula**:
```
SLA Compliance = (Bugs Resolved Within SLA) / (Total Bugs Resolved) × 100%
```

**Target**: >90% (by severity)

**Example**:
- 8 P1 bugs resolved this week
- 7 resolved within 2 days (within SLA)
- 1 resolved in 4 days (SLA miss)
- SLA Compliance = 7/8 = 87.5% ❌ (below target)

---

#### 7. Regression Rate
**Definition**: % of bug fixes that introduce new bugs

**Formula**:
```
Regression Rate = (Bugs Labeled "regression") / (Total Bugs) × 100%
```

**Target**: <10%

**If >10%**: Review code review process, add more tests

---

#### 8. Test Coverage
**Definition**: % of code covered by tests

**Targets**:
- **Unit test coverage**: >80%
- **Critical paths E2E coverage**: 100%

**Tools**: Jest coverage report, Codecov

---

### Metrics Dashboard

**Tool**: Metabase or Looker

**Dashboard URL**: https://metrics.aicalendar.com/bugs

**Sections**:

#### Overview
- Total open bugs (by severity)
- Bugs created this week
- Bugs resolved this week
- MTTR (average)
- SLA compliance %

#### Trends (Last 12 Weeks)
- Line chart: Bug creation vs resolution rate
- Line chart: Bug backlog size over time
- Line chart: MTTR by severity over time
- Line chart: Bug escape rate over time

#### Squad Performance
- Table: Bugs per squad (open, resolved this week, MTTR)
- Highlight: Squads missing SLAs

#### Bug Sources
- Pie chart: Bugs by component (auth, calendar, tasks, etc.)
- Pie chart: Bugs by source (customer support, QA, Sentry, internal)
- Pie chart: Bugs by environment (production, staging)

---

### Weekly Bug Report (Automated)

**Sent Every Monday** to `#engineering` Slack channel

**Template**:
```
📊 Weekly Bug Report (Week of Nov 5-11)

🐛 Bug Activity:
  • Created: 12 bugs (↓2 from last week)
  • Resolved: 15 bugs (↑3 from last week)
  • Backlog: 42 bugs (↓3 from last week) ✅

⏱️ Resolution Time:
  • P0: 3.2 hours avg (↓0.5h) ✅
  • P1: 1.8 days avg (↑0.3d) ⚠️
  • P2: 8.5 days avg (↓2d) ✅

🎯 SLA Compliance:
  • P0: 100% (2/2) ✅
  • P1: 83% (5/6) ⚠️ (1 SLA miss)
  • P2: 92% (11/12) ✅

📊 Bug Backlog by Severity:
  • P0: 0 ✅
  • P1: 3 ✅
  • P2: 18 ✅
  • P3: 21 ✅

🔥 Top Issues:
  1. BUG-245: Calendar sync failing for Outlook users (P1) - In Progress
  2. BUG-267: Task filters slow with >100 tasks (P2) - QA Testing
  3. BUG-289: Mobile UI broken on iOS 17 (P2) - In Review

🏆 Top Bug Fixers:
  1. @alice (7 bugs closed)
  2. @bob (5 bugs closed)
  3. @charlie (4 bugs closed)

Action Items:
  • 1 P1 SLA miss - Squad Beta to investigate (BUG-256)
  • Bug backlog healthy, keep up the pace!
```

---

## 🗃️ Bug Backlog Management

### Weekly Backlog Review

**When**: Every Wednesday during backlog refinement (1 hour)

**Who**: QA Lead + Engineering Manager + Squad Leads (rotating)

**Agenda**:
1. **Review P0/P1 bugs** (5 min): Should be 0 or near-0
2. **Review P2 bugs** (15 min): Prioritize top 10 for next sprint
3. **Review P3 bugs** (20 min):
   - Batch similar bugs
   - Downgrade to P4 if appropriate
   - Close if no longer relevant
4. **Review P4 bugs** (15 min):
   - Close stale bugs (>90 days old)
   - Convert feature requests to feature backlog
5. **Sprint planning prep** (5 min): Identify bugs for next sprint

---

### Bug Prioritization Framework

**Prioritize bugs based on**:

1. **Severity** (P0 > P1 > P2 > P3)
2. **User Impact** (how many users affected?)
   - >50% users: High
   - 10-50% users: Medium
   - <10% users: Low
3. **Business Impact** (revenue, reputation, churn risk?)
   - Blocks payment: High
   - Frustrating but not blocking: Medium
   - Annoying but ignorable: Low
4. **Effort** (time to fix?)
   - <4 hours: Low
   - 1-2 days: Medium
   - 3+ days: High

**Prioritization Matrix**:

```
        Low Effort   Medium Effort   High Effort
High    DO NOW       DO THIS         PLAN
Impact  ⚡           SPRINT          CAREFULLY

Medium  DO IN        SCHEDULE        CONSIDER
Impact  SPRINT       SOON            WORKAROUND

Low     NICE         BACKLOG         DEFER OR
Impact  TO HAVE                      WON'T FIX
```

**Example**:
- Bug affects 80% of users + takes 2 hours to fix → **DO NOW** ⚡
- Bug affects 5% of users + takes 1 week to fix → **BACKLOG** or **WON'T FIX**

---

### Closing Stale Bugs

**Auto-Close Rules** (via Linear automation):

#### P3/P4 Bugs
- No activity for 90 days → Auto-close as "Stale"
- Comment: "Closing due to inactivity. Reopen if still relevant."

#### P2 Bugs
- No activity for 180 days → Flag for manual review
- QA Lead decides: Close or keep open

#### P0/P1 Bugs
- Never auto-close
- Must be manually resolved or downgraded

**Monthly Cleanup** (First Monday of month):
- QA Lead reviews all "Stale" candidates
- Close or re-prioritize
- Goal: Keep backlog <100 bugs

---

### Bug Backlog Health Indicators

**Healthy Backlog**:
✅ P0: 0 bugs
✅ P1: <5 bugs
✅ P2: <20 bugs
✅ P3: <50 bugs
✅ P4: <100 bugs
✅ Total: <175 bugs
✅ No bug >90 days old in P0/P1
✅ No bug >180 days old in P2

**Unhealthy Backlog** (triggers corrective action):
❌ P1: >10 bugs
❌ P2: >50 bugs
❌ Total: >250 bugs
❌ Any P1 bug >14 days old
❌ Bug creation rate > resolution rate for 4+ weeks

**Corrective Actions**:
1. **Bug Sprint**: Dedicate full sprint to bugs only (0% features)
2. **Bug Bash**: Full-team 1-day event to close bugs
3. **Increase Allocation**: Bump bug sprint capacity from 30% → 50%
4. **Root Cause Analysis**: Why are we creating so many bugs?

---

## 👥 Roles & Responsibilities

### Responsibility Matrix (RACI)

| Activity | Support Eng | QA Lead | QA Eng | Squad Lead | Engineer | Eng Manager | Tech Lead |
|----------|-------------|---------|--------|------------|----------|-------------|-----------|
| **Receive bug report** | R | I | I | I | I | I | I |
| **Initial triage** | R | A | C | I | I | I | I |
| **Reproduce bug** | C | A | R | I | I | I | I |
| **Assign severity** | C | A | R | C | I | I | I |
| **Assign to squad** | I | A | C | I | I | R | C |
| **Assign to engineer** | I | I | I | A/R | I | C | C |
| **Fix bug** | I | I | I | C | A/R | I | C |
| **Code review** | I | I | I | C | R | I | A |
| **QA testing (staging)** | I | C | A/R | I | C | I | I |
| **Deploy to production** | I | I | I | C | R | I | A |
| **Verify in production** | C | C | A/R | I | C | I | I |
| **Hotfix approval** | I | I | I | I | I | A | C |
| **Post-mortem** | C | C | C | R | R | A | R |
| **Weekly metrics review** | I | A/R | C | C | I | A | C |
| **Backlog cleanup** | I | A/R | C | C | I | C | I |

**Legend**:
- **R** = Responsible (does the work)
- **A** = Accountable (ultimately answerable, approves)
- **C** = Consulted (provides input)
- **I** = Informed (kept in the loop)

---

### Detailed Role Descriptions

#### Support Engineer (1 person)
**Responsibilities**:
- Monitor customer support channels (Intercom, email)
- Receive and document bug reports from customers
- Initial screening: Is it really a bug or user error?
- Create Linear issues for valid bugs
- Provide workarounds to customers while bugs are being fixed
- Follow up with customers when bugs are resolved
- Escalate urgent P0/P1 bugs to QA Lead

**Time Allocation**:
- 60%: Customer support (non-bug issues)
- 30%: Bug intake and documentation
- 10%: Testing and verification

---

#### QA Lead (1 person)
**Reports to**: Engineering Manager

**Responsibilities**:
- Lead daily bug triage (9:30 AM daily)
- Assign severity and priority to all bugs
- Assign bugs to appropriate squads
- Ensure SLAs are being met
- Track bug metrics (dashboard, weekly reports)
- Conduct weekly backlog reviews
- Organize bug bash events
- Improve QA processes
- Mentor QA Engineer

**Time Allocation**:
- 40%: Bug triage and management
- 30%: Manual testing (exploratory, regression)
- 20%: Process improvement and metrics
- 10%: Team coordination and leadership

**Success Metrics**:
- SLA compliance >90%
- Bug backlog <100 bugs
- Bug escape rate <20% (post-launch)
- MTTR within targets

---

#### QA Engineer (1 person)
**Reports to**: Engineering Manager (dotted line to QA Lead)

**Responsibilities**:
- Reproduce bugs reported by customers/support
- Write and execute manual test cases
- Write and maintain E2E tests (Playwright)
- Test bug fixes on staging before production deploy
- Verify bugs are fixed in production
- Exploratory testing of new features
- Document test cases and procedures

**Time Allocation**:
- 40%: Manual testing (smoke tests, regression, exploratory)
- 30%: E2E test automation (Playwright)
- 20%: Bug verification and closure
- 10%: Bug reproduction and documentation

**Success Metrics**:
- >95% of bugs reproduced within 1 day
- 100% of P0/P1 fixes verified before production deploy
- E2E test coverage of all critical paths
- <5% flaky test rate

---

#### Squad Lead (4 Senior Engineers)
**Reports to**: Engineering Manager

**Responsibilities**:
- Assign bugs to engineers on their squad
- Review and approve bug fixes from squad members
- Ensure squad is meeting bug SLAs
- Participate in hotfix war rooms (if on-call)
- Balance squad capacity between features and bugs
- Escalate blocked bugs to Engineering Manager
- Conduct post-mortems for P0/P1 bugs

**Time Allocation**:
- 50%: Feature development (coding)
- 20%: Bug fixes (coding)
- 20%: Code review and mentorship
- 10%: Squad coordination and planning

**Success Metrics**:
- Squad SLA compliance >90%
- Squad bug backlog <15 bugs
- Squad velocity stable (meeting sprint commitments)

---

#### Engineer (18 people: 8 Full Stack, 2 Frontend, 2 Backend, 1 DevOps, 1 ML, 3 Data)
**Reports to**: Engineering Manager

**Responsibilities**:
- Fix bugs assigned to them
- Write regression tests for all bug fixes
- Participate in code reviews
- Test bug fixes locally before creating PR
- Collaborate with QA on bug reproduction
- Participate in hotfixes (if on-call)

**Time Allocation** (varies by sprint phase):
- **Pre-Beta**: 70% features, 20% bugs, 10% tech debt
- **Beta**: 60% features, 30% bugs, 10% tech debt
- **Post-Launch**: 50% features, 30% bugs, 20% tech debt

**Success Metrics**:
- Bugs assigned resolved within SLA
- <10% regression rate (bug fixes don't introduce new bugs)
- Code review participation (review 5+ PRs/week)

---

#### Engineering Manager (1 person)
**Reports to**: Portfolio Manager

**Responsibilities**:
- Overall accountability for product quality
- Approve SLA extensions
- Approve hotfix deploys (P0)
- Facilitate post-mortems for P0/P1 incidents
- Review weekly bug metrics with QA Lead
- Allocate sprint capacity for bugs vs features
- Escalate quality issues to leadership
- Performance management for QA team

**Time Allocation**:
- 40%: People management (1:1s, performance reviews, hiring)
- 30%: Process and quality oversight
- 20%: Technical strategy and architecture
- 10%: Coding (critical bugs, unblocking)

**Success Metrics**:
- Team hitting SLAs >90%
- Bug backlog under control (<100 bugs)
- Bug escape rate <20% (post-launch)
- Team velocity stable or improving
- Engineer satisfaction (stay >80%)

---

#### Tech Lead (1 person)
**Reports to**: Engineering Manager

**Responsibilities**:
- Approve hotfix deploys (P1)
- Review high-risk bug fixes
- Root cause analysis for complex bugs
- Technical post-mortem facilitation
- Define coding standards and best practices
- Review architecture changes that fix bugs
- Mentor engineers on debugging techniques

**Time Allocation**:
- 50%: Architecture and technical strategy
- 20%: Code review (high-risk changes)
- 20%: Coding (complex bug fixes)
- 10%: Mentorship and documentation

**Success Metrics**:
- <10% regression rate
- Zero data loss incidents
- Architecture decisions well-documented
- Team technical skills improving

---

#### DevOps Engineer (1 person)
**Reports to**: Tech Lead

**Responsibilities**:
- Monitor production for incidents (Sentry, Datadog)
- Participate in P0 hotfix war rooms
- Deploy hotfixes to production
- Maintain rollback procedures
- Improve CI/CD pipeline to catch bugs earlier
- Set up and tune monitoring/alerting
- Maintain staging environment parity with production

**Time Allocation**:
- 40%: Infrastructure and deployment automation
- 30%: Monitoring, alerting, and incident response
- 20%: CI/CD pipeline improvements
- 10%: On-call and hotfix support

**Success Metrics**:
- 99.9% uptime
- <10 minute deploy time (CI/CD)
- Zero failed deploys in last 30 days
- <15 min incident detection time (monitoring)

---

#### On-Call Engineer (Rotating)
**Rotation**: Weekly rotation among Senior Engineers and Squad Leads

**Responsibilities**:
- Respond to PagerDuty alerts 24/7 during on-call week
- Investigate and triage P0 incidents immediately (<15 min)
- Act as Incident Commander for P0 hotfixes
- Deploy hotfixes (with approval)
- Write post-mortem incident reports
- Hand off unresolved issues to next on-call

**Compensation**:
- $500/week on-call stipend
- +1 day off after on-call week

**Success Metrics**:
- P0 response time <15 minutes
- P0 resolution time <4 hours
- Post-mortem completed within 24 hours

---

## 📝 Templates & Resources

### Bug Report Template
Location: `.speckit/templates/bug-report.md`

### Post-Mortem Template
Location: `.speckit/templates/incident-postmortem.md`

### Hotfix Checklist
Location: `.speckit/checklists/hotfix-checklist.md`

### Bug Triage Runbook
Location: `.speckit/runbooks/bug-triage.md`

### Deployment Runbook
Location: `.speckit/runbooks/deployment.md`

### Rollback Runbook
Location: `.speckit/runbooks/rollback.md`

---

## 🔗 Related Documents

- [Team Structure](./team-structure.md)
- [Portfolio Release Plan](./portfolio-release-plan.md)
- [CI/CD Setup](../docs/ci-cd.md)
- [Testing Strategy](../docs/testing-strategy.md)
- [Incident Response Plan](./incident-response-plan.md)

---

## 📞 Contact & Escalation

### Slack Channels
- `#incidents` - P0 bugs, production issues (immediate response)
- `#engineering` - P1/P2 bugs, general engineering discussion
- `#qa` - QA team, testing, bug reports
- `#customer-feedback` - Customer-reported bugs

### Key Contacts
- **QA Lead**: [TBD] - @qa-lead
- **Engineering Manager**: [TBD] - @eng-manager
- **Tech Lead**: [TBD] - @tech-lead
- **DevOps Engineer**: [TBD] - @devops
- **On-Call Engineer**: Check PagerDuty schedule

### Escalation Path
1. **L1 (Support Engineer)**: Initial triage, customer workarounds
2. **L2 (QA Lead)**: Bug classification, squad assignment
3. **L3 (Squad Lead)**: Bug fixing, code review
4. **L4 (Engineering Manager)**: SLA extensions, resource allocation
5. **L5 (CTO/Portfolio Manager)**: Business decisions, communication to board

---

## 📅 Review & Updates

**Review Frequency**:
- **Monthly**: Review bug metrics and adjust processes if needed
- **Quarterly**: Full process review (PI planning)
- **Annually**: Major overhaul based on learnings

**Next Review Date**: December 1, 2025

**Document Owner**: Engineering Manager + QA Lead

**Change Log**:
- 2025-11-12: Initial version created
- [Future updates here]

---

## ✅ Summary: Quick Reference

### Bug Severity
- **P0**: Production down → Fix in 4 hours
- **P1**: Major feature broken → Fix in 2 days
- **P2**: Minor issue → Fix in 2 weeks
- **P3**: Cosmetic → Fix next release

### Daily Routine
- **9:30 AM**: Daily bug triage (QA Lead + EM + On-call)
- **Continuous**: Monitor #incidents for P0/P1 bugs
- **Friday**: Weekly quality review

### Sprint Allocation
- **Pre-Beta**: 70% features, 20% bugs, 10% tech debt
- **Beta**: 60% features, 30% bugs, 10% tech debt
- **Post-Launch**: 50% features, 30% bugs, 20% tech debt

### Key Metrics
- SLA compliance >90%
- Bug backlog <100 bugs
- Bug escape rate <20% (post-launch)
- MTTR: P0 <4hrs, P1 <2 days, P2 <2 weeks

### Hotfix Process
1. Declare incident (#incidents)
2. Create hotfix branch
3. Fix + test + review (senior engineer required)
4. Deploy to staging → smoke test → deploy to production
5. Monitor for 30 minutes
6. Post-mortem within 24 hours

---

**Remember**: Quality is everyone's responsibility. Catch bugs early, fix bugs fast, and learn from every incident. 🚀

---

**Last Updated**: 2025-11-12
**Maintained By**: Engineering Manager & QA Lead
**Version**: 1.0