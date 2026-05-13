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
│   │   ├── workspaces/[id]/      # Workspace routes
│   │   │   ├── board/            # Kanban board view
│   │   │   ├── list/             # List view
│   │   │   ├── tasks/[taskId]/   # Task detail view
│   │   │   └── settings/        # Workspace settings
│   │   └── layout.tsx            # Dashboard layout with sidebar
│   ├── api/                      # API route handlers
│   │   ├── auth/                 # NextAuth handler
│   │   ├── workspaces/           # Workspace CRUD
│   │   ├── tasks/                # Task CRUD
│   │   ├── comments/             # Comment CRUD
│   │   ├── statuses/             # Status CRUD + reorder
│   │   └── invitations/          # Invitation CRUD + accept
│   └── layout.tsx                # Root layout (providers)
├── components/
│   ├── ui/                       # Shared UI primitives
│   ├── auth/                     # Auth components
│   ├── board/                    # Kanban board components
│   ├── task/                     # Task components
│   ├── comment/                  # Comment components
│   ├── workspace/                # Workspace components
│   └── providers/                # React providers (Query, Auth)
├── lib/
│   ├── auth.ts                   # Auth.js configuration
│   ├── db/                       # Prisma client instance
│   ├── actions/                  # Server actions
│   ├── email/                    # Resend email sending
│   └── validations/              # Zod schemas
├── types/                        # Shared TypeScript types
└── generated/
    └── prisma/                   # Generated Prisma client (gitignored)
```

## Key Patterns

### Server Components by Default

All components in `app/` are Server Components by default. Only add `'use client'` when a component needs:
- React hooks (useState, useEffect, etc.)
- Browser APIs (localStorage, event handlers)
- Next Auth client methods (signIn, signOut)

### Server Actions

Use Server Actions for mutations (create workspace, create task, etc.). Server Actions are defined with `'use server'` at the top of the file in `src/lib/actions/`.

### Data Fetching

Fetch data in Server Components directly from the database using Prisma. After a mutation, call `revalidatePath()` or `revalidateTag()` to trigger a re-render.

### Client State

- **Server state**: TanStack Query (fetching, caching, mutations, optimistic updates)
- **Local UI state**: React hooks (useState, useReducer)
- **View preference**: localStorage for Kanban vs List toggle

### Optimistic Updates

For drag-and-drop and status changes, use TanStack Query's `onMutate` + `onError` pattern:

```ts
useMutation({
  mutationFn: updateTaskStatus,
  onMutate: async (newStatus) => {
    // Cancel queries, save snapshot, optimistically update cache
  },
  onError: (err, newStatus, context) => {
    // Rollback to saved snapshot
  },
  onSettled: () => {
    // Refetch to ensure consistency
  },
})
```

### Authorization

Every API route must verify the user is authenticated and is a member of the workspace before returning data. Use the `auth()` function from `@/lib/auth` in Server Components and API routes.