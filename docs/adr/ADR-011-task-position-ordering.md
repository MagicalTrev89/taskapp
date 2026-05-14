# ADR-011: Task Position Ordering Strategy

Date: 2026-05-14

## Status

Accepted

## Context

US-015 requires tasks within a Kanban column to be manually reorderable by drag-and-drop. This requires persisting a position for each task within its status column.

Three common strategies for maintaining order in a relational database:

1. **Integer gaps** — Each task gets an integer `position` field. New tasks get position 0 (top). Reordering a task updates its position to the midpoint of neighbours (e.g., moving between positions 10 and 20 → position 15). Periodic reindexing closes gaps.
2. **Fractional indexing** — Positions are strings using fractional indexing (similar to Figma). Infinite subdivisions without reindexing.
3. **Array reorder** — Client sends an ordered array of task IDs. Server updates all positions in a transaction. This is the pattern already used for status reordering (PUT /statuses with `statusIds`).

## Decision

Use **integer gaps** for the `position` field, but use **array reorder** as the API contract (matching the existing status reorder endpoint).

The client sends an ordered array of task IDs within a status column via `PUT /api/workspaces/:id/tasks/reorder`. The server assigns sequential integer positions (0, 1, 2, ...) in a single transaction. This combines the simplicity of integer positions with the clean API contract of array reorder.

### Position field details

- `position` is a nullable integer on the Task model, scoped to `(workspaceId, statusId)`.
- Tasks with `position = null` sort by `createdAt DESC` (preserving existing behaviour during and after migration).
- New tasks are assigned `position = 0`, and all existing tasks in that status column are shifted by +1 in the same transaction.
- When reordering, the client sends the full ordered array of visible task IDs. The server reassigns positions as 0, 1, 2, ... in a transaction.

### Why not fractional indexing?

- Adds a string column and encoding/decoding complexity for no MVP benefit.
- Integer gaps with array reorder is simpler and already proven by the status reordering implementation.

### Why not simple integer gaps with midpoint arithmetic?

- Midpoint arithmetic requires reindexing when gaps fill up.
- Array reorder avoids midpoints entirely — every reorder normalises positions to sequential integers.
- Array reorder matches the existing pattern for status reordering.

## Consequences

### Positive

- Consistent API pattern with status reordering (same request/response shape)
- Integer positions are easy to query, sort, and paginate
- No reindexing needed — every reorder normalises positions
- Migration is safe: `position` starts as null, preserving current sort order

### Negative

- Reordering N tasks requires N database writes (same as status reordering, acceptable for MVP with ≤10,000 tasks per workspace)
- Full array of task IDs must be sent on each reorder — acceptable for MVP column sizes
- Concurrent reorders follow last-write-wins (P08) — no conflict resolution UI