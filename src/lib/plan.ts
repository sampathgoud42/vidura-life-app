/**
 * The "Right Now" engine: which activity fits this moment, for this person.
 *
 * Score = daily foundation (+2) + matching focus categories (+3 each, max 2)
 *       + time-window fit (+6 inside, up to +3 just before, −1.5 once passed)
 *       + meal-time boost (+2.5 inside a meal window) − 100 if done today.
 * A tiny per-day jitter breaks ties, so equal options rotate across the week.
 */
import {
  ACTIVITIES,
  AIR_FRY_DINNERS,
  AIR_FRY_LUNCHES,
  EXERCISE_PLAN,
  MEAL_PLANS,
  PROTEIN_SNACKS,
  type Activity,
  type ActivityKind,
  type CategoryId,
  type DayPlan,
  type Meal,
  type Phase,
  type PhaseId,
} from "../data/content";
import type { Prefs } from "./storage";
import { DAY_MINUTES, phaseAt, phaseById, phaseLocalMinutes, phasesAfter, weekdayIndex } from "./time";

export interface PlanContext {
  categories: CategoryId[];
  prefs: Prefs;
  /** The calendar day being planned. */
  date: Date;
  /** Local minutes after midnight being looked at (now, or the dial preview). */
  minutes: number;
  doneToday: ReadonlySet<string>;
}

export interface Resolved {
  activity: Activity;
  phase: PhaseId;
  eyebrow: string;
  headline: string;
  detail: string;
  /** Extra line under the detail, e.g. today's early drink. */
  extra?: string;
  minutes: number;
  steps: string[];
  focusNote?: { category: CategoryId; text: string };
  notes: string[];
  matched: CategoryId[];
  done: boolean;
}

/** One representative moment per phase, used for timeline headlines. */
export const PHASE_ANCHORS: Record<PhaseId, number> = {
  dawn: 5 * 60 + 45,
  morning: 8 * 60,
  midday: 13 * 60,
  afternoon: 16 * 60,
  evening: 18 * 60 + 45,
  night: 21 * 60 + 30,
};

/** Today's meals, with the artifact's protein enhancement applied. */
export function dayPlan(prefs: Prefs, weekday: number): DayPlan {
  const byDiet = MEAL_PLANS[prefs.region] ?? MEAL_PLANS["pan-indian"];
  const base = byDiet[prefs.diet][weekday];
  const out: DayPlan = { ...base, snack: PROTEIN_SNACKS[weekday] };
  if (prefs.diet === "non-vegetarian") {
    out.dinner = AIR_FRY_DINNERS[weekday];
    if (weekday % 2 === 1) out.lunch = AIR_FRY_LUNCHES[weekday];
  }
  return out;
}

export function eligible(a: Activity, prefs: Prefs): boolean {
  return !a.approach || a.approach.includes(prefs.approach);
}

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

function score(a: Activity, ctx: PlanContext, phase: Phase, useWindow: boolean): number {
  const overlap = a.categories.filter((c) => ctx.categories.includes(c)).length;
  let s = (a.categories.length === 0 ? 2 : 0) + Math.min(overlap, 2) * 3;
  if (useWindow) {
    const m = phaseLocalMinutes(phase, ctx.minutes);
    const [start, end] = a.window;
    if (m >= start && m < end) s += 6 + (a.kind === "meal" ? 2.5 : 0);
    else if (m < start) s += Math.max(0, 3 - (start - m) / 40);
    else s -= 1.5;
  } else if (a.kind === "meal") {
    s += 1;
  }
  s += ((hash(a.id) + weekdayIndex(ctx.date) * 7) % 10) / 100;
  if (ctx.doneToday.has(a.id)) s -= 100;
  return s;
}

/** Activities for the phase at `ctx.minutes`, best first. */
export function rankNow(ctx: PlanContext): Activity[] {
  const phase = phaseAt(ctx.minutes);
  return ACTIVITIES.filter((a) => a.phase === phase.id && eligible(a, ctx.prefs))
    .map((a) => ({ a, s: score(a, ctx, phase, true) }))
    .sort((x, y) => y.s - x.s)
    .map((x) => x.a);
}

const KIND_LABEL: Record<ActivityKind, string> = {
  ritual: "Ritual",
  move: "Movement",
  breathe: "Breath",
  meal: "Meal",
  rest: "Rest",
  light: "Light",
};

export function resolve(a: Activity, ctx: PlanContext): Resolved {
  const weekday = weekdayIndex(ctx.date);
  const plan = dayPlan(ctx.prefs, weekday);
  const meal: Meal | undefined = a.meal ? plan[a.meal] : undefined;
  const exercise = a.exercise ? EXERCISE_PLAN[weekday] : undefined;
  const phaseLabel = phaseById(a.phase).label;

  let eyebrow = `${phaseLabel} · ${KIND_LABEL[a.kind]}`;
  let headline = a.title;
  let detail = a.summary;
  let extra: string | undefined;
  let minutes = a.minutes;

  if (a.kind === "meal" && meal) {
    eyebrow = `${a.title} · ${plan.theme} ${plan.emoji}`.trim();
    headline = meal.title;
    detail = meal.detail;
  } else if (meal) {
    extra = `Today's early drink: ${meal.title} (${meal.detail.toLowerCase()})`;
  }
  if (exercise) {
    eyebrow = `${phaseLabel} · ${a.title}`;
    headline = exercise.title;
    detail = exercise.detail;
    minutes = exercise.minutes;
  }

  const fill = (s: string) =>
    s.replace("{meal}", meal ? meal.title : "your usual").replace("{exercise}", exercise ? exercise.detail : "");

  const matched = a.categories.filter((c) => ctx.categories.includes(c));
  const focusCat = ctx.categories.find((c) => a.focus?.[c]);
  const notes: string[] = [];
  const dietNote = a.dietNote?.[ctx.prefs.diet];
  if (dietNote) notes.push(dietNote);
  if (ctx.prefs.audience !== "everyone") {
    const an = a.audienceNote?.[ctx.prefs.audience];
    if (an) notes.push(an);
  }
  if (a.note) notes.push(a.note);

  return {
    activity: a,
    phase: a.phase,
    eyebrow,
    headline,
    detail,
    extra,
    minutes,
    steps: a.steps.map(fill).filter(Boolean),
    focusNote: focusCat ? { category: focusCat, text: a.focus![focusCat]! } : undefined,
    notes,
    matched,
    done: ctx.doneToday.has(a.id),
  };
}

export interface NowPlan {
  phase: Phase;
  now: Resolved;
  also: Resolved[];
  allDone: boolean;
}

export function planNow(ctx: PlanContext, pinnedId?: string | null): NowPlan {
  const phase = phaseAt(ctx.minutes);
  const ranked = rankNow(ctx);
  const pinned = pinnedId ? ranked.find((a) => a.id === pinnedId) : undefined;
  const first = pinned ?? ranked[0];
  const rest = ranked.filter((a) => a !== first);
  return {
    phase,
    now: resolve(first, ctx),
    also: rest.slice(0, 3).map((a) => resolve(a, ctx)),
    allDone: ranked.every((a) => ctx.doneToday.has(a.id)),
  };
}

export interface TimelineItem {
  phase: Phase;
  headline: Resolved;
  count: number;
  startsIn: number;
  tomorrow: boolean;
}

/** The next five phases, each with its headline activity. */
export function upNext(ctx: PlanContext): TimelineItem[] {
  const current = phaseAt(ctx.minutes);
  const nowM = ((ctx.minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  return phasesAfter(current.id, 5).map((phase) => {
    const startsIn = (phase.start - nowM + DAY_MINUTES) % DAY_MINUTES;
    const tomorrow = nowM + startsIn >= DAY_MINUTES;
    const date = tomorrow ? new Date(ctx.date.getTime() + 864e5) : ctx.date;
    const pctx: PlanContext = { ...ctx, date, minutes: PHASE_ANCHORS[phase.id], doneToday: tomorrow ? new Set() : ctx.doneToday };
    const list = ACTIVITIES.filter((a) => a.phase === phase.id && eligible(a, ctx.prefs));
    const best = [...list].sort((x, y) => score(y, pctx, phase, true) - score(x, pctx, phase, true))[0];
    return { phase, headline: resolve(best, pctx), count: list.length, startsIn, tomorrow };
  });
}

/** What's planned at any minute of the day (for the dial preview). */
export function planAt(ctx: PlanContext, minutes: number): Resolved {
  const c = { ...ctx, minutes };
  const ranked = rankNow({ ...c, doneToday: new Set() });
  return resolve(ranked[0], c);
}

export function activityById(id: string): Activity | undefined {
  return ACTIVITIES.find((a) => a.id === id);
}
