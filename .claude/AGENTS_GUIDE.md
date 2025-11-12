# Claude Agents Guide

This project uses specialized Claude agents to streamline development. Each agent has specific expertise and responsibilities.

## Available Agents

### 🎨 UX/UI Agent
**Location**: `.claude/agents/ux-ui.md`
**Expertise**: Design, user experience, accessibility, Shadcn UI

**Use when**:
- Creating new UI components
- Designing user interfaces
- Ensuring accessibility compliance
- Maintaining design system consistency
- Reviewing visual designs

**Example prompts**:
```
@ux-ui Design a sign-in page with Google OAuth button.
Requirements: centered card, professional look, mobile-responsive.

@ux-ui Review the dashboard layout for accessibility issues.

@ux-ui Create a task card component with hover states and animations.
```

### 💻 Full Stack Developer Agent
**Location**: `.claude/agents/full-stack-dev.md`
**Expertise**: Next.js, React, TypeScript, Shadcn UI, PostgreSQL, APIs, DevOps

**Use when**:
- Implementing features
- Writing database queries
- Setting up authentication
- Creating API endpoints
- Fixing bugs
- Configuring CI/CD
- Any coding task

**Example prompts**:
```
@full-stack-dev Implement the authentication flow specified in
docs/specs/phase-1/authentication.md

@full-stack-dev Set up Prisma with PostgreSQL and create the User model.

@full-stack-dev Fix the navbar mobile menu not closing on link click.

@full-stack-dev Add database migration for tasks table.
```

### 📋 Project Manager Agent
**Location**: `.claude/agents/project-manager.md`
**Expertise**: Specifications, planning, coordination, documentation

**Use when**:
- Creating feature specifications
- Planning sprints
- Breaking down large features
- Reviewing project status
- Making architectural decisions
- Coordinating between agents

**Example prompts**:
```
@project-manager Create a spec for calendar integration with Google Calendar.

@project-manager What's the current status of Phase 1? What's blocking us?

@project-manager Break down the task management feature into smaller tasks.

@project-manager Review if the authentication implementation meets the spec.
```

## How to Use Agents

### Method 1: Tag in Prompt (Recommended)
Simply tag the agent in your message:

```
@ux-ui I need a dashboard layout with a sidebar and main content area.
```

### Method 2: Context-Aware
Claude Code will automatically select the right agent based on your request:

```
"I need to implement user authentication with Google OAuth"
→ Will use Full Stack Developer agent

"Design a calendar view component"
→ Will use UX/UI agent

"Create a specification for task management"
→ Will use Project Manager agent
```

### Method 3: Explicit Agent Selection
If you're using the CLI:

```bash
# Use specific agent
claude --agent ux-ui "Design the sign-in page"
claude --agent full-stack-dev "Implement the API endpoint"
claude --agent project-manager "Create sprint plan"
```

## Workflow Examples

### Example 1: New Feature Implementation

**Step 1**: Project Manager creates spec
```
@project-manager Create a specification for user profile management.
Include: view profile, edit profile, upload avatar.
```

**Step 2**: UX/UI designs interface
```
@ux-ui Design the profile page based on the spec in
docs/specs/phase-1/profile-management.md
```

**Step 3**: Full Stack Dev implements
```
@full-stack-dev Implement the profile management feature.
Spec: docs/specs/phase-1/profile-management.md
Designs: [link or description]
```

**Step 4**: Project Manager reviews
```
@project-manager Review the profile management implementation
against the spec. Are all acceptance criteria met?
```

### Example 2: Bug Fix

```
@full-stack-dev There's a bug where the navbar mobile menu doesn't
close when clicking a link. Please investigate and fix.
```

### Example 3: Design System Addition

```
@ux-ui Add a new "Badge" component to our design system.
It should have variants: default, success, warning, error.
Follow our existing design patterns.
```

### Example 4: Architecture Decision

```
@project-manager We need to decide between tRPC and REST API
for our backend. Please evaluate both options and make a
recommendation with an ADR (Architecture Decision Record).
```

## Agent Collaboration

Agents can collaborate on complex tasks:

```
I need to add a calendar integration feature.

@project-manager Please create a detailed specification.
@ux-ui Once the spec is ready, design the UI.
@full-stack-dev Once designs are ready, implement the feature.
```

Claude Code will orchestrate the agents in sequence.

## Best Practices

### ✅ Do

- **Be specific**: Provide clear context and requirements
- **Reference docs**: Point to specs, designs, or existing code
- **One agent per task**: Don't try to make one agent do another's job
- **Follow specs**: Ensure implementations match specifications
- **Review outputs**: Always review agent work before committing

### ❌ Don't

- **Don't mix responsibilities**: Don't ask UX/UI agent to write backend code
- **Don't skip specs**: Don't ask dev to implement without a spec
- **Don't bypass PM**: Always have PM create/approve specs first
- **Don't ignore feedback**: If an agent flags an issue, address it

## Agent Decision Tree

```
Need to...

├─ Create a specification?
│  └─ Use @project-manager
│
├─ Design UI or create components?
│  └─ Use @ux-ui
│
├─ Implement code, API, or database?
│  └─ Use @full-stack-dev
│
├─ Fix a bug?
│  └─ Use @full-stack-dev
│
├─ Make architectural decision?
│  └─ Use @project-manager
│
├─ Review accessibility?
│  └─ Use @ux-ui
│
├─ Plan a sprint?
│  └─ Use @project-manager
│
└─ Not sure?
   └─ Ask any agent, Claude Code will route correctly
```

## Agent Capabilities Summary

| Task | UX/UI | Full Stack | PM |
|------|-------|------------|-----|
| Write specifications | ❌ | ❌ | ✅ |
| Design UI components | ✅ | ❌ | ❌ |
| Implement features | ❌ | ✅ | ❌ |
| Write database queries | ❌ | ✅ | ❌ |
| Set up authentication | ❌ | ✅ | ❌ |
| Create API endpoints | ❌ | ✅ | ❌ |
| Configure CI/CD | ❌ | ✅ | ❌ |
| Fix bugs | Sometimes | ✅ | ❌ |
| Review accessibility | ✅ | ❌ | ❌ |
| Create animations | ✅ | ✅ | ❌ |
| Sprint planning | ❌ | ❌ | ✅ |
| Write documentation | ✅ | ✅ | ✅ |
| Make architecture decisions | ❌ | Sometimes | ✅ |
| Review code quality | ❌ | ✅ | ❌ |
| Ensure spec compliance | ❌ | ❌ | ✅ |

## Current Project Context

### Phase 0: Foundation ✅ COMPLETE
- Landing page built
- Project structure set up
- Agents configured
- Spec-kit integrated

### Phase 1: Authentication (IN PROGRESS)
- **Spec**: `docs/specs/phase-1/authentication.md`
- **Status**: Spec ready, awaiting UX/UI designs
- **Next**: UX/UI to design sign-in page

### What to Work On

**Project Manager**:
- Create specs for onboarding flow
- Create specs for profile management
- Plan Phase 2 (Calendar Integration)

**UX/UI**:
- Design sign-in page (from authentication spec)
- Design onboarding flow
- Design user profile page

**Full Stack Developer**:
- Wait for sign-in page design
- Then: Implement authentication (NextAuth.js setup)
- Set up Prisma and database

## Tips for Effective Agent Use

1. **Start with PM**: Always begin new features with a specification from PM
2. **Follow the flow**: PM → UX/UI → Full Stack Dev
3. **Reference documents**: Point agents to existing specs and docs
4. **Be detailed**: More context = better results
5. **Iterate**: Don't expect perfection on first try
6. **Review thoroughly**: You're the final quality gate

## Getting Help

**Agent not behaving correctly?**
- Check the agent's configuration file in `.claude/agents/`
- Ensure you're using the right agent for the task
- Provide more specific context

**Need to update an agent?**
- Edit the agent's markdown file in `.claude/agents/`
- Add new capabilities or adjust behavior
- Commit the changes

**Want to add a new agent?**
- Create a new `.md` file in `.claude/agents/`
- Define the agent's role and expertise
- Document with examples

## Examples from Other Projects

### Successful Agent Usage

```
✅ GOOD:
"@full-stack-dev Implement the authentication specified in
docs/specs/phase-1/authentication.md. The UX/UI designs are in
Figma [link]. Focus on Google OAuth first."

❌ BAD:
"@full-stack-dev Make authentication"
(Too vague, no context)
```

```
✅ GOOD:
"@ux-ui Design a task card component. Requirements:
- Show task title, duration, priority
- Support drag and drop visual
- Hover state with actions
- Mobile responsive
- Follow our design system colors"

❌ BAD:
"@ux-ui Make a task thing"
(Not specific enough)
```

```
✅ GOOD:
"@project-manager Create a specification for calendar sync.
We need to support Google Calendar with real-time sync.
Include edge cases like API rate limits and conflict resolution."

❌ BAD:
"@project-manager Write a spec for calendars"
(Lacks detail on requirements)
```

## Conclusion

Using specialized agents keeps the project organized and ensures high-quality deliverables. Each agent is an expert in their domain, so leverage their strengths!

**Remember**:
- Specs first (PM)
- Then designs (UX/UI)
- Then implementation (Full Stack Dev)
- Always follow the process!

---

**Questions?** Check the individual agent files in `.claude/agents/` for more details.
