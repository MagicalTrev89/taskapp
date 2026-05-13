# US-010: Navigation & App Shell

**Epic:** Workspaces
**Persona:** User
**Status:** Draft

## Story

As a user, I want consistent navigation across the app so that I can move between my workspaces, views, and settings without confusion.

## Acceptance Criteria

- [ ] The app has a sidebar containing: workspace switcher, Board link, List link, Settings link, and user profile (name, avatar, sign-out)
- [ ] The workspace switcher displays the current workspace name and member count; clicking it opens a dropdown listing all workspaces the user belongs to
- [ ] Selecting a workspace from the switcher navigates to that workspace's Kanban board
- [ ] The Board and List links navigate to the current workspace's Kanban board (US-006) and list view (US-007) respectively; the active view is visually highlighted
- [ ] The Settings link navigates to the workspace settings page (US-004 members and statuses)
- [ ] On narrow screens (below 768px), the sidebar collapses into a hamburger menu with the same navigation items
- [ ] The sidebar shows the current user's name and avatar (or initials fallback) with a sign-out option
- [ ] Unauthenticated users cannot see the sidebar; they are redirected to the login page (US-001)

## Notes

- The sidebar provides the structural shell that all views live within
- This story covers the persistent navigation; individual views are covered by their respective stories