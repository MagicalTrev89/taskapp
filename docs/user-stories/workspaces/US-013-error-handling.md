# US-013: Error Handling & Network Failures

**Epic:** Cross-cutting
**Persona:** User
**Status:** Draft

## Story

As a user, I want to receive clear feedback when operations fail so that I understand what went wrong and can take appropriate action.

## Acceptance Criteria

- [ ] When a network request fails, the user sees a non-blocking error message (toast/notification) describing the failure: "Something went wrong. Please try again."
- [ ] When the user's session expires, they are redirected to the login page with a "Your session has expired. Please sign in again." message
- [ ] When a task creation fails, the form data is preserved so the user can retry without re-entering the title and description
- [ ] When a task deletion fails, the task remains in the list and an error message is shown
- [ ] When a comment submission fails, the comment text is preserved in the input field so the user can retry
- [ ] When a drag-and-drop status update fails, the task card reverts to its original column and an error message is shown
- [ ] When a status rename, reorder, or delete operation fails, the status list reverts to its previous state and an error message is shown
- [ ] When an invitation email fails to send, the owner sees an error: "Invitation could not be sent. Please try again."
- [ ] The app uses optimistic updates for drag-and-drop (US-006) and status changes (US-009), reverting on failure

## Notes

- This is a cross-cutting story that applies to all operations across the app
- MVP uses last-write-wins for concurrent edits — no conflict resolution or merging
- Offline support (viewing cached data without network) is post-MVP