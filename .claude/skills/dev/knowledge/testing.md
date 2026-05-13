# Testing Knowledge — Coach App

Two test suites: **Vitest** (unit/integration) and **Playwright** (e2e).

## Playwright — critical rules

### Never start the dev server yourself

Do NOT manually run `next dev` or `npm run dev` before running Playwright tests. The `playwright.config.ts` `webServer` config handles this automatically:

- If the server **is** running on localhost:3000: Playwright reuses it (`reuseExistingServer: true`).
- If it is **not** running: Playwright starts it via `npm run dev` automatically.

Do not add a manual server start step — it will conflict.

### Always run with `--workers=4` locally

```bash
npx playwright test --workers=4
```

`--workers=1` was used previously but was too slow. The config sets 4 workers locally (`workers: process.env.CI ? undefined : 4`). Always pass `--workers=4` explicitly on the command line.

### Database access in Playwright — use `pg` directly

Playwright seed scripts and test setup/teardown must use the `pg` package directly. Do NOT use the Prisma client (it is ESM-only and incompatible with the Playwright test runner context).

```ts
// CORRECT — in Playwright global setup/seed scripts
import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// WRONG — will fail in Playwright context
import { prisma } from '@/lib/prisma';
```

### Wait for RSC content, not just navigation

After navigating or performing an action, wait for specific **content** to appear rather than just URL changes. React Server Components may still be streaming after navigation completes.

```ts
// CORRECT
await page.goto('/dashboard');
await page.waitForSelector('[data-testid="dashboard-heading"]');

// FRAGILE — page may have navigated but RSC content not yet rendered
await page.goto('/dashboard');
await page.click('button');
```

## Vitest — unit and integration tests

- Config is in `vitest.config.ts` (or `vite.config.ts`).
- Run with `npm test` (runs `vitest run` — single pass, no watch).
- Watch mode: `npm run test:watch`.
- Coverage: `@vitest/coverage-v8` — run with `vitest run --coverage`.

## What to test where

| Concern | Tool |
|---------|------|
| Pure functions, utilities, transformers | Vitest unit test |
| Service layer logic, DB queries | Vitest integration (real DB) |
| User journeys, acceptance criteria | Playwright e2e |
| API route handlers | Vitest or Playwright depending on complexity |

## No database mocks

Do not mock the database in any test. Prior incident: mocked tests passed but the production migration failed due to mock/prod divergence. Tests must hit a real database. Use the test database configured via `DATABASE_URL` in `.env.test`.

## Common pitfalls

| Pitfall | Fix |
|---------|-----|
| Playwright tests flaking / interfering with each other | Confirm `--workers=1` is being used |
| "Cannot find module `@/generated/prisma/client`" in tests | Run `npx prisma generate` before `npm test` |
| Playwright seed script crashes on Prisma import | Rewrite seed to use `pg` directly |
| RSC content not visible after navigation in Playwright | Add `waitForSelector` for specific content |
| Tests pass locally, fail in CI | Check CI workflow has `npx prisma generate` before test step |

## API route testing patterns

When testing API routes that handle workspace-scoped resources:

1. **Every DELETE/PUT/PATCH must verify workspace membership** — even for sub-resources like comments. A user who has left a workspace should not be able to delete their old comments by knowing the comment ID.
2. **Whitelist sort fields** — never pass user-supplied `sortBy` directly to Prisma `orderBy`. Map to an allowlist: `["createdAt", "title", "statusId"]`.
3. **Whitespace-only strings are not empty** — Zod's `.min(1)` accepts `"   "`. Use `.refine(val => val.trim().length > 0)` or `.trim().min(1)` for text fields where whitespace-only input should be rejected.
4. **Nullable vs optional for clearing fields** — When a PATCH endpoint should allow clearing a field (e.g., removing a description), use `.nullable()` in the Zod schema. `.optional()` alone means "keep existing if omitted" — `{ description: null }` with `.nullable().optional()` means "set to null".
