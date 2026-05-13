# Deployment

## Platform

TaskApp is deployed on **Vercel** (ADR-005).

## Production Deployment

1. Merge `develop` into `main`
2. Vercel automatically deploys `main` to production
3. No manual steps required

## Preview Deployments

- Every push to `develop` creates a preview deployment
- Every PR targeting `develop` creates a preview deployment
- Preview URLs are available in the PR comments on GitHub

## Environment Variables

Set in the Vercel dashboard (Settings → Environment Variables):

| Variable | Environment | Description |
|----------|-------------|-------------|
| `DATABASE_URL` | Production, Preview | Supabase PostgreSQL connection string |
| `AUTH_SECRET` | Production, Preview | JWT secret (generate with `npx auth secret`) |
| `AUTH_URL` | Production | `https://taskapp.vercel.app` (production URL) |
| `GOOGLE_CLIENT_ID` | Production, Preview | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Production, Preview | Google OAuth client secret |
| `RESEND_API_KEY` | Production, Preview | Resend API key |

## Database Migrations

Run migrations before deploying:

```bash
npx prisma migrate deploy
```

This can be added as a Vercel build command or run manually against the production database.

## CI/CD

The GitHub Actions workflow (to be set up) runs:
1. `npx prisma generate`
2. `npm test` (Vitest)
3. `npm run test:e2e` (Playwright)
4. `npm run build`

All steps must pass before a PR can be merged.