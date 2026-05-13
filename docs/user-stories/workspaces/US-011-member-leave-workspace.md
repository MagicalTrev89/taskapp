# US-011: Member Leave Workspace

**Epic:** Workspaces
**Persona:** User (workspace member)
**Status:** Draft

## Story

As a workspace member, I want to leave a workspace voluntarily so that I am no longer associated with it or able to access its tasks.

## Acceptance Criteria

- [ ] A workspace member can leave a workspace from the workspace settings page
- [ ] Leaving a workspace requires a confirmation prompt: "Are you sure you want to leave [Workspace Name]?"
- [ ] After leaving, the member can no longer access the workspace or its tasks
- [ ] Tasks and comments created by the leaving member remain in the workspace with the member's name preserved
- [ ] The leaving member is removed from the workspace member list visible to the owner
- [ ] If the member's last-used workspace was the one they left, they are redirected to their next available workspace, or to the empty state (US-012) if they have no workspaces

## Notes

- This complements US-003 (Owner removes member) — this story covers voluntary departure
- The Owner cannot leave their own workspace; they must transfer ownership or delete the workspace (not in MVP scope)