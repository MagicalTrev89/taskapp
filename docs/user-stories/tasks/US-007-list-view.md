# US-007: List View

**Epic:** Tasks
**Persona:** User (workspace member)
**Status:** Draft

## Story

As a workspace member, I want to view all tasks in a list so that I can quickly scan, sort, and find tasks regardless of status.

## Acceptance Criteria

- [ ] A toggle in the view header allows switching between Kanban board view and list view
- [ ] The list view displays tasks in a table with columns: Title, Status, Created (date)
- [ ] The list is sorted by creation date (newest first) by default
- [ ] The user can sort the list by any column in ascending or descending order; sorting by Status uses the workspace's status order, not alphabetical
- [ ] Clicking a task row opens the task detail view (US-009)
- [ ] The current view preference (Kanban or List) persists in localStorage across page reloads
- [ ] Tasks can be filtered by status via a status filter dropdown above the list
- [ ] When a workspace has zero tasks, the list shows an empty state with a "Create your first task" CTA (see US-012)
- [ ] The list loads tasks with pagination: 50 tasks per page, with pagination controls at the bottom

## Notes

- The list view complements the Kanban board; both show the same tasks, just in different layouts
- Search/filter by title text is post-MVP