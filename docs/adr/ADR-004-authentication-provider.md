# ADR-004: Authentication Provider

Date: 2026-05-13

## Status

Accepted

## Context

US-001 requires Google OAuth 2.0 as the sole authentication method. We need:
- "Sign in with Google" button that initiates OAuth 2.0
- Automatic user provisioning on first sign-in (including default workspace)
- Session management with expiry and redirect on session loss
- Access to the user's Google profile (name, email, avatar) for display
- Integration with Next.js API routes for protecting endpoints

## Decision

Use **NextAuth.js (Auth.js)** with the Google provider.

## Rationale

NextAuth.js is the standard authentication library for Next.js:
- Built-in Google OAuth 2.0 provider with minimal configuration
- Works with Next.js API routes and middleware for route protection
- Manages session tokens (JWT or database-backed) automatically
- Provides `useSession` hook on the client and `getServerSession` on the server
- Large community, well-documented (principle 5)

## Consequences

### Positive
- Google OAuth configured in under 50 lines of code
- Session management (creation, renewal, expiry) is handled automatically
- Client-side `useSession` hook provides user data (name, email, avatar) throughout the app
- Middleware integration for protecting routes (US-001 AC: unauthenticated users redirected to login)
- Open-source with no vendor lock-in

### Negative
- NextAuth.js is in a transition period between v4 and v5 (Auth.js); we'll use v5 (Auth.js) as the stable path forward
- Session token storage defaults to JWT; if we need server-side session invalidation post-MVP, we'll need to add a database adapter

### Security considerations
- Google OAuth client ID and secret must be stored in environment variables, never committed to source
- Session JWTs must use a strong `NEXTAUTH_SECRET` environment variable
- The callback URL must be whitelisted in the Google Cloud Console