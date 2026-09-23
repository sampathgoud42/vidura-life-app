/**
 * Menstrual-cycle estimates for the fertility guide. Pure date maths on local
 * calendar days: ovulation ≈ 14 days before the next period, fertile window =
 * the 5 days before ovulation + ovulation day. Estimates only; the UI says so.
 */
import type { CyclePhaseId } from "../data/content";

export const CYCLE_MIN = 21;
export const CYCLE_MAX = 40;
export const PERIOD_MIN = 2;
export const PERIOD_MAX = 8;
const LUTEAL = 14;

export interface CycleInput {
  /** First day of the last period, local YYYY-MM-DD. */
  lastStart: string;
  cycleLength: number;
  periodLength: number;
}

export interface CycleEstimate {
  /** 1-based day of the current cycle. */
  day: number;
  cycleLength: number;
  periodLength: number;
  /** 1-based cycle days. */
  ovulationDay: number;
  fertileStart: number;
  fertileEnd: number;
  phase: CyclePhaseId;
  cycleStart: Date;
  ovulation: Date;
  fertileFrom: Date;
  fertileTo: Date;
  nextPeriod: Date;
  /** True when the entered date is so old that we projected forward whole cycles. */
  projected: boolean;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(v)));

/** Local-midnight Date from YYYY-MM-DD (never parsed as UTC). */
export function parseDay(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.getFullYear() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[3]) ? d : null;
}

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
/** Whole calendar days from a to b (DST-safe: counts dates, not milliseconds). */
const daysBetween = (a: Date, b: Date) =>
  Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 864e5);

export function phaseOnDay(day: number, e: Pick<CycleEstimate, "periodLength" | "ovulationDay" | "fertileStart" | "fertileEnd">): CyclePhaseId {
  if (day <= e.periodLength) return "period";
  if (day === e.ovulationDay) return "ovulation";
  if (day >= e.fertileStart && day <= e.fertileEnd) return "fertile";
  return day < e.fertileStart ? "follicular" : "luteal";
}

export function validateCycle(input: Partial<CycleInput>, today: Date): { ok: true; value: CycleInput } | { ok: false; reason: "date" | "future" | "old" } {
  const start = input.lastStart ? parseDay(input.lastStart) : null;
  if (!start) return { ok: false, reason: "date" };
  const gap = daysBetween(start, today);
  if (gap < 0) return { ok: false, reason: "future" };
  if (gap > 365) return { ok: false, reason: "old" };
  return {
    ok: true,
    value: {
      lastStart: dayKey(start),
      cycleLength: clamp(input.cycleLength ?? 28, CYCLE_MIN, CYCLE_MAX),
      periodLength: clamp(input.periodLength ?? 5, PERIOD_MIN, PERIOD_MAX),
    },
  };
}

export function estimateCycle(input: CycleInput, today: Date): CycleEstimate | null {
  const first = parseDay(input.lastStart);
  if (!first) return null;
  const cycleLength = clamp(input.cycleLength, CYCLE_MIN, CYCLE_MAX);
  const periodLength = clamp(input.periodLength, PERIOD_MIN, PERIOD_MAX);
  const since = daysBetween(first, today);
  if (since < 0) return null;
  // Past the expected cycle? Assume regular cycles and roll forward to the current one.
  const cycles = Math.floor(since / cycleLength);
  const cycleStart = addDays(first, cycles * cycleLength);
  const day = since - cycles * cycleLength + 1;
  const ovulationDay = Math.max(periodLength + 1, cycleLength - LUTEAL);
  const fertileStart = Math.max(1, ovulationDay - 5);
  const fertileEnd = ovulationDay;
  const est = {
    day,
    cycleLength,
    periodLength,
    ovulationDay,
    fertileStart,
    fertileEnd,
    cycleStart,
    ovulation: addDays(cycleStart, ovulationDay - 1),
    fertileFrom: addDays(cycleStart, fertileStart - 1),
    fertileTo: addDays(cycleStart, fertileEnd - 1),
    nextPeriod: addDays(cycleStart, cycleLength),
    projected: cycles > 0,
  };
  return { ...est, phase: phaseOnDay(day, est) };
}
