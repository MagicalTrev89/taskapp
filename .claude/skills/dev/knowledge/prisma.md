# Prisma Knowledge — Coach App

Project uses **Prisma 7** with **`@prisma/adapter-pg`** (connection pooling via the `pg` driver).

## Generated client is NOT committed

The generated Prisma client at `src/generated/prisma/` is gitignored. This means:

- Any CI/CD job that runs code importing from `@/generated/prisma/client` **must** run `npx prisma generate` first.
- `next build` is fine — `package.json` `build` script already runs `prisma generate`.
- **Test jobs must explicitly run `npx prisma generate` before `npm test`** — they do not go through the build script.
- Check **every job** in **every `.github/workflows/` file** any time you touch CI.

## ESM-only client

The generated Prisma client is **ESM-only**. This affects:

- **Node scripts** (`scripts/*.ts` / `scripts/*.js`) — cannot `require()` the Prisma client. Use `pg` directly for any standalone scripts.
- **Playwright tests** — must use `pg` directly for database setup/teardown, not the Prisma client.
- The Next.js app itself works fine because it runs in an ESM context.

## Schema changes require a dev server restart

After running `npx prisma migrate dev` or editing `prisma/schema.prisma`:

1. Run `npx prisma generate` to regenerate the client.
2. **Restart the Next.js dev server** — the old generated types are cached in memory and will cause type errors until the server restarts.

## Migration rules (from CLAUDE.md)

Any migration that sets a default value for a new field or modifies existing rows **must** have:

1. Clear requirements documented in the relevant user story under `docs/user-stories/`.
2. Agreement on the default/transformation before writing the migration — do not improvise.

## Connection setup

The project uses `@prisma/adapter-pg` for connection pooling. The Prisma client is instantiated with the pg adapter — do not swap to the default connection string approach without an ADR.

```ts
// Correct pattern — uses pg adapter
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
```

## Common pitfalls

| Pitfall | Fix |
|---------|-----|
| CI test job fails: "Cannot find module `@/generated/prisma/client`" | Add `npx prisma generate` step before `npm test` in the workflow |
| Script crashes importing Prisma client | Rewrite the script to use `pg` directly |
| Playwright seed/teardown fails with import error | Use `pg` directly, not Prisma client |
| Type errors on newly added fields after schema change | Restart the dev server after `prisma generate` |
| New NOT NULL column migration with existing rows | Define and document the default value in the user story first |
| Case-insensitive unique constraint in Prisma | `@@unique` is case-sensitive at DB level; use `findFirst` with `mode: "insensitive"` in app code for case-insensitive uniqueness checks |
| Setting a field to NULL via PATCH | Use `.nullable()` in Zod schema (not `.optional()` alone) — Prisma interprets `{ description: null }` as "set to null" but `{}` (omitted) as "keep existing" |
