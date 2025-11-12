# AI Calendar Agent - Portfolio & Release Plan

> **Planning Horizon**: 18 months (Jan 2026 - Jun 2027)
> **Planning Methodology**: SAFe (Scaled Agile Framework) adapted for 40-person team
> **Program Increments (PIs)**: 3 months each (6 sprints per PI)
> **Last Updated**: 2025-11-12

---

## 📊 Portfolio Overview

### Total Scope
- **13 Core Product Initiatives** (Must launch with)
- **2 Marketing & Growth Initiatives** (Customer acquisition and community)
- **5 Strategic/Future Initiatives** (Expansion and scale)
- **Total**: 20 Initiatives
- **Total Story Points**: ~3,600+ points (core + marketing)
- **Timeline**: 18-24 months (with 40-person team)

### Team Capacity
- **6 Squads** x **40 points/sprint average** = **240 points/sprint** (combined)
- **Per PI** (6 sprints): 240 × 6 = **1,440 points/PI**
- **Per Year** (4 PIs): 1,440 × 4 = **5,760 points/year**

### Resource Allocation
- **40 people** organized into **6 cross-functional squads**
- Each squad: 6-7 people (engineers, designer, PM support)
- Scrum Masters: 2 (each managing 3 squads)

---

## 🎯 Release Strategy

### Release Types

#### Major Releases (Every PI - 3 months)
- **Scope**: Multiple initiatives complete
- **Marketing**: Blog post, email campaign, social media
- **Changelog**: Full release notes
- **Examples**: "Q1 Release: Core Product Launch", "Q2 Release: AI Intelligence"

#### Minor Releases (Every Sprint - 2 weeks)
- **Scope**: Features, improvements, bug fixes
- **Marketing**: In-app notification, changelog entry
- **Examples**: "Sprint 5 Release: Dark Mode", "Sprint 8: Slack Integration"

#### Hotfixes (As Needed)
- **Scope**: Critical bugs, security issues
- **Marketing**: Status page update, email if user-impacting
- **SLA**: Deploy within 4 hours of discovery

---

## 📅 Program Increment (PI) Planning

### PI 1: Q1 2026 (Jan-Mar) - Foundation
**Theme**: Launch MVP to Beta Users
**Sprints**: 1-6
**Goal**: Ship core product (auth, calendar, tasks, AI scheduling)

### PI 2: Q2 2026 (Apr-Jun) - Differentiation
**Theme**: AI Intelligence & Integrations
**Sprints**: 7-12
**Goal**: 10x better than competitors with smart AI and seamless integrations

### PI 3: Q3 2026 (Jul-Sep) - Scale
**Theme**: Team Features & Enterprise
**Sprints**: 13-18
**Goal**: Unlock B2B/enterprise revenue, scale to 10K users

### PI 4: Q4 2026 (Oct-Dec) - Expansion
**Theme**: Mobile & Internationalization
**Sprints**: 19-24
**Goal**: Global expansion, mobile apps, SOC 2 certified

---

## 🗓️ PI 1: Q1 2026 (Jan-Mar) - Foundation

**Duration**: 12 weeks (6 sprints)
**Capacity**: 1,440 story points (240/sprint × 6)
**Planned**: 1,295 story points (90% utilization - buffer for unknowns)

### Objectives
1. Launch beta with core product (auth, tasks, calendar, AI scheduling)
2. Achieve 40% activation rate
3. Ship with strong onboarding and support infrastructure
4. Establish deployment velocity (300 points/sprint)

### Initiatives

| Initiative | Squad | Story Points | Status | Priority |
|------------|-------|--------------|--------|----------|
| **Initiative 1**: Foundation (remaining) | Gamma | 45 | 🟡 | P0 |
| **Initiative 2**: Authentication | Alpha | 220 | 🔵 | P0 |
| **Initiative 3**: Calendar Integration | Alpha | 180 | 🔵 | P0 |
| **Initiative 4**: Task Management | Alpha | 270 | 🔵 | P0 |
| **Initiative 5**: AI Scheduling (V1) | Beta | 330 | 🔵 | P0 |
| **Initiative 8**: Admin Panel (Phase 1) | Delta | 150 | 🔵 | P0 |
| **Initiative 9**: User Success (Phase 1) | Epsilon | 100 | 🔵 | P0 |
| **TOTAL** | All Squads | **1,295** | - | - |

### Sprint Breakdown

#### Sprint 1-2 (Weeks 1-4): Authentication & Infrastructure
**Focus**: Get authentication working, CI/CD pipeline, monitoring

**Squad Alpha**: Initiative 2 (Authentication)
- Google OAuth setup
- Database schema
- NextAuth configuration
- Sign-in page
- Protected routes
- **Points**: 80

**Squad Gamma**: Initiative 1 (Foundation)
- CI/CD pipeline (GitHub Actions)
- Testing infrastructure (Jest, Playwright)
- Sentry integration
- Performance optimization
- Feature flags
- **Points**: 80

**Squad Delta**: Initiative 8 (Admin - Phase 1)
- Roles & permissions system
- User invitation system
- **Points**: 40

**Squad Epsilon**: Initiative 9 (User Success - Phase 1)
- Help center setup
- Email service provider
- Onboarding checklist design
- **Points**: 40

**Total**: 240 points

---

#### Sprint 3-4 (Weeks 5-8): Calendar & Tasks
**Focus**: Core functionality (calendar sync, task CRUD)

**Squad Alpha**: Initiatives 3 & 4
- Calendar data models
- Google Calendar integration (OAuth, sync, UI)
- Task API endpoints
- Task list UI
- Task creation form
- **Points**: 160

**Squad Beta**: Initiative 5 (AI - Foundation)
- Time slot finder algorithm
- Task sorter
- Slot matching (basic version)
- **Points**: 40

**Squad Epsilon**: Initiative 9 (Phase 1 continued)
- Onboarding flow implementation
- Empty state guidance
- Sample data option
- **Points**: 40

**Total**: 240 points

---

#### Sprint 5-6 (Weeks 9-12): AI Scheduling & Polish
**Focus**: AI scheduling V1, onboarding polish, admin basics

**Squad Alpha**: Initiative 4 (Tasks continued)
- Task filters, search, sorting
- Task editing/deletion
- Task completion
- **Points**: 80

**Squad Beta**: Initiative 5 (AI Scheduling)
- Schedule generator
- Schedule API endpoints
- Schedule visualization
- Manual adjustments
- **Points**: 80

**Squad Delta**: Initiative 8 (Admin)
- Workspace settings
- User management UI
- **Points**: 40

**Squad Epsilon**: Initiative 9 (Phase 1 wrap-up)
- Onboarding email sequence
- Core help articles
- In-app contextual help
- **Points**: 40

**Total**: 240 points

---

### PI 1 Deliverables
✅ Authentication with Google OAuth
✅ Google Calendar sync (bidirectional)
✅ Task management (CRUD, filters, tags)
✅ AI scheduling (rule-based V1)
✅ Admin panel (basic workspace management)
✅ Onboarding flow (interactive, email sequence)
✅ Help docs (20 articles)
✅ CI/CD pipeline (automated deployment)
✅ Monitoring (Sentry, Vercel Analytics)

### PI 1 Success Metrics
- 1,000 beta signups
- 40% activation rate
- NPS ≥ 40
- 99.5% uptime
- 300 points/sprint velocity achieved

---

## 🗓️ PI 2: Q2 2026 (Apr-Jun) - Differentiation

**Duration**: 12 weeks (6 sprints)
**Capacity**: 1,440 story points
**Planned**: 1,350 story points

### Objectives
1. Differentiate with AI intelligence (energy-based, meeting fatigue)
2. Launch key integrations (Todoist, Asana, Linear, Slack)
3. Add focus mode and productivity tools
4. Achieve 5,000 active users and $50K MRR

### Initiatives

| Initiative | Squad | Story Points | Priority |
|------------|-------|--------------|----------|
| **Initiative 5**: AI Scheduling (V2 - remaining) | Beta | 150 | P0 |
| **Initiative 6**: Analytics & Insights | Zeta | 120 | P1 |
| **Initiative 9**: User Success (Phase 2) | Epsilon | 111 | P0 |
| **Initiative 11**: Integrations (Phase 1) | Beta + Gamma | 150 | P1 |
| **Initiative 12**: Focus & Productivity | Epsilon | 110 | P1 |
| **Initiative 1**: Content Marketing & SEO (expanded) | Marketing Team | 140 | P1 |
| **Initiative 14**: Marketing & Brand (Phase 1) | Marketing Team | 130 | P1 |
| **Initiative 7**: Platform (APIs, templates) | Gamma | 80 | P2 |
| **Initiative 8**: Admin (Phase 2 - Billing) | Delta | 70 | P0 |
| **TOTAL** | All Squads | **1,051** | - |

**Notes**:
- Initiative 10 (AI Intelligence, 213 pts) moved to PI 3 due to dependency on Initiative 5 completion
- Marketing initiatives (1.3 expansion + Initiative 14 Phase 1) begin in PI 2 to prepare for growth phase

### Sprint Breakdown

#### Sprint 7-8: AI Scheduling V2 & Analytics
- Complete AI Scheduling Engine (Initiative 5)
- Dynamic rescheduling
- Capacity management
- Personal analytics dashboard
- Time breakdown visualizations
- **Points**: 240

#### Sprint 9-10: Integrations Phase 1
- Todoist integration (2-way sync)
- Asana integration
- Linear integration
- Slack basic integration (notifications)
- **Points**: 240

#### Sprint 11-12: Focus Mode & User Success
- Focus mode UI with DND
- Pomodoro timer
- Help docs expansion (40+ articles)
- Feature request system
- NPS surveys
- **Points**: 240

### PI 2 Deliverables
✅ AI Scheduling V2 complete (dynamic rescheduling, capacity management)
✅ 4 major integrations (Todoist, Asana, Linear, Slack)
✅ Focus mode with Pomodoro timer
✅ Analytics dashboard (time breakdown, productivity insights)
✅ Billing & subscription (Stripe integration)
✅ Blog (5+ SEO-optimized posts)
✅ User success improvements (expanded help docs, feature requests, NPS)
✅ Platform APIs & templates

### PI 2 Success Metrics
- 5,000 active users (5x growth)
- 100 paying customers
- $50K MRR
- 50% activation rate (up from 40%)
- 60% 30-day retention

---

## 🗓️ PI 3: Q3 2026 (Jul-Sep) - Scale

**Duration**: 12 weeks (6 sprints)
**Capacity**: 1,440 story points
**Planned**: 1,400 story points

### Objectives
1. Scale to 10,000 users
2. Launch team features (unlock B2B revenue)
3. Complete admin panel and security features
4. **Ship AI Intelligence 2.0** (energy-based, meeting fatigue, context switching)
5. Achieve $200K ARR

### Initiatives

| Initiative | Squad | Story Points | Priority |
|------------|-------|--------------|----------|
| **Initiative 10**: AI Intelligence & Learning | Beta | 213 | P1 |
| **Initiative 8**: Admin (Phase 3 - Security) | Delta | 175 | P0 |
| **Initiative 11**: Integrations (Phase 2) | Beta + Gamma | 117 | P1 |
| **Initiative 13**: Team Coordination | Delta + Alpha | 267 | P1 |
| **Initiative 14**: Marketing & Brand (Phase 2) | Marketing Team | 128 | P1 |
| **Initiative 15**: Community & DevRel (Phase 1) | Marketing Team | 100 | P1 |
| **Initiative 20**: Growth & Virality | Epsilon | 76 | P1 |
| **Initiative 7**: Platform (remaining) | Gamma | 80 | P2 |
| **TOTAL** | All Squads | **1,156** | - |

**Notes**:
- Initiative 10 moved from PI 2 due to dependency on Initiative 5 (AI Engine) completing in Sprint 11
- Marketing & Community initiatives scale up in PI 3 to drive growth and user acquisition

### Sprint Breakdown

#### Sprint 13-14: AI Intelligence & Team Features
- **AI Intelligence (Initiative 10)**: Energy-based scheduling, task energy classification, meeting load analysis, back-to-back detection
- **Team Coordination**: Team calendar view, find meeting time algorithm
- **Points**: 240

#### Sprint 15-16: AI Learning & Team Management
- **AI Intelligence (Initiative 10)**: Energy pattern learning, meeting fatigue score, smart meeting recommendations
- **Team Coordination**: Task assignment, team capacity view, dependencies
- **Admin Security**: 2FA, session management, audit logging
- **Points**: 240

#### Sprint 17-18: Context Switching & Growth
- **AI Intelligence (Initiative 10)**: Task similarity detection, batching algorithm, flow state tracking
- **Growth**: Referral program, affiliate program, public roadmap, changelog
- **Integrations**: Notion (2-way sync), Toggl (time tracking)
- **Points**: 240

### PI 3 Deliverables
✅ **AI Intelligence 2.0** (energy-based, meeting fatigue, context switching, learning)
✅ Team calendar and meeting scheduler (Calendly-style)
✅ Team task assignment and capacity management
✅ Admin panel complete (security, audit logs, GDPR, 2FA)
✅ Referral and affiliate programs
✅ 9 total integrations (including Notion, Toggl, Jira)
✅ Growth loops and virality mechanisms

### PI 3 Success Metrics
- 10,000 active users (2x growth)
- 500 paying customers (5x growth)
- $200K ARR (4x growth)
- 50 team accounts
- 65% 30-day retention

---

## 🗓️ PI 4: Q4 2026 (Oct-Dec) - Expansion

**Duration**: 12 weeks (6 sprints)
**Capacity**: 1,440 story points
**Planned**: 1,400 story points

### Objectives
1. Launch mobile apps (iOS, Android)
2. Internationalization (3 languages)
3. SOC 2 Type I certified
4. Achieve $500K ARR milestone

### Initiatives

| Initiative | Squad | Story Points | Priority |
|------------|-------|--------------|----------|
| **Initiative 15**: Enterprise Security (SOC 2) | Delta | 200 | P1 |
| **Initiative 18**: Internationalization | All Squads | 150 | P2 |
| **Initiative 19**: Mobile Apps (Phase 1) | New Mobile Squad | 466 | P2 |
| **Initiative 17**: Business Intelligence | Zeta | 100 | P3 |
| **TOTAL** | All Squads | **916** | - |

### Sprint Breakdown

#### Sprint 19-20: Mobile Foundation & SOC 2
- React Native setup
- iOS app (core features)
- SOC 2 audit prep
- **Points**: 240

#### Sprint 21-22: Mobile Features & i18n
- Android app (core features)
- Push notifications
- Translation framework
- 3 languages (ES, FR, DE)
- **Points**: 240

#### Sprint 23-24: Polish & Launch
- Mobile widgets (iOS, Android)
- App store optimization
- SOC 2 Type I audit
- Business intelligence dashboards
- **Points**: 240

### PI 4 Deliverables
✅ iOS app (App Store)
✅ Android app (Play Store)
✅ Push notifications
✅ 3 languages (English, Spanish, French)
✅ SOC 2 Type I certified
✅ Internal BI dashboards

### PI 4 Success Metrics
- $500K ARR (milestone achieved)
- 1,000 paying customers
- 5,000 mobile app installs
- 15% free-to-paid conversion
- LTV:CAC > 3:1

---

## 🗺️ Roadmap Visualization

```
Q1 2026 (PI 1): Foundation
├── Core Product (Auth, Tasks, Calendar, AI V1)
├── Admin Panel (Basic)
├── Onboarding & Support
└── Goal: 1,000 beta users, 40% activation

Q2 2026 (PI 2): Differentiation
├── AI Intelligence (Energy-based, Meeting fatigue)
├── Integrations (Todoist, Asana, Linear, Slack)
├── Focus Mode & Productivity Tools
└── Goal: 5,000 users, $50K MRR

Q3 2026 (PI 3): Scale
├── Team Features (Calendar, Meetings, Assignments)
├── Enterprise Admin & Security (2FA, Audit logs)
├── Growth (Referrals, Affiliates)
└── Goal: 10,000 users, $200K ARR

Q4 2026 (PI 4): Expansion
├── Mobile Apps (iOS, Android)
├── Internationalization (3 languages)
├── SOC 2 Certification
└── Goal: $500K ARR, 1,000 paying customers

2027: Market Leader
├── Advanced AI (GPT-4, Machine Learning)
├── White-Label & Partnerships
├── Enterprise Features (SSO, SAML, Custom domains)
└── Goal: $5M ARR, 50,000 users
```

---

## 📋 Dependencies & Risks

### Critical Path Dependencies

#### Q1 Dependencies
- **Authentication** must complete before **Admin Panel**
- **Calendar Integration** required for **AI Scheduling**
- **Task Management** required for **AI Scheduling**
- **Email Service** required for **Onboarding**

#### Q2 Dependencies
- **AI Scheduling V1** must complete before **AI Intelligence**
- **OAuth foundation** required for **Integrations**

#### Q3 Dependencies
- **User Management** required for **Team Features**
- **Admin Panel** required for **Enterprise Security**

#### Q4 Dependencies
- **Core Product** must be solid before **Mobile Apps**
- **Security Infrastructure** required for **SOC 2**

### Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Google Calendar API rate limits | Medium | High | Implement caching, batch requests, request quota increase |
| AI scheduling acceptance < 70% | Medium | High | User testing, iterate algorithm, provide manual override |
| Team velocity below 300 pts/sprint | Medium | Medium | Hire faster, improve onboarding, reduce technical debt |
| SOC 2 audit delays | Medium | Medium | Start early (Q3), hire consultant, dedicated engineer |
| Mobile apps delayed | High | Medium | Start in Q3 (not Q4), consider React Native (faster) |
| Integrations break (API changes) | Medium | High | Monitor API changelogs, versioning, error handling |
| Stripe payment failures | Low | High | Robust error handling, retry logic, manual review |
| GDPR compliance issues | Low | Very High | Legal review, regular audits, data protection officer |

---

## 🚀 Launch Strategy

### Beta Launch (Q1 2026)
**Audience**: 1,000 beta users (waitlist, friends & family, early adopters)
**Channels**:
- Email waitlist
- Product Hunt (side project)
- Twitter/LinkedIn
- Indie Hackers
- Reddit (r/productivity, r/selfhosted)

**Goals**:
- Get feedback
- Find bugs
- Iterate quickly
- Build social proof

---

### Public Launch (Q2 2026)
**Audience**: General public
**Channels**:
- Product Hunt (main launch)
- Hacker News
- TechCrunch (if funded)
- Twitter/LinkedIn ads
- SEO blog posts

**Goals**:
- 5,000 signups in first month
- Media coverage
- Paid customers
- Investor interest (if seeking funding)

---

### Enterprise Launch (Q3 2026)
**Audience**: Teams (5+ seats), enterprise (50+ seats)
**Channels**:
- LinkedIn ads (targeted to CTOs, VPs Engineering)
- G2, Capterra listings
- Outbound sales
- Partner with consultancies

**Goals**:
- 50 team accounts
- $200K ARR
- Enterprise pipeline

---

## 📊 Portfolio Metrics Dashboard

### Initiative Health

| Initiative | Progress | Status | Risk | Notes |
|------------|----------|--------|------|-------|
| Initiative 1: Foundation | 70% | ✅ | 🟢 | CI/CD complete, monitoring live |
| Initiative 2: Authentication | 0% | 🟡 | 🟡 | Starting Sprint 1 |
| Initiative 3: Calendar | 0% | 🔵 | 🟡 | Depends on Auth |
| Initiative 4: Tasks | 0% | 🔵 | 🟢 | - |
| Initiative 5: AI Scheduling | 0% | 🔵 | 🟡 | Complex algorithm |
| Initiative 6: Analytics | 0% | 🔵 | 🟢 | - |
| Initiative 7: Platform | 0% | 🔵 | 🟢 | - |
| Initiative 8: Admin | 0% | 🔵 | 🟢 | - |
| Initiative 9: User Success | 0% | 🔵 | 🟢 | - |
| Initiative 10: AI Intelligence | 0% | 🔵 | 🟡 | Depends on AI V1 |
| Initiative 11: Integrations | 0% | 🔵 | 🔴 | API changes risk |
| Initiative 12: Focus Mode | 0% | 🔵 | 🟢 | - |
| Initiative 13: Team Features | 0% | 🔵 | 🟢 | - |

---

## 🎯 Success Criteria

### PI 1 Success (Q1)
- [ ] 1,000 beta signups
- [ ] 40% activation rate
- [ ] NPS ≥ 40
- [ ] 300 pts/sprint velocity
- [ ] 99.5% uptime

### PI 2 Success (Q2)
- [ ] 5,000 active users
- [ ] $50K MRR
- [ ] 50% activation rate
- [ ] 60% 30-day retention
- [ ] 4 integrations live

### PI 3 Success (Q3)
- [ ] 10,000 active users
- [ ] $200K ARR
- [ ] 50 team accounts
- [ ] 65% 30-day retention
- [ ] < 5% monthly churn

### PI 4 Success (Q4)
- [ ] $500K ARR
- [ ] 1,000 paying customers
- [ ] Mobile apps launched
- [ ] SOC 2 certified
- [ ] LTV:CAC > 3:1

---

**Last Updated**: 2025-11-12
**Review Cadence**: Weekly (progress), Monthly (portfolio review), Quarterly (PI Planning)
**Maintained By**: Portfolio Manager + Program Manager
