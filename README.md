# AI Calendar Agent

A modern SaaS application that automatically plans your tasks inside your Google or Outlook Calendar using AI.

**Current Status**: Phase 0 Complete (Landing Page), Phase 1 In Progress (Authentication)

## 🚀 Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **Shadcn UI** components
- **Framer Motion** animations
- Fully responsive design
- Modern, minimalist aesthetic
- SEO optimized

## 📦 Project Structure

```
├── .claude/                # Claude AI agents
│   ├── agents/
│   │   ├── ux-ui.md       # UX/UI Agent
│   │   ├── full-stack-dev.md  # Full Stack Developer
│   │   └── project-manager.md # Project Manager
│   └── AGENTS_GUIDE.md    # How to use agents
├── .speckit/              # Spec-kit configuration
│   └── constitution       # Project principles
├── app/                   # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx          # Landing page
│   └── globals.css
├── components/
│   ├── ui/               # Shadcn UI components
│   ├── features/         # Feature-specific components
│   ├── layouts/          # Layout components
│   └── shared/           # Shared components
├── docs/                 # Documentation
│   ├── specs/            # Feature specifications
│   │   ├── phase-1/
│   │   └── phase-2/
│   ├── architecture/     # Architecture docs
│   └── PROJECT_OVERVIEW.md
├── lib/                  # Utilities
│   ├── utils.ts
│   └── animations.ts
└── public/               # Static assets

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fantastic-octo
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **UI Components:** Shadcn UI
- **Animations:** Framer Motion
- **Icons:** Lucide React

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🤖 AI Agents

This project uses specialized Claude AI agents for development:

### Available Agents

- **🎨 UX/UI Agent** - Design system, components, accessibility
- **💻 Full Stack Developer** - Implementation, APIs, database, DevOps
- **📋 Project Manager** - Specifications, planning, coordination

### Usage

```bash
# Tag an agent in your prompt
@ux-ui Design the sign-in page
@full-stack-dev Implement authentication
@project-manager Create a spec for calendar integration
```

📖 See [`.claude/AGENTS_GUIDE.md`](.claude/AGENTS_GUIDE.md) for detailed usage instructions.

## 📋 Spec-Kit Integration

This project uses [GitHub Spec-Kit](https://github.com/github/spec-kit) for spec-driven development.

### Key Documents

- **Constitution**: `.speckit/constitution` - Project principles and standards
- **Specifications**: `docs/specs/` - Feature specifications by phase
- **Project Overview**: `docs/PROJECT_OVERVIEW.md` - Vision and roadmap

### Development Workflow

1. **Specify** (PM): Create detailed feature specification
2. **Design** (UX/UI): Design the user interface
3. **Implement** (Full Stack): Build according to spec
4. **Review** (PM): Verify against acceptance criteria

## 🎯 Landing Page Sections

1. **Hero** - Main value proposition with CTAs
2. **How it Works** - 3-step process explanation
3. **Why You'll Love It** - Key benefits
4. **Features** - Feature highlights grid
5. **Testimonial** - Social proof
6. **CTA** - Beta signup with email capture
7. **Footer** - Links and copyright

## 🗺️ Project Phases

### Phase 0: Foundation ✅ (COMPLETED)
- [x] Landing page
- [x] Project structure
- [x] Design system
- [x] Agent setup
- [x] Spec-kit integration

### Phase 1: Authentication & User Management (IN PROGRESS)
- [ ] Google OAuth authentication
- [ ] User onboarding
- [ ] Profile management
- [ ] Settings page

**Status**: Specification complete, ready for design & implementation

### Phase 2: Calendar Integration (PLANNED)
- Google Calendar sync
- Microsoft Outlook sync
- Multi-calendar support

### Phase 3: Task Management (PLANNED)
- Create, edit, delete tasks
- Time estimation
- Prioritization

### Phase 4: AI Scheduling (PLANNED)
- Automatic task scheduling
- Conflict resolution
- Learning algorithm

See [`docs/PROJECT_OVERVIEW.md`](docs/PROJECT_OVERVIEW.md) for complete roadmap.

## 📚 Documentation

- **[Project Overview](docs/PROJECT_OVERVIEW.md)** - Vision, roadmap, tech stack
- **[Agents Guide](.claude/AGENTS_GUIDE.md)** - How to use AI agents
- **[Constitution](.speckit/constitution)** - Project principles
- **[Phase 1 Auth Spec](docs/specs/phase-1/authentication.md)** - Authentication specification

## 👤 Author

Made with ❤️ by Joseph Hani

## 📄 License

ISC
