# ADR-003: Database

Date: 2026-05-13

## Status

Accepted

## Context

The MVP requires a relational data model:
- Users belong to Workspaces via Memberships (many-to-many with roles)
- Workspaces have Statuses (ordered list) and Tasks
- Tasks have a Status (foreign key) and Comments
- Invitations link emails to Workspaces with expiry tracking

Key requirements:
- Enforcing uniqueness constraints (status names per workspace, membership per user+workspace)
- Ordered collections (status position determines Kanban column order)
- Pagination (tasks, comments, members)
- Transactional integrity for operations like "delete a status and migrate its tasks to another status"

## Decision

Use **PostgreSQL** hosted on **Supabase** (managed PostgreSQL).

## Rationale

PostgreSQL is the natural fit for a relational data model. Supabase provides managed PostgreSQL with:
- Automatic daily backups
- Connection pooling built in
- Row Level Security (RLS) available if needed post-MVP
- A generous free tier sufficient for MVP traffic
- Direct SQL access — no proprietary query language

## Consequences

### Positive
- Full relational model with foreign keys, constraints, and transactions (principle 5: proven technology)
- Supabase handles ops — no database server management (principle 4: managed services)
- Connection pooling built in, avoiding the classic "connection exhaustion" problem
- pgvector and other extensions available if needed post-MVP

### Negative
- Tied to PostgreSQL dialect; migration to another database would require effort
- Supabase's free tier has limits (500MB storage, 50k monthly rows) — sufficient for MVP but will need a paid plan for growth
- Using Supabase's built-in auth is not chosen because US-001 requires Google OAuth only, and we need custom workspace provisioning logic

### Schema note

The initial schema will use explicit foreign keys and NOT NULL constraints. Status ordering uses a `position` integer column. Task creation timestamps use `created_at` with a default of `now()`.