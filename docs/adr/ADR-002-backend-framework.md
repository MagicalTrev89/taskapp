# ADR-002: Backend Framework and Language

Date: 2026-05-13

## Status

Accepted

## Context

The MVP requires:
- REST API endpoints for CRUD operations on workspaces, tasks, statuses, comments, and members
- Google OAuth 2.0 authentication flow (US-001)
- Email sending for workspace invitations (US-003)
- Session management and authorisation checks
- PostgreSQL as the chosen database (ADR-003)

We need a backend framework that integrates well with our database choice and supports rapid MVP development.

## Decision

Use **Next.js API Routes** with **TypeScript** as the backend, running on the same server as the frontend (monorepo approach per ADR-010).

## Rationale

Given the MVP scope (13 stories, simple CRUD with one auth provider), a separate backend service adds deployment and operational complexity without meaningful benefit. Next.js API Routes provide:

- Shared TypeScript types between frontend and backend
- One deployment, one build pipeline
- Built-in support for middleware (auth checks)
- Sufficient performance for MVP traffic levels

If the backend needs to be extracted as a separate service later (post-MVP), the API route handlers can be migrated to a standalone Express/Fastify server with minimal refactoring since they're already TypeScript functions.

## Consequences

### Positive
- Single codebase, single deployment, shared types (principle 3: one stack)
- No CORS configuration needed — frontend and API share the same origin
- Faster development loop: no separate backend to start, build, and deploy
- TypeScript end-to-end eliminates type mismatches between client and server

### Negative
- API routes share the Next.js server process; no independent scaling of backend vs. frontend
- Long-running operations (e.g., bulk email sends) should not block API routes — use background jobs if needed post-MVP
- Testing API routes requires setting up the Next.js request context

### Risks mitigated
- API routes are standard TypeScript functions — they can be extracted to a standalone service post-MVP with minimal effort
- The MVP does not require independent backend scaling; user limits (50 per workspace, 10 workspaces per user) make this unnecessary