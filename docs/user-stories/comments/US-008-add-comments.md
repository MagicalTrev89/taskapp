# US-008: Add Comments to a Task

**Epic:** Comments
**Persona:** User (workspace member)
**Status:** Draft

## Story

As a workspace member, I want to add comments to a task so that I can discuss the work, provide context, and collaborate with other members.

## Acceptance Criteria

- [ ] A comment input field is available on the task detail view (US-009)
- [ ] Submitting a comment records the comment text, author name, and timestamp
- [ ] Comments are displayed in chronological order (oldest first) below the task description
- [ ] Each comment shows the author's name, avatar (from Google profile; initials fallback if no avatar), timestamp, and text
- [ ] The comment author can delete their own comment without a confirmation prompt; the comment is hard-deleted and removed from the list
- [ ] Only the comment author can delete their comment; the workspace Owner cannot delete others' comments in MVP
- [ ] Any workspace member can comment on any task in the workspace
- [ ] A comment must contain at least 1 non-whitespace character; whitespace-only input is treated as empty
- [ ] An empty comment cannot be submitted (submit button is disabled for empty or whitespace-only input)
- [ ] Comments have a maximum length of 5,000 characters; a character count is shown when the input exceeds 4,500 characters
- [ ] A task can have a maximum of 500 comments; comments are paginated at 25 per page with a "Load more" button

## Notes

- Markdown formatting in comments is post-MVP
- @-mentions and notifications are post-MVP
- File attachments in comments are post-MVP
- Editing comments is post-MVP (delete and re-add is the MVP workaround)
- Hard delete means the comment is removed from the database and cannot be recovered