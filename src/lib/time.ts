/**
 * Time source: the device clock and time zone only (no network).
 * Phases are computed from local minutes after midnight.
 */
import { PHASES, type Phase, type PhaseId } from "../data/content";

export const DAY_MINUTES = 1440;

let offsetMs = 0;

/**
 * QA / demo override: `?at=HH:MM` starts the app's clock at that local time
 * and lets it tick forward normally (e.g. `?at=04:59` to watch Night → Dawn).
 */
export function initClockOverride(search: string): void {
  try {
    const at = new URLSearchParams(search).get("at");
    const m = at?.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return;
    const h = Number(m[1]);
    const min = Number(m[2]);
    if (h > 23 || min > 59) return;
    const target = new Date();
    target.setHours(h, min, 0, 0);
    offsetMs = target.getTime() - Date.now();
  } catch {
    offsetMs = 0;
  }
}

export const clockNow = (): Date => new Date(Date.now() + offsetMs);

export const minutesOf = (d: Date): number => d.getHours() * 60 + d.getMinutes();

export const wrapMinutes = (m: number): number => ((Math.round(m) % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;

export function inPhase(p: Phase, minutes: number): boolean {
  const m = wrapMinutes(minutes);
  return p.start < p.end ? m >= p.start && m < p.end : m >= p.start || m < p.end;
}

export function phaseAt(minutes: number): Phase {
  return PHASES.find((p) => inPhase(p, minutes)) ?? PHASES[PHASES.length - 1];
}

export const phaseById = (id: PhaseId): Phase => PHASES.find((p) => p.id === id) ?? PHASES[0];

/** Minutes on a continuous scale for a phase (night's early hours become 1440+). */
export function phaseLocalMinutes(p: Phase, minutes: number): number {
  const m = wrapMinutes(minutes);
  return p.start > p.end && m < p.end ? m + DAY_MINUTES : m;
}

/** The `count` phases after `id`, cyclically. */
export function phasesAfter(id: PhaseId, count: number): Phase[] {
  const i = PHASES.findIndex((p) => p.id === id);
  return Array.from({ length: count }, (_, k) => PHASES[(i + 1 + k) % PHASES.length]);
}

/** Monday = 0 … Sunday = 6, matching the artifact's plan order. */
export const weekdayIndex = (d: Date): number => (d.getDay() + 6) % 7;

export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

// ── Intl formatting ───────────────────────────────────────────────────────────
const safeFormat = (opts: Intl.DateTimeFormatOptions) => {
  try {
    return new Intl.DateTimeFormat(undefined, opts);
  } catch {
    return new Intl.DateTimeFormat("en", opts);
  }
};

const clockFmt = safeFormat({ hour: "numeric", minute: "2-digit" });
const hourFmt = safeFormat({ hour: "numeric" });
const dateFmt = safeFormat({ weekday: "long", day: "numeric", month: "long" });
const weekdayShortFmt = safeFormat({ weekday: "narrow" });

const atMinutes = (m: number) => {
  const d = new Date(2000, 0, 1);
  d.setHours(0, wrapMinutes(m), 0, 0);
  return d;
};

export const formatClock = (d: Date): string => clockFmt.format(d);
export const formatMinutes = (m: number): string => clockFmt.format(atMinutes(m));
export const formatHour = (m: number): string => hourFmt.format(atMinutes(m));
export const formatDateLong = (d: Date): string => dateFmt.format(d);
export const formatWeekdayNarrow = (d: Date): string => weekdayShortFmt.format(d);

export function formatPhaseRange(p: Phase): string {
  const a = atMinutes(p.start);
  const b = atMinutes(p.end);
  // Same-day ranges read best via formatRange ("7–11 am"); the night range wraps midnight.
  if (p.start < p.end) {
    try {
      if (typeof hourFmt.formatRange === "function") return hourFmt.formatRange(a, b);
    } catch {
      /* fall through */
    }
  }
  return `${hourFmt.format(a)} – ${hourFmt.format(b)}`;
}

/** IANA zone of the device, e.g. "Asia/Kolkata". */
export function timeZoneLabel(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  } catch {
    return "";
  }
}

/** Short zone name for display, e.g. "IST" or "GMT+5:30". */
export function timeZoneShort(d: Date): string {
  try {
    const part = new Intl.DateTimeFormat(undefined, { timeZoneName: "short" }).formatToParts(d).find((p) => p.type === "timeZoneName");
    return part?.value ?? "";
  } catch {
    return "";
  }
}

export function greetingFor(minutes: number): string {
  const h = Math.floor(wrapMinutes(minutes) / 60);
  if (h < 5) return "Hello, night owl";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}
