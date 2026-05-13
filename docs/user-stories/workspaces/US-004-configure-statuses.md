# US-004: Configure Workspace Statuses

**Epic:** Workspaces
**Persona:** User (Owner)
**Status:** Draft

## Story

As a workspace owner, I want to configure the task statuses available in my workspace so that the Kanban board and task workflow match my team's process.

## Acceptance Criteria

- [ ] A new workspace is created with three default statuses: To Do, In Progress, Completed (in that order)
- [ ] The workspace owner can add a new status by providing a name
- [ ] The workspace owner can rename an existing status
- [ ] The workspace owner can delete a status; if tasks exist with that status, a modal prompts the owner to select a target status to move those tasks to
- [ ] If only one status remains, the delete action is disabled with a tooltip: "A workspace must have at least one status"
- [ ] When deleting a status with only one other status available, the target status is auto-selected in the modal
- [ ] The workspace owner can reorder statuses via drag-and-drop (desktop) and touch (mobile); the order determines the left-to-right column layout on the Kanban board
- [ ] Status names must be unique within a workspace (case-insensitive) and 1–50 characters
- [ ] At least one status must always exist in a workspace
- [ ] A workspace can have a maximum of 20 statuses
- [ ] Changes to statuses are reflected in the Kanban board and task status dropdown for the current user immediately (optimistic update); other users see changes on refresh

## Notes

- Statuses are scoped to a workspace, not to individual users
- The default statuses (To Do, In Progress, Completed) provide a usable starting point out of the box
- Colour-coding statuses is post-MVP
- ADR required for the drag-and-drop library choice