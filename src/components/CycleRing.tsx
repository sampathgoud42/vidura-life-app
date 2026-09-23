import { motion, useReducedMotion } from "framer-motion";
import type { CycleEstimate } from "../lib/cycle";
import { phaseOnDay } from "../lib/cycle";
import { arcPath } from "./Rings";

/**
 * The cycle as a ring of days: period, fertile window and estimated ovulation,
 * with today marked. Decorative summary; the dates are also given in text.
 */
export function CycleRing({ est, size = 220 }: { est: CycleEstimate; size?: number }) {
  const reduced = useReducedMotion();
  const c = size / 2;
  const r = size / 2 - 16;
  const n = est.cycleLength;
  const gap = n > 30 ? 1.6 : 2.2;
  const seg = 360 / n;
  const todayAngle = (est.day - 0.5) * seg;
  const rad = ((todayAngle - 90) * Math.PI) / 180;

  return (
    <div className="cycle-ring" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
        {Array.from({ length: n }, (_, i) => {
          const day = i + 1;
          const phase = phaseOnDay(day, est);
          return (
            <motion.path
              key={day}
              d={arcPath(c, c, r, i * seg + gap / 2, (i + 1) * seg - gap / 2)}
              className={`cycle-seg cycle-${phase} ${day === est.day ? "is-today" : ""}`}
              strokeWidth={phase === "ovulation" ? 16 : phase === "fertile" ? 13 : 9}
              fill="none"
              strokeLinecap="round"
              initial={reduced ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: reduced ? 0 : i * 0.012 }}
            />
          );
        })}
        <circle cx={c + Math.cos(rad) * r} cy={c + Math.sin(rad) * r} r={10} className="cycle-today-dot" />
      </svg>
      <div className="cycle-center">
        <span className="cycle-day">Day {est.day}</span>
        <span className="cycle-of">of about {n}</span>
      </div>
    </div>
  );
}
