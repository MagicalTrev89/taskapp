# MVP Scope

## In Scope (13 stories)

### Auth
| # | Title | Key Features |
|---|-------|-------------|
| US-001 | Google Sign-In | OAuth 2.0, auto-provision default workspace, session management |

### Workspaces
| # | Title | Key Features |
|---|-------|-------------|
| US-002 | Create a Workspace | Name, auto-owner role, empty state |
| US-003 | Workspace Membership | Invite by email, 7-day expiry, cancel invite, remove member |
| US-004 | Configure Workspace Statuses | Add/rename/reorder/delete, defaults: To Do, In Progress, Completed |
| US-010 | Navigation & App Shell | Sidebar, workspace switcher, mobile hamburger |
| US-011 | Member Leave Workspace | Voluntary departure, confirmation prompt |
| US-012 | Empty States | Zero tasks, zero comments, zero workspaces, no filter results |
| US-013 | Error Handling & Network Failures | Toast notifications, form preservation, optimistic rollback |

### Tasks
| # | Title | Key Features |
|---|-------|-------------|
| US-005 | Create a Task | Title + description, default status, edit, delete with confirmation |
| US-006 | Kanban Board View | Columns per status, drag-and-drop, pagination, horizontal scroll on mobile |
| US-014 | Kanban Drag-and-Drop UX Fixes | Drop-target column highlight, fix unreachable columns, drag-cancel behaviour |
| US-015 | Reorder Tasks Within a Column | Drag-to-reorder within a status column, position persistence, insertion indicator |
| US-007 | List View | Sortable table, status filter, pagination, localStorage view preference |
| US-009 | Task Detail View | Title/description/status display, inline edit, status dropdown, back navigation |

### Comments
| # | Title | Key Features |
|---|-------|-------------|
| US-008 | Add Comments to a Task | Text comments, chronological display, delete own, 5k char limit, pagination |

## Not In Scope (Post-MVP Backlog)

These features are explicitly deferred. They must not be implemented until the MVP is complete and they are moved out of the backlog with full user stories written.

- Task assignment (assigning a person to a task)
- Due dates on tasks
- Priority levels on tasks
- Labels/tags on tasks
- File attachments on tasks or comments
- Markdown formatting in comments
- @-mentions and notifications
- Real-time multi-user updates (WebSockets/SSE)
- Search/filter tasks by title text
- Colour-coding statuses
- Swimlanes or grouping on Kanban board
- ~~Manual card ordering within a Kanban column~~ (moved to MVP scope as US-015)
- Task history / activity log
- Workspace deletion or archival
- Ownership transfer for workspaces
- Role-based permissions beyond Owner/Member
- Offline support / service workers
- Comment editing (delete and re-add is the MVP workaround)
- Workspace name uniqueness enforcement

## Limits (MVP)

| Resource | Limit |
|----------|-------|
| Workspaces per user | 10 |
| Members per workspace | 50 |
| Statuses per workspace | 20 |
| Tasks per workspace | 10,000 |
| Comments per task | 500 |
| Characters per comment | 5,000 |
| Invitation link expiry | 7 days |
| Tasks per page (pagination) | 50 |
| Comments per page (pagination) | 25 |

## Concurrency Model

Last-write-wins for MVP. No conflict resolution, no merging, no real-time sync. Other users see changes on navigation/refresh.