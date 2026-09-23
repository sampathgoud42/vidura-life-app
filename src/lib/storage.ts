/**
 * Local-first persistence. Every read/write is wrapped in try/catch and
 * mirrored in memory, so the app keeps working (for the session) when
 * storage is blocked, full or throws on access (private modes, sandboxed
 * iframes, disabled site data).
 */
import {
  APPROACHES,
  AUDIENCES,
  CATEGORIES,
  DEFAULT_PREFS,
  DIETS,
  MEAL_SLOTS,
  PHASES,
  REGIONS,
  type ApproachId,
  type AudienceId,
  type CategoryId,
  type DietId,
  type Meal,
  type MealSlot,
  type PhaseId,
  type RegionId,
} from "../data/content";
import { NAME_MAX, cleanName, graphemeLength, validateEmail } from "./validation";

export const PROFILE_KEY = "vidura.profile";
export const LOG_KEY = "vidura.log";
/** Today's meal swaps and balance additions. Resets itself on a new day. */
export const DAY_KEY = "vidura.day";
/** Cycle details for the fertility guide: saved only if the person opts in. */
export const CYCLE_KEY = "vidura.cycle";
/** Which email was last saved to the wellness database (so it's saved once, not on every visit). */
export const CONTACT_KEY = "vidura.contact";

export const contactSynced = (): string | null => {
  const o = parse(readRaw(CONTACT_KEY)) as { email?: unknown } | null;
  return typeof o?.email === "string" ? o.email : null;
};
export const markContactSynced = (email: string): void => {
  writeRaw(CONTACT_KEY, JSON.stringify({ email: email.toLowerCase(), at: new Date().toISOString() }));
};

export interface Prefs {
  region: RegionId;
  diet: DietId;
  approach: ApproachId;
  audience: AudienceId;
}

export interface Profile {
  name: string;
  email: string;
  categories: CategoryId[];
  createdAt: string;
  updatedAt: string;
  version: 1;
  /** Optional "Make it yours" settings (region, diet, approach, audience). */
  prefs?: Prefs;
}

export interface LogEntry {
  id: string;
  activityId: string;
  categories: CategoryId[];
  phase: PhaseId;
  /** ISO timestamp. */
  at: string;
  /** Local calendar day, YYYY-MM-DD. */
  date: string;
  /** Local minutes after midnight. */
  minute: number;
}

const memory = new Map<string, string>();
let probed: boolean | null = null;

function local(): Storage | null {
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

export function storageAvailable(): boolean {
  if (probed !== null) return probed;
  try {
    const s = local();
    if (!s) throw new Error("no storage");
    const k = "__vidura_probe__";
    s.setItem(k, "1");
    s.removeItem(k);
    probed = true;
  } catch {
    probed = false;
  }
  return probed;
}

function readRaw(key: string): string | null {
  if (storageAvailable()) {
    try {
      const v = local()?.getItem(key) ?? null;
      if (v !== null) return v;
    } catch {
      /* use memory */
    }
  }
  return memory.get(key) ?? null;
}

function writeRaw(key: string, value: string): boolean {
  memory.set(key, value);
  if (!storageAvailable()) return false;
  try {
    local()?.setItem(key, value);
    return true;
  } catch {
    return false; // quota exceeded or revoked mid-session
  }
}

function removeRaw(key: string): void {
  memory.delete(key);
  try {
    local()?.removeItem(key);
  } catch {
    /* ignore */
  }
}

function parse(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const CATEGORY_IDS = new Set<string>(CATEGORIES.map((c) => c.id));
const PHASE_IDS = new Set<string>(PHASES.map((p) => p.id));
const oneOf = <T extends string>(list: readonly { id: T }[], v: unknown, fallback: T): T =>
  list.some((x) => x.id === v) ? (v as T) : fallback;

export function sanitizePrefs(x: unknown): Prefs {
  const o = (x && typeof x === "object" ? x : {}) as Record<string, unknown>;
  return {
    region: oneOf(REGIONS, o.region, DEFAULT_PREFS.region),
    diet: oneOf(DIETS, o.diet, DEFAULT_PREFS.diet),
    approach: oneOf(APPROACHES, o.approach, DEFAULT_PREFS.approach),
    audience: oneOf(AUDIENCES, o.audience, DEFAULT_PREFS.audience),
  };
}

/** Accepts anything, returns a valid Profile or null (corrupt / foreign data). */
export function sanitizeProfile(x: unknown): Profile | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const name = typeof o.name === "string" ? cleanName(o.name) : "";
  const email = typeof o.email === "string" ? o.email.trim() : "";
  if (!name || graphemeLength(name) > NAME_MAX || !validateEmail(email).ok) return null;
  const categories = Array.isArray(o.categories)
    ? [...new Set(o.categories.filter((c): c is CategoryId => typeof c === "string" && CATEGORY_IDS.has(c)))]
    : [];
  const iso = (v: unknown) => (typeof v === "string" && !Number.isNaN(Date.parse(v)) ? v : new Date().toISOString());
  return {
    name,
    email,
    categories,
    createdAt: iso(o.createdAt),
    updatedAt: iso(o.updatedAt),
    version: 1,
    ...(o.prefs ? { prefs: sanitizePrefs(o.prefs) } : {}),
  };
}

export const loadProfile = (): Profile | null => sanitizeProfile(parse(readRaw(PROFILE_KEY)));

export function saveProfile(p: Profile): boolean {
  return writeRaw(PROFILE_KEY, JSON.stringify(p));
}

const LOG_MAX_DAYS = 120;
const LOG_MAX_ENTRIES = 2000;

export function loadLog(): LogEntry[] {
  const raw = parse(readRaw(LOG_KEY)) as { entries?: unknown } | null;
  const list = Array.isArray(raw?.entries) ? raw.entries : [];
  return list.filter(
    (e): e is LogEntry =>
      !!e &&
      typeof e === "object" &&
      typeof (e as LogEntry).id === "string" &&
      typeof (e as LogEntry).activityId === "string" &&
      typeof (e as LogEntry).date === "string" &&
      typeof (e as LogEntry).minute === "number" &&
      PHASE_IDS.has((e as LogEntry).phase) &&
      Array.isArray((e as LogEntry).categories),
  );
}

export function saveLog(entries: LogEntry[]): boolean {
  const cutoff = Date.now() - LOG_MAX_DAYS * 864e5;
  const kept = entries.filter((e) => Date.parse(e.at) >= cutoff).slice(-LOG_MAX_ENTRIES);
  return writeRaw(LOG_KEY, JSON.stringify({ version: 1, entries: kept }));
}

// ── Today's plate: swaps, additions, lighter portions ─────────────────────────
export interface DayExtra {
  id: string;
  kind: "food" | "move";
  slot: MealSlot;
  title: string;
  detail: string;
  protein: number;
  /** For "move": the activity to bring forward at its time. */
  activityId?: string;
}

export interface DayState {
  version: 1;
  /** Local calendar day this state belongs to (YYYY-MM-DD). */
  date: string;
  swaps: Partial<Record<MealSlot, Meal>>;
  extras: DayExtra[];
  /** Slots to keep lighter today, with the hint shown on them. */
  lighter: Partial<Record<MealSlot, string>>;
  /** Suggestion ids the person dismissed today. */
  dismissed: string[];
}

export const emptyDay = (date: string): DayState => ({ version: 1, date, swaps: {}, extras: [], lighter: {}, dismissed: [] });

const SLOT_IDS = new Set<string>(MEAL_SLOTS.map((m) => m.id));
const str = (v: unknown, max = 240) => (typeof v === "string" ? v.slice(0, max) : "");
const grams = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(200, Math.round(v))) : 0);

function sanitizeMeal(x: unknown): Meal | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const title = str(o.title, 120).trim();
  return title ? { title, detail: str(o.detail).trim(), protein: grams(o.protein) } : null;
}

export function sanitizeDay(x: unknown, today: string): DayState {
  const o = (x && typeof x === "object" ? x : {}) as Record<string, unknown>;
  if (o.date !== today) return emptyDay(today);
  const swaps: DayState["swaps"] = {};
  if (o.swaps && typeof o.swaps === "object")
    for (const [k, v] of Object.entries(o.swaps)) {
      const m = SLOT_IDS.has(k) ? sanitizeMeal(v) : null;
      if (m) swaps[k as MealSlot] = m;
    }
  const extras = (Array.isArray(o.extras) ? o.extras : [])
    .map((e): DayExtra | null => {
      if (!e || typeof e !== "object") return null;
      const r = e as Record<string, unknown>;
      if (typeof r.id !== "string" || (r.kind !== "food" && r.kind !== "move") || !SLOT_IDS.has(r.slot as string) || !str(r.title)) return null;
      return {
        id: r.id.slice(0, 80),
        kind: r.kind,
        slot: r.slot as MealSlot,
        title: str(r.title, 120),
        detail: str(r.detail),
        protein: grams(r.protein),
        ...(typeof r.activityId === "string" ? { activityId: r.activityId.slice(0, 80) } : {}),
      };
    })
    .filter((e): e is DayExtra => !!e)
    .slice(0, 12);
  const lighter: DayState["lighter"] = {};
  if (o.lighter && typeof o.lighter === "object")
    for (const [k, v] of Object.entries(o.lighter)) if (SLOT_IDS.has(k) && str(v)) lighter[k as MealSlot] = str(v);
  const dismissed = (Array.isArray(o.dismissed) ? o.dismissed : []).filter((d): d is string => typeof d === "string").slice(0, 40);
  return { version: 1, date: today, swaps, extras, lighter, dismissed };
}

export const loadDay = (today: string): DayState => sanitizeDay(parse(readRaw(DAY_KEY)), today);
export const saveDay = (d: DayState): boolean => writeRaw(DAY_KEY, JSON.stringify(d));

// ── Cycle (opt-in) ─────────────────────────────────────────────────────────────
export interface SavedCycle {
  lastStart: string;
  cycleLength: number;
  periodLength: number;
}

export function loadCycle(): SavedCycle | null {
  const o = parse(readRaw(CYCLE_KEY)) as Record<string, unknown> | null;
  if (!o || typeof o.lastStart !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(o.lastStart)) return null;
  const n = (v: unknown, lo: number, hi: number, d: number) => (typeof v === "number" && v >= lo && v <= hi ? Math.round(v) : d);
  return { lastStart: o.lastStart, cycleLength: n(o.cycleLength, 21, 40, 28), periodLength: n(o.periodLength, 2, 8, 5) };
}
export const saveCycle = (c: SavedCycle): boolean => writeRaw(CYCLE_KEY, JSON.stringify({ version: 1, ...c }));
export const forgetCycle = (): void => removeRaw(CYCLE_KEY);

export function clearAll(): void {
  removeRaw(PROFILE_KEY);
  removeRaw(LOG_KEY);
  removeRaw(DAY_KEY);
  removeRaw(CYCLE_KEY);
  removeRaw(CONTACT_KEY);
}

export function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
