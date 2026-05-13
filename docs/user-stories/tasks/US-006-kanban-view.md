# US-006: Kanban Board View

**Epic:** Tasks
**Persona:** User (workspace member)
**Status:** Draft

## Story

As a workspace member, I want to see tasks organised in a Kanban board by status so that I can visualise the workflow and quickly see what's in each stage.

## Acceptance Criteria

- [ ] The Kanban board displays one column per workspace status, ordered left-to-right as configured
- [ ] Each column header shows the status name and the count of tasks in that status
- [ ] Each task card on the board shows the task title
- [ ] Tasks within a column are sorted by creation date (newest first) by default
- [ ] Dragging a task card to a different column updates the task's status to the target column's status; the card appears at the top of the target column
- [ ] Dropping a task card on the same column it came from is a no-op (status unchanged)
- [ ] If the drag-and-drop update fails (network error), the card reverts to its original column with an error message
- [ ] The Kanban board is the default view when entering a workspace
- [ ] An empty status column is still displayed with a "No tasks" placeholder
- [ ] The board is responsive; on narrow screens (below 768px), columns scroll horizontally with touch/swipe support
- [ ] Drag-and-drop works on both desktop (mouse) and mobile (touch)
- [ ] A keyboard-accessible alternative to drag-and-drop exists (see US-009): users can change task status via a dropdown on the task detail view
- [ ] When a workspace has zero tasks, the board shows all columns with empty state placeholders and a prominent "Create your first task" CTA (see US-012)
- [ ] The board loads tasks with pagination: initially loads up to 50 tasks per column, with a "Load more" option for columns exceeding 50 tasks

## Notes

- The Kanban board derives its columns entirely from the workspace status configuration (US-004)
- ADR required for the drag-and-drop library choice
- MVP does not include swimlanes, grouping, or manual card ordering within columns