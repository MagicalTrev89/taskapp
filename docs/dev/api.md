# API Reference

Base URL: `/api`

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/auth/[...nextauth]` | NextAuth handler (login, callback, session) |

## Workspaces

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/workspaces` | Create a workspace |
| GET | `/api/workspaces` | List user's workspaces |
| GET | `/api/workspaces/:id` | Get workspace details |

## Workspace Memberships

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workspaces/:id/members` | List members + pending invitations |
| POST | `/api/workspaces/:id/members` | Invite member (by email) |
| DELETE | `/api/workspaces/:id/members/:uid` | Remove member |
| POST | `/api/workspaces/:id/leave` | Member leaves workspace |

## Invitations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/invitations/:token/accept` | Accept invitation |
| DELETE | `/api/workspaces/:id/invitations/:iid` | Cancel invitation |

## Statuses

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/workspaces/:id/statuses` | Add status |
| PUT | `/api/workspaces/:id/statuses/:sid` | Rename status |
| DELETE | `/api/workspaces/:id/statuses/:sid` | Delete status (with migration target) |
| PUT | `/api/workspaces/:id/statuses/reorder` | Reorder statuses |

## Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/workspaces/:id/tasks` | Create task |
| GET | `/api/workspaces/:id/tasks` | List tasks (paginated, filterable) |
| GET | `/api/workspaces/:id/tasks/:tid` | Get task detail |
| PUT | `/api/workspaces/:id/tasks/:tid` | Update task |
| DELETE | `/api/workspaces/:id/tasks/:tid` | Delete task |

## Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/workspaces/:id/tasks/:tid/comments` | Add comment |
| GET | `/api/workspaces/:id/tasks/:tid/comments` | List comments (paginated) |
| DELETE | `/api/workspaces/:id/tasks/:tid/comments/:cid` | Delete comment |

## OpenAPI Schema

The full schema is maintained in `src/api/schema/v1.yaml`.