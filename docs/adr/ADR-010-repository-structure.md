# ADR-010: Repository Structure

Date: 2026-05-13

## Status

Accepted

## Context

We need to decide how to organise the codebase for the MVP. Options:
1. Monorepo: frontend and backend in one repository
2. Separate repositories: frontend and backend in different repositories

Given ADR-002 (Next.js API Routes as backend), the frontend and backend are already in the same framework. The question is whether to use a monorepo tool (Turborepo, Nx) or a single Next.js project.

## Decision

Use a **single Next.js project** in one repository (monolithic repo, no monorepo tooling).

## Directory structure

```
taskapp/
├── docs/                          # Project documentation
│   ├── adr/                       # Architecture Decision Records
│   ├── design/                    # High-level design, principles, MVP scope
│   ├── dev/                       # Developer docs (setup, SDLC, API reference)
│   ├── mocks/                     # HTML/Tailwind UI mockups
│   └── user-stories/              # User stories by epic
├── src/
│   ├── app/                       # Next.js App Router pages and layouts
│   │   ├── (auth)/                # Auth group: login page
│   │   ├── (dashboard)/          # Authenticated group: app shell, sidebar
│   │   │   ├── workspaces/[id]/   # Workspace routes
│   │   │   │   ├── board/         # Kanban board view
│   │   │   │   ├── list/          # List view
│   │   │   │   ├── tasks/[taskId]/# Task detail view
│   │   │   │   └── settings/      # Workspace settings (members, statuses)
│   │   │   └── layout.tsx         # Dashboard layout with sidebar
│   │   └── api/                   # API route handlers
│   │       ├── auth/              # NextAuth configuration
│   │       ├── workspaces/        # Workspace CRUD
│   │       ├── tasks/             # Task CRUD
│   │       ├── comments/          # Comment CRUD
│   │       ├── statuses/          # Status CRUD + reorder
│   │       └── invitations/       # Invitation CRUD + accept
│   ├── components/                # React components
│   │   ├── ui/                    # Shared UI primitives (Button, Input, Modal, etc.)
│   │   ├── board/                 # Kanban board components
│   │   ├── task/                  # Task components (card, detail, form)
│   │   ├── comment/               # Comment components
│   │   └── workspace/            # Workspace components (switcher, settings)
│   ├── lib/                       # Shared utilities
│   │   ├── db/                    # Database client, queries, migrations
│   │   ├── auth/                  # Auth utilities, session helpers
│   │   ├── email/                 # Email sending (Resend)
│   │   └── validations/           # Zod schemas for request/response validation
│   └── types/                     # Shared TypeScript types
├── public/                        # Static assets
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── .env.local.example             # Environment variable template
└── CLAUDE.md
```

## Rationale

A single Next.js project is the simplest structure that satisfies all MVP stories (principle 2). There is no separate frontend/backend to coordinate, no monorepo tooling to configure, and shared types flow naturally through the `src/types` directory.

## Consequences

### Positive
- One `npm install`, one build, one deployment (principle 3)
- Shared TypeScript types between frontend and backend — no type drift
- Next.js App Router provides clear file-based routing that maps directly to the user stories
- No Turborepo/Nx configuration overhead for a single-project repo
- Easy to split later if needed — API routes can be extracted to a standalone server

### Negative
- All code in one project means no independent deployment of frontend vs. backend
- The `src/app/api` directory will grow as endpoints are added; keeping it organised by resource (not feature) is important
- No package boundary enforcement between frontend and backend code; relies on convention and code review