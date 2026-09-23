import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { DEFAULT_PREFS, type CategoryId, type Meal, type MealSlot, type Phase, type PhaseId } from "../data/content";
import { doneOn } from "../lib/insights";
import { THEMES } from "../lib/palette";
import { syncContactOnce } from "../lib/remote";
import {
  DAY_KEY,
  LOG_KEY,
  PROFILE_KEY,
  clearAll,
  emptyDay,
  loadDay,
  saveDay,
  type DayExtra,
  type DayState,
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
  /** Today's swaps, additions and lighter portions (resets on a new day). */
  day: DayState;
  swapMeal: (slot: MealSlot, meal: Meal | null) => void;
  addExtra: (extra: DayExtra) => void;
  removeExtra: (id: string) => void;
  setLighter: (slot: MealSlot, hint: string | null) => void;
  dismissSuggestion: (id: string) => void;
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
  const [dayRaw, setDayRaw] = useState<DayState>(() => loadDay(localDateKey(clockNow())));
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
    setDayRaw(emptyDay(localDateKey(clockNow())));
  }, []);

  /** Apply a change to today's state; yesterday's state is dropped first. */
  const updateDay = useCallback((fn: (d: DayState) => DayState) => {
    setDayRaw((prev) => {
      const key = localDateKey(clockNow());
      const next = fn(prev.date === key ? prev : emptyDay(key));
      if (!saveDay(next)) setStorageOk(false);
      return next;
    });
  }, []);

  const swapMeal = useCallback<AppApi["swapMeal"]>(
    (slot, meal) =>
      updateDay((d) => {
        const swaps = { ...d.swaps };
        if (meal) swaps[slot] = meal;
        else delete swaps[slot];
        const lighter = { ...d.lighter };
        delete lighter[slot];
        return { ...d, swaps, lighter };
      }),
    [updateDay],
  );
  const addExtra = useCallback<AppApi["addExtra"]>(
    (extra) => updateDay((d) => ({ ...d, extras: [...d.extras.filter((e) => e.id !== extra.id), extra] })),
    [updateDay],
  );
  const removeExtra = useCallback<AppApi["removeExtra"]>((id) => updateDay((d) => ({ ...d, extras: d.extras.filter((e) => e.id !== id) })), [updateDay]);
  const setLighter = useCallback<AppApi["setLighter"]>(
    (slot, hint) =>
      updateDay((d) => {
        const lighter = { ...d.lighter };
        if (hint) lighter[slot] = hint;
        else delete lighter[slot];
        return { ...d, lighter };
      }),
    [updateDay],
  );
  const dismissSuggestion = useCallback<AppApi["dismissSuggestion"]>(
    (id) => updateDay((d) => ({ ...d, dismissed: [...new Set([...d.dismissed, id])] })),
    [updateDay],
  );

  // Save the email to the wellness database once, if it isn't there yet (optional, silent).
  const profileEmail = profile?.email;
  useEffect(() => {
    if (profileRef.current && profileEmail) syncContactOnce({ name: profileRef.current.name, email: profileEmail });
  }, [profileEmail]);

  // Keep several tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === PROFILE_KEY || e.key === null) setProfile(loadProfile());
      if (e.key === LOG_KEY || e.key === null) setLog(loadLog());
      if (e.key === DAY_KEY || e.key === null) setDayRaw(loadDay(localDateKey(clockNow())));
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
  const day = useMemo(() => (dayRaw.date === todayKey ? dayRaw : emptyDay(todayKey)), [dayRaw, todayKey]);

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
      day,
      swapMeal,
      addExtra,
      removeExtra,
      setLighter,
      dismissSuggestion,
    }),
    // prettier-ignore
    [profile, prefs, log, storageOk, now, nowMinutes, phase, previewMinutes, displayMinutes, displayPhase, createProfile, updateProfile, complete, undo, clearData, doneToday, day, swapMeal, addExtra, removeExtra, setLighter, dismissSuggestion],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
