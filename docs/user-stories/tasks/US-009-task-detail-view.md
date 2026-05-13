# US-009: Task Detail View

**Epic:** Tasks
**Persona:** User (workspace member)
**Status:** Draft

## Story

As a workspace member, I want to view and edit a task's full details so that I can see its description, change its status, and read and add comments.

## Acceptance Criteria

- [ ] Clicking a task card on the Kanban board (US-006) or a task row in the list view (US-007) opens the task detail view
- [ ] The task detail view displays the task title, description, current status, creator name, and creation timestamp
- [ ] The task title can be edited inline by clicking on it
- [ ] The task description can be edited via an edit button that reveals a text area
- [ ] The task status can be changed via a dropdown menu showing all workspace statuses, providing a keyboard-accessible alternative to drag-and-drop
- [ ] Changing the status via the dropdown immediately updates the task's status; the change is reflected when returning to the Kanban board or list view
- [ ] An "Edit" button allows editing the title and description; an "Delete" button allows deleting the task (with confirmation prompt per US-005)
- [ ] A "Back" link or breadcrumb returns the user to the previous view (Kanban board or list view)
- [ ] The comment section (US-008) is displayed below the task description

## Notes

- This story defines the task detail page/panel that US-007 and US-008 reference
- The status dropdown is the primary keyboard-accessible way to change task status without drag-and-drop
- MVP does not include task history or activity log