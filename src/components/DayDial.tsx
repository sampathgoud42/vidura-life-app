import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useRef, type KeyboardEvent, type PointerEvent } from "react";
import { PHASES } from "../data/content";
import { haptics } from "../lib/device";
import { THEMES } from "../lib/palette";
import { planAt, type PlanContext } from "../lib/plan";
import { formatHour, formatMinutes, phaseAt, wrapMinutes } from "../lib/time";
import { useApp } from "../state/AppState";
import { Moon, Sun } from "./Icons";
import { arcPath } from "./Rings";

const SIZE = 320;
const C = SIZE / 2;
const R = 122;
const RING = 18;

/** Noon sits at the top like the sun, midnight at the bottom; time runs clockwise. */
const minToDeg = (m: number) => ((wrapMinutes(m) / 1440) * 360 + 180) % 360;
const degToMin = (deg: number) => ((deg / 360) * 1440 + 720) % 1440;
const polar = (r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)] as const;
};

/**
 * Circular 24-hour dial. Drag (or use the arrow keys) to preview what's
 * planned at any hour; the sky behind the app follows in real time.
 */
export function DayDial({ ctx }: { ctx: Omit<PlanContext, "minutes"> }) {
  const { displayMinutes, nowMinutes, previewMinutes, setPreviewMinutes } = useApp();
  const reduced = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const lastHour = useRef<number | null>(null);
  const raf = useRef(0);

  const minutes = displayMinutes;
  const phase = phaseAt(minutes);
  const plan = useMemo(() => planAt({ ...ctx, minutes }, minutes), [ctx, minutes]);
  const [tx, ty] = polar(R, minToDeg(minutes));
  const [nx, ny] = polar(R + RING / 2 + 9, minToDeg(nowMinutes));
  const isDay = phase.theme === "light";

  const set = (m: number) => {
    const snapped = wrapMinutes(Math.round(m / 5) * 5);
    const hour = Math.floor(snapped / 60);
    if (lastHour.current !== null && hour !== lastHour.current) haptics.select();
    lastHour.current = hour;
    setPreviewMinutes(snapped === nowMinutes ? null : snapped);
  };

  const fromPointer = (e: PointerEvent<SVGSVGElement>) => {
    const r = svgRef.current!.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    let deg = (Math.atan2(x, -y) * 180) / Math.PI;
    if (deg < 0) deg += 360;
    set(degToMin(deg));
  };

  const onDown = (e: PointerEvent<SVGSVGElement>) => {
    const r = svgRef.current!.getBoundingClientRect();
    const scale = SIZE / r.width;
    const dist = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) * scale;
    if (dist < R - 46 || dist > R + 40) return; // only the ring band scrubs
    dragging.current = true;
    svgRef.current!.setPointerCapture(e.pointerId);
    fromPointer(e);
  };
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    const ev = { clientX: e.clientX, clientY: e.clientY } as PointerEvent<SVGSVGElement>;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => fromPointer(ev));
  };
  const onUp = () => {
    dragging.current = false;
    lastHour.current = null;
  };

  const onKey = (e: KeyboardEvent<SVGGElement>) => {
    const step: Record<string, number> = { ArrowRight: 15, ArrowUp: 15, ArrowLeft: -15, ArrowDown: -15, PageUp: 60, PageDown: -60 };
    if (e.key in step) {
      e.preventDefault();
      set(minutes + step[e.key]);
    } else if (e.key === "Home") {
      e.preventDefault();
      set(0);
    } else if (e.key === "End") {
      e.preventDefault();
      set(1435);
    } else if (e.key === "Escape" && previewMinutes !== null) {
      e.preventDefault();
      setPreviewMinutes(null);
    }
  };

  const what = plan.eyebrow === plan.headline ? plan.headline : `${plan.eyebrow}: ${plan.headline}`;
  const valueText = `${formatMinutes(minutes)}, ${phase.label}. ${what}`;

  return (
    <div className="dial">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="dial-svg"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <circle cx={C} cy={C} r={R} className="dial-track" strokeWidth={RING + 8} fill="none" />
        {PHASES.map((p) => {
          const from = minToDeg(p.start);
          let to = minToDeg(p.end);
          if (to <= from) to += 360;
          const active = p.id === phase.id;
          return (
            <path
              key={p.id}
              d={arcPath(C, C, R, from + 1.2, to - 1.2)}
              stroke={THEMES[p.id].orb[1]}
              strokeWidth={active ? RING + 4 : RING}
              strokeLinecap="round"
              fill="none"
              className="dial-arc"
              opacity={active ? 1 : 0.62}
            />
          );
        })}
        {Array.from({ length: 24 }, (_, h) => {
          const deg = minToDeg(h * 60);
          const major = h % 6 === 0;
          const [x1, y1] = polar(R - RING / 2 - 7, deg);
          const [x2, y2] = polar(R - RING / 2 - (major ? 15 : 10), deg);
          return <line key={h} x1={x1} y1={y1} x2={x2} y2={y2} className={major ? "dial-tick dial-tick-major" : "dial-tick"} />;
        })}
        {[0, 6, 12, 18].map((h) => {
          const [x, y] = polar(R + RING / 2 + 22, minToDeg(h * 60));
          return (
            <text key={h} x={x} y={y} className="dial-label" textAnchor="middle" dominantBaseline="central">
              {formatHour(h * 60)}
            </text>
          );
        })}
        {previewMinutes !== null && (
          <g aria-hidden="true">
            <circle cx={nx} cy={ny} r={4} className="dial-now" />
          </g>
        )}
        <g
          role="slider"
          tabIndex={0}
          aria-label="Preview your day"
          aria-valuemin={0}
          aria-valuemax={1435}
          aria-valuenow={minutes}
          aria-valuetext={valueText}
          onKeyDown={onKey}
          className="dial-thumb-g"
        >
          <motion.g
            initial={false}
            animate={{ x: tx - C, y: ty - C }}
            transition={dragging.current || reduced ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 26 }}
          >
            <circle cx={C} cy={C} r={21} className="dial-thumb-halo" />
            <circle cx={C} cy={C} r={15} className="dial-thumb" />
            <g transform={`translate(${C - 9} ${C - 9})`} className="dial-thumb-icon">
              {isDay ? <Sun size={18} /> : <Moon size={18} />}
            </g>
          </motion.g>
        </g>
      </svg>

      <div className="dial-center" aria-hidden="true">
        <span className="dial-time">{formatMinutes(minutes)}</span>
        <span className="dial-phase">{phase.label}</span>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={plan.activity.id + plan.headline}
            className="dial-plan"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            {plan.headline}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
