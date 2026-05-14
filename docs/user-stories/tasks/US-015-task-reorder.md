# US-015: Reorder Tasks Within a Column

**Epic:** Tasks
**Persona:** User (workspace member)
**Status:** Draft

## Story

As a workspace member, I want to drag and reorder tasks within the same Kanban column so that I can prioritise work visually without changing a task's status.

## Acceptance Criteria

- [ ] Dragging a task card within the same column reorders the task relative to other tasks in that column; the new position persists after page reload
- [ ] The task's status is **not** changed when reordering within the same column
- [ ] Reordering is achieved by dragging a task card above or below another task card in the same column; a visual insertion indicator (e.g., horizontal line) shows where the task will be placed
- [ ] The new position is persisted via an API call; the UI updates optimistically and reverts on failure
- [ ] If the reorder API call fails, the task snaps back to its original position and an error message is shown
- [ ] Reordering works on both desktop (mouse) and mobile (touch)
- [ ] A `position` (integer) field is added to the Task model, scoped to `statusId` — positions are relative within a status column, not globally unique
- [ ] The migration must not reorder existing tasks: tasks with a null `position` are ordered by `createdAt` (newest-first), preserving the current default sort
- [ ] The reorder API accepts a task ID and its desired position within the column, following the same pattern as `PUT /api/workspaces/{id}/statuses` (ordered array of IDs)
- [ ] Reordering follows last-write-wins (P08): if two users reorder simultaneously, the last update wins with no conflict resolution UI

## Context

US-006 originally scoped same-column drops as a no-op and excluded manual card ordering from MVP. During local testing, the user attempted to reorder tasks within a column and expected the new order to persist. This story promotes that interaction from "future feature" to a requested feature.

**MVP scope update required:** "Manual card ordering within a Kanban column" must be moved from the "Not In Scope" list in `docs/design/mvp-scope.md` to the "In Scope" table, referencing US-015, before implementation begins (architecture principle P01 — MVP-First).

## Notes

- **ADR required** for the ordering strategy (integer gaps, fractional indexing, rank-based) before implementation begins — this is a technology decision per principle P10
- This is a new feature beyond the original US-006 scope; it requires a Prisma schema change and a new reorder API endpoint
- The `position` field default must be handled carefully: null preserves current ordering, and new tasks are assigned `position` at the top of their column (consistent with US-005 AC#6)
- If a column has more than 50 tasks (paginated), only the currently loaded tasks are reorderable. The user must load more before reordering beyond the first page