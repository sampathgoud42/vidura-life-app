# Vidura Life

A calm, time-aware wellness companion. The whole UI follows the sun: a living mesh-gradient sky
shifts from dawn peach to night indigo, and the **Right Now** card suggests what fits this moment
for your focus areas. It's built from the content of the original *Wellness app* artifact
(health goals, daily rituals, weekly movement, 126 regional Indian day plans, tips, affirmations)
and the earlier Vidura World wellness site (remedies, routines, foods).

- **Today's plate**: every meal with ≈ protein, a day total against the ~0.8 g/kg guide, **Change**
  any meal for today (alternatives match your diet and kitchen, ranked for your focus), and
  **Balance your day** suggestions: add a protein snack, walk after a heavier meal, keep the next meal lighter.
- **Tips**: Tips · Tricks (by approach and women's / men's notes) · Routines · Foods (enjoy / go easy on, illustrated).
- **Fertility guide** (with the Fertility focus): cycle and fertile-window estimates, the best time to
  try, tracking pros and cons, egg / sperm health, myths and facts, OTC supplements with evidence verdicts.
- **Extras** for everyone: short summaries of nine books and ideas, from Ikigai to the I Ching.

Local-first: no accounts. Plans, history, swaps and cycle details stay on the device. The only thing
that leaves it is the **name and email** entered at sign-up, saved to the SQLite wellness database
when it's reachable (best effort: if it can't be saved, nothing is shown and the app carries on).

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173  (also on your LAN, for phone testing)
npm run build        # typecheck + production build → dist/
npm run preview      # serve dist/ locally
```

Try any time of day with `?at=HH:MM`, e.g. `http://localhost:5173/?at=19:15` (the clock keeps ticking from there).

## Scripts

| Script | What it does |
| --- | --- |
| `npm run qa:setup` | Once: installs the QA browser (Chrome headless shell) inside this project, under `node_modules`. |
| `npm run qa` | Drives the built app: onboarding and validation edge cases, the wellness DB upsert, storage blocked, every phase, 4:59 → 5:00 and midnight boundaries, reduced motion, meal swaps and balance, Tips views, the fertility guide, Extras, 380 px and desktop layouts. Screenshots go to `qa/screens/`. |
| `npm run wellness-api` | Runs the wellness contact API on its own (port 8791), for a hosted site. |
| `npm run contrast` | WCAG AA audit of every phase palette (worst-case over the mesh and glass). |
| `npm run images:prompts` | Writes `docs/IMAGE_PROMPTS.md` (all 51 Nano Banana Pro prompts). |
| `npm run images:dry` | Lists missing images and estimates the cost. |
| `npm run images` | Generates missing images with Nano Banana Pro, writes WebP + `-sm` variants, rebuilds blurred placeholders. |
| `npm run extract` | Re-extracts the meal plans from `reference/wellness-app.original.jsx` into `src/data/content.ts`, with ≈ protein per meal (`scripts/lib/protein.mjs`). |
| `npm run icons` | Renders the PWA icons from the orb mark. |

## Images (Nano Banana Pro)

1. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` (Google AI Studio key with Gemini 3 Pro Image access).
2. `npm run images:dry` shows the cost estimate. All 51 images at 2K come to about **$6.80** (1K and 2K cost the same; 4K costs more).
3. `npm run images` generates them. Existing files are skipped; use `--force` to redo them or `--only=night` to filter.

Art direction: content-themed **modern minimalist flat illustration**. Bold geometric shapes, clean
edges and flat colour, with each image's palette taken from its time phase (dawn peach/lilac →
night indigo/teal), so it sits naturally inside the living-light background. Flat art is light:
about 10–20 KB per image.

Slots: category tiles **1:1** → `public/assets/focus/*.webp`, phase heroes **16:9** →
`public/assets/{phase}/hero.webp`, phase × activity cards **4:5** → `public/assets/{phase}/{slug}.webp`,
food guides **16:9** → `public/assets/food/{focus}-{enjoy|limit}.webp`, fertility heroes **16:9** →
`public/assets/fertility/{women|men}.webp`.
Until an image exists, its slot shows a phase-tinted gradient. When one exists, it's lazy-loaded
over a blurred LQIP. Text over art sits on frosted, theme-coloured panels (contrast-checked
against worst-case art colours) rather than dark scrims.

## Wellness database

`server/wellness-db.mjs` keeps sign-up contacts in SQLite (Node's built-in `node:sqlite`, no extra
dependency) at `data/wellness.db` (git-ignored, created with its folder on first save; override with
`WELLNESS_DB` in `.env.local`, inside the project). It stores **name + email only**, upserting on the
email (case-insensitive): new → insert, known → update, changed in Settings → the same row is renamed.

- `npm run dev` / `npm run preview` mount `PUT /api/wellness/contact`, so running locally saves contacts.
- For the hosted site, run `npm run wellness-api` somewhere reachable and build with
  `VITE_WELLNESS_API=https://that-host/api/wellness`. Without it, the hosted app simply skips the save.
- The app never shows an error for this step: it's optional by design.

## Project map

```
src/
  data/content.ts          ← ALL content (categories, phases, activities, meals, tips, messages, image prompts)
  data/images.generated.ts ← image sizes + LQIPs (written by scripts/build-lqip.mjs)
  lib/palette.ts           ← phase palettes (single source of colour; AA-checked)
  lib/time.ts              ← device clock, Intl formatting, phase maths
  lib/plan.ts              ← the "Right Now" engine
  lib/storage.ts           ← try/catch-wrapped localStorage + memory fallback
  lib/validation.ts        ← name / email rules
  lib/meals.ts             ← meal swap options (diet filter, focus ranking)
  lib/balance.ts           ← "Balance your day" suggestions
  lib/cycle.ts             ← fertile-window estimates
  lib/remote.ts            ← best-effort contact save to the wellness DB
  state/AppState.tsx       ← profile, log, clock, dial preview, today's plate
  components/              ← BreathingOrb, LivingBackground, DayDial, BottomSheet, Rings, CycleRing, …
  screens/                 ← Onboarding, Focus, Kitchen, Now (+ TodayPlate, MealSwapSheet), Guided, Tips (+ TipsSections), FertilityGuide, Insights, Extras, Settings
server/  wellness-db.mjs (SQLite contacts) · wellness-api.mjs (standalone server)
scripts/ extraction (+ lib/protein.mjs), images, QA, contrast, icons
docs/  ARCHITECTURE.md · IMAGE_PROMPTS.md · QA_CHECKLIST.md
reference/  original artifact + raw extracted data · old-app/ (earlier wellness site sources)
```

## Deploy

Live on Firebase Hosting: <https://vidura-life-app.web.app> (`npm run build`, then
`npx -y firebase-tools@latest deploy --only hosting`). `dist/` is a static site with a relative base,
so it also works from any other host or subfolder. Serve it over HTTPS for the PWA install
prompt and the service worker. Bump `VERSION` in `public/sw.js` on releases that replace assets.

## Browser support

Modern evergreen browsers: Safari / iOS 16.4+, Chrome / Edge 111+, Firefox 128+, recent Samsung Internet.
Progressive features (View Transitions, scroll-driven animations, Wake Lock, vibration) are feature-detected.

## A note on health content

Tips and activities are general wellness ideas, not medical advice. The original artifact's
medical claims were rewritten as plain suggestions, and traditional herbs carry a
check-with-your-doctor note. The fertility guide follows WHO, NICE, ASRM and NHS guidance, rates
supplements by evidence, and answers the boy-or-girl myth instead of offering a method (none works,
and sex selection is illegal in India under the PCPNDT Act). Protein figures are rough estimates.
The book summaries in Extras are written in our own words.
