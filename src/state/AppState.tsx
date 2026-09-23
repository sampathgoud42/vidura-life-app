import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { DEFAULT_PREFS, type CategoryId, type Phase, type PhaseId } from "../data/content";
import { doneOn } from "../lib/insights";
import { THEMES } from "../lib/palette";
import {
  LOG_KEY,
  PROFILE_KEY,
  clearAll,
  loadLog,
  loadProfile,
  newId,
  saveLog,
  saveProfile,
  storageAvailable,
  type LogEntry,
  type Prefs,
  type Profile,
} from "../lib/storage";
import { clockNow, localDateKey, minutesOf, phaseAt } from "../lib/time";

export interface AppApi {
  profile: Profile | null;
  prefs: Prefs;
  log: LogEntry[];
  /** False when the browser blocks storage — the app then runs from memory. */
  storageOk: boolean;
  now: Date;
  nowMinutes: number;
  phase: Phase;
  previewMinutes: number | null;
  displayMinutes: number;
  displayPhase: Phase;
  setPreviewMinutes: (m: number | null) => void;
  createProfile: (name: string, email: string) => void;
  updateProfile: (patch: Partial<Pick<Profile, "name" | "email" | "categories" | "prefs">>) => void;
  complete: (activityId: string, categories: CategoryId[], phase: PhaseId) => LogEntry;
  undo: (entryId: string) => void;
  clearData: () => void;
  doneToday: ReadonlySet<string>;
}

const Ctx = createContext<AppApi | null>(null);

export function useApp(): AppApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside <AppProvider>");
  return v;
}

/** Ticks on every minute boundary, and immediately when the tab becomes visible again. */
function useClock(): Date {
  const [now, setNow] = useState(clockNow);
  useEffect(() => {
    let timer = 0;
    const schedule = () => {
      const n = clockNow();
      const delay = 60_000 - (n.getSeconds() * 1000 + n.getMilliseconds()) + 25;
      timer = window.setTimeout(() => {
        setNow(clockNow());
        schedule();
      }, delay);
    };
    const refresh = () => {
      window.clearTimeout(timer);
      setNow(clockNow());
      schedule();
    };
    const onVisibility = () => document.visibilityState === "visible" && refresh();
    schedule();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
    };
  }, []);
  return now;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(loadProfile);
  const [log, setLog] = useState<LogEntry[]>(loadLog);
  const [storageOk, setStorageOk] = useState(storageAvailable);
  const [previewMinutes, setPreviewMinutes] = useState<number | null>(null);
  const now = useClock();

  const nowMinutes = minutesOf(now);
  const phase = phaseAt(nowMinutes);
  const displayMinutes = previewMinutes ?? nowMinutes;
  const displayPhase = phaseAt(displayMinutes);

  const persistProfile = useCallback((p: Profile | null) => {
    setProfile(p);
    if (p && !saveProfile(p)) setStorageOk(false);
  }, []);

  const createProfile = useCallback(
    (name: string, email: string) => {
      const t = new Date().toISOString();
      persistProfile({ name, email, categories: [], createdAt: t, updatedAt: t, version: 1 });
    },
    [persistProfile],
  );

  const profileRef = useRef(profile);
  profileRef.current = profile;

  const updateProfile = useCallback<AppApi["updateProfile"]>(
    (patch) => {
      const cur = profileRef.current;
      if (!cur) return;
      persistProfile({ ...cur, ...patch, updatedAt: new Date().toISOString() });
    },
    [persistProfile],
  );

  const complete = useCallback<AppApi["complete"]>((activityId, categories, ph) => {
    const t = clockNow();
    const entry: LogEntry = {
      id: newId(),
      activityId,
      categories,
      phase: ph,
      at: t.toISOString(),
      date: localDateKey(t),
      minute: minutesOf(t),
    };
    setLog((prev) => {
      const next = [...prev, entry];
      if (!saveLog(next)) setStorageOk(false);
      return next;
    });
    return entry;
  }, []);

  const undo = useCallback((entryId: string) => {
    setLog((prev) => {
      const next = prev.filter((e) => e.id !== entryId);
      saveLog(next);
      return next;
    });
  }, []);

  const clearData = useCallback(() => {
    clearAll();
    setProfile(null);
    setLog([]);
    setPreviewMinutes(null);
  }, []);

  // Keep several tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === PROFILE_KEY || e.key === null) setProfile(loadProfile());
      if (e.key === LOG_KEY || e.key === null) setLog(loadLog());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // The whole UI follows the (displayed) sun: tokens, colour scheme, browser chrome.
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.phase === displayPhase.id) return;
    root.classList.add("phase-shift");
    root.dataset.phase = displayPhase.id;
    root.dataset.scheme = displayPhase.theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEMES[displayPhase.id].base);
    const t = window.setTimeout(() => root.classList.remove("phase-shift"), 1200);
    return () => window.clearTimeout(t);
  }, [displayPhase.id, displayPhase.theme]);

  const todayKey = localDateKey(now);
  const doneToday = useMemo(() => doneOn(log, todayKey), [log, todayKey]);
  const prefs = profile?.prefs ?? DEFAULT_PREFS;

  const api = useMemo<AppApi>(
    () => ({
      profile,
      prefs,
      log,
      storageOk,
      now,
      nowMinutes,
      phase,
      previewMinutes,
      displayMinutes,
      displayPhase,
      setPreviewMinutes,
      createProfile,
      updateProfile,
      complete,
      undo,
      clearData,
      doneToday,
    }),
    [profile, prefs, log, storageOk, now, nowMinutes, phase, previewMinutes, displayMinutes, displayPhase, createProfile, updateProfile, complete, undo, clearData, doneToday],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
