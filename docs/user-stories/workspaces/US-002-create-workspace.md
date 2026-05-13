# US-002: Create a Workspace

**Epic:** Workspaces
**Persona:** User
**Status:** Draft

## Story

As a user, I want to create a workspace so that I can organise tasks within a shared context that other people can join.

## Acceptance Criteria

- [ ] A "Create Workspace" action is accessible from the app navigation
- [ ] The user provides a workspace name (required, 1–100 characters) to create a workspace
- [ ] The workspace creator is automatically added as a workspace member with the Owner role
- [ ] After creation, the user is taken to the workspace with an empty state prompting them to create their first task (see US-012)
- [ ] The workspace appears in the user's workspace switcher/list
- [ ] Workspace names are not required to be globally unique; multiple users may create workspaces with the same name
- [ ] A user can create and belong to a maximum of 10 workspaces
- [ ] A workspace has a maximum of 50 members

## Notes

- Workspaces are the top-level container for tasks, statuses, and members
- For MVP, workspace roles are limited to Owner (creator) and Member