# Coach App — Claude Context

A grassroots football team management application. Currently in the design/planning phase.

## Project Docs

- [High-Level Design](docs/design/high-level-design.md) — living summary of all technical decisions
- [Architecture Principles](docs/design/architecture-principles.md) — core values that govern all technical decisions
- [ADR Index](docs/adr/README.md) — architecture decision records
- [User Stories](docs/user-stories/README.md) — requirements by persona/epic
- [Developer Docs](docs/dev/) — local setup, SDLC, architecture, API reference, deployment

## UI Mocks

All UI/UX mockups live in `docs/mocks/`. When producing design mockups (HTML/Tailwind prototypes, wireframes, etc.), always save them there.

## Rules

### MVP first — coach product before anything else

See [docs/design/mvp-scope.md](docs/design/mvp-scope.md). Players never get accounts. Parents are post-MVP. Do not implement any feature for a non-coach persona until the coach MVP is complete and the feature has been moved out of the future features backlog with full user stories written.

### Future features must not be built without stories

[docs/future-features.md](docs/future-features.md) is the holding area for nice-to-haves. Nothing in that list may be implemented until it is:
1. Removed from the list
2. Defined as user stories in `docs/user-stories/`
3. Any required ADRs raised and accepted

### Every technical decision requires an ADR

Before suggesting or implementing any technology choice (framework, database, auth provider, hosting, third-party service, etc.):

1. Raise an ADR in `docs/adr/` using the next available number
2. Get it accepted before writing any code that depends on that choice
3. Update the **Technology Decisions** table in `docs/design/high-level-design.md` to reflect the accepted decision

This applies to Claude too — do not assume a technology stack. If a decision hasn't been recorded in an accepted ADR, it hasn't been made.

### User stories before features

New features must trace back to a user story in `docs/user-stories/`. If one doesn't exist, write it first.

### ADR format

See [docs/adr/README.md](docs/adr/README.md) for the template.

### Branch deletion — feature branches only

Only `feature/*` and `fix/*` branches may ever be deleted. **Never delete `main` or `develop`.** Both are permanent branches:

- `main` — production-ready code, deployed by CI
- `develop` — integration branch; all feature PRs target this before being promoted to `main`

When GitHub offers "Delete branch" after a PR is merged, only click it for `feature/*` or `fix/*` branches. If `develop` is ever accidentally deleted, recreate it by fast-forwarding from `main` and pushing.
