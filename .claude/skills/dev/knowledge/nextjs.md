# Next.js Knowledge — Coach App

Project uses **Next.js 16 App Router** with **React 19** and **Tailwind CSS v4**.

## App Router fundamentals

- Every component inside `app/` is a **Server Component by default**. Add `'use client'` only when the component needs browser APIs, hooks, or event handlers.
- Never use React hooks (`useState`, `useEffect`, etc.) in Server Components — it will throw at runtime.
- Client Components can import Server Components **only as children via `children` prop**, not as direct imports.

## Params and searchParams are Promises (Next.js 15+)

In Next.js 15+, `params` and `searchParams` in page/layout components are **Promises**, not plain objects.

```tsx
// CORRECT
export default async function Page({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
}

// WRONG — will produce a runtime warning and may break
export default async function Page({ params }: { params: { teamId: string } }) {
  const { teamId } = params; // params is a Promise
}
```

## Async cookies/headers (Next.js 15+)

`cookies()` and `headers()` from `next/headers` are now **async** — always await them.

```tsx
import { cookies } from 'next/headers';
const cookieStore = await cookies();
```

## Data fetching

- Fetch data in **Server Components** by calling service/DB functions directly — no need for `useEffect` or client-side fetching for initial data.
- After a mutation (Server Action or API route), call `revalidatePath('/path')` or `revalidateTag('tag')` to invalidate the cache and trigger a re-render.
- Do NOT use `cache: 'no-store'` everywhere as a shortcut — understand what caching is appropriate for each route.

## Server Actions

- Define with `'use server'` at the top of the function or file.
- Use for form submissions and mutations — bind to the `action` prop on `<form>` elements.
- Always validate and sanitise inputs; Server Actions run on the server but inputs come from the client.
- Return a typed result object rather than throwing, so the client component can display errors gracefully.

## Route structure in this project

```
src/app/
  layout.tsx          — root layout (always Server Component)
  page.tsx            — home
  dashboard/          — main coach dashboard
  teams/[teamId]/     — team detail, edit, delete, players
  matches/[matchId]/  — match detail, edit, delete, plan, squad, view
  admin/              — admin panel (separate layout)
  api/                — route handlers (REST API — schema-first, see ADR-004)
```

## Loading and error boundaries

- `loading.tsx` in a route segment creates a **Suspense boundary** — shown while the page's async data loads.
- `error.tsx` creates an **error boundary** — must be `'use client'` (React requirement). Receives `error` and `reset` props.
- Both files are colocated with the route they cover.

## next-auth v5 (Auth.js beta)

- Access the session on the server via `auth()` from `@/auth` — **not** `getServerSession`.
- In Server Components and Route Handlers: `const session = await auth();`
- Protect routes via `middleware.ts` at the project root using the `auth` middleware export.
- The Prisma adapter is wired in — the session user ID maps to the `User` table via the adapter.

## Common pitfalls

| Pitfall | Fix |
|---------|-----|
| "Cannot use hooks in Server Component" | Add `'use client'` to the component |
| Stale data after mutation | Call `revalidatePath` or `revalidateTag` in the Server Action |
| `params` is a Promise at runtime | Await `params` before destructuring |
| `cookies()` returns a Promise | Await `cookies()` from `next/headers` |
| Client Component importing a Server Component directly | Pass Server Component output as `children` instead |
| Large bundle on a page that only needs server data | Remove `'use client'` — fetch on the server |
