/** Small, feature-detected device helpers: haptics, media queries, view transitions. */
import { flushSync } from "react-dom";

const mq = (q: string) => {
  try {
    return window.matchMedia(q).matches;
  } catch {
    return false;
  }
};

export const isCoarsePointer = () => mq("(pointer: coarse)");
export const canHover = () => mq("(hover: hover) and (pointer: fine)");
export const prefersReducedMotion = () => mq("(prefers-reduced-motion: reduce)");

function vibrate(pattern: number | number[]): void {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator && isCoarsePointer()) navigator.vibrate(pattern);
  } catch {
    /* unsupported (e.g. iOS Safari) */
  }
}

export const haptics = {
  tap: () => vibrate(8),
  select: () => vibrate(12),
  success: () => vibrate([10, 40, 18]),
  warn: () => vibrate([6, 30, 6]),
};

type DocWithVT = Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };

/** Runs a state update inside a View Transition when supported (and motion is allowed). */
export function withViewTransition(update: () => void): void {
  const doc = document as DocWithVT;
  if (!doc.startViewTransition || prefersReducedMotion()) {
    update();
    return;
  }
  try {
    doc.startViewTransition(() => flushSync(update));
  } catch {
    update();
  }
}

type WakeLockSentinelLike = { release: () => Promise<void> };
type NavWithWakeLock = Navigator & { wakeLock?: { request: (t: "screen") => Promise<WakeLockSentinelLike> } };

export async function requestWakeLock(): Promise<WakeLockSentinelLike | null> {
  try {
    return (await (navigator as NavWithWakeLock).wakeLock?.request("screen")) ?? null;
  } catch {
    return null;
  }
}
