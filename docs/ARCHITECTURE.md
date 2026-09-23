# Vidura Life — architecture

React 19 + Vite 7 + Framer Motion 12 + Tailwind CSS 4. No backend, no runtime network calls.
All content lives in **`src/data/content.ts`** (one typed file). Colour lives in **`src/lib/palette.ts`**.

## Where the content came from

Everything was extracted from the original *Wellness app* artifact (`reference/wellness-app.original.jsx`):

| Artifact | Vidura Life |
| --- | --- |
| 6 health goals (`GOALS_MALE` / `GOALS_FEMALE`) | 6 focus categories (bento tiles) |
| Morning ritual, 7-day exercise plan, 6 daily meal slots, evening pranayama, "dinner by 7:30", "sleep before 10:30" | 25 time-phase activities across Dawn → Night |
| `BASE_MEALS` + `REGION_MEALS` (5 regions × 3 diets × 7 days), protein snacks, air-fry swaps | `MEAL_PLANS` (126 day plans, injected by `scripts/extract-artifact.mjs`) |
| Region / diet / approach (Modern · Ayurvedic · Both) / gender-specific notes | Optional "Make it yours" step + Settings |
| Tips + foods to eat / avoid per goal | 48 claim-free tip cards |
| 15 affirmations | 32 welcome messages (15 original + 17 new) |

Per the brief, medical and physiological claims were removed (e.g. "lowers LDL 10–15 %",
"equivalent to mild statins", the "testosterone secrets" section). Traditional herbs carry
a check-with-your-doctor note. The untouched original stays in `reference/` for traceability.

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
               │  └─ WelcomeReveal   orb bloom + radial particles · Display serif · random message · 3 s hold
               ├─ WelcomeReveal (returning)   "Welcome back, {name}"
               ├─ FocusScreen        bento grid of FocusTile (SmartImage 1:1) · CounterPill
               ├─ KitchenScreen      PrefsFields (ChoiceGroup ×4) · live "today's plate" preview
               └─ MainShell
                  ├─ topbar          BreathingOrb · StreakRing (7-day) · Settings button
                  ├─ tab-view        (View Transitions on tab change)
                  │  ├─ NowScreen
                  │  │  ├─ greeting        Display (Fraunces axes) · Intl date/time/zone · aria-live
                  │  │  ├─ NowCard         SmartImage 4:5 + scrim · Start · Done → LightBurst + log
                  │  │  ├─ "Also good right now"   swap into the Now card
                  │  │  ├─ Up next today   horizontal timeline (next 5 phases, scroll-snap)
                  │  │  └─ Your day        DayDial (24 h scrub → sky follows) · Today's plate
                  │  ├─ TipsScreen      filter Chips · CardStack (drag to dismiss / spring back) · footnote
                  │  └─ InsightsScreen  StreakRing · RadialStat per category · phase bars · favourite
                  ├─ TabBar            Now · Tips · Insights (shared layoutId pill)
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
```

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
pull today's dish from `dayPlan(prefs, weekday)`, which applies the artifact's own protein
rules (protein snack every day; air-fry dinners daily and lunches Tue/Thu/Sat for
non-vegetarians). `upNext` scores each upcoming phase at a representative anchor time.

### Living light

- `THEMES` in `lib/palette.ts` → CSS tokens for every phase, inlined into `index.html` by a
  tiny Vite plugin (no flash on first paint). An inline boot script picks the phase before React loads.
- `LivingBackground` tweens the five blob colours in **OKLab** with `requestAnimationFrame`:
  2 s on a real phase change, 260 ms while scrubbing (with ±30 min blending around
  boundaries, so the sky moves continuously under your finger). The orb subscribes to the same live palette.
- Theme tokens (ink, glass, accent) glide with a temporary `html.phase-shift` transition class.
- `scripts/check-contrast.mjs` verifies WCAG AA for every phase: text on the brightest
  blob, glass over every blob, accent and focus rings. All 61 checks pass.

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
