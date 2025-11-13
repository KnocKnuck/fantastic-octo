# Initiative 11: Integrations Ecosystem

**Goal**: Integrate with tools users already use to reduce friction and increase adoption
**Business Value**: Users won't switch if it requires re-entering data. Integrations = lower barriers = higher adoption
**Timeline**: Q2-Q3 2026 (Weeks 12-24)
**Status**: 🔵 Not Started
**Owner**: Integrations Lead + Product Manager 2
**Squad**: Squad Zeta (Integrations & Partnerships)

> Critical for adoption. Users have tasks in Todoist, issues in Linear, notes in Notion. Import = instant value.

---

## Feature 11.1: Task Management Integrations

**Description**: Two-way sync with popular task management tools

### Story 11.1.1: Todoist Integration
**As a** Todoist user
**I want** to import my Todoist tasks
**So that** I don't duplicate work

**Acceptance Criteria**:
- [ ] OAuth integration with Todoist API
- [ ] Import flow:
  - Connect Todoist account
  - Select projects to sync
  - Initial import (all tasks)
  - Ongoing sync (every 15 minutes)
- [ ] Field mapping:
  - Todoist task → AI Calendar task
  - Title, description, due date, priority
  - Labels → Tags
  - Projects → Projects
- [ ] Two-way sync:
  - Changes in Todoist → Update in AI Calendar
  - Changes in AI Calendar → Update in Todoist
  - Mark complete in either → Syncs to both
- [ ] Conflict resolution:
  - Last-write-wins
  - Show conflict notification
- [ ] Settings:
  - Choose sync direction (one-way or two-way)
  - Auto-schedule imported tasks (on/off)
- [ ] Sync status indicator:
  - "Last synced 2 minutes ago"
  - "Syncing..." animation
  - Error handling with retry

**Story Points**: 21
**Sprint**: Sprint 13
**Status**: 🔵 Not Started
**Priority**: P0
**Assignee**: Integrations Engineer 1, Backend Engineer 2

---

### Story 11.1.2: Asana Integration
**As an** Asana user
**I want** to import Asana tasks
**So that** I can schedule my Asana work

**Acceptance Criteria**:
- [ ] OAuth integration with Asana API
- [ ] Import flow:
  - Connect Asana account
  - Select workspaces/projects to sync
  - Choose which tasks to import (assigned to me, all, custom filter)
- [ ] Field mapping:
  - Asana task → AI Calendar task
  - Name, notes, due date, assignee
  - Tags, custom fields
  - Subtasks → Checklist items
- [ ] Two-way sync:
  - Status sync (To Do, In Progress, Complete)
  - Due date sync
  - Notes/comments sync (optional)
- [ ] Asana-specific features:
  - Import dependencies (Task B waits for Task A)
  - Respect Asana milestones
- [ ] Webhook support:
  - Real-time updates (instead of polling)
  - Instant sync when Asana task changes

**Story Points**: 21
**Sprint**: Sprint 14
**Status**: 🔵 Not Started
**Priority**: P0
**Assignee**: Integrations Engineer 2, Backend Engineer 2

---

### Story 11.1.3: Linear Integration
**As a** Linear user
**I want** to schedule Linear issues
**So that** I plan my engineering work

**Acceptance Criteria**:
- [ ] OAuth integration with Linear API
- [ ] Import flow:
  - Connect Linear account
  - Select teams to sync
  - Filter: My issues, Team issues, All issues
  - Filter by status (Backlog, Todo, In Progress)
- [ ] Field mapping:
  - Linear issue → AI Calendar task
  - Title, description, labels, priority
  - Estimate (story points) → Duration
  - Due date
  - Project, Cycle (sprint)
- [ ] Two-way sync:
  - Status sync (Backlog, Todo, In Progress, Done)
  - Schedule in AI Calendar → Update Linear due date
  - Complete in AI Calendar → Complete in Linear
- [ ] Linear-specific features:
  - Import parent/child issues (epics)
  - Sync cycle deadlines
  - Show Linear issue ID (e.g., "ENG-123")
- [ ] Deep linking:
  - Click task → Open Linear issue
  - Linear webhook → Update AI Calendar

**Story Points**: 21
**Sprint**: Sprint 15
**Status**: 🔵 Not Started
**Priority**: P0
**Assignee**: Integrations Engineer 1, Backend Engineer 2

---

### Story 11.1.4: Jira Integration
**As a** Jira user (enterprise)
**I want** to schedule Jira tickets
**So that** I plan sprint work

**Acceptance Criteria**:
- [ ] OAuth integration with Jira Cloud API
- [ ] Support Jira Server (on-premise) via API token
- [ ] Import flow:
  - Connect Jira account
  - Select projects to sync
  - JQL filter support (advanced): "assignee = currentUser() AND status != Done"
- [ ] Field mapping:
  - Jira issue → AI Calendar task
  - Summary, description, labels, priority
  - Story points → Duration estimate
  - Due date, sprint
  - Issue type (Story, Bug, Task)
- [ ] Two-way sync:
  - Status sync (To Do, In Progress, Done)
  - Time tracking (AI Calendar actual time → Jira logged work)
  - Comments (optional)
- [ ] Jira-specific features:
  - Import epics and stories (hierarchy)
  - Respect sprint dates
  - Show Jira issue key (e.g., "PROJ-456")
- [ ] Enterprise features:
  - Custom field mapping
  - Multiple Jira instances
  - Jira Data Center support

**Story Points**: 34
**Sprint**: Sprint 16
**Status**: 🔵 Not Started
**Priority**: P1
**Assignee**: Integrations Engineer 2, Backend Engineer 2
**Dependencies**: Enterprise customers

---

### Story 11.1.5: Generic Task Import (CSV/JSON)
**As a** user of other tools
**I want** to import tasks via file
**So that** I can migrate from any tool

**Acceptance Criteria**:
- [ ] CSV import:
  - Upload CSV file
  - Map columns: Title, Description, Due Date, Priority, Tags, Project
  - Preview import (first 5 rows)
  - Validate data (highlight errors)
  - Import (bulk create tasks)
- [ ] JSON import:
  - Upload JSON file (schema defined)
  - Validate against schema
  - Import
- [ ] Supported formats:
  - CSV (Excel, Google Sheets)
  - JSON (API export)
  - TSV (tab-separated)
- [ ] Import history:
  - Track imports
  - Show import date, source, task count
  - Re-import option (overwrite or merge)
- [ ] Export feature:
  - Export tasks to CSV/JSON
  - Include all fields
  - Used for backup or migration

**Story Points**: 13
**Sprint**: Sprint 13
**Status**: 🔵 Not Started
**Priority**: P1
**Assignee**: Full Stack Engineer (Squad Zeta)

---

### Story 11.1.6: Integration Marketplace (Future)
**As a** user
**I want** to see all available integrations
**So that** I can connect my tools

**Acceptance Criteria**:
- [ ] Integrations page (`/integrations`)
- [ ] Categories:
  - Task Management (Todoist, Asana, Linear, Jira, Trello, ClickUp)
  - Calendar (Google, Outlook - already built)
  - Communication (Slack, Teams)
  - Time Tracking (Toggl, Harvest, Clockify)
  - Notes (Notion, Obsidian)
  - CRM (HubSpot, Salesforce)
  - Coming Soon (planned integrations)
- [ ] Each integration card:
  - Logo, name, description
  - "Connect" button
  - Connected status (if already connected)
  - "Learn more" link (help docs)
- [ ] Search/filter integrations
- [ ] Popular integrations (most connected)
- [ ] Request integration form

**Story Points**: 8
**Sprint**: Sprint 17
**Status**: 🔵 Not Started
**Priority**: P2
**Assignee**: Frontend Specialist 2, Product Designer 2

---

## Feature 11.2: Communication Integrations

**Description**: Integrate with Slack and Microsoft Teams for notifications and commands

### Story 11.2.1: Slack Integration - Basic
**As a** Slack user
**I want** daily schedule posted to Slack
**So that** I see my plan without opening the app

**Acceptance Criteria**:
- [ ] Slack app setup:
  - Create Slack app
  - OAuth flow (install to workspace)
  - Request permissions: chat:write, commands
- [ ] Features:
  - Daily schedule digest (posted at 8 AM)
  - Channel: DM or custom channel (#productivity)
  - Format: Rich message with tasks listed
  - Include: Task title, time, priority, project
- [ ] Schedule message template:
  - "Good morning! Here's your schedule for today:"
  - List of tasks with checkboxes
  - Summary: "5 tasks, 6 hours scheduled"
  - Link to full calendar
- [ ] Settings:
  - Choose channel
  - Choose time (default 8 AM)
  - Enable/disable

**Story Points**: 13
**Sprint**: Sprint 14
**Status**: 🔵 Not Started
**Priority**: P1
**Assignee**: Integrations Engineer 1, Backend Engineer 2

---

### Story 11.2.2: Slack Integration - Commands
**As a** Slack user
**I want** to interact with AI Calendar from Slack
**So that** I don't need to open the app

**Acceptance Criteria**:
- [ ] Slash commands:
  - `/aicalendar today` → Show today's schedule
  - `/aicalendar add [task]` → Quick add task
  - `/aicalendar next` → What's my next task?
  - `/aicalendar summary` → Week summary
- [ ] Command responses:
  - Ephemeral message (only visible to user)
  - Rich formatting with buttons
  - Quick actions: "Mark complete", "Reschedule"
- [ ] Interactive components:
  - Mark task complete from Slack
  - Snooze task
  - Start focus session
- [ ] Notifications:
  - Task reminder: "Starting 'Design mockups' in 10 min"
  - Task overdue: "Task 'Write blog post' is overdue"
  - Schedule changes: "Your schedule was updated"
- [ ] DND integration:
  - Respect Slack Do Not Disturb
  - Pause notifications during focus time

**Story Points**: 21
**Sprint**: Sprint 15
**Status**: 🔵 Not Started
**Priority**: P1
**Assignee**: Integrations Engineer 1, Backend Engineer 2
**Dependencies**: Story 11.2.1

---

### Story 11.2.3: Microsoft Teams Integration
**As a** Microsoft Teams user
**I want** AI Calendar in Teams
**So that** I use it at work

**Acceptance Criteria**:
- [ ] Teams app setup:
  - Create Teams app
  - OAuth flow (Azure AD)
  - Permissions: chat, notifications
- [ ] Features (similar to Slack):
  - Daily schedule message
  - Bot commands:
    - @AI Calendar today
    - @AI Calendar add task
    - @AI Calendar next
  - Adaptive Cards (rich formatting)
- [ ] Teams tab integration:
  - Add "AI Calendar" tab to channel
  - Show team calendar view
  - Collaboration features
- [ ] Teams notifications:
  - Task reminders
  - Schedule updates
  - Respect Teams presence (busy, in a meeting, etc.)
- [ ] Teams-specific:
  - Create task from Teams message (context menu)
  - Schedule Teams meetings via bot

**Story Points**: 21
**Sprint**: Sprint 16
**Status**: 🔵 Not Started
**Priority**: P1
**Assignee**: Integrations Engineer 2, Backend Engineer 2
**Dependencies**: Enterprise customers

---

### Story 11.2.4: Slack & Teams Status Sync
**As a** user
**I want** my status synced to Slack/Teams
**So that** my team knows I'm in focus mode

**Acceptance Criteria**:
- [ ] Sync AI Calendar status to Slack/Teams:
  - In focus mode → Set status: "🎯 Focusing" (DND on)
  - In meeting → Set status: "📞 In a meeting"
  - Available → Clear status
- [ ] Custom status messages:
  - "Working on [task name]"
  - "Deep work until [end time]"
  - "Back at [time]"
- [ ] Auto-expire status:
  - Clear status when task/meeting ends
- [ ] Bidirectional sync:
  - Slack status "In a meeting" → Block calendar in AI Calendar
  - Teams presence "Busy" → Don't schedule tasks
- [ ] Settings:
  - Enable/disable status sync
  - Custom status templates

**Story Points**: 13
**Sprint**: Sprint 17
**Status**: 🔵 Not Started
**Priority**: P2
**Assignee**: Integrations Engineer 1

---

## Feature 11.3: Note-Taking Integrations

**Description**: Sync with Notion, Obsidian for notes and knowledge management

### Story 11.3.1: Notion Integration
**As a** Notion user
**I want** to sync tasks from Notion databases
**So that** I schedule my Notion tasks

**Acceptance Criteria**:
- [ ] OAuth integration with Notion API
- [ ] Import flow:
  - Connect Notion workspace
  - Select databases to sync
  - Map properties: Title, Status, Due Date, Tags
- [ ] Two-way sync:
  - Notion database item → AI Calendar task
  - Status sync (Todo, In Progress, Done)
  - Due date sync
  - Check/uncheck → Complete/incomplete
- [ ] Notion-specific:
  - Support for Notion relations (linked databases)
  - Embed AI Calendar schedule in Notion page (iframe)
  - Create Notion page from task (meeting notes)
- [ ] Use cases:
  - Project management in Notion
  - Personal task database in Notion
  - Team wiki with tasks

**Story Points**: 21
**Sprint**: Sprint 15
**Status**: 🔵 Not Started
**Priority**: P2
**Assignee**: Integrations Engineer 2, Backend Engineer 2

---

### Story 11.3.2: Obsidian Integration (Plugin)
**As an** Obsidian user
**I want** an Obsidian plugin
**So that** I schedule tasks from my notes

**Acceptance Criteria**:
- [ ] Obsidian community plugin:
  - Install from Obsidian Community Plugins
  - API key authentication
- [ ] Features:
  - Sync tasks from Obsidian notes (parse `- [ ] Task` checkboxes)
  - Filter: All vaults, specific folders, daily notes
  - Map metadata: Due date (`due:: 2026-01-15`), Priority (`priority:: high`)
- [ ] Commands:
  - "AI Calendar: Sync tasks"
  - "AI Calendar: Add to schedule"
  - "AI Calendar: View today's schedule"
- [ ] Display:
  - Sidebar panel with today's schedule
  - Inline schedule view (embed in note)
- [ ] Two-way sync:
  - Complete task in Obsidian → Complete in AI Calendar
  - Complete in AI Calendar → Check checkbox in Obsidian

**Story Points**: 21
**Sprint**: Sprint 16
**Status**: 🔵 Not Started
**Priority**: P2
**Assignee**: Integrations Engineer 1 (TypeScript, Obsidian API)

---

### Story 11.3.3: Meeting Notes Integration
**As a** user
**I want** meeting notes auto-linked to calendar events
**So that** I can find notes later

**Acceptance Criteria**:
- [ ] Detect meeting notes in Notion/Obsidian:
  - Page title: "Meeting: [event name]"
  - Date matches calendar event
  - Tagged with "meeting"
- [ ] Auto-link:
  - Calendar event → Link to note
  - Note → Link to calendar event
- [ ] Template support:
  - "Create meeting note" button on calendar event
  - Pre-fill template: Date, attendees, agenda
  - Save to Notion or Obsidian
- [ ] Quick access:
  - "View notes" button on calendar event
  - Search meetings by note content

**Story Points**: 13
**Sprint**: Sprint 17
**Status**: 🔵 Not Started
**Priority**: P2
**Assignee**: Integrations Engineer 2, Backend Engineer 2
**Dependencies**: Stories 11.3.1, 11.3.2

---

## Feature 11.4: Time Tracking Integrations

**Description**: Auto-track time spent on tasks with Toggl, Harvest, Clockify

### Story 11.4.1: Toggl Integration
**As a** Toggl user
**I want** to auto-start Toggl timer
**So that** I track time effortlessly

**Acceptance Criteria**:
- [ ] OAuth integration with Toggl API
- [ ] Connect Toggl account:
  - Select workspace
  - Map projects (AI Calendar project → Toggl project)
- [ ] Auto-start timer:
  - Click "Start task" in AI Calendar → Start Toggl timer
  - Timer name: Task title
  - Project: Mapped project
  - Tags: AI Calendar tags
- [ ] Auto-stop timer:
  - Click "Complete task" → Stop Toggl timer
  - Log actual duration
- [ ] Manual timer control:
  - "Start Toggl timer" button
  - "Stop timer" button
  - Edit time entry in Toggl
- [ ] Sync time entries:
  - Import Toggl time entries → AI Calendar actual time
  - Show total time tracked per task
- [ ] Reports:
  - Compare estimated vs actual time
  - Weekly time tracking summary

**Story Points**: 21
**Sprint**: Sprint 14
**Status**: 🔵 Not Started
**Priority**: P2
**Assignee**: Integrations Engineer 1, Backend Engineer 2

---

### Story 11.4.2: Harvest Integration
**As a** Harvest user (agencies, freelancers)
**I want** to track billable hours
**So that** I invoice clients accurately

**Acceptance Criteria**:
- [ ] OAuth integration with Harvest API
- [ ] Connect Harvest account:
  - Select Harvest projects and tasks
  - Map AI Calendar project → Harvest project
  - Map task → Harvest task type
- [ ] Auto-create time entries:
  - Complete task → Create Harvest time entry
  - Duration: Actual time spent
  - Billable: Yes/no (based on project settings)
  - Notes: Task description
- [ ] Billable hour tracking:
  - Mark tasks as "Billable" or "Non-billable"
  - Show billable hours per week
  - Weekly revenue estimate
- [ ] Invoice readiness:
  - "This week: 32 billable hours ($3,200)"
  - Export to Harvest for invoicing
- [ ] Settings:
  - Default billable status
  - Hourly rate

**Story Points**: 21
**Sprint**: Sprint 15
**Status**: 🔵 Not Started
**Priority**: P2
**Assignee**: Integrations Engineer 2, Backend Engineer 2

---

### Story 11.4.3: Built-in Time Tracking (No Integration)
**As a** user without external time tracker
**I want** built-in time tracking
**So that** I track time without extra tools

**Acceptance Criteria**:
- [ ] Start/stop timer:
  - "Start" button on task (begins timer)
  - "Stop" button (stops timer, logs duration)
  - Pause/resume support
- [ ] Active timer indicator:
  - Navbar: "🔴 Timer running: Design mockups (23:45)"
  - Desktop notification when timer reaches estimate
  - Sound alert (optional)
- [ ] Time logs:
  - Track all time entries per task
  - Show: Date, start time, end time, duration
  - Edit/delete time entries
- [ ] Reports:
  - Time tracked per day/week/month
  - Time by project
  - Time by task type
  - Export to CSV
- [ ] Integrations:
  - Export time logs to Toggl/Harvest (manual)

**Story Points**: 13
**Sprint**: Sprint 13
**Status**: 🔵 Not Started
**Priority**: P2
**Assignee**: Full Stack Engineer (Squad Zeta)

---

## Notes

- **Initiative 11 is critical for adoption** - Users won't switch without data import
- **Integration priority**:
  - P0: Todoist, Asana, Linear (most requested in user research)
  - P1: Jira, Slack (enterprise/teams)
  - P2: Notion, Toggl, Teams (power users)
- **Technical approach**:
  - Queue system for sync jobs (Inngest or BullMQ)
  - Webhook support for real-time updates (preferred over polling)
  - Retry logic with exponential backoff
  - Rate limiting (respect API limits)
  - OAuth 2.0 for all integrations (secure)
- **Data sync challenges**:
  - Conflict resolution (last-write-wins vs user choice)
  - Bidirectional sync loops (A → B → A)
  - Schema mapping (priority levels differ across tools)
  - Performance (sync 1000+ tasks efficiently)
- **Metrics to track**:
  - Integration adoption rate (% of users with >= 1 integration)
  - Most popular integrations
  - Sync success rate (target: 99%+)
  - Sync latency (target: < 5 min)
  - Errors/failures per integration
- **Business model**:
  - Basic integrations: Free tier (Google Calendar, CSV import)
  - Advanced integrations: Pro tier (Todoist, Asana, Slack)
  - Enterprise integrations: Enterprise tier (Jira, Teams, SSO)
  - Integration marketplace: Partner revenue share (future)

---

**Total Stories in Initiative 11**: 16 stories
**Total Story Points**: 267 points (~6-7 sprints)
**Priority**: P1 (Strategic - critical for adoption)
**Dependencies**: Task management (Initiative 4), API infrastructure (Initiative 7), Queue system (Initiative 3)

---

**Last Updated**: 2025-11-12
**Version**: 1.0
