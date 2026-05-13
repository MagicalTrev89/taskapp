# Architecture Principles

These principles govern all technical decisions for TaskApp. Every ADR must be consistent with these principles. If a decision conflicts with a principle, the conflict must be explicitly acknowledged and justified in the ADR.

## 1. MVP-First

Ship the minimum viable product before adding complexity. Every feature must trace to a user story. If it isn't in the MVP scope, it doesn't get built until the MVP is complete and stable.

## 2. Simplicity Over Flexibility

Choose the simplest approach that satisfies the user stories. Avoid premature abstraction, over-engineering, and "we might need this later." Three similar lines are better than a premature abstraction.

## 3. One Stack, One Team

The MVP is built by a small team. Prefer a single-language stack where possible. Avoid introducing multiple languages, build systems, or deployment pipelines unless the benefit is clear and immediate.

## 4. Managed Services Over Self-Hosted

Prefer managed services (databases, authentication, email delivery, hosting) over self-hosted infrastructure. Time spent on ops is time not spent on the product.

## 5. Proven Over Novel

Choose well-established libraries, frameworks, and services with large communities and extensive documentation. The MVP is not the place to bet on unproven technology.

## 6. Security by Default

Authentication, authorisation, input validation, and OWASP Top 10 protections are not optional. Every endpoint must verify the user is a workspace member before returning data.

## 7. Progressive Enhancement

The app must work on modern browsers (last 2 versions of Chrome, Firefox, Safari, Edge). Mobile-first responsive design. Accessibility is not an afterthought — keyboard navigation and screen-reader support are required for core flows.

## 8. Last-Write-Wins for MVP

Concurrent editing conflicts are resolved by last-write-wins. No operational transforms, no conflict resolution UI. This keeps the data model simple and avoids WebSocket complexity for MVP.

## 9. Optimistic UI

User interactions (drag-and-drop, status changes, comment posting) should feel instant. Update the UI immediately, revert on server error. This means the client must handle failure states gracefully.

## 10. Decisions Require ADRs

No technology choice is assumed. Every decision — framework, database, auth provider, hosting, third-party service — must be recorded in an accepted ADR before any code depends on it.