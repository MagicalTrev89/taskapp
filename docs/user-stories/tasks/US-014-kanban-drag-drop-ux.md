# US-014: Kanban Drag-and-Drop UX Fixes

**Epic:** Tasks
**Persona:** User (workspace member)
**Status:** Draft

## Story

As a workspace member, I want clear visual feedback when dragging a task card across the Kanban board so that I know which column I am dropping into, and I want drag-and-drop to work reliably for every column on the board.

## Acceptance Criteria

- [ ] When a user begins dragging a task card, the target column (the column the card is currently hovering over) is visually highlighted with a distinct background colour or border so the user can clearly see where the card will land
- [ ] The highlight is removed when the drag ends (on drop or on cancel)
- [ ] Dragging a task into **any** column — including "In Progress" — successfully moves the task to that column and persists the status change
- [ ] The drag-and-drop interaction works consistently across all workspace status columns; no column is an unreachable drop target
- [ ] US-006 AC#5 (task appears at top of target column after drag) still works after this fix
- [ ] Cancelling a drag (e.g., pressing Escape, dragging off-screen, or releasing outside a valid target) returns the card to its original position with no status change
- [ ] On mobile/touch devices, the same highlight feedback is shown during drag

## Context

During local testing, two problems were identified:

1. **No drop-target highlight** — dragging a task provides no visual indication of which column will receive the drop, making the interaction feel imprecise.
2. **"In Progress" column is unreachable** — tasks cannot be dropped into the In Progress column. The drop target does not register. The current implementation uses `closestCorners` collision detection (dnd-kit), which can skip over narrow columns or columns with few cards because it measures distance to the nearest droppable corner. A column with zero or few cards has a small hit area, making it hard to target.

Both issues degrade the core Kanban interaction described in US-006.

## Notes

- This story addresses bugs and UX gaps in the US-006 (Kanban Board View) implementation; it does not change the fundamental behaviour defined in US-006
- No new ADR is needed — ADR-006 (dnd-kit) already covers the library choice; this story fixes the implementation
- Reordering tasks within a column is a separate feature — see US-015