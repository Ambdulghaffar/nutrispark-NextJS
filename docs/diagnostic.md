# Diagnostic — Nutrispark (Next.js)

Diagnostic performed on 2026-08-08, read-only. The project was created and committed between July 25 and 27, 2025 (19 commits), and hasn't been touched since.

## Stack and versions

| Item | Value |
|---|---|
| Next.js | 15.4.4 — **App Router** |
| React | 19.1.0 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) + shadcn/ui components (Radix UI, `class-variance-authority`, `tailwind-merge`) |
| Icons | lucide-react |
| Charts | recharts 3.1.0 (macronutrient pie chart) |
| Dev bundler | Turbopack (`next dev --turbopack`) |

**No version is significantly outdated.** This is actually a surprisingly recent stack for a tutorial from a year ago: Next 15 + React 19 + Tailwind v4 were still new in summer 2025. A year later (`npm outdated`):

- Next.js 15.4.4 → 16.3.0 available (major upgrade, not required)
- React 19.1.0 → 19.2.8 (minor)
- Tailwind 4.1.11 → 4.3.3, ESLint 9.32 → 9.39 / 10.x (minor)
- A reasonable gap overall, nothing that blocks deployment as-is.

## Does the project still start?

Yes, with no changes needed.

- **`npm install`**: OK, 415 packages, no errors.
- **`npm run build`**: **succeeds** (`✓ Compiled successfully in 87s`), correctly generates all 6 routes (static + dynamic). Non-blocking ESLint warnings:
  - `react-hooks/exhaustive-deps` in `src/app/food/[name]/page.tsx` (missing `fetchFood` dependency) and `src/app/page.tsx` (missing `router` dependency).
  - `geistSans` and `geistMono` declared in `src/app/layout.tsx` but never used (the active font is `Inter`, not Geist).
- **`npm run dev`**: starts normally (~16s with Turbopack), all tested routes respond (`/`, `/api/foods/all`, `/food/apple`).
- **`npm audit`**: **11 vulnerabilities (2 critical, 8 high, 1 moderate)**, all located in transitive dependencies of `next` (postcss, sharp, tar, nanoid, picomatch — CVEs related to image optimization, SSRF via redirects, DoS, etc.). These are fixed by upgrading `next` to 15.5.x/16.x (`npm audit fix --force`), not by changing application code.

No TypeScript errors — `tsc` passes silently during the build.

## Environment variables and external services

**None.** There is no `.env`, no `.env.local`, and no API key anywhere in the code. The project is fully self-contained:

- No database.
- No call to any external API.
- Nutrition data comes from a hardcoded TypeScript array (`src/data.ts`, 80 foods).
- Both API routes (`src/app/api/foods/all/route.ts`, `src/app/api/foods/[name]/route.ts`) simply read that in-memory array and return it as JSON.

Consequence: nothing to configure on Vercel (no environment variables to set) for the app to run exactly as it does locally.

## Current features

The app is a small nutrition-lookup tool with two screens:

1. **`/` (home page)** — `src/app/page.tsx`, client component. Fetches the food list via `GET /api/foods/all`, displays a search combobox (Radix `Popover` + `Command`, shadcn styling), and redirects to `/food/[slug]` on selection.
2. **`/food/[name]`** — `src/app/food/[name]/page.tsx`, client component. Fetches one food via `GET /api/foods/[name]`, displays: name, a macronutrient pie chart (recharts) for carbs/protein/fat, calories, macro breakdown, vitamins and minerals, with two image icons (`/vitamins.png`, `/minerals.png`) and a back button.
3. **Internal API** — two GET routes that expose the static `foods` array (full list, or lookup by slug generated from the name).

There is no nutrition "tracking" in the strict sense (no log, no saved meals, no user account): it's a browsable catalog, not a tracker.

## Code quality and technical debt

Concrete findings, in order of impact:

- **Silent routing bug — metadata never applied.** [src/app/food/[name]/layouts.tsx](../src/app/food/[name]/layouts.tsx) contains a `generateMetadata` function meant to give each food page a dynamic title. But the file is named `layouts.tsx` (with an "s") while Next.js only recognizes `layout.tsx`. **This file is never executed**: every page, including `/food/apple`, keeps the generic "Nutrispark" title defined in the root layout. Verified in dev: the `<title>` on `/food/apple` stays "Nutrispark".
- **Inconsistent image filename casing.** The code references `/Vitamins.png` and `/Minerals.png` (capitalized) in [src/app/food/[name]/page.tsx:125,137](../src/app/food/[name]/page.tsx#L125-L137), but the actual files in `public/` are `vitamins.png` and `minerals.png` (lowercase). This works locally on Windows (case-insensitive filesystem) but **will break on Vercel**, whose Linux filesystem is case-sensitive → 404'd images in production. See the deployment section below.
- **No real error handling / "not found" state.** Both `fetch` calls (home page and food page) catch network errors with a plain `console.log(error)` and no visible feedback to the user. Worse: when the API returns `404 { error: "Food not found" }` (unknown food), the frontend doesn't check `response.ok` — it still calls `setFood(data)` with `data = { error: "..." }`, exits the loading state, and tries to render `food.name`, `food.calories`, etc. on an object that doesn't have those properties (renders `undefined`, no crash but a broken UI). Verified in dev on `/food/doesnotexist`.
- **Leftover debug `console.log`** in both `catch` blocks (`src/app/page.tsx:42`, `src/app/food/[name]/page.tsx:36`).
- **Two fonts loaded, only one used.** `Geist`/`Geist_Mono` are imported and instantiated in `layout.tsx` but never applied (the font actually in use is `Inter`, via `fontSans`) — dead weight, with an associated ESLint warning.
- **Tailwind classes broken by typos** in `src/app/food/[name]/page.tsx`:
  - `lg: text-7xl` (line 57) — space after the colon, Tailwind doesn't recognize the class, no effect.
  - `lg:-1/3` (line 61) — likely a typo for `lg:w-1/3`, invalid class, no effect.
  - `bg-[##5079F2]` (line 109) — double `#`, invalid color (the "Protein" swatch renders a default/transparent color instead of the intended blue).
- **Data is 100% hardcoded, no persistence.** `src/data.ts` is a static TypeScript array of 80 foods. No database, no CMS. This is consistent with a tutorial project, but any change (adding/editing a food) requires a redeploy.
- **No class components**: everything is functional components + hooks (`useState`/`useEffect`), so no old-style React debt on that front.
- **TypeScript typing is generally correct** (`strict: true` in `tsconfig.json`), with well-defined interfaces in `src/types/index.ts`. No `any` found in application code.
- **No secrets committed in plaintext** — searched for `api_key`, `secret`, `password`, `token`, found nothing, and there is no external service to authenticate against anyway.

## Responsive state

The design is **mostly desktop-first**, with a partial responsive treatment on only one page:

- **Home page (`/`)**: no `sm:`/`md:`/`lg:` classes anywhere in the code. The search button has a fixed width `w-[300px]` (no `max-w-full` or adaptation), and the title is a fixed `text-5xl` with no mobile variant. It remains usable on small screens (nothing overflows badly given how sparse the page is), but this isn't deliberate responsive work — just a simple layout that happens to hold up on mobile.
- **Food page (`/food/[name]`)**: the only page with a real responsive layout (`flex-col` on mobile → `md:flex-row` on desktop, widths `w-full` → `md:w-1/2`). This is genuine work, but undermined by the Tailwind typos listed above (`lg: text-7xl`, `lg:-1/3`) that cancel the intended effect on large screens.
- **shadcn/ui components** (`Button`, `Popover`, `Command`, `Dialog`) are responsive by construction (e.g. `sm:max-w-lg` in `dialog.tsx`), but `Dialog` isn't even used anywhere in the app — dead code imported without being used.
- No custom viewport meta to flag: Next.js injects the default viewport, so mobile zoom behaves correctly even though the layout itself wasn't specifically tested on small screens.

**Visual conclusion**: responsive work is incomplete — only one of the two screens received real mobile treatment, and that treatment contains errors that neutralize part of the result.

## Ready for Vercel?

**Yes, with reservations.** No structural blocker: no stateful server, no database, no hardcoded local file paths (`fs`, absolute paths), no required environment variable. `next build` passes with no errors. A default Vercel deployment (Git import, zero-config) will work technically.

Reservations to address before/after going live, in priority order:

1. **Image filename casing** (`Vitamins.png`/`Minerals.png` vs `vitamins.png`/`minerals.png`) — will genuinely break in production (Linux, case-sensitive), fix before deploying to avoid broken icons on every food page.
2. **Rename `layouts.tsx` → `layout.tsx`** so per-food dynamic page titles finally work (currently every page shares the same title — bad for SEO/link sharing).
3. **`npm audit fix --force`** (bumping `next` to 15.5.x or 16.x) to clear the 11 vulnerabilities, including 2 critical ones — none is actively exploited by the current code, but it's worth starting clean for a production deploy.
4. Fix the "food not found" handling on the frontend (check `response.ok` before `setFood`) to avoid a broken UI if a user hits an invalid `/food/xxx` URL.

None of the above blocks a first demo deployment; these are quick fixes (minutes to a few hours) rather than a rewrite.
