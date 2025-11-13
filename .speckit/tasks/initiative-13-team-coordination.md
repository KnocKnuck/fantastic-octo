# Initiative 13: Team Coordination & Meetings

**Goal**: Enable seamless team collaboration, meeting scheduling, and workload management
**Business Value**: Unlock B2B revenue with team features that justify Team/Enterprise pricing tiers
**Timeline**: Q3 2026 (Weeks 18-30)
**Status**: 🔵 Not Started
**Owner**: Product Manager 2 + Engineering Manager
**Squad**: Squad Beta (Team & Collaboration)

> B2B growth driver. Individual users pay $10/mo. Teams pay $100+/mo. This unlocks enterprise revenue.

---

## Feature 13.1: Team Calendar View

**Description**: Shared calendar view to see team availability and coordinate schedules

### Story 13.1.1: Team Calendar UI
**As a** team member
**I want** to see my team's availability
**So that** I can find meeting times

**Acceptance Criteria**:
- [ ] Team calendar page (`/team/calendar`)
- [ ] Team member list (sidebar):
  - Avatar, name, role
  - Status indicator (available, busy, in meeting, out of office)
  - Filter: Show/hide team members
- [ ] Calendar views:
  - Day view: Hour-by-hour for all team members
  - Week view: Week schedule for all team members
  - Grid layout: Team members as columns, time as rows
- [ ] Event display:
  - Meetings: Blocks on calendar
  - Focus time: Different color
  - Out of office: Grayed out
  - Available time: White/empty
- [ ] Hover details:
  - Hover over event → Show event title, time, attendees
  - Don't show private event details (respect privacy)
- [ ] Time zone support:
  - Show all times in viewer's time zone
  - Indicator: "John is in PST (3 hours behind you)"

**Story Points**: 21
**Sprint**: Sprint 18
**Status**: 🔵 Not Started
**Priority**: P1
**Assignee**: Frontend Specialist 1, Product Designer 2

---

### Story 13.1.2: Find Meeting Time Algorithm
**As a** meeting organizer
**I want** to find times when everyone is available
**So that** I can schedule meetings quickly

**Acceptance Criteria**:
- [ ] "Find meeting time" button
- [ ] Meeting criteria:
  - Duration (15, 30, 45, 60 minutes)
  - Attendees (select from team)
  - Date range (this week, next week, custom)
  - Preferred time (morning, afternoon, any)
  - Required vs optional attendees
- [ ] Algorithm:
  - Find slots where all required attendees are free
  - Consider optional attendees (best effort)
  - Respect work hours (don't suggest 6 PM if someone works 9-5)
  - Respect focus time (avoid scheduling during deep work blocks)
  - Consider time zones
- [ ] Results:
  - List of available time slots (ranked by quality)
  - Show: Date, time, attendees available
  - "Best option" highlighted (e.g., all attendees free, morning time)
  - Quick actions: "Schedule meeting" button
- [ ] Visual display:
  - Highlight available slots on calendar
  - Green = all attendees available
  - Yellow = most attendees available
  - Red = conflicts

**Story Points**: 21
**Sprint**: Sprint 18
**Status**: 🔵 Not Started
**Priority**: P1
**Assignee**: Backend Engineer 2, AI/ML Engineer 1

---

### Story 13.1.3: Team Availability Widget
**As a** team member
**I want** a quick view of who's available now
**So that** I know who I can contact

**Acceptance Criteria**:
- [ ] "Team availability" widget (dashboard):
  - List of team members
  - Current status for each:
    - 🟢 Available
    - 🔴 Busy (in meeting)
    - 🟡 Focus mode (do not disturb)
    - ⚪ Out of office
    - 🌙 Offline (outside work hours)
- [ ] Status details:
  - "In meeting until 2:30 PM"
  - "Focusing on 'Design mockups' until 4 PM"
  - "Out of office (vacation)"
  - "Next available: Tomorrow 9 AM"
- [ ] Quick actions:
  - Click team member → View their calendar
  - "Schedule meeting" button
  - "Send message" (if Slack integration)
- [ ] Real-time updates:
  - Status updates automatically (WebSocket or polling)
  - Notification when team member becomes available

**Story Points**: 13
**Sprint**: Sprint 19
**Status**: 🔵 Not Started
**Priority**: P1
**Assignee**: Frontend Specialist 2, Backend Engineer 2

---

### Story 13.1.4: Shared Team Events
**As a** team lead
**I want** to create events for the whole team
**So that** everyone knows about all-hands, offsites, holidays

**Acceptance Criteria**:
- [ ] Create shared team event:
  - Event name (e.g., "Q1 All-Hands")
  - Date and time
  - Duration
  - Attendees: All team, specific members, optional
  - Recurrence (weekly team standup)
  - Type: Meeting, out of office, holiday, company event
- [ ] Event visibility:
  - Shows on all team members' calendars
  - Color-coded (different from personal events)
  - Badge: "Team event"
- [ ] Permissions:
  - Team admin/owner can create team events
  - Members can see but not edit
  - Members can mark attendance (Yes, No, Maybe)
- [ ] Notifications:
  - Notify team when event is created
  - Reminder before event (configurable)
- [ ] Types of team events:
  - All-hands meetings
  - Team offsites
  - Company holidays (blocks everyone's calendar)
  - Team celebrations (optional attendance)

**Story Points**: 13
**Sprint**: Sprint 19
**Status**: 🔵 Not Started
**Priority**: P1
**Assignee**: Full Stack Engineer (Squad Beta), Backend Engineer 2

---

## Feature 13.2: Meeting Scheduler (Calendly-style)

**Description**: Shareable booking links for easy meeting scheduling with external contacts

### Story 13.2.1: Booking Page Setup
**As a** user
**I want** a personal booking page
**So that** others can schedule meetings with me

**Acceptance Criteria**:
- [ ] Booking page URL: `aicalendar.com/[username]` or custom domain
- [ ] Username selection:
  - Choose username (unique, lowercase, alphanumeric)
  - Validate availability
  - Change username (redirects old URL)
- [ ] Booking page customization:
  - Profile photo, name, bio
  - Headline: "Schedule a meeting with me"
  - Custom welcome message
  - Branding: Company logo, colors (Pro/Enterprise)
- [ ] Meeting types:
  - Create multiple meeting types:
    - "15-min Quick Call"
    - "30-min Discovery Call"
    - "60-min Strategy Session"
    - "Coffee Chat"
  - Each type has: Duration, description, location (Zoom, phone, in-person)
- [ ] Availability settings:
  - Work hours (Mon-Fri 9-5)
  - Buffer time (15 min before/after meetings)
  - Blackout dates (unavailable days)
  - Minimum notice (24 hours)
  - Rolling availability (next 30 days)

**Story Points**: 21
**Sprint**: Sprint 19
**Status**: 🔵 Not Started
**Priority**: P1
**Assignee**: Full Stack Engineer (Squad Beta), Product Designer 2

---

### Story 13.2.2: Booking Flow
**As a** visitor
**I want** to book a meeting easily
**So that** I can connect with the user

**Acceptance Criteria**:
- [ ] Visitor experience:
  - Visit booking page: `aicalendar.com/john`
  - See meeting types (if multiple)
  - Select meeting type
  - See available time slots (calendar view)
  - Select time slot
  - Fill form: Name, email, optional message
  - Confirm booking
- [ ] Availability display:
  - Calendar grid showing available slots
  - Time zone selector (auto-detect visitor's time zone)
  - Only show available times (respect user's calendar)
  - Gray out unavailable times
  - Show next 30 days (scroll to load more)
- [ ] Confirmation:
  - Success page: "Meeting scheduled!"
  - Details: Date, time, duration, location
  - Calendar invite (ICS file download)
  - "Add to Google Calendar" button
- [ ] Email notifications:
  - To visitor: Confirmation email with meeting details
  - To user: "New meeting booked: [Name] on [Date]"
  - Both: Reminder 1 day before, 1 hour before
- [ ] Auto-add to user's calendar:
  - Create event in AI Calendar
  - Sync to Google/Outlook Calendar
  - Include visitor name, email, message

**Story Points**: 21
**Sprint**: Sprint 20
**Status**: 🔵 Not Started
**Priority**: P1
**Assignee**: Full Stack Engineer (Squad Beta), Frontend Specialist 1
**Dependencies**: Story 13.2.1

---

### Story 13.2.3: Meeting Scheduler - Advanced Features
**As a** power user
**I want** advanced scheduling options
**So that** I have full control over my bookings

**Acceptance Criteria**:
- [ ] Custom questions:
  - Ask visitor custom questions (e.g., "What would you like to discuss?")
  - Required or optional
  - Answers included in calendar event
- [ ] Conditional logic:
  - "If topic is 'Sales', require phone number"
  - "If duration is 60 min, require manager approval"
- [ ] Booking limits:
  - Max bookings per day (e.g., 4 meetings max)
  - Max bookings per week
  - Prevent burnout
- [ ] Team scheduling:
  - Round-robin: Distribute meetings across team members
  - Collective: Book with multiple team members at once
  - Use case: Sales team, support team
- [ ] Payment integration (future):
  - Charge for consultation (Stripe integration)
  - Paid meeting types (e.g., "$100 for 60-min consultation")
- [ ] Embed booking widget:
  - Embed on website (iframe or JavaScript widget)
  - WordPress plugin
  - Wix/Squarespace integration

**Story Points**: 21
**Sprint**: Sprint 21
**Status**: 🔵 Not Started
**Priority**: P2
**Assignee**: Full Stack Engineer (Squad Beta), Backend Engineer 2
**Dependencies**: Story 13.2.2

---

### Story 13.2.4: Booking Management
**As a** user
**I want** to manage my bookings
**So that** I control my schedule

**Acceptance Criteria**:
- [ ] Bookings dashboard (`/bookings`):
  - List of all scheduled bookings
  - Filter: Upcoming, past, canceled
  - Search by visitor name or email
- [ ] Booking details:
  - Visitor name, email, time
  - Custom answers
  - Meeting type
  - Location (Zoom link, phone, etc.)
- [ ] Booking actions:
  - Reschedule booking (send new times to visitor)
  - Cancel booking (notify visitor, refund if paid)
  - Add notes (internal, not visible to visitor)
- [ ] Cancellation & rescheduling by visitor:
  - Visitor receives link to cancel/reschedule
  - Self-service (no need to contact user)
  - Cancellation policy (24-hour notice required)
- [ ] Analytics:
  - Total bookings this month
  - Most popular meeting type
  - Booking conversion rate (visits → bookings)
  - No-show rate

**Story Points**: 13
**Sprint**: Sprint 20
**Status**: 🔵 Not Started
**Priority**: P1
**Assignee**: Full Stack Engineer (Squad Beta), Data Analyst

---

### Story 13.2.5: Calendar Integration for Availability
**As a** user
**I want** my bookings to respect my existing calendar
**So that** I'm not double-booked

**Acceptance Criteria**:
- [ ] Check availability across calendars:
  - Google Calendar
  - Outlook Calendar
  - AI Calendar tasks and events
- [ ] Conflict detection:
  - Don't show time slots if user has existing event
  - Respect focus time blocks (don't book during deep work)
  - Respect out-of-office events
- [ ] Buffer time:
  - Don't book back-to-back (add 15-min buffer)
  - Configurable buffer before/after meetings
- [ ] Real-time availability:
  - Update available slots dynamically
  - If user accepts a meeting elsewhere, remove from booking page
- [ ] Multiple calendar support:
  - User can select which calendars to check for conflicts
  - Example: Check work calendar but not personal calendar

**Story Points**: 13
**Sprint**: Sprint 21
**Status**: 🔵 Not Started
**Priority**: P1
**Assignee**: Backend Engineer 2
**Dependencies**: Calendar sync (Initiative 3)

---

## Feature 13.3: Team Task Management

**Description**: Assign tasks to team members and track team capacity

### Story 13.3.1: Task Assignment
**As a** team lead
**I want** to assign tasks to team members
**So that** work is distributed

**Acceptance Criteria**:
- [ ] Assignee field on tasks:
  - Dropdown: Select team member
  - Search team members
  - Assign to multiple people (shared task)
  - Assign to self (default)
- [ ] Task delegation flow:
  - Create task
  - Assign to team member
  - Add notes/instructions
  - Set due date
  - Send notification to assignee
- [ ] Assignee view:
  - Filter: "Assigned to me"
  - Notification: "New task assigned: [Task name]"
  - Accept/reject task (optional)
  - Reassign task (if can't complete)
- [ ] Task permissions:
  - Assignee can edit task
  - Assignee can mark complete
  - Assigner can view progress
  - Admin can reassign
- [ ] Notifications:
  - Email: "John assigned you a task: [Task name]"
  - In-app: Task notification badge
  - Slack: DM with task details (if integrated)

**Story Points**: 13
**Sprint**: Sprint 20
**Status**: 🔵 Not Started
**Priority**: P1
**Assignee**: Backend Engineer 2, Full Stack Engineer (Squad Beta)

---

### Story 13.3.2: Team Capacity View
**As a** team lead
**I want** to see team capacity
**So that** I don't overload anyone

**Acceptance Criteria**:
- [ ] Team capacity dashboard (`/team/capacity`):
  - List of team members
  - For each member:
    - Total tasks assigned
    - Total hours scheduled
    - Available hours (40 - scheduled)
    - Capacity percentage (e.g., 85% utilized)
- [ ] Visual indicators:
  - Green: < 80% capacity (healthy)
  - Yellow: 80-100% capacity (near limit)
  - Red: > 100% capacity (overloaded)
- [ ] Capacity chart:
  - Bar chart: Team member vs hours scheduled
  - Show work hours limit (e.g., 40 hours/week)
- [ ] Filters:
  - This week, next week, this month
  - By project
  - By task priority
- [ ] Recommendations:
  - "Sarah is overbooked (48 hours scheduled). Consider reassigning tasks."
  - "John has 20 hours available this week. He can take on more work."
- [ ] Load balancing:
  - "Reassign task" button to redistribute work
  - Suggest best assignee based on capacity

**Story Points**: 21
**Sprint**: Sprint 21
**Status**: 🔵 Not Started
**Priority**: P1
**Assignee**: Backend Engineer 2, Data Analyst, Frontend Specialist 2

---

### Story 13.3.3: Task Dependencies
**As a** team lead
**I want** to define task dependencies
**So that** work happens in the right order

**Acceptance Criteria**:
- [ ] Dependency field on tasks:
  - "This task depends on: [Select task]"
  - Can have multiple dependencies
  - Dependency type:
    - Blocks: Can't start Task B until Task A is done
    - Related: Tasks are related but not blocking
- [ ] Visual indicator:
  - Show dependency icon on task
  - Hover: "Waiting on 'Design mockups' by Sarah"
- [ ] Dependency logic:
  - If Task A is incomplete, Task B can't be scheduled (or marked as "Blocked")
  - If Task A is completed, Task B becomes "Ready"
  - Notification: "Task 'Design mockups' is complete. You can now start 'Build homepage'."
- [ ] Dependency graph:
  - Visual diagram showing task dependencies
  - Gantt chart style (optional)
  - Identify critical path (longest chain of dependencies)
- [ ] Warnings:
  - Circular dependencies: "Task A depends on Task B, which depends on Task A"
  - Broken dependencies: "Dependency task was deleted"

**Story Points**: 21
**Sprint**: Sprint 22
**Status**: 🔵 Not Started
**Priority**: P2
**Assignee**: Backend Engineer 2, Frontend Specialist 1

---

### Story 13.3.4: Team Task Board (Kanban View)
**As a** team member
**I want** a Kanban board for team tasks
**So that** I see the team's workflow

**Acceptance Criteria**:
- [ ] Kanban board page (`/team/board`):
  - Columns: Backlog, To Do, In Progress, Review, Done
  - Customizable columns (drag to reorder)
- [ ] Task cards:
  - Task title
  - Assignee avatar
  - Due date
  - Priority badge
  - Tags
  - Drag and drop to move between columns
- [ ] Filters:
  - By assignee
  - By project
  - By priority
  - By due date
- [ ] Team view:
  - See all team tasks in one board
  - OR individual boards per team member
- [ ] Updates:
  - Real-time (WebSocket): See when team members move tasks
  - Activity feed: "Sarah moved 'Design mockups' to In Progress"
- [ ] Collaboration:
  - Comment on tasks
  - @mention team members
  - Attach files
- [ ] Swimlanes (optional):
  - Horizontal rows grouped by assignee, project, or priority

**Story Points**: 21
**Sprint**: Sprint 22
**Status**: 🔵 Not Started
**Priority**: P2
**Assignee**: Frontend Specialist 1, Backend Engineer 2

---

## Feature 13.4: Team Analytics

**Description**: Insights into team productivity, meeting culture, and bottlenecks

### Story 13.4.1: Team Productivity Dashboard
**As a** team lead
**I want** to see team productivity metrics
**So that** I understand team performance

**Acceptance Criteria**:
- [ ] Team analytics page (`/team/analytics`):
  - Overview widgets:
    - Total tasks completed this week (team-wide)
    - Total hours worked (estimated)
    - Team task completion rate (%)
    - Average task duration
- [ ] Individual metrics:
  - Tasks completed per team member
  - Hours worked per team member
  - Completion rate per team member
  - Leaderboard (optional, can be demotivating)
- [ ] Project metrics:
  - Tasks by project
  - Project progress (% complete)
  - Project health (on track, at risk, overdue)
- [ ] Trends:
  - Chart: Team productivity over time (last 12 weeks)
  - Compare to previous period (vs last month, vs last quarter)
- [ ] Insights:
  - "Team productivity increased 15% this month"
  - "Design project is at risk (50% of tasks overdue)"
  - "John completed 20% more tasks than average"

**Story Points**: 21
**Sprint**: Sprint 21
**Status**: 🔵 Not Started
**Priority**: P1
**Assignee**: Data Analyst, Backend Engineer 2, Frontend Specialist 2

---

### Story 13.4.2: Meeting Culture Metrics
**As a** team lead
**I want** to analyze team meeting culture
**So that** I optimize team meeting load

**Acceptance Criteria**:
- [ ] Meeting metrics:
  - Total meeting hours (team-wide)
  - Average meeting hours per person
  - % of time in meetings (team average)
  - Meeting distribution (who attends most meetings?)
- [ ] Meeting quality metrics:
  - Back-to-back meetings (% of team)
  - Long meetings (> 2 hours)
  - Early/late meetings (before 9 AM, after 5 PM)
  - Meeting-free time (hours per week without meetings)
- [ ] Benchmarks:
  - Industry average: 15 hours/week in meetings
  - Recommended: < 25% of time in meetings
  - Color coding: Green (healthy), Yellow (moderate), Red (overload)
- [ ] Recommendations:
  - "Team spends 40% of time in meetings (industry avg: 25%). Consider No-Meeting Fridays."
  - "Sarah has 6 hours of back-to-back meetings on Tuesday. Add breaks."
  - "3 meetings have 10+ attendees. Consider smaller meetings."
- [ ] Meeting cost calculator:
  - Calculate meeting cost: Attendees × hourly rate × duration
  - "This week's meetings cost: $12,000"
  - Awareness of meeting time value

**Story Points**: 13
**Sprint**: Sprint 22
**Status**: 🔵 Not Started
**Priority**: P1
**Assignee**: Data Analyst, Backend Engineer 2

---

### Story 13.4.3: Bottleneck Detection
**As a** team lead
**I want** to identify bottlenecks
**So that** I resolve blockers

**Acceptance Criteria**:
- [ ] Bottleneck analysis:
  - Identify tasks that are blocking other tasks
  - Identify team members who are blockers (many tasks waiting on them)
  - Identify overdue dependencies
- [ ] Bottleneck dashboard:
  - List of tasks with dependencies waiting
  - "3 tasks waiting on Sarah to complete 'Design mockups'"
  - "5 tasks blocked (waiting on dependencies)"
- [ ] Team member workload:
  - "Sarah is a bottleneck: 8 team members waiting on her"
  - Recommendation: "Distribute Sarah's workload or prioritize her tasks"
- [ ] Alerts:
  - Notify when bottleneck detected
  - "Task 'API endpoint' has been blocking 3 tasks for 5 days"
- [ ] Resolution:
  - Quick actions: Reassign task, escalate priority, remove dependency
  - Track bottleneck resolution time

**Story Points**: 13
**Sprint**: Sprint 23
**Status**: 🔵 Not Started
**Priority**: P2
**Assignee**: Data Analyst, Backend Engineer 2
**Dependencies**: Task dependencies (Story 13.3.3)

---

## Notes

- **Initiative 13 is key for B2B revenue** - Individual users pay $10/mo. Teams pay $20/user/mo = $400/mo for 20-person team.
- **Competitive landscape**:
  - Calendly: $10-15/seat/mo (meeting scheduling)
  - Asana: $10-25/user/mo (task management)
  - Our advantage: All-in-one (tasks + calendar + meetings + AI)
- **Team features pricing**:
  - Free: No team features (individual only)
  - Pro: Basic team features (view team calendar, shared events)
  - Team: Full team features ($20/user/mo, min 3 users)
  - Enterprise: Advanced features (SSO, custom, dedicated support)
- **Technical considerations**:
  - Real-time collaboration: WebSocket or Pusher for live updates
  - Permissions: Row-level security (Supabase RLS or Prisma)
  - Multi-tenancy: Separate team data (team_id foreign key)
  - Scalability: Optimize queries for large teams (100+ users)
- **Privacy considerations**:
  - Team calendar: Don't show private event details (only "Busy")
  - User can mark events as "Private" (hide from team)
  - Admin can't see personal tasks (unless assigned)
- **Metrics to track**:
  - Team feature adoption (% of users in teams)
  - Average team size
  - Booking page usage (bookings per user)
  - Task assignment rate (% of tasks assigned vs self-assigned)
  - Team retention (teams have lower churn than individuals)
- **Go-to-market**:
  - Target: Startups, agencies, consultants, sales teams
  - Use cases: Project management, client scheduling, team coordination
  - Marketing: "Calendly + Asana + AI = AI Calendar Agent"

---

**Total Stories in Initiative 13**: 16 stories
**Total Story Points**: 267 points (~6-7 sprints)
**Priority**: P1 (Strategic - B2B revenue unlock)
**Dependencies**: Task management (Initiative 4), Calendar sync (Initiative 3), Team collaboration (Initiative 7)

---

**Last Updated**: 2025-11-12
**Version**: 1.0
