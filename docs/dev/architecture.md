# Architecture

## Tech Stack

See [High-Level Design](../design/high-level-design.md) for the full technology decisions table.

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (React 19) with App Router |
| Backend | Next.js API Routes (TypeScript) |
| Database | PostgreSQL on Supabase |
| ORM | Prisma 7 |
| Auth | Auth.js (NextAuth v5) with Google provider |
| Styling | Tailwind CSS v4 |
| State | TanStack Query v5 (server state) + React hooks (local state) |
| Drag & Drop | @dnd-kit |
| Email | Resend |
| Hosting | Vercel |

## Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Unauthenticated routes
│   │   └── login/                # Login page
│   ├── (dashboard)/              # Authenticated routes (sidebar layout)
│   │   ├── page.tsx              # Dashboard home (redirects to first workspace)
│   │   ├── workspaces/[id]/      # Workspace routes
│   │   │   ├── board/            # Kanban board view
│   │   │   ├── list/             # List view (sortable table)
│   │   │   ├── tasks/[taskId]/   # Task detail with comments
│   │   │   └── settings/         # Members + statuses management
│   │   └── layout.tsx            # Dashboard layout with sidebar
│   ├── api/                      # API route handlers
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   └── workspaces/[id]/      # Workspace CRUD + nested resources
│   │       ├── route.ts          # GET workspace detail
│   │       ├── statuses/         # Status CRUD + reorder
│   │       ├── tasks/            # Task CRUD
│   │       │   └── [taskId]/     # Task detail + comments
│   │       ├── members/          # Member management
│   │       └── leave/            # Leave workspace
│   └── layout.tsx                # Root layout (providers)
├── components/
│   ├── ui/                       # Shared UI primitives (toast)
│   ├── auth/                     # Auth components (login button, sign out)
│   ├── board/                    # Kanban board components
│   │   ├── kanban-board.tsx      # Main board with drag-and-drop
│   │   ├── task-card.tsx         # Task card display
│   │   └── draggable-task-card.tsx # Sortable wrapper for cards
│   ├── workspace/                # Workspace components (sidebar)
│   └── providers/                # React providers (Query, Auth)
├── hooks/
│   └── use-toast.ts              # Toast notification hook
├── lib/
│   ├── auth.ts                   # Auth.js configuration
│   ├── db/                       # Prisma client instance
│   ├── actions/                  # Server actions (createWorkspace)
│   ├── email/                    # Resend email sending
│   └── validations/              # Zod schemas (workspace, task, comment)
├── types/                        # Shared TypeScript types
│   └── next-auth.d.ts           # Session type augmentation
└── generated/
    └── prisma/                   # Generated Prisma client (gitignored)
```

## Key Patterns

### Server Components by Default

All pages in `app/` are Server Components. They verify auth and membership, then delegate to Client Components for interactive UI. Only add `'use client'` when a component needs React hooks, browser APIs, or NextAuth client methods.

### Client Components for Interactive Pages

Each page route has a server component (auth check + data prefetch) that renders a client component:

```
page.tsx (server) → *-client.tsx (client, uses TanStack Query)
```

This pattern keeps auth checks on the server while enabling rich client-side interactions.

### Data Fetching

- **Server Components**: Direct Prisma queries for auth checks and initial data
- **Client Components**: TanStack Query for all interactive data (statuses, tasks, members, comments)
- **Mutations**: TanStack Query `useMutation` with optimistic cache invalidation

### Authorization

Every API route verifies the user is authenticated and is a member of the workspace. Owner-only operations (status management, member management) check `membership.role === "OWNER"`.

### State Management

- **Server state**: TanStack Query v5 (fetching, caching, mutations)
- **Local UI state**: React hooks (useState, useReducer)
- **URL state**: Workspace ID derived from `usePathname()` in the sidebar

### Toast Notifications

A lightweight toast system (`useToast` hook + `Toaster` component) provides success/error feedback for mutations. Toasts auto-dismiss after 4 seconds.