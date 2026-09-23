# Vidura Life — architecture

React 19 + Vite 7 + Framer Motion 12 + Tailwind CSS 4. Local-first: everything runs in the browser.
The single exception is a best-effort save of the name and email to the SQLite wellness database
(see *Wellness database*). All content lives in **`src/data/content.ts`** (one typed file). Colour
lives in **`src/lib/palette.ts`**. Nothing in the project refers to files outside its own folder.

## Where the content came from

Everything was extracted from the original *Wellness app* artifact (`reference/wellness-app.original.jsx`):

| Artifact | Vidura Life |
| --- | --- |
| 6 health goals (`GOALS_MALE` / `GOALS_FEMALE`) | 6 focus categories (bento tiles) |
| Morning ritual, 7-day exercise plan, 6 daily meal slots, evening pranayama, "dinner by 7:30", "sleep before 10:30" | 25 time-phase activities across Dawn → Night |
| `BASE_MEALS` + `REGION_MEALS` (5 regions × 3 diets × 7 days), protein snacks, air-fry swaps | `MEAL_PLANS` (126 day plans, injected by `scripts/extract-artifact.mjs`) |
| Region / diet / approach (Modern · Ayurvedic · Both) / gender-specific notes | Optional "Make it yours" step + Settings |
| Tips + foods to eat / avoid per goal | 63 claim-free tip cards (incl. women's / men's notes) |
| The earlier Vidura World wellness site (`reference/old-app/`): remedies by approach × gender, morning additions, foods | `TRICKS` (~120), `DAILY_RITUAL`, `MORNING_ADDS`, `FOOD_GUIDES` (enjoy / go easy on, with illustrations) |
| (new) | Fertility guide, protein per meal, meal swaps + balance suggestions, Extras (book summaries) |
| 15 affirmations | 32 welcome messages (15 original + 17 new) |

Per the brief, medical and physiological claims were removed (e.g. "lowers LDL 10–15 %",
"equivalent to mild statins", the "testosterone secrets" section, which now appears as a myth
in the fertility guide). Items with safety concerns (shilajit, guggul, kapikacchu, daily neem,
giloy) were left out. Traditional herbs carry a check-with-your-doctor note. The untouched
originals stay in `reference/` for traceability.

## Component tree

```
main.tsx
└─ AppProvider                     state: profile, log, clock, preview time, storage status
   └─ ToastProvider                aria-live toasts (with Undo)
      └─ LightBurstProvider        canvas: "confetti of light" + orb-bloom particles
         └─ App                    stage machine, MotionConfig(reducedMotion="user")
            ├─ LivingBackground    phase mesh gradient (5 blobs) + stars + grain, 2 s crossfade
            └─ LayoutGroup / AnimatePresence(popLayout)   ← shared layoutId "orb" across stages
               ├─ Onboarding
               │  ├─ NameStep        TypeIn question · borderless input · InputLine · MagneticButton
               │  ├─ EmailStep       name morphs up (layoutId "name-text") · spring rise · live validation
               │  └─ WelcomeReveal   orb bloom + radial particles · Display heading · random message · 3 s hold
               ├─ WelcomeReveal (returning)   "Welcome back, {name}"
               ├─ FocusScreen        floating, loosely scattered FocusTiles sized to fit the viewport · CounterPill
               ├─ KitchenScreen      PrefsFields (ChoiceGroup ×4) · live "today's plate" preview
               └─ MainShell
                  ├─ topbar          BreathingOrb · StreakRing (7-day) · Settings button
                  ├─ tab-view        (View Transitions on tab change)
                  │  ├─ NowScreen
                  │  │  ├─ greeting        Display (Plus Jakarta Sans, weight-axis entrance) · Intl date/time/zone · aria-live
                  │  │  ├─ NowCard         flat illustration fading into a frosted body · Start · Done → LightBurst + log
                  │  │  ├─ "Also good right now"   swap into the Now card
                  │  │  ├─ Up next today   horizontal timeline (next 5 phases, scroll-snap)
                  │  │  ├─ Your day        DayDial (24 h scrub → sky follows)
                  │  │  ├─ TodayPlate      protein per meal + ProteinMeter · Change → MealSwapSheet · Balance your day
                  │  │  └─ guide link      (Fertility focus) → FertilityGuide
                  │  ├─ TipsScreen      Segmented tabs: Tips (CardStack) · Tricks · Routines · Foods (FoodGuideCard) · focus Chips
                  │  ├─ InsightsScreen  StreakRing · RadialStat per category · phase bars · favourite
                  │  ├─ ExtrasScreen    theme Chips · book cards → BookSheet (summary, parts, key ideas, try this)
                  │  └─ FertilityGuide  women / men · CycleTool + CycleRing · timing · pros & cons · egg / sperm health · foods · myths · supplements · doctor · sources
                  ├─ TabBar            Now · Tips · Insights · Extras (shared layoutId pill)
                  ├─ Preview pill      "Previewing 7:30 pm · Back to now"
                  ├─ SettingsSheet     BottomSheet: name, email, focus, kitchen, Clear my data
                  └─ GuidedMode        portal: orb + circular progress timer · steps · pause · wake lock
```

## State model

```ts
// localStorage "vidura.profile"
interface Profile {
  name: string;               // trimmed, 1–30 graphemes
  email: string;              // /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  categories: CategoryId[];   // ≥ 1 once past onboarding
  createdAt: string;          // ISO
  updatedAt: string;          // ISO
  version: 1;
  prefs?: { region: RegionId; diet: DietId; approach: ApproachId; audience: AudienceId };
}

// localStorage "vidura.log"  → { version: 1, entries: LogEntry[] }  (last 120 days, ≤ 2000)
interface LogEntry {
  id: string; activityId: string; categories: CategoryId[];
  phase: PhaseId; at: string /* ISO */; date: string /* local YYYY-MM-DD */; minute: number;
}

// localStorage "vidura.day": today's plate; a stored state from another day is ignored
interface DayState {
  version: 1; date: string;                       // local YYYY-MM-DD
  swaps: Partial<Record<MealSlot, Meal>>;          // Meal = { title, detail, protein }
  extras: DayExtra[];                              // added for balance: a food (with protein) or a walk
  lighter: Partial<Record<MealSlot, string>>;      // "Half the rice, with extra sabzi or salad"
  dismissed: string[];                             // suggestion ids, today only
}

// localStorage "vidura.cycle": only while "Remember these dates" is on
interface SavedCycle { lastStart: string; cycleLength: number /* 21–40 */; periodLength: number /* 2–8 */ }

// localStorage "vidura.contact": which email was last saved to the wellness database
```

Clear my data removes every `vidura.*` key.

| State | Owner | Notes |
| --- | --- | --- |
| `profile`, `log` | `AppProvider` | Every read/write in `lib/storage.ts` is try/catch-wrapped and mirrored in memory. `storageOk=false` → app keeps working for the session and Settings says so. Corrupt / foreign JSON is sanitised or ignored. Other tabs sync via the `storage` event. |
| `now` | `AppProvider` (`useClock`) | Device clock only. Ticks on each minute boundary and immediately on `visibilitychange` / `focus` / `pageshow`. `?at=HH:MM` starts the clock at a given time for QA and demos. |
| `phase` / `displayPhase` | derived | `phaseAt(minutes)`; `displayPhase` follows the dial preview. It sets `data-phase` + `data-scheme` on `<html>` and the `theme-color` meta. |
| `previewMinutes` | `AppProvider` | `null` = live. Set by `DayDial`; cleared by "Back to now", Esc or a tab change. |
| stage | `App` | `onboarding → focus → kitchen → main`; returning users get `welcomeBack → main` (or `focus` if no categories). |
| tab, sheet, guided | `MainShell` | Local UI state. |

### The "Right Now" engine (`lib/plan.ts`)

For the phase at the current minute, each eligible activity (approach filter) is scored:

```
+2   daily foundation (no category = for everyone)
+3   per matching focus category (max 2)
+6   now inside its preferred window   (+2.5 more for meals)
+≤3  window starts soon · −1.5 window already passed
−100 already done today   · tiny per-weekday jitter rotates ties
```

The best becomes the Now card, the next three are "Also good right now". Meal activities
pull today's dish from `todayPlan(prefs, weekday, swaps)`: `dayPlan` applies the artifact's own
protein rules (protein snack every day; air-fry dinners daily and lunches Tue/Thu/Sat for
non-vegetarians), then today's swaps are laid on top. An activity added by a balance suggestion
scores +8 in its window. `upNext` scores each upcoming phase at a representative anchor time
(tomorrow's phases ignore today's swaps).

### Protein estimates (`scripts/lib/protein.mjs`)

Run at extraction time, so every `Meal` carries `protein` (grams). Each description is split into
components ("2 bajra rotis", "150g chicken", "½ cup brown rice") and matched against a table of
typical home servings (IFCT 2017 / USDA ballpark), scaled by counts, weights, cups or tablespoons.
One-dish phrases merge ("moong dal + brown rice khichdi"), negations drop out ("no curd"), meat
and fish weights read as raw, and thali meat portions shrink. The UI shows "≈ N g".

### Today's plate: swaps and balance (`lib/meals.ts`, `lib/balance.ts`)

- **Swaps**: alternatives for one slot come from your kitchen's other days, other regional
  kitchens and the protein picks. Diet is a hard filter (vegetarian = vegetarian + vegan plans;
  vegan = vegan only). Options are ranked with focus weights over tags read from the text
  (millet, legume, greens, fermented, fish, fried, sweet …), plus protein. Near-duplicates merge.
- **Balance**: up to three suggestions. Add a protein food when the plate is under the ~0.8 g/kg
  guide (46 / 50 / 54 g) or a swap took 6 g or more out. After a heavier swap: a walk and a lighter
  next meal. Late in the day with no movement logged: an evening stroll. Plenty of protein: drop
  an added portion. All optional, undoable and dismissible for the day.

### Fertility guide (`screens/FertilityGuide.tsx`, `lib/cycle.ts`)

Calendar-day maths: ovulation ≈ 14 days before the next period, fertile window = the 5 days
before plus ovulation day, cycles 21–40 days, projected forward over whole cycles. Content follows
WHO, NICE CG156, ASRM and NHS guidance. Supplements carry evidence verdicts (FAZST and MOXI for
men). There's no method to choose a baby's sex, so the guide answers that myth and notes the PCPNDT Act.

### Wellness database (`server/wellness-db.mjs`)

SQLite through Node's built-in `node:sqlite` (no dependency). `data/wellness.db` (git-ignored) is
created on first save. `PUT /api/wellness/contact {name, email, previousEmail?}` upserts on the
email (case-insensitive): a new email is inserted, a known one is updated, and a changed email
renames the existing row. Only the name and email are sent. The Vite dev and preview servers mount
the endpoint; `npm run wellness-api` runs it standalone (port 8791, CORS allow-list, rate limit).
The client (`lib/remote.ts`) calls it as soon as the email is entered and after edits in Settings,
with a timeout, and **silently gives up** on any failure. The hosted build only calls it when built
with `VITE_WELLNESS_API`.

### Living light

- `THEMES` in `lib/palette.ts` → CSS tokens for every phase, inlined into `index.html` by a
  tiny Vite plugin (no flash on first paint). An inline boot script picks the phase before React loads.
- `LivingBackground` tweens the five blob colours in **OKLab** with `requestAnimationFrame`:
  2 s on a real phase change, 260 ms while scrubbing (with ±30 min blending around
  boundaries, so the sky moves continuously under your finger). The orb subscribes to the same live palette.
- Theme tokens (ink, glass, accent) glide with a temporary `html.phase-shift` transition class.
- `scripts/check-contrast.mjs` verifies WCAG AA for every phase: text on the brightest
  blob, glass over every blob, accent and focus rings, plus text on the frosted art panels
  over extreme illustration colours (black, white, saturated saffron/teal/navy/yellow/rose/plum).

### Illustrations

Content-themed flat vector art from Nano Banana Pro (style block in `content.ts`). Each image's
palette comes from its phase, and a median pass plus lean WebP keeps images around 10–20 KB. Text never sits
directly on art: tiles use a frosted fade in `--panel`, the Now card's art melts into a frosted
body, timeline times sit in frosted pills, and the Insights hero frames a frosted panel.

### Motion & interaction

Framer Motion springs everywhere. Shared-layout morphs for the orb and the name. View Transitions
API for tab switches (feature-detected). CSS `animation-timeline: view()` reveals, behind
`@supports`. Magnetic buttons and cursor-glow cards are enabled for fine pointers only.
`navigator.vibrate` gives haptics on touch devices. Everything honours `prefers-reduced-motion`:
Framer's `reducedMotion="user"`, CSS fallbacks, instant type-in, and no particles. The sky
still crossfades, because a colour change isn't movement.

### Why no Three.js

The orb is layered CSS gradients (core, conic "aurora", caustics, specular, rim), so it costs nothing to load,
works in every browser and is easy to theme per phase. Three.js was optional in the brief, and
leaving it out saves ~150 kB.

### PWA

`public/manifest.webmanifest` (standalone, maskable icons), `public/sw.js` (network-first
HTML, stale-while-revalidate assets, offline shell; registered in production builds only),
safe-area insets, `theme-color` follows the phase. Fonts are self-hosted via Fontsource,
with nothing loaded from a CDN.
