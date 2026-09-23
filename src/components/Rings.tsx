import { motion, useReducedMotion } from "framer-motion";
import type { DayCell } from "../lib/insights";
import { formatWeekdayNarrow } from "../lib/time";

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
};

export function arcPath(cx: number, cy: number, r: number, from: number, to: number): string {
  const [x1, y1] = polar(cx, cy, r, from);
  const [x2, y2] = polar(cx, cy, r, to);
  const sweep = (((to - from) % 360) + 360) % 360;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

/** Seven-segment ring: one arc per day of the last week, lit when you completed something. */
export function StreakRing({
  days,
  streak,
  size = 56,
  stroke = 5,
  showDays = false,
  className = "",
}: {
  days: DayCell[];
  streak: number;
  size?: number;
  stroke?: number;
  showDays?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const c = size / 2;
  const r = c - stroke / 2 - (showDays ? 14 : 1);
  const seg = 360 / 7;
  const gap = 9;
  const active = days.filter((d) => d.count > 0).length;
  return (
    <div className={`streak-ring ${className}`} style={{ width: size, height: size }} role="img" aria-label={`${streak}-day streak. Active on ${active} of the last 7 days.`}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
        {days.map((d, i) => {
          const from = i * seg + gap / 2;
          const to = (i + 1) * seg - gap / 2;
          const lit = d.count > 0;
          const [lx, ly] = polar(c, c, r + stroke + 7, (from + to) / 2);
          return (
            <g key={d.key}>
              <path d={arcPath(c, c, r, from, to)} className="ring-track" strokeWidth={stroke} fill="none" strokeLinecap="round" />
              {lit && (
                <motion.path
                  d={arcPath(c, c, r, from, to)}
                  className={d.isToday ? "ring-lit ring-today" : "ring-lit"}
                  strokeWidth={stroke}
                  fill="none"
                  strokeLinecap="round"
                  initial={reduced ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.7, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              {showDays && (
                <text x={lx} y={ly} className={`ring-day ${d.isToday ? "ring-day-today" : ""}`} textAnchor="middle" dominantBaseline="central">
                  {formatWeekdayNarrow(d.date)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <span className="streak-ring-center" aria-hidden="true">
        <span className="streak-ring-num">{streak}</span>
      </span>
    </div>
  );
}

/** Small animated radial chart for one category. */
export function RadialStat({ value, max, label, emoji, size = 96 }: { value: number; max: number; label: string; emoji: string; size?: number }) {
  const reduced = useReducedMotion();
  const stroke = 7;
  const r = size / 2 - stroke;
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <figure className="radial-stat" aria-label={`${label}: ${value} completed`}>
      <div className="radial-stat-ring" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
          <circle cx={size / 2} cy={size / 2} r={r} className="ring-track" strokeWidth={stroke} fill="none" />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            className="ring-lit"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            initial={reduced ? false : { pathLength: 0 }}
            animate={{ pathLength: pct || 0.0001, opacity: pct ? 1 : 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <span className="radial-stat-center" aria-hidden="true">
          <span className="radial-stat-emoji">{emoji}</span>
          <span className="radial-stat-value">{value}</span>
        </span>
      </div>
      <figcaption className="radial-stat-label">{label}</figcaption>
    </figure>
  );
}
