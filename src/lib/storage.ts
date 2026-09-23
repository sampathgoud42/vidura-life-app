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
  PHASES,
  REGIONS,
  type ApproachId,
  type AudienceId,
  type CategoryId,
  type DietId,
  type PhaseId,
  type RegionId,
} from "../data/content";
import { NAME_MAX, cleanName, graphemeLength, validateEmail } from "./validation";

export const PROFILE_KEY = "vidura.profile";
export const LOG_KEY = "vidura.log";

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

export function clearAll(): void {
  removeRaw(PROFILE_KEY);
  removeRaw(LOG_KEY);
}

export function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
