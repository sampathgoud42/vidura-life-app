/**
 * The palette currently on screen, mid-crossfade included. LivingBackground
 * drives it; the orb (and anything else tinted by the sky) subscribes.
 */
import type { PhaseId } from "../data/content";
import { liveColorsFor, type LiveColors } from "./palette";

type Listener = (c: LiveColors) => void;

let current: LiveColors = liveColorsFor(
  (typeof document !== "undefined" && (document.documentElement.dataset.phase as PhaseId)) || "morning",
);
const listeners = new Set<Listener>();

export const livePalette = {
  get: (): LiveColors => current,
  set(next: LiveColors): void {
    current = next;
    listeners.forEach((l) => l(next));
  },
  subscribe(l: Listener): () => void {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
