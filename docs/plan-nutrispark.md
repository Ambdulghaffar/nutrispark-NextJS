# Nutrispark — Work Plan

Ordered checklist of fixes, chores, features, and polish items. See `docs/diagnostic.md` for the audit these items come from, and `CLAUDE.md` for the project's stack and constraints (no backend/database — persistence is `localStorage` only).

- [x] Fix: rename layouts.tsx to layout.tsx (dynamic page titles never apply)
- [ ] Fix: correct image filename casing (Vitamins.png/Minerals.png vs vitamins.png/minerals.png)
- [x] Fix: handle "food not found" properly on the front end (check response.ok before setFood)
- [x] Fix: remove leftover console.log in catch blocks
- [x] Fix: remove unused Geist/Geist Mono font imports (Inter is the active font)
- [x] Fix: correct broken Tailwind classes (lg: text-7xl, lg:-1/3, bg-[##5079F2])
- [x] Chore: npm audit fix --force to resolve the 11 vulnerabilities (2 critical)
- [x] Feature: TDEE/calorie needs calculator (age/weight/height/activity level, Harris-Benedict formula), calculated via a real POST /api/calculator/tdee route (server-side calculation, no persistence — request in, result out)
- [x] Feature: Favorites (heart icon on food list + detail page, persisted in localStorage)
- [x] Feature: Daily food journal (add a food + quantity from its detail page, running daily totals for calories/macros, persisted in localStorage, displayed against the TDEE goal from the calculator as a progress indicator — e.g. "1450 / 2200 kcal today")
- [x] Polish: responsive audit on the home page (currently no responsive treatment at all)
- [x] Polish: fix responsive typos on the food detail page so the existing md: breakpoint work actually takes effect
- [ ] Deploy to Vercel
