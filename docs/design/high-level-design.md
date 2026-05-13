# High-Level Design

Living summary of all technical decisions for TaskApp. Updated when ADRs are accepted.

## Overview

TaskApp is a collaborative task management application with Kanban board and list views. Users organise work within workspaces, configure statuses per workspace, and collaborate via task comments. Authentication is Google OAuth only.

## Technology Decisions

| Decision | Choice | ADR |
|----------|--------|-----|
| Frontend Framework | Next.js (React) with App Router | [ADR-001](../adr/ADR-001-frontend-framework.md) |
| Backend Framework | Next.js API Routes (TypeScript) | [ADR-002](../adr/ADR-002-backend-framework.md) |
| Database | PostgreSQL (Supabase, managed) | [ADR-003](../adr/ADR-003-database.md) |
| Authentication | Auth.js (NextAuth.js v5) with Google provider | [ADR-004](../adr/ADR-004-authentication-provider.md) |
| Hosting & Deployment | Vercel (GitHub-connected CI/CD) | [ADR-005](../adr/ADR-005-hosting-deployment.md) |
| Drag-and-Drop | @dnd-kit | [ADR-006](../adr/ADR-006-drag-and-drop-library.md) |
| Email Provider | Resend (transactional email) | [ADR-007](../adr/ADR-007-email-provider.md) |
| Client State Management | TanStack Query (server state) + React hooks (local state) | [ADR-008](../adr/ADR-008-client-state-management.md) |
| Real-Time Updates | None for MVP (optimistic updates + refetch on navigation) | [ADR-009](../adr/ADR-009-real-time-strategy.md) |
| Repository Structure | Single Next.js project (monolithic repo) | [ADR-010](../adr/ADR-010-repository-structure.md) |

## Architecture Principles

See [architecture-principles.md](architecture-principles.md) for the full list. Key principles:

1. **MVP-First** — Ship the minimum before adding complexity
2. **Simplicity Over Flexibility** — Three similar lines are better than a premature abstraction
3. **One Stack, One Team** — Single-language (TypeScript), single deployment
4. **Managed Services Over Self-Hosted** — Supabase, Vercel, Resend over DIY
5. **Proven Over Novel** — Well-established libraries with large communities
6. **Last-Write-Wins** — No conflict resolution for concurrent edits in MVP
7. **Optimistic UI** — Update immediately, revert on failure

## Data Model

Core entities and relationships:

```
User
  ├── id, google_id, email, name, avatar_url, created_at
  └── WorkspaceMembership (1:N)
        └── workspace_id, role (Owner | Member)

Workspace
  ├── id, name, created_at
  ├── WorkspaceMembership (1:N)
  ├── Status (1:N, ordered by position)
  └── Task (1:N)

Status
  ├── id, workspace_id, name, position
  └── unique (workspace_id, name) — case-insensitive

Task
  ├── id, workspace_id, status_id (FK → Status), title, description, created_by (FK → User), created_at
  └── Comment (1:N)

Comment
  ├── id, task_id, author_id (FK → User), text, created_at

Invitation
  ├── id, workspace_id, email, token, status (pending | accepted | expired), created_at, expires_at, invited_by (FK → User)
  └── unique (workspace_id, email) where status = 'pending'
```

Limits (per PO decisions):
- 10 workspaces per user
- 50 members per workspace
- 20 statuses per workspace
- 10,000 tasks per workspace
- 500 comments per task
- 5,000 characters per comment

## API Endpoints

```
Auth
  GET  /api/auth/[...nextauth]    — NextAuth handler
  POST /api/auth/logout           — Clear session

Workspaces
  POST /api/workspaces            — Create workspace
  GET  /api/workspaces            — List user's workspaces
  GET  /api/workspaces/:id        — Get workspace details

Workspace Memberships
  GET    /api/workspaces/:id/members          — List members + pending invitations
  POST   /api/workspaces/:id/members          — Invite member (by email)
  DELETE /api/workspaces/:id/members/:uid     — Remove member
  POST   /api/workspaces/:id/leave            — Member leaves workspace

Invitations
  POST /api/invitations/:token/accept          — Accept invitation
  DELETE /api/workspaces/:id/invitations/:id  — Cancel invitation

Statuses
  POST   /api/workspaces/:id/statuses            — Add status
  PUT    /api/workspaces/:id/statuses/:sid        — Rename status
  DELETE /api/workspaces/:id/statuses/:sid         — Delete status (with migration target)
  PUT    /api/workspaces/:id/statuses/reorder      — Reorder statuses

Tasks
  POST   /api/workspaces/:id/tasks           — Create task
  GET    /api/workspaces/:id/tasks            — List tasks (paginated, filterable by status)
  GET    /api/workspaces/:id/tasks/:tid       — Get task detail
  PUT    /api/workspaces/:id/tasks/:tid        — Update task
  DELETE /api/workspaces/:id/tasks/:tid        — Delete task

Comments
  POST   /api/workspaces/:id/tasks/:tid/comments       — Add comment
  GET    /api/workspaces/:id/tasks/:tid/comments         — List comments (paginated)
  DELETE /api/workspaces/:id/tasks/:tid/comments/:cid     — Delete comment
```

## Branch Strategy

- `main` — production-ready code, deployed by CI
- `develop` — integration branch; all feature PRs target this before promotion to `main`
- `feature/*` — feature branches
- `fix/*` — bug fix branches

Per CLAUDE.md: only `feature/*` and `fix/*` branches may be deleted. `main` and `develop` are permanent.