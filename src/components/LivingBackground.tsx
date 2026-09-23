import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { liveColorsFor, mixLive, oklabToRgb, rgbCss, type LiveColors } from "../lib/palette";
import { livePalette } from "../lib/livePalette";
import { phaseAt, phaseLocalMinutes } from "../lib/time";
import { useApp } from "../state/AppState";

/** Half-width (minutes) of the blend band around each phase boundary while scrubbing. */
const BAND = 30;

/** Continuous sky for any minute: pure phase colours, blended ±30 min around boundaries. */
function skyAt(minutes: number): LiveColors {
  const p = phaseAt(minutes);
  const local = phaseLocalMinutes(p, minutes);
  const start = p.start;
  const end = p.start < p.end ? p.end : p.end + 1440;
  const here = liveColorsFor(p.id);
  if (local > end - BAND) {
    const next = phaseAt(end % 1440);
    return mixLive(here, liveColorsFor(next.id), (local - (end - BAND)) / (2 * BAND));
  }
  if (local < start + BAND) {
    const prev = phaseAt((start - 1 + 1440) % 1440);
    return mixLive(liveColorsFor(prev.id), here, 0.5 + (local - start) / (2 * BAND));
  }
  return here;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Stars() {
  const stars = useMemo(() => {
    const rnd = mulberry32(20260923);
    return Array.from({ length: 90 }, (_, i) => ({
      x: rnd() * 1000,
      y: rnd() * 1000 * 0.8,
      r: 0.6 + rnd() * rnd() * 1.9,
      o: 0.25 + rnd() * 0.65,
      tw: i % 3 === 0,
      d: (rnd() * 6).toFixed(2),
    }));
  }, []);
  return (
    <svg className="stars" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#fff"
          opacity={s.o}
          className={s.tw ? "twinkle" : undefined}
          style={s.tw ? { animationDelay: `${s.d}s` } : undefined}
        />
      ))}
    </svg>
  );
}

export function LivingBackground() {
  const { displayPhase, previewMinutes } = useApp();
  const ref = useRef<HTMLDivElement>(null);

  const write = (c: LiveColors) => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--lb-base", rgbCss(oklabToRgb(c.base)));
    c.blobs.forEach((b, i) => el.style.setProperty(`--lb-${i + 1}`, rgbCss(oklabToRgb(b))));
    el.style.setProperty("--lb-stars", c.stars.toFixed(3));
  };

  useLayoutEffect(() => {
    write(livePalette.get());
  }, []);

  // Real time: discrete phase palettes, 2 s crossfade. Scrubbing: continuous sky, fast follow.
  const previewing = previewMinutes !== null;
  const key = previewing ? `p${previewMinutes}` : displayPhase.id;
  useEffect(() => {
    const from = livePalette.get();
    const to = previewing ? skyAt(previewMinutes!) : liveColorsFor(displayPhase.id);
    const duration = previewing ? 260 : 2000;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / duration);
      const c = mixLive(from, to, ease(k));
      livePalette.set(c);
      write(c);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <div ref={ref} className="living-bg" aria-hidden="true">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <div className="blob blob-4" />
      <div className="blob blob-5" />
      <Stars />
      <div className="grain" />
    </div>
  );
}
