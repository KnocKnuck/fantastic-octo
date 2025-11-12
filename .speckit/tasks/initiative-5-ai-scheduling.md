# Initiative 5: AI Scheduling Engine

**Goal**: Automatically schedule tasks into calendar slots
**Business Value**: Core differentiation and main value proposition
**Timeline**: Q2 2026 (Weeks 13-20)
**Status**: 🔵 Not Started

## Feature 5.1: Rule-Based Scheduler V1

**Description**: Algorithm to place tasks in optimal time slots

### Story 5.1.1: Time Slot Finder
**As a** system
**I want** to find available time slots
**So that** I know where tasks can be placed

**Acceptance Criteria**:
- [ ] Function: `findAvailableSlots(startDate, endDate, existingEvents, workHours)`
- [ ] Returns array of free time blocks
- [ ] Respects work hours from user preferences
- [ ] Excludes existing calendar events
- [ ] Excludes weekends (unless in workDays)
- [ ] Handles multi-day ranges
- [ ] Performance: < 100ms for 1 week

**Story Points**: 8
**Sprint**: Sprint 9
**Status**: 🔵 Not Started
**Priority**: P0

---

### Story 5.1.2: Task Sorter
**As a** system
**I want** to sort tasks by priority
**So that** important work gets scheduled first

**Acceptance Criteria**:
- [ ] Sort by priority (URGENT > HIGH > MEDIUM > LOW)
- [ ] Secondary sort by deadline (soonest first)
- [ ] Tertiary sort by created date
- [ ] Handle missing deadlines
- [ ] Pure function (no side effects)

**Story Points**: 3
**Sprint**: Sprint 9
**Status**: 🔵 Not Started
**Priority**: P0

---

### Story 5.1.3: Slot Matching Algorithm
**As a** system
**I want** to match tasks to slots
**So that** I create a valid schedule

**Acceptance Criteria**:
- [ ] Function: `matchTaskToSlot(task, availableSlots, constraints)`
- [ ] Find slot large enough for task duration
- [ ] Prefer morning slots for high-energy tasks
- [ ] Avoid back-to-back long tasks
- [ ] Return best slot or null
- [ ] Reasoning string for why slot chosen

**Story Points**: 13
**Sprint**: Sprint 9
**Status**: 🔵 Not Started
**Priority**: P0

---

### Story 5.1.4: Schedule Generator
**As a** system
**I want** to generate complete schedules
**So that** users get all tasks placed

**Acceptance Criteria**:
- [ ] Function: `generateSchedule(tasks, calendar, userPrefs)`
- [ ] Sort tasks by priority
- [ ] Find slots for each task
- [ ] Insert breaks between tasks (15 min default)
- [ ] Return Schedule object with slots
- [ ] Include AI reasoning for each placement
- [ ] Handle cases where not all tasks fit
- [ ] Performance: < 3 seconds for 20 tasks

**Story Points**: 13
**Sprint**: Sprint 10
**Status**: 🔵 Not Started
**Priority**: P0

---

### Story 5.1.5: Schedule API Endpoints
**As a** frontend
**I want** API endpoints for scheduling
**So that** I can trigger AI scheduling

**Acceptance Criteria**:
- [ ] POST `/api/schedule/generate` - Generate new schedule
- [ ] GET `/api/schedule/current` - Get active schedule
- [ ] POST `/api/schedule/:id/accept` - Accept schedule
- [ ] POST `/api/schedule/:id/reject` - Reject and regenerate
- [ ] PATCH `/api/schedule/slots/:id` - Manual adjustment
- [ ] Validation and error handling
- [ ] Tests written

**Story Points**: 8
**Sprint**: Sprint 10
**Status**: 🔵 Not Started
**Priority**: P0

---

## Feature 5.2: Schedule Visualization

**Description**: UI to display and interact with generated schedules

### Story 5.2.1: Schedule View Design
**As a** user
**I want** to see my AI-generated schedule
**So that** I can review and approve it

**Acceptance Criteria**:
- [ ] Schedule view mockup designed
- [ ] Timeline visualization (day/week view)
- [ ] Task blocks with time and duration
- [ ] AI reasoning tooltips
- [ ] Accept/Reject buttons
- [ ] "Regenerate" button
- [ ] Comparison: before (task list) vs after (schedule)
- [ ] Approved by PM

**Story Points**: 8
**Sprint**: Sprint 10
**Status**: 🔵 Not Started
**Priority**: P0

---

### Story 5.2.2: Schedule View Implementation
**As a** user
**I want** to interact with my schedule
**So that** I can accept or modify it

**Acceptance Criteria**:
- [ ] Schedule page at `/dashboard/schedule`
- [ ] "Generate Schedule" button
- [ ] Loading state during generation (< 3s)
- [ ] Display generated schedule in timeline
- [ ] Show AI reasoning for each task placement
- [ ] Highlight conflicts (if any)
- [ ] Accept button (saves to calendar)
- [ ] Reject button (regenerates)
- [ ] Time saved calculation displayed

**Story Points**: 13
**Sprint**: Sprint 11
**Status**: 🔵 Not Started
**Priority**: P0

---

### Story 5.2.3: Manual Schedule Adjustments
**As a** user
**I want** to manually adjust scheduled tasks
**So that** I can fine-tune the AI's suggestions

**Acceptance Criteria**:
- [ ] Drag and drop tasks to different slots
- [ ] Resize task duration
- [ ] Click to edit task time
- [ ] Validation: detect conflicts
- [ ] Warning if overlapping
- [ ] Auto-adjust surrounding tasks (optional)
- [ ] Save manual changes

**Story Points**: 13
**Sprint**: Sprint 11
**Status**: 🔵 Not Started
**Priority**: P1

---

## Feature 5.3: Dynamic Rescheduling

**Description**: Automatically adjust schedule when calendar changes

### Story 5.3.1: Conflict Detection
**As a** system
**I want** to detect scheduling conflicts
**So that** I can notify the user

**Acceptance Criteria**:
- [ ] Monitor calendar for new events
- [ ] Check if new events overlap scheduled tasks
- [ ] Flag conflicting tasks
- [ ] Calculate impact (how many tasks affected)
- [ ] Store conflict in database

**Story Points**: 8
**Sprint**: Sprint 12
**Status**: 🔵 Not Started
**Priority**: P0

---

### Story 5.3.2: Auto-Reschedule Engine
**As a** system
**I want** to automatically reschedule conflicting tasks
**So that** schedules stay valid

**Acceptance Criteria**:
- [ ] When conflict detected, find next available slot
- [ ] Move conflicting task to new slot
- [ ] Cascade: adjust other affected tasks
- [ ] Preserve task order if possible
- [ ] Generate new schedule version
- [ ] Notification to user of changes

**Story Points**: 13
**Sprint**: Sprint 12
**Status**: 🔵 Not Started
**Priority**: P0

---

### Story 5.3.3: Rescheduling Notifications
**As a** user
**I want** to be notified of rescheduling
**So that** I'm aware of changes

**Acceptance Criteria**:
- [ ] Toast notification when reschedule happens
- [ ] Summary: "2 tasks rescheduled due to new meeting"
- [ ] Option to view changes
- [ ] Option to undo (revert to previous schedule)
- [ ] Email notification (optional, future)

**Story Points**: 5
**Sprint**: Sprint 12
**Status**: 🔵 Not Started
**Priority**: P1

---

## Feature 5.4: Capacity Management

**Description**: Warn users when overbooked

### Story 5.4.1: Capacity Calculator
**As a** system
**I want** to calculate available capacity
**So that** I can warn if overbooked

**Acceptance Criteria**:
- [ ] Calculate work hours in date range
- [ ] Subtract existing calendar events
- [ ] = Available capacity
- [ ] Calculate task demand (sum of estimates)
- [ ] Capacity % = demand / available
- [ ] Flag if > 100% (overbooked)

**Story Points**: 5
**Sprint**: Sprint 13
**Status**: 🔵 Not Started
**Priority**: P0

---

### Story 5.4.2: Capacity Warning UI
**As a** user
**I want** to see my capacity status
**So that** I don't overcommit

**Acceptance Criteria**:
- [ ] Capacity gauge on dashboard
- [ ] Visual: 0-50% (green), 50-80% (yellow), 80-100% (orange), 100%+ (red)
- [ ] Text: "You have X hours available this week"
- [ ] Warning if overbooked: "You're overbooked by Y hours"
- [ ] Suggestions: "Consider postponing these tasks..."
- [ ] List of suggested tasks to postpone

**Story Points**: 8
**Sprint**: Sprint 13
**Status**: 🔵 Not Started
**Priority**: P0

---

## Feature 5.5: AI Learning & Improvement (Future)

**Description**: Learn from user behavior to improve scheduling

### Story 5.5.1: Actual vs. Estimated Time Tracking
**As a** system
**I want** to track how long tasks actually take
**So that** I can improve estimates

**Acceptance Criteria**:
- [ ] When task marked complete, prompt: "How long did this take?"
- [ ] Store actualMinutes in database
- [ ] Calculate variance: actual vs estimated
- [ ] Aggregate by task type/tag
- [ ] Display accuracy metrics to user

**Story Points**: 8
**Sprint**: Sprint 14
**Status**: 🔵 Not Started
**Priority**: P1

---

### Story 5.5.2: Estimate Adjustment
**As a** system
**I want** to adjust future estimates
**So that** scheduling becomes more accurate

**Acceptance Criteria**:
- [ ] Calculate user's average overrun %
- [ ] Apply buffer to future estimates
- [ ] Learn per-tag patterns (e.g., "design" tasks take 1.5x estimate)
- [ ] Confidence score for each estimate
- [ ] Explain adjustment to user

**Story Points**: 13
**Sprint**: Sprint 14
**Status**: 🔵 Not Started
**Priority**: P1

---

### Story 5.5.3: GPT-4 Integration (Optional)
**As a** system
**I want** to use GPT-4 for smarter scheduling
**So that** decisions are more intelligent

**Acceptance Criteria**:
- [ ] OpenAI API key configured
- [ ] Prompt engineering for scheduling
- [ ] Send user context and task list to GPT-4
- [ ] Parse AI response into schedule format
- [ ] A/B test: rule-based vs AI
- [ ] Track acceptance rates
- [ ] Fallback to rule-based if AI fails

**Story Points**: 21
**Sprint**: Sprint 15
**Status**: 🔵 Not Started
**Priority**: P2

---
