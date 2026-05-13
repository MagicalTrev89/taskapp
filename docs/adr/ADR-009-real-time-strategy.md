# ADR-009: Real-Time Update Strategy

Date: 2026-05-13

## Status

Accepted

## Context

US-004 and US-006 specify that status changes are "immediately reflected" for the current user. US-013 specifies that the app uses optimistic updates for drag-and-drop and status changes, reverting on failure.

The question is whether other connected users should see changes in real-time (WebSockets) or only on page refresh (polling/cache invalidation).

## Decision

**No real-time updates for MVP.** Use optimistic updates for the current user and cache invalidation on navigation for other users.

## Rationale

The user stories explicitly state in US-004: "Changes to statuses are reflected in the Kanban board and task status dropdown for the current user immediately (optimistic update); other users see changes on refresh."

Adding WebSockets or Server-Sent Events (SSE) for real-time multi-user updates would require:
- A WebSocket server (additional infrastructure)
- Connection management and reconnection logic
- Race condition handling for concurrent edits
- Significantly more complex state management

For an MVP with workspaces of up to 50 members (US-002), the latency of "refresh to see changes" is acceptable. Most task management interactions are asynchronous, not real-time collaborative editing.

## Consequences

### Positive
- No WebSocket infrastructure or connection management (principle 2: simplicity)
- TanStack Query's built-in refetch-on-window-focus and refetch-on-mount provide near-real-time updates for users who navigate between views
- Simpler deployment — no persistent connections on the server
- Lower infrastructure cost

### Negative
- Users in the same workspace do not see each other's changes until they navigate or refresh
- Last-write-wins for concurrent edits means a user can overwrite another's changes without knowing (acceptable per principle 8)

### Post-MVP path
If real-time updates are needed, the options are:
1. **Polling**: TanStack Query `refetchInterval` — simplest but adds server load
2. **Server-Sent Events**: Lightweight one-directional push from server to client
3. **WebSockets**: Full bidirectional real-time — most complex, best UX

Option 2 (SSE) is the recommended post-MVP upgrade path.