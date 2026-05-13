# ADR-008: Client State Management

Date: 2026-05-13

## Status

Accepted

## Context

The MVP requires:
- Server data fetching (workspaces, tasks, comments, members, statuses)
- Optimistic updates for drag-and-drop and status changes (US-006, US-009)
- Local persistence of view preference (Kanban vs List) in localStorage (US-007)
- Form state for task creation, editing, and comments
- Last-used workspace tracking in localStorage (US-001)

## Decision

Use **TanStack Query** (React Query) for server state and **React state** (useState/useReducer) for local UI state.

## Rationale

TanStack Query is the standard server-state library for React:
- Handles fetching, caching, background refetching, and pagination out of the box
- Built-in support for optimistic updates via `onMutate` + `onError` rollback — exactly what US-006 and US-013 require
- Cache invalidation and refetching for keeping lists in sync after mutations
- Prefetching for faster navigation between views
- Works with Next.js App Router and any fetch-based API client

We do not need a global client state store (Redux, Zustand) because:
- All shared state comes from the server (workspaces, tasks, comments)
- The only local state is view preferences (localStorage) and form state (React hooks)
- Component state can be lifted to the nearest common parent for the few cases where it needs to be shared

## Consequences

### Positive
- Eliminates the need for a global state store — TanStack Query handles server state (principle 2: simplicity)
- Optimistic updates are a first-class feature, not a manual pattern
- Automatic cache invalidation after mutations keeps all views consistent
- Pagination support for tasks (US-007), comments (US-008), and members (US-003)

### Negative
- TanStack Query is an additional dependency with its own concepts (queries, mutations, invalidation)
- Cache keys must be managed consistently — we'll define a key factory early
- Local storage for view preference and last-used workspace needs a thin wrapper, not a state library

### Implementation note
- Use TanStack Query v5 with the App Router integration
- Define query key factory: `workspaceKeys.all`, `workspaceKeys.detail(id)`, `taskKeys.byWorkspace(wsId)`, etc.
- Use `useMutation` with `onMutate` (optimistic update) and `onError` (rollback) for all mutations