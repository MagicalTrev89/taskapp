# US-005: Create a Task

**Epic:** Tasks
**Persona:** User (workspace member)
**Status:** Draft

## Story

As a workspace member, I want to create a task with a title and description so that I can capture work that needs to be done.

## Acceptance Criteria

- [ ] A "New Task" button is accessible from the Kanban board and list views
- [ ] Creating a task requires a title (1–255 characters); description is optional
- [ ] The task is assigned the first status in the workspace status list by default
- [ ] The task's creator and creation timestamp are recorded
- [ ] After creation, the task appears in the Kanban board in the default status column and in the list view
- [ ] After creation, the new task card appears at the top of its column
- [ ] The user can edit the task title and description after creation; the 1–255 character constraint on title is enforced on edit
- [ ] The user can delete a task with a confirmation prompt; deleting a task also deletes all its comments (hard delete)
- [ ] Task titles do not need to be unique within a workspace
- [ ] A workspace can have a maximum of 10,000 tasks

## Notes

- Task assignment (assigning a specific person) is post-MVP
- Due dates, priority, labels, and attachments are post-MVP
- For MVP, all workspace members can create, edit, and delete any task in the workspace
- Comments on a deleted task are hard-deleted and cannot be recovered