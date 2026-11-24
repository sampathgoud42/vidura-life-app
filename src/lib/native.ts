/**
 * The native layer of the iOS app (Capacitor). On the web every function here is a
 * no-op or falls back to the browser API, and the plugins are only loaded inside
 * the app, so the web bundle stays the same size.
 *
 *   haptics        Taptic Engine taps instead of navigator.vibrate (absent on iOS)
 *   keep awake     the screen stays on during guided sessions
 *   sign-in links  a tapped email link (Universal Link) opens the app's own link flow
 *   reminders      gentle daily local notifications at the start of each part of the day
 *   status bar     follows the light or dark phase theme
 */
import { Capacitor } from "@capacitor/core";

export const isNative = Capacitor.isNativePlatform();

// ── Haptics ─────────────────────────────────────────────────────────────────
export type HapticKind = "tap" | "select" | "success" | "warn";

export function nativeHaptic(kind: HapticKind): void {
  void import("@capacitor/haptics")
    .then(({ Haptics, ImpactStyle, NotificationType }) => {
      if (kind === "tap") return Haptics.impact({ style: ImpactStyle.Light });
      if (kind === "select") return Haptics.selectionChanged();
      if (kind === "success") return Haptics.notification({ type: NotificationType.Success });
      return Haptics.notification({ type: NotificationType.Warning });
    })
    .catch(() => {});
}

// ── Keep awake ──────────────────────────────────────────────────────────────
export async function nativeKeepAwake(): Promise<{ release: () => Promise<void> } | null> {
  try {
    const { KeepAwake } = await import("@capacitor-community/keep-awake");
    await KeepAwake.keepAwake();
    return { release: () => KeepAwake.allowSleep().then(() => undefined) };
  } catch {
    return null;
  }
}

// ── Sign-in links (Universal Links) ─────────────────────────────────────────
/**
 * When the app is opened from an emailed sign-in link, reload the app at
 * "/?mode=signIn&oobCode=…" so the same link flow as the web version runs.
 */
function openLink(url: string, readCode: (href: string) => string | null): void {
  const code = readCode(url);
  if (!code) return;
  const current = new URL(window.location.href);
  if (current.searchParams.get("oobCode") === code) return; // already handling it
  try {
    if (sessionStorage.getItem("vidura.linkHandled") === code) return;
    sessionStorage.setItem("vidura.linkHandled", code);
  } catch {
    /* ignore */
  }
  window.location.replace(`${current.origin}/?mode=signIn&oobCode=${encodeURIComponent(code)}`);
}

// ── Status bar ──────────────────────────────────────────────────────────────
export function nativeStatusBar(dark: boolean): void {
  if (!isNative) return;
  void import("@capacitor/status-bar")
    .then(({ StatusBar, Style }) => StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light }))
    .catch(() => {});
}

/** Call once at start-up (inside the app only). */
export function initNative(readCode: (href: string) => string | null): void {
  if (!isNative) return;
  void import("@capacitor/app")
    .then(async ({ App }) => {
      await App.addListener("appUrlOpen", ({ url }) => openLink(url, readCode));
      const launch = await App.getLaunchUrl();
      if (launch?.url) openLink(launch.url, readCode);
    })
    .catch(() => {});
}

// ── Daily reminders ─────────────────────────────────────────────────────────
const REMINDERS_KEY = "vidura.reminders";

export interface ReminderSlot {
  /** Minutes after midnight. */
  at: number;
  title: string;
  body: string;
}

export const remindersOn = (): boolean => {
  try {
    return localStorage.getItem(REMINDERS_KEY) === "on";
  } catch {
    return false;
  }
};

const ID_BASE = 4100;

/**
 * Turn the daily reminders on (asks for permission the first time) or off.
 * Returns whether they are on afterwards.
 */
export async function setReminders(on: boolean, slots: readonly ReminderSlot[]): Promise<boolean> {
  if (!isNative) return false;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const pending = await LocalNotifications.getPending();
    const ours = pending.notifications.filter((n) => n.id >= ID_BASE && n.id < ID_BASE + 50);
    if (ours.length) await LocalNotifications.cancel({ notifications: ours.map((n) => ({ id: n.id })) });
    if (!on) {
      localStorage.setItem(REMINDERS_KEY, "off");
      return false;
    }
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display !== "granted") perm = await LocalNotifications.requestPermissions();
    if (perm.display !== "granted") {
      localStorage.setItem(REMINDERS_KEY, "off");
      return false;
    }
    await LocalNotifications.schedule({
      notifications: slots.map((s, i) => ({
        id: ID_BASE + i,
        title: s.title,
        body: s.body,
        schedule: { on: { hour: Math.floor(s.at / 60) % 24, minute: s.at % 60 }, allowWhileIdle: true },
      })),
    });
    localStorage.setItem(REMINDERS_KEY, "on");
    return true;
  } catch {
    return false;
  }
}
