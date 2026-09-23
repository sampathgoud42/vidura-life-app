import { PHASES, type CategoryId, type PhaseId } from "../data/content";
import type { LogEntry } from "./storage";
import { addDays, localDateKey } from "./time";

export interface DayCell {
  date: Date;
  key: string;
  count: number;
  isToday: boolean;
}

/** Last seven local days, oldest first. */
export function lastSevenDays(log: LogEntry[], today: Date): DayCell[] {
  const counts = countByDate(log);
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6);
    const key = localDateKey(date);
    return { date, key, count: counts.get(key) ?? 0, isToday: i === 6 };
  });
}

function countByDate(log: LogEntry[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const e of log) m.set(e.date, (m.get(e.date) ?? 0) + 1);
  return m;
}

/**
 * Consecutive days with at least one completion. Today counts when it has
 * one; otherwise the streak is still "alive" from yesterday until midnight.
 */
export function currentStreak(log: LogEntry[], today: Date): number {
  const counts = countByDate(log);
  let day = counts.get(localDateKey(today)) ? today : addDays(today, -1);
  let n = 0;
  while (counts.get(localDateKey(day))) {
    n++;
    day = addDays(day, -1);
  }
  return n;
}

export function byCategory(log: LogEntry[]): Map<CategoryId, number> {
  const m = new Map<CategoryId, number>();
  for (const e of log) for (const c of e.categories) m.set(c, (m.get(c) ?? 0) + 1);
  return m;
}

export function byPhase(log: LogEntry[]): Record<PhaseId, number> {
  const out = Object.fromEntries(PHASES.map((p) => [p.id, 0])) as Record<PhaseId, number>;
  for (const e of log) out[e.phase]++;
  return out;
}

export function mostActivePhase(log: LogEntry[]): PhaseId | null {
  if (!log.length) return null;
  const counts = byPhase(log);
  return PHASES.reduce((best, p) => (counts[p.id] > counts[best] ? p.id : best), PHASES[0].id);
}

export function favouriteActivity(log: LogEntry[]): { id: string; count: number } | null {
  const m = new Map<string, number>();
  for (const e of log) m.set(e.activityId, (m.get(e.activityId) ?? 0) + 1);
  let best: { id: string; count: number } | null = null;
  for (const [id, count] of m) if (!best || count > best.count) best = { id, count };
  return best;
}

export function doneOn(log: LogEntry[], dateKey: string): Set<string> {
  return new Set(log.filter((e) => e.date === dateKey).map((e) => e.activityId));
}
