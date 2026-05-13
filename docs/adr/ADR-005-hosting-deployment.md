# ADR-005: Hosting and Deployment

Date: 2026-05-13

## Status

Accepted

## Context

The MVP needs:
- A hosting platform for the Next.js application (frontend + API routes)
- PostgreSQL database hosting (ADR-003: Supabase)
- Email delivery for invitations (ADR-007: Resend)
- CI/CD pipeline for automated deployments from the `main` branch
- HTTPS and custom domain support
- Sufficient free tier for development and initial launch

## Decision

Deploy on **Vercel** with a GitHub-connected CI/CD pipeline.

## Rationale

Vercel is the creator of Next.js and provides first-class support:
- Zero-configuration deployment of Next.js applications
- Automatic previews for pull requests
- Edge functions for middleware (auth checks)
- Generous free tier (hobby plan) sufficient for MVP
- Custom domains, HTTPS, and global CDN included
- Direct integration with GitHub for push-to-deploy

## Consequences

### Positive
- Pushing to `main` triggers automatic deployment (principle 4: managed services)
- Pull request previews for review before merging
- Serverless functions auto-scale; no server management
- Vercel + Next.js is the most battle-tested combination (principle 5)
- Environment variables managed in Vercel dashboard, not in code

### Negative
- Vercel serverless functions have execution time limits (10s on hobby, 60s on Pro) — sufficient for MVP CRUD operations
- Vendor lock-in for deployment, though the Next.js app itself is portable
- Cold starts on serverless functions; negligible impact for CRUD operations

### CI/CD pipeline
- `develop` branch: automatic deployment to a preview environment
- `main` branch: automatic deployment to production
- Feature branches (`feature/*`, `fix/*`): preview deployments for PR review