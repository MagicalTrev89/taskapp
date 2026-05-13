# Playwright Knowledge — Coach App

Project uses **Playwright** with **5 projects** (desktop, mobile, mobile-small, authenticated, authenticated-admin).

## Config quick-reference (`playwright.config.ts`)

| Setting | Value |
|---------|-------|
| `testDir` | `./e2e` |
| `workers` (local) | `4` |
| `workers` (CI) | `undefined` (Playwright default) |
| `fullyParallel` | `true` — tests within a file also run in parallel |
| `retries` (local) | `0` |
| `retries` (CI) | `2` |
| `timeout` | `30 000 ms` |
| `expect.timeout` | `10 000 ms` |
| `globalSetup` | `./e2e/global.setup.js` |

## Projects and which tests they run

| Project | Device | Matches | Ignores |
|---------|--------|---------|---------|
| `desktop` | Desktop Chrome | all `e2e/` | `authenticated/` |
| `mobile` | Pixel 5 | all `e2e/` | `authenticated/` |
| `mobile-small` | 320×568 | all `e2e/` | `authenticated/` |
| `authenticated` | Desktop Chrome | `authenticated/` | `authenticated/admin/` |
| `authenticated-admin` | Desktop Chrome | `authenticated/admin/` | — |

Auth state files: `playwright/.auth/coach.json` and `playwright/.auth/admin.json`.

## Dev server — never start it yourself

The `webServer` config only applies locally and uses `reuseExistingServer: true`:

- If the server **is** running on localhost:3000: Playwright reuses it.
- If it is **not** running: Playwright starts it via `npm run dev` automatically.
- **Never run `npm run dev` yourself before running tests** — it will either conflict or be redundant.
- In CI there is no `webServer` config — the app is already deployed to Vercel and `PLAYWRIGHT_BASE_URL` points at it.

## Running tests locally

```bash
# All tests (all 5 projects)
npx playwright test --workers=4

# Authenticated tests only
npx playwright test e2e/authenticated/ --workers=4 --reporter=list

# Single file
npx playwright test e2e/authenticated/fixtures.spec.ts --workers=4

# Single test by title
npx playwright test --grep "AC1" --workers=4
```

Always pass `--workers=4` explicitly when running from the command line.

## global.setup.js — critical rules

### Must stay CommonJS

`global.setup.js` is a `.js` file using `module.exports = setup` — **not TypeScript, not ESM**. Do not convert it to `.ts` or use `export default`. The `@auth/core/jwt` encode import is done via dynamic `await import(...)` inside the function to work around the CommonJS/ESM boundary.

### Uses `pg` directly — never Prisma

The setup file uses `new Pool({ connectionString: DATABASE_URL })` from `pg`. Do not import the Prisma client here — it is ESM-only and will crash.

### Seeded entities

The setup creates (all idempotent via UPSERT):
- Coach user: `test-coach@coachapp.test`
- Admin user: `test-admin@coachapp.test`
- Disabled user: `test-disabled@coachapp.test`
- A test team with **at least 8 players** (shirt numbers 1–8)
- `maintenance_mode` setting set to `false`

IDs are written to `playwright/.auth/test-ids.json`:
```json
{ "userId", "teamId", "adminUserId", "disabledUserId", "coachUserId" }
```

### Reading seeded IDs in tests

```ts
import * as fs from 'fs';
import * as path from 'path';

function getTestIds(): { userId: string; teamId: string } {
  const filePath = path.join(__dirname, '../../playwright/.auth/test-ids.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}
```

Never hardcode IDs — always read from `test-ids.json`.

## Waiting for RSC content

React Server Components stream after navigation. Always wait for **specific content** to be visible before interacting — never rely on navigation completing alone.

```ts
// CORRECT — wait for real content, not just the URL
await page.goto('/matches/new');
await expect(page.locator('input[name="opponent"]')).toBeVisible();

// WRONG — RSC may still be streaming
await page.goto('/matches/new');
await page.locator('input[name="opponent"]').fill('...');  // may fail
```

Loading skeletons are replaced by real content — skeletons do not have form inputs, so waiting for an input to be visible confirms RSC has finished streaming.

## sr-only / visually-hidden inputs

Radio buttons and checkboxes styled with `sr-only` (clipped, not `display:none`) are non-interactable by default. Use `{ force: true }`:

```ts
// CORRECT
await page.locator('input[name="format"][value="QUARTERS"]').check({ force: true });

// WRONG — throws "Element is not interactable"
await page.locator('input[name="format"][value="QUARTERS"]').check();
```

## Testing unauthenticated behaviour

Create a fresh browser context with no storage state:

```ts
test('requires authentication', async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: undefined });
  const page = await ctx.newPage();
  await page.goto('/matches/new');
  await expect(page).toHaveURL(/\/login/);
  await ctx.close();
});
```

## Reading DOM state with page.evaluate()

When Playwright locators can't reach the value you need (e.g. computed styles, deeply nested text), use `page.evaluate()`:

```ts
const fontSize = await el.evaluate((node) =>
  parseFloat(window.getComputedStyle(node).fontSize)
);

// Reading a specific text value from a complex DOM structure
const value = await page.evaluate(() => {
  const el = document.querySelector('...');
  return el?.textContent?.trim() ?? null;
});
```

## CI vs local differences

| Concern | Local | CI |
|---------|-------|-----|
| Base URL | `http://localhost:3000` | `PLAYWRIGHT_BASE_URL` (Vercel preview) |
| Dev server | started by Playwright if not running | none — app already deployed |
| Auth bypass | not needed | `VERCEL_AUTOMATION_BYPASS_SECRET` header |
| Auth cookie name | `authjs.session-token` | `__Secure-authjs.session-token` (HTTPS) |
| Workers | 4 | Playwright default |
| Retries | 0 | 2 |

## Common pitfalls

| Pitfall | Fix |
|---------|-----|
| Test fails on RSC-rendered content immediately after navigation | Add `await expect(locator).toBeVisible()` before interacting |
| sr-only radio/checkbox throws "not interactable" | Add `{ force: true }` to `.check()` or `.click()` |
| global.setup.js crashes with ESM import error | Keep it as `.js` with `module.exports`; use dynamic `import()` for ESM deps |
| global.setup.js crashes importing Prisma | Replace with `pg` Pool directly |
| Hardcoded teamId/userId breaks after DB reset | Always read from `playwright/.auth/test-ids.json` |
| Tests interfere with each other | Confirm `fullyParallel: true` — tests must not share mutable state |
| `page.evaluate()` returns `null` unexpectedly | RSC may not have streamed yet — add a `waitForSelector` first |
| CI auth fails with 401 on Vercel preview | Check `VERCEL_AUTOMATION_BYPASS_SECRET` is set in CI env |
| Server action throws after Prisma schema change, button stuck on "pending" state | Dev server has old generated Prisma client in memory — restart `npm run dev` after `prisma generate` |
| `getByText(/regex/)` fails with "strict mode violation" | The regex matches multiple elements — use a role-based locator like `getByRole('heading', { name: '...' })` instead |
| `getByRole('button', { name: /Start/i })` matches multiple buttons | Hint text inside sibling buttons (e.g. "Start timer first") also matches — use `{ name: "Start", exact: true }` to target the specific button |
| Period label appears in two places (header + card), causing strict mode violation | Use `.first()` or scope to a specific container: `page.locator('.timer-card').getByText(...)` |
| `locator('li').filter({ hasText: 'Opponent FC' })` matches multiple items | Prior test runs leave same-named matches in DB — use `filter({ has: locator('a[href*="${matchId}"]') })` to locate by matchId instead |
| Future-dated match kick-off times out in `waitForURL(/live/)` | Clicking Kick Off shows the warning dialog — call `kickOffViaWarning` helper (which clicks "Start anyway") rather than assuming direct navigation |
| Fire-and-forget server action not yet persisted when `page.reload()` runs | If a button calls a `void serverAction()` and the test reloads immediately after, the DB may not have the new state yet — wait for a local DOM change that confirms the action completed (e.g. `expect(locator).toHaveText("00:00")`) then add `waitForTimeout(500)` before reloading |
| UI test expects a table that was seeded by a different parallel test | With `fullyParallel: true`, tests run concurrently — a UI test that renders a table cannot rely on data created in a sibling test. Call the data-setup helper directly in every test that needs it. |
| Tests fail after a Prisma schema change (e.g. `createMany` throws "Unknown argument") | Hot reload picks up new app code but NOT the regenerated Prisma client — restart the dev server after `npx prisma generate` so the new client is loaded |
| Relative game-time assertion fails with accumulated DB data (e.g. `player0 > subPlayer`) | Accumulated stats across many runs can diverge if any run had unusual data — use floor assertions (`>= N`) instead of relative comparisons between two accumulated totals |
