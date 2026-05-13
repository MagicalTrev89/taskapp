# US-012: Empty States

**Epic:** Cross-cutting
**Persona:** User
**Status:** Draft

## Story

As a user, I want to see helpful empty states when there is no content yet so that I know what to do next instead of staring at a blank screen.

## Acceptance Criteria

- [ ] When a workspace has zero tasks, the Kanban board (US-006) shows all status columns with a "No tasks" placeholder in each, plus a prominent "Create your first task" CTA button
- [ ] When a workspace has zero tasks, the list view (US-007) shows an illustration and message: "No tasks yet. Create your first task to get started." with a CTA button
- [ ] When a task has zero comments, the comment section shows a message: "No comments yet. Be the first to comment." with the comment input field visible
- [ ] When a user has no accessible workspaces (first sign-in or after leaving all workspaces), they see an illustration, message: "You're not in any workspaces yet." and a "Create a workspace" CTA button
- [ ] When a status filter in the list view yields no matching tasks, a message shows: "No tasks match this filter." with a "Clear filter" link

## Notes

- Empty states are critical for first-time user experience and for moments of transition (e.g., after deleting all tasks)
- Each empty state should provide a clear next action, never leave the user stranded