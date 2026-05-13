# API Reference

Base URL: `/api`

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/auth/[...nextauth]` | NextAuth handler (login, callback, session) |

All endpoints except auth require a valid session cookie. Unauthorized requests return `401 { error: "Unauthorized" }`.

## Workspaces

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/workspaces` | Create a workspace (max 10 per user) |
| GET | `/api/workspaces` | List user's workspaces |
| GET | `/api/workspaces/:id` | Get workspace details (members, statuses, task count) |

## Workspace Memberships

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workspaces/:id/members` | List members + pending invitations |
| POST | `/api/workspaces/:id/members` | Invite member by email (owner only) |
| DELETE | `/api/workspaces/:id/members?userId=...` | Remove member (owner only) |
| POST | `/api/workspaces/:id/leave` | Member leaves workspace (owner cannot leave) |

## Statuses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workspaces/:id/statuses` | List workspace statuses (ordered by position) |
| POST | `/api/workspaces/:id/statuses` | Add status (owner only, max 20) |
| PUT | `/api/workspaces/:id/statuses` | Reorder statuses (body: `{ statusIds: string[] }`) |
| PATCH | `/api/workspaces/:id/statuses/:sid` | Rename status (owner only) |
| DELETE | `/api/workspaces/:id/statuses/:sid` | Delete status with task migration (owner only) |

## Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/workspaces/:id/tasks` | Create task |
| GET | `/api/workspaces/:id/tasks` | List tasks (paginated, sortable, filterable by status) |
| GET | `/api/workspaces/:id/tasks/:taskId` | Get task detail (includes comments) |
| PATCH | `/api/workspaces/:id/tasks/:taskId` | Update task (partial) |
| DELETE | `/api/workspaces/:id/tasks/:taskId` | Delete task (cascade deletes comments) |

### Query Parameters (GET /tasks)

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `statusId` | string | — | Filter by status |
| `page` | integer | 1 | Page number |
| `sortBy` | string | createdAt | Sort field |
| `sortOrder` | string | desc | asc or desc |

## Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/workspaces/:id/tasks/:taskId/comments` | Add comment |
| GET | `/api/workspaces/:id/tasks/:taskId/comments` | List comments (paginated, 25 per page) |
| DELETE | `/api/workspaces/:id/tasks/:taskId/comments/:commentId` | Delete comment (author only) |

## Error Format

All errors return:

```json
{ "error": "<message>" }
```

Some endpoints add `details` (Zod validation) or `taskCount` alongside `error`.

## OpenAPI Schema

The full schema is maintained in `src/api/schema/v1.yaml`.