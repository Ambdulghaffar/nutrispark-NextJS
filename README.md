# Nutrispark 🥦

A nutrition explorer that helps you look up foods, calculate your daily calorie needs, and track what you eat against your own goal.

## Overview

Nutrispark lets you search a food database for detailed nutritional breakdowns, calculate your Total Daily Energy Expenditure (TDEE) with the Mifflin-St Jeor formula, save foods to a favorites list, and log meals in a daily journal that tracks your progress against a personal calorie goal. It started in July 2025 as a Next.js learning project built from a tutorial, and has since been extended with these personal features and audited for a proper production deployment.

## Features

- **Food search** — browse and search 84 foods with detailed nutritional values (calories, macros, fiber, sugar, vitamins, minerals)
- **TDEE calculator** — estimate your Basal Metabolic Rate and daily calorie needs using the Mifflin-St Jeor formula, calculated server-side via a real `POST` route
- **Favorites** — save foods for quick access, persisted with `localStorage` across pages and browser tabs
- **Daily food journal** — log foods eaten and track progress against your personal TDEE-based calorie goal
- **Responsive design** — usable from mobile to desktop

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router, Turbopack dev server)
- [React](https://react.dev) 19
- [TypeScript](https://www.typescriptlang.org) (`strict` mode)
- [Tailwind CSS](https://tailwindcss.com) v4
- [shadcn/ui](https://ui.shadcn.com) (Radix UI primitives, `class-variance-authority`, `tailwind-merge`)
- [Recharts](https://recharts.org) — macronutrient breakdown chart on the food detail page
- [Lucide](https://lucide.dev) icons
- Route Handlers (GET/POST) for the API layer

## API Routes

Nutrispark ships a small set of Next.js Route Handlers:

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/foods/all` | Returns the full list of foods |
| `GET` | `/api/foods/[name]` | Returns a single food by its slugified name |
| `POST` | `/api/calculator/tdee` | Calculates BMR, TDEE, and a macro split from body metrics |

**Example — `POST /api/calculator/tdee`**

Request body:

```json
{
  "age": 28,
  "sex": "male",
  "weight": 75,
  "height": 180,
  "activityLevel": "moderate"
}
```

Response:

```json
{
  "bmr": 1724,
  "tdee": 2672,
  "macros": {
    "protein": 200,
    "carbohydrates": 267,
    "fat": 89
  }
}
```

## Getting Started

```bash
git clone <this-repo-url>
cd nutrispark-NextJS
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No environment variables are required — the app has no backend or database; all food data is static and everything else is computed client-side or via stateless API routes.

## Live Demo

[Live demo](https://nutrispark-next-js.vercel.app/)

## License

MIT
