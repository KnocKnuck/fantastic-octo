# Initiative 2: User Onboarding & Authentication

**Goal**: Enable users to create accounts and access the application securely
**Business Value**: User acquisition, secure access, GDPR compliance
**Timeline**: Q1 2026 (Weeks 1-4)
**Status**: 🟡 In Progress

## Feature 2.1: OAuth Authentication

**Description**: Google OAuth integration for secure sign-up and sign-in

### Story 2.1.1: Google OAuth Setup

**As a** developer
**I want** Google OAuth configured
**So that** users can sign in with Google

**Acceptance Criteria**:

- [x] Google Cloud project created
- [x] OAuth consent screen configured
- [x] Client ID and secret generated
- [x] Redirect URIs configured (localhost + production)
- [x] Scopes defined (email, profile, calendar)
- [x] Environment variables documented

**Story Points**: 3
**Sprint**: Sprint 1
**Status**: ✅ Done (Day 1 - Nov 12)
**Priority**: P0
**Assignee**: Squad Alpha

---

### Story 2.1.2: Database Schema for Auth

**As a** system
**I want** a database schema for users
**So that** user data is stored securely

**Acceptance Criteria**:

- [x] Supabase project created
- [x] Prisma installed and initialized
- [x] User model created
- [x] Account model created (OAuth)
- [x] Session model created
- [x] VerificationToken model created
- [x] Initial migration run
- [x] Database connection tested

**Story Points**: 5
**Sprint**: Sprint 1
**Status**: ✅ Done (Day 1 - Nov 12)
**Priority**: P0
**Assignee**: Squad Alpha
**Dependencies**: Story 2.1.1

---

### Story 2.1.3: NextAuth.js Configuration

**As a** developer
**I want** NextAuth.js configured
**So that** authentication is handled properly

**Acceptance Criteria**:

- [x] NextAuth.js installed
- [x] Auth API route created (`/api/auth/[...nextauth]`)
- [x] Google provider configured
- [x] Prisma adapter configured
- [x] Session callbacks implemented
- [x] Auth tested locally (sign in, sign out, session)

**Story Points**: 5
**Sprint**: Sprint 1
**Status**: ✅ Done (Day 1 - Nov 12)
**Priority**: P0
**Assignee**: Squad Alpha
**Dependencies**: Story 2.1.2

---

### Story 2.1.4: Sign-In Page Design

**As a** user
**I want** a beautiful sign-in page
**So that** I trust the product from first impression

**Acceptance Criteria**:

- [ ] Figma mockup created
- [ ] Centered card layout
- [ ] "Sign in with Google" button with logo
- [ ] Loading states designed
- [ ] Error states designed
- [ ] Mobile responsive design
- [ ] Approved by PM

**Story Points**: 3
**Sprint**: Sprint 1
**Status**: 🔵 Not Started
**Priority**: P0
**Assignee**: UX/UI Agent

---

### Story 2.1.5: Sign-In Page Implementation

**As a** user
**I want** to sign in with Google
**So that** I can access the application

**Acceptance Criteria**:

- [ ] Sign-in page at `/auth/signin`
- [ ] Shadcn Button and Card components used
- [ ] Google sign-in button with OAuth flow
- [ ] Loading state during authentication
- [ ] Error handling and display
- [ ] Redirect to dashboard after sign-in
- [ ] Mobile responsive

**Story Points**: 5
**Sprint**: Sprint 1
**Status**: 🔵 Not Started
**Priority**: P0
**Assignee**: Full Stack Developer
**Dependencies**: Story 2.1.3, Story 2.1.4

---

### Story 2.1.6: Protected Routes Middleware

**As a** system
**I want** to protect authenticated routes
**So that** only logged-in users can access them

**Acceptance Criteria**:

- [ ] Middleware created (`middleware.ts`)
- [ ] `/dashboard/*` routes protected
- [ ] `/settings/*` routes protected
- [ ] Redirect to `/auth/signin` if not authenticated
- [ ] Redirect back to original URL after sign-in
- [ ] Session check performance < 100ms

**Story Points**: 3
**Sprint**: Sprint 1
**Status**: 🔵 Not Started
**Priority**: P0
**Assignee**: Full Stack Developer
**Dependencies**: Story 2.1.5

---

### Story 2.1.7: Sign-Out Functionality

**As a** user
**I want** to sign out
**So that** I can secure my account on shared devices

**Acceptance Criteria**:

- [ ] Sign-out button in navigation
- [ ] Clicking button triggers sign-out
- [ ] Session terminated
- [ ] Cookies cleared
- [ ] Redirect to homepage
- [ ] Success toast notification

**Story Points**: 2
**Sprint**: Sprint 1
**Status**: 🔵 Not Started
**Priority**: P0
**Assignee**: Full Stack Developer
**Dependencies**: Story 2.1.6

---

## Feature 2.2: User Profile Management

**Description**: View and edit user profile information

### Story 2.2.1: Profile Page Design

**As a** user
**I want** to view my profile
**So that** I can see my account information

**Acceptance Criteria**:

- [ ] Profile page mockup designed
- [ ] Display: name, email, profile picture
- [ ] Edit button for each field
- [ ] Avatar upload placeholder (future)
- [ ] Approved by PM

**Story Points**: 3
**Sprint**: Sprint 2
**Status**: 🔵 Not Started
**Priority**: P0
**Assignee**: UX/UI Agent

---

### Story 2.2.2: Profile API Endpoints

**As a** system
**I want** API endpoints for profile
**So that** frontend can fetch/update profile data

**Acceptance Criteria**:

- [ ] GET `/api/user/profile` - Returns user data
- [ ] PATCH `/api/user/profile` - Updates user data
- [ ] Validation with Zod
- [ ] Authentication required
- [ ] Error handling (400, 401, 500)
- [ ] Tests written

**Story Points**: 5
**Sprint**: Sprint 2
**Status**: 🔵 Not Started
**Priority**: P0
**Assignee**: Full Stack Developer

---

### Story 2.2.3: Profile Page Implementation

**As a** user
**I want** to edit my profile
**So that** I can keep my information up to date

**Acceptance Criteria**:

- [ ] Profile page at `/settings/profile`
- [ ] Display current user data
- [ ] Edit form with React Hook Form
- [ ] Validation with Zod
- [ ] Save button with loading state
- [ ] Success/error notifications
- [ ] Changes persist after page refresh

**Story Points**: 5
**Sprint**: Sprint 2
**Status**: 🔵 Not Started
**Priority**: P0
**Assignee**: Full Stack Developer
**Dependencies**: Story 2.2.1, Story 2.2.2

---

## Feature 2.3: User Preferences & Settings

**Description**: Configure work hours, timezone, and scheduling preferences

### Story 2.3.1: Preferences Schema

**As a** system
**I want** to store user preferences
**So that** AI can respect user's work schedule

**Acceptance Criteria**:

- [ ] Add fields to User model:
  - timezone (string, default "UTC")
  - workHoursStart (int, default 9)
  - workHoursEnd (int, default 17)
  - workDays (array, default Mon-Fri)
  - breakDuration (int, default 15)
- [ ] Migration created and run
- [ ] Prisma client regenerated

**Story Points**: 3
**Sprint**: Sprint 2
**Status**: 🔵 Not Started
**Priority**: P0
**Assignee**: Full Stack Developer

---

### Story 2.3.2: Preferences Page Design

**As a** user
**I want** to set my work preferences
**So that** AI schedules within my preferred hours

**Acceptance Criteria**:

- [ ] Settings page mockup designed
- [ ] Work hours selector (start/end time)
- [ ] Work days checkboxes (Mon-Sun)
- [ ] Break duration input (minutes)
- [ ] Timezone dropdown
- [ ] Save button
- [ ] Approved by PM

**Story Points**: 5
**Sprint**: Sprint 2
**Status**: 🔵 Not Started
**Priority**: P0
**Assignee**: UX/UI Agent

---

### Story 2.3.3: Preferences API & UI

**As a** user
**I want** to configure my preferences
**So that** scheduling fits my lifestyle

**Acceptance Criteria**:

- [ ] GET `/api/user/preferences` endpoint
- [ ] PATCH `/api/user/preferences` endpoint
- [ ] Preferences page at `/settings/preferences`
- [ ] Form with all preference fields
- [ ] Validation (work hours, days, etc.)
- [ ] Save and reload to verify persistence
- [ ] Default values for new users

**Story Points**: 8
**Sprint**: Sprint 2
**Status**: 🔵 Not Started
**Priority**: P0
**Assignee**: Full Stack Developer
**Dependencies**: Story 2.3.1, Story 2.3.2

---

### Story 2.3.4: Dashboard Layout & Navigation

**As a** user
**I want** a consistent navigation
**So that** I can easily access all features

**Acceptance Criteria**:

- [ ] Dashboard layout at `app/(dashboard)/layout.tsx`
- [ ] Top navbar with logo and user menu
- [ ] Sidebar with navigation links:
  - Dashboard
  - Tasks
  - Calendar
  - Settings
- [ ] User avatar and name in navbar
- [ ] Sign-out button in user menu
- [ ] Responsive (sidebar collapses on mobile)

**Story Points**: 8
**Sprint**: Sprint 2
**Status**: 🔵 Not Started
**Priority**: P0
**Assignee**: UX/UI Agent, Full Stack Developer

---
