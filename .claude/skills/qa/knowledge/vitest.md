# Vitest Knowledge — Coach App

Project uses **Vitest** for unit and integration tests.

## Running tests

```bash
npm test              # vitest run — single pass, exits with result
npm run test:watch    # vitest — watch mode, re-runs on change
```

Coverage (via `@vitest/coverage-v8`):
```bash
npx vitest run --coverage
```

## No database mocks

Do not mock the database in any test. Tests must use a real database connection (configured via `DATABASE_URL`). Prior incident: mocked tests passed but a production migration failed because the mock didn't reflect real DB behaviour.

## What belongs in Vitest vs Playwright

| Concern | Tool |
|---------|------|
| Pure functions, utilities, transformers | Vitest unit test |
| Service layer logic, DB queries | Vitest integration (real DB) |
| User journeys, acceptance criteria | Playwright e2e |
| API route handlers | Playwright if behaviour depends on full request lifecycle; Vitest for isolated logic |

## Prisma client in tests

The Prisma generated client (`src/generated/prisma/`) is not committed. Before running `npm test` in CI, `npx prisma generate` must be run first — the Vitest process will fail to import the client otherwise.

Locally this is not an issue if you have already run `prisma generate` or started the dev server. In CI it is always required.

## Common pitfalls

| Pitfall | Fix |
|---------|-----|
| CI test job: "Cannot find module `@/generated/prisma/client`" | Add `npx prisma generate` step before `npm test` in the workflow |
| Test passes locally, fails in CI | Check CI workflow has `npx prisma generate` before the test step |
| Mocked DB test passes but prod breaks | Remove the mock — use a real DB connection |
