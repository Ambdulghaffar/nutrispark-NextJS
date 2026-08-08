# Nutrispark

A Next.js learning project (created July 2025, untouched since) now being audited, fixed, and prepared for a Vercel deployment.

## Stack

- **Next.js 15.4.4** — App Router (not Pages Router)
- **React 19.1.0**
- **TypeScript**, `strict: true`
- **Tailwind CSS v4** (`@tailwindcss/postcss`) + **shadcn/ui** components (Radix UI primitives, `class-variance-authority`, `tailwind-merge`)
- Icons: `lucide-react`
- Charts: `recharts` (macronutrient pie chart on the food detail page)
- Dev bundler: Turbopack (`next dev --turbopack`)

## No backend, no database

There is no server-side persistence layer of any kind:

- All food data lives in `src/data.ts`, a static in-memory TypeScript array (~80 foods).
- The existing API routes (`src/app/api/foods/all/route.ts`, `src/app/api/foods/[name]/route.ts`) only read and return this static array — they are not backed by a database.
- No `.env` / `.env.local` files exist, and none are required for the app to run today.

**Constraint: any new feature that needs persistence (favorites, food journal, etc.) must use `localStorage` on the client.** Do not introduce a real database, ORM, auth provider, or external backend service for this project. A server-side API route is fine for stateless calculation (e.g. a TDEE calculator that takes input and returns a result without storing anything), but nothing should require a database or external service to run.

## Deployment target

Vercel, zero-config. The app must keep working with a plain Git-import deploy — no environment variables to configure, no external services to provision. Avoid anything that depends on a stateful server, local filesystem writes, or absolute local file paths.

## Project docs

- `docs/diagnostic.md` — baseline audit of the project as found (stack, build/lint/audit results, functionality, code quality, responsive state, Vercel readiness).
- `docs/plan-nutrispark.md` — ordered checklist of fixes, chores, features, and polish items to work through next.
