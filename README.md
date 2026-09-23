# Vidura Life

A calm, time-aware wellness companion. The whole UI follows the sun: a living mesh-gradient sky
shifts from dawn peach to night indigo, and the **Right Now** card suggests what fits this moment
for your focus areas. It's built from the content of the original *Wellness app* artifact
(health goals, daily rituals, weekly movement, 126 regional Indian day plans, tips, affirmations).

Local-first: no backend, no accounts, no runtime network calls. **Your details stay on this device only.**

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
| `npm run qa` | Drives the built app in your installed Edge/Chrome: onboarding and validation edge cases, storage blocked, every phase, 4:59 → 5:00 and midnight boundaries, reduced motion, 380 px and desktop layouts. Screenshots go to `qa/screens/`. |
| `npm run contrast` | WCAG AA audit of every phase palette (worst-case over the mesh and glass). |
| `npm run images:prompts` | Writes `docs/IMAGE_PROMPTS.md` (all 37 Nano Banana Pro prompts). |
| `npm run images:dry` | Lists missing images and estimates the cost. |
| `npm run images` | Generates missing images with Nano Banana Pro, writes WebP + `-sm` variants, rebuilds blurred placeholders. |
| `npm run extract` | Re-extracts the meal plans from `reference/wellness-app.original.jsx` into `src/data/content.ts`. |
| `npm run icons` | Renders the PWA icons from the orb mark. |

## Images (Nano Banana Pro)

1. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` (Google AI Studio key with Gemini 3 Pro Image access).
2. `npm run images:dry` shows the cost estimate. 37 images at 2K is about **$5** (1K and 2K cost the same; 4K costs more).
3. `npm run images` generates them. Existing files are skipped; use `--force` to redo them or `--only=night` to filter.

Slots: category tiles **1:1** → `public/assets/focus/*.webp`, phase heroes **16:9** →
`public/assets/{phase}/hero.webp`, phase × activity cards **4:5** → `public/assets/{phase}/{slug}.webp`.
Until an image exists, its slot shows a phase-tinted gradient. When one exists, it's lazy-loaded
over a blurred LQIP with a dark scrim, so text stays readable.

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
  state/AppState.tsx       ← profile, log, clock, dial preview
  components/              ← BreathingOrb, LivingBackground, DayDial, BottomSheet, Rings, …
  screens/                 ← Onboarding, Focus, Kitchen, Now, Guided, Tips, Insights, Settings
docs/  ARCHITECTURE.md · IMAGE_PROMPTS.md · QA_CHECKLIST.md
reference/  original artifact + raw extracted data
```

## Deploy

`dist/` is a static site with a relative base, so it works from any host or subfolder (Netlify,
Vercel, GitHub Pages, S3, Firebase Hosting). Serve it over HTTPS for the PWA install
prompt and the service worker.

## Browser support

Modern evergreen browsers: Safari / iOS 16.4+, Chrome / Edge 111+, Firefox 128+, recent Samsung Internet.
Progressive features (View Transitions, scroll-driven animations, Wake Lock, vibration) are feature-detected.

## A note on health content

Tips and activities are general wellness ideas, not medical advice. The original artifact's
medical claims were rewritten as plain suggestions, and traditional herbs carry a
check-with-your-doctor note.
