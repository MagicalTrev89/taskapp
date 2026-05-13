# Local Setup

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- **PostgreSQL** 15+ (or a Supabase account with a project)
- **Google Cloud Console** project with OAuth 2.0 credentials

## Steps

### 1. Clone and install

```bash
git clone <repo-url> taskapp
cd taskapp
npm install
```

### 2. Environment variables

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@localhost:5432/taskapp` |
| `AUTH_SECRET` | Random secret for JWT sessions | Run `npx auth secret` to generate |
| `AUTH_URL` | App URL | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | From Google Cloud Console |
| `RESEND_API_KEY` | Resend API key for transactional email | `re_xxxx...` (optional for local dev) |

### 3. Database setup

If using a local PostgreSQL:

```bash
createdb taskapp
npx prisma migrate dev --name init
```

If using Supabase, set `DATABASE_URL` to your Supabase connection string and run:

```bash
npx prisma migrate dev --name init
```

### 4. Generate Prisma client

```bash
npx prisma generate
```

This step is also run automatically by `npm run build`.

### 5. Google OAuth setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret to `.env.local`

### 6. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### 7. (Optional) Seed the database

There is no seed script yet. The first user to sign in via Google will automatically get a default workspace with the three default statuses.

## Common commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (includes `prisma generate`) |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest unit tests |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:e2e` | Run Playwright e2e tests |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database without migration |
| `npm run db:studio` | Open Prisma Studio |

## Troubleshooting

- **"Cannot find module `@/generated/prisma/client`"**: Run `npx prisma generate`
- **Type errors after schema changes**: Restart the dev server after running `npx prisma generate`
- **Google OAuth not working**: Ensure the redirect URI in Google Cloud Console matches `http://localhost:3000/api/auth/callback/google`