# QA checklist

Automated: `npm run build && npm run qa` drives the real app in a Chrome headless shell that lives
inside this project (`npm run qa:setup` installs it once, under `node_modules`). It checks everything
marked **[auto]**, saves screenshots to `qa/screens/`, and points the wellness API at a throwaway
`qa/wellness-qa.db`. The contrast audit runs with `npm run contrast`.

Handy for manual passes: append `?at=HH:MM` to start the app's clock at any time (e.g. `?at=04:59`).

## 1 · Name validation
- [ ] **[auto]** Empty submit → gentle hint "I'd love to know what to call you." + shake; no red.
- [ ] **[auto]** Whitespace only (`"   "`) → treated as empty.
- [ ] **[auto]** 31 characters → hint asks for ≤ 30; 30 is accepted.
- [ ] **[auto]** `"  Priya  "` → saved as `Priya` (trimmed; inner runs of spaces collapse).
- [ ] Emoji / accents count as one character each (`"Zoë 👩🏽‍⚕️"` = 5).
- [ ] Enter and the → button both advance; → key at the end of the text advances too.
- [ ] Hint is announced by screen readers (role="status").

## 2 · Email validation (live, debounced 300 ms)
- [ ] **[auto]** `priya@` → after the pause, a calm inline hint appears; no shake while typing.
- [ ] **[auto]** `priya@example`, `priya@example.c`, `pri ya@example.com`, `@example.com` → invalid.
- [ ] **[auto]** `priya@example.com` → underline gathers into a self-drawing checkmark.
- [ ] Submitting an invalid email shakes once and shows the hint immediately.
- [ ] Leading and trailing spaces are trimmed. Addresses over 254 characters are rejected.
- [ ] "Change name" goes back with the name pre-filled.
- [ ] **[auto]** As soon as the email is accepted, name + email are saved to the wellness DB (insert).
- [ ] **[auto]** Changing the email in Settings updates the same DB row (no duplicate).
- [ ] Same email again, any letter case → the existing row is updated, not duplicated.
- [ ] DB unreachable (hosted site without `VITE_WELLNESS_API`, offline, server down) → no error shown; onboarding continues.

## 3 · Storage
- [ ] **[auto]** Profile saved under `vidura.profile` as `{ name, email, categories, createdAt, updatedAt, version: 1 }` (+ optional `prefs`).
- [ ] **[auto]** Storage blocked (`localStorage` throws) → the whole flow still works, and Settings explains that changes last until the tab closes.
- [ ] Corrupt JSON in `vidura.profile` → treated as a new user; no crash.
- [ ] Private window / quota full → completions still log for the session.
- [ ] Returning user → "Welcome back, {name}" → Now (or Focus if no categories yet).
- [ ] **[auto]** Clear my data → two-step confirm → back to onboarding; every `vidura.*` key removed (profile, log, day, cycle, contact).
- [ ] Two tabs open: a change in one shows up in the other.

## 4 · Time phases & boundaries (device clock, `Intl`)
- [ ] **[auto]** 04:59 → 05:00 flips Night → Dawn on the minute tick.
- [ ] **[auto]** 06:59 → 07:00 Dawn → Morning · 19:59 → 20:00 Evening → Night.
- [ ] **[auto]** 23:59 → 00:00 stays Night; the date and the day's meal plan roll to tomorrow.
- [ ] **[auto]** Tab hidden across a boundary → phase recomputes on `visibilitychange`.
- [ ] **[auto]** Each phase (05:40, 08:00, 12:45, 15:30, 18:40, 22:15) shows the right palette and Now card.
- [ ] Phase change crossfades over ~2 s. Never a hard switch.
- [ ] Changing the OS time zone while open updates the clock at the next tick.
- [ ] Timeline marks phases after midnight as "Tomorrow".

## 5 · Right Now, dial, completion
- [ ] **[auto]** Done logs to `vidura.log`, fires the light burst, shows an Undo toast, advances the card.
- [ ] **[auto]** Start opens guided mode (timer + orb + steps). Esc closes it and focus returns.
- [ ] Pause/Resume keeps the timer accurate after the phone sleeps. The screen stays awake (Wake Lock).
- [ ] **[auto]** Dragging the dial to ~23:40 turns the whole UI to Night. "Back to now" restores it.
- [ ] **[auto]** Dial is a keyboard slider (arrows ±15 min, PgUp/PgDn ±1 h, Home/End, Esc).
- [ ] All activities in a phase done → "You're all set for now" card.
- [ ] Streak ring: consecutive days, today counts once something is done.

## 5b · Protein, meal swaps & balance
- [ ] **[auto]** Today's plate shows ≈ protein per meal and a day total against the ~50 g guide; the lunchtime Now card shows it too.
- [ ] **[auto]** Change → alternatives from your kitchen, other kitchens and protein picks; a vegetarian never sees meat, fish or eggs.
- [ ] **[auto]** Picking one replaces the meal (Changed badge), saves `vidura.day`, and Undo / Back to the plan restores it.
- [ ] **[auto]** A light day gets Balance your day suggestions, led by a protein add-on for the diet; Add puts it on the plate; dismiss hides it for today.
- [ ] A heavier swap suggests a walk afterwards and a lighter next meal; an added walk becomes the Now card in its window.
- [ ] Vegan: only vegan options and add-ons (soy milk, tofu, chana…). Non-vegetarian: air-fry protein picks appear for lunch and dinner.
- [ ] Past midnight the plate resets to the plan (yesterday's swaps are ignored).

## 6 · Tips & insights
- [ ] **[auto]** Drag past the threshold dismisses the card. A short drag springs back.
- [ ] ←/→ keys and buttons move through the deck. Filter chips follow your categories.
- [ ] **[auto]** "Not medical advice" footnote present.
- [ ] Insights: streak, radial chart per category, most active time, all computed locally.
- [ ] **[auto]** Tricks follow the approach and the women's / men's notes (men: ashwagandha in, shatavari out).
- [ ] **[auto]** Routines: daily ritual + one card per focus (morning add-ons, the day's rhythm).
- [ ] **[auto]** Foods: enjoy / go easy on per focus, with art and ≈ protein per serving; diet-filtered.

## 6b · Fertility guide
- [ ] **[auto]** Opens from Tips (and Now) with the Fertility focus; defaults to men / women from the notes setting.
- [ ] **[auto]** Covers timing, pros & cons, sperm / egg health, foods, myths, supplements with verdicts, when to see a doctor, sources.
- [ ] **[auto]** No boy/girl technique: the myth is answered, PCPNDT noted.
- [ ] **[auto]** Cycle tool: a date 9 days ago shows the ring, fertile window, ovulation and next period.
- [ ] **[auto]** Dates are saved only with Remember on, and removed when it's switched off.
- [ ] Future dates and dates over a year old get a gentle hint; cycle length 21–40, period 2–8.

## 6c · Extras
- [ ] **[auto]** Every user has the Extras tab with 9 book summaries; theme chips filter them.
- [ ] **[auto]** The Japanese ideas entry shows Ikigai, Kaizen, Hansei and Ichigo Ichie; each book has key ideas and something to try.
- [ ] **[auto]** The 5 Love Languages carries its evidence note.

## 7 · Reduced motion
- [ ] **[auto]** Question text appears instantly (no typing).
- [ ] No orb breathing or parallax, no drifting blobs, no particles or shake, no scroll reveals.
- [ ] Screens still fade; the sky still crossfades (colour, not movement).

## 8 · 380 px layout & responsiveness
- [ ] **[auto]** No horizontal scroll at 380 px on Focus, Now and every phase (measured against the viewport, not the emulated layout width).
- [ ] **[auto]** 1280 px desktop: two-column Now, no horizontal scroll; the fertility guide fits too.
- [ ] **[auto]** 380 px: Today's plate, the light day, the fertility guide and Extras fit.
- [ ] Safe areas respected on notched phones (top bar, tab bar, sheet).
- [ ] Tap targets ≥ 44 px. Text scales with browser zoom up to 200 %.

## 9 · Accessibility
- [ ] `npm run contrast` → every phase palette passes WCAG AA (worst case over the brightest blob).
- [ ] Full keyboard path: onboarding → focus tiles (aria-pressed) → radio groups (arrow keys) → tabs → sheet (focus trap, Esc).
- [ ] Visible focus ring on everything, in light and dark phases, and on photos.
- [ ] Greeting and validation messages are aria-live. Toasts are announced.
- [ ] Screen reader hears full sentences, never letter-by-letter typing.

## 10 · Browsers & PWA
- [ ] Safari iOS 16.4+, Chrome/Edge 111+, Firefox 128+, Samsung Internet (recent).
- [ ] No `backdrop-filter` → glass falls back to solid tokens. No View Transitions → instant tab switch.
- [ ] Install to home screen (Android/desktop Chrome, iOS Share → Add to Home Screen). Launches standalone.
- [ ] Offline after first load (service worker), with images cached as viewed.
- [ ] **[auto]** No console errors.
