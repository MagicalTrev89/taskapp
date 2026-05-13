# ADR-001: Frontend Framework

Date: 2026-05-13

## Status

Accepted

## Context

The MVP requires a single-page application with:
- Kanban board with drag-and-drop (US-006)
- Responsive layout with sidebar navigation (US-010)
- Multiple views (Kanban, list, task detail, settings) with client-side routing
- Optimistic UI updates (US-013)
- Form handling for task creation, status management, and comments

We need a frontend framework that supports component-based UI, state management, and has strong drag-and-drop library support.

## Decision

Use **Next.js** (React-based) with the App Router.

## Consequences

### Positive
- Large ecosystem and community; extensive documentation and third-party libraries
- Server-side rendering (SSR) and static generation available if needed for SEO or performance
- App Router provides file-based routing that maps well to our view structure
- Best drag-and-drop library support (dnd-kit is React-native)
- Strong TypeScript support out of the box
- API routes built in — can serve as both frontend and backend if we choose the monorepo approach (ADR-010)

### Negative
- Heavier than a pure SPA (Vite + React) due to Next.js server components
- App Router is still relatively new; some patterns are evolving
- Bundle size is larger than minimal React setups

### Risks mitigated
- Next.js is the most popular React framework with the largest community — proven choice per principle 5
- Server components can be incrementally adopted; the MVP can use mostly client components