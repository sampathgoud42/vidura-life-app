import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent, type RefObject } from "react";
import { BreathingOrb } from "../components/BreathingOrb";
import { MagneticButton } from "../components/Controls";
import { ArrowRight } from "../components/Icons";
import { SmartImage } from "../components/SmartImage";
import { Display } from "../components/Typography";
import { CATEGORIES, type Category, type CategoryId } from "../data/content";
import { haptics } from "../lib/device";
import { useApp } from "../state/AppState";

/** Display order: the artifact's headline goals first. */
const ORDER: CategoryId[] = ["cholesterol", "sugar", "bp", "gut", "inflammation", "hormonal", "fertility"];

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * Sizes the floating tiles so that every one of them fits between the header and
 * the action bar. It tries 3 or 4 columns on wide screens and 2 or 3 on phones,
 * and keeps whichever gives the largest tiles (seven tiles: 4 + 3, or 3 + 3 + 1).
 */
function useFitTiles(gridRef: RefObject<HTMLDivElement | null>, footRef: RefObject<HTMLElement | null>) {
  const [fit, setFit] = useState({ tile: 0, cols: 2 });
  useLayoutEffect(() => {
    const measure = () => {
      const grid = gridRef.current;
      if (!grid) return;
      const wide = window.innerWidth >= 768;
      const gap = wide ? 28 : 14;
      const top = grid.getBoundingClientRect().top + window.scrollY;
      const below = (footRef.current?.offsetHeight ?? 64) + 20 + 44 + 18; // action bar + margin + page padding + safety
      const size = (cols: number) => {
        const rows = Math.ceil(ORDER.length / cols);
        const byHeight = (window.innerHeight - top - below - 34 - (rows - 1) * gap) / rows; // 34 = field padding + float room
        const byWidth = (grid.clientWidth - (cols - 1) * gap) / cols;
        return Math.min(byWidth, byHeight, wide ? 300 : 230);
      };
      const [a, b] = wide ? [3, 4] : [2, 3];
      const cols = size(b) > size(a) ? b : a;
      const tile = Math.floor(Math.max(wide ? 128 : 96, size(cols)));
      setFit((f) => (f.tile === tile && f.cols === cols ? f : { tile, cols }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (gridRef.current) ro.observe(gridRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [gridRef, footRef]);
  return fit;
}

export function FocusScreen({ onDone }: { onDone: () => void }) {
  const { profile, updateProfile } = useApp();
  const [selected, setSelected] = useState<CategoryId[]>(profile?.categories ?? []);
  const [hint, setHint] = useState("");
  const shake = useAnimationControls();
  const reduced = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLElement>(null);
  const { tile, cols } = useFitTiles(gridRef, footRef);

  // A loose, slightly different scatter every visit: tilt, drift, size and float timing.
  const scatter = useMemo(
    () => ORDER.map(() => ({ r: rand(-3.2, 3.2), dy: rand(-1, 1), s: rand(0.9, 1), dur: rand(6.5, 10), delay: -rand(0, 8) })),
    [],
  );

  const toggle = (id: CategoryId) => {
    haptics.select();
    setHint("");
    setSelected((cur) => (cur.includes(id) ? cur.filter((c) => c !== id) : [...cur, id]));
  };

  const next = () => {
    if (!selected.length) {
      setHint("Choose at least one focus to continue.");
      haptics.warn();
      if (!reduced) shake.start({ x: [0, -8, 7, -5, 3, 0], transition: { duration: 0.4 } });
      return;
    }
    updateProfile({ categories: ORDER.filter((c) => selected.includes(c)) });
    onDone();
  };

  return (
    <main className="screen focus" id="app-main">
      <header className="screen-head">
        <div className="head-row">
          <BreathingOrb layoutId="orb" size={52} />
          <p className="eyebrow">Hi {profile?.name}, one more thing</p>
        </div>
        <Display as="h1" className="t-title">
          What would you like to focus on?
        </Display>
        <p className="lede">Pick one or more. Every part of your day adapts to them.</p>
      </header>

      <div
        ref={gridRef}
        className="float-field"
        style={{ "--tile": tile ? `${tile}px` : undefined, "--cols": cols } as CSSProperties}
        role="group"
        aria-label="Focus areas"
      >
        {ORDER.map((id, i) => {
          const s = scatter[i];
          return (
            <div
              key={id}
              className="float-slot"
              style={
                {
                  "--r": `${s.r.toFixed(2)}deg`,
                  "--dy": `${(s.dy * (tile || 160) * 0.06).toFixed(1)}px`,
                  "--s": s.s.toFixed(3),
                  "--fd": `${s.dur.toFixed(1)}s`,
                  "--fdl": `${s.delay.toFixed(1)}s`,
                } as CSSProperties
              }
            >
              <FocusTile cat={CATEGORIES.find((c) => c.id === id)!} index={i} selected={selected.includes(id)} onToggle={() => toggle(id)} />
            </div>
          );
        })}
      </div>

      <motion.footer ref={footRef} className="focus-footer" animate={shake}>
        <CounterPill count={selected.length} />
        <MagneticButton variant="primary" size="lg" onClick={next} aria-describedby="focus-hint">
          Continue <ArrowRight size={18} />
        </MagneticButton>
      </motion.footer>
      <p id="focus-hint" className="focus-hint" role="status" aria-live="polite">
        {hint}
      </p>
    </main>
  );
}

function FocusTile({ cat, index, selected, onToggle }: { cat: Category; index: number; selected: boolean; onToggle: () => void }) {
  const reduced = useReducedMotion();
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setEntered(true), 700 + index * 70);
    return () => window.clearTimeout(t);
  }, [index]);

  const glow = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <motion.button
      type="button"
      className={`tile glow ${selected ? "tile-on" : ""}`}
      aria-pressed={selected}
      onClick={onToggle}
      onPointerMove={glow}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.94 }}
      animate={{ opacity: 1, y: selected && !reduced ? -6 : 0, scale: selected && !reduced ? 1.035 : 1 }}
      whileHover={reduced ? undefined : { y: -4 }}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 24, delay: entered ? 0 : 0.15 + index * 0.07 }}
    >
      <SmartImage slot={cat.image} fill sizes="(min-width: 768px) 300px, 45vw" />
      <span className="tile-emoji" aria-hidden="true">
        {cat.emoji}
      </span>
      <span className="tile-text">
        <span className="tile-label">{cat.tileLabel ?? cat.label}</span>
        <span className="tile-blurb">{cat.blurb}</span>
      </span>
      <span className="tile-check" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: selected ? 1 : 0, opacity: selected ? 1 : 0 }}
            transition={{ duration: reduced ? 0 : 0.35, ease: [0.65, 0, 0.35, 1] }}
          />
        </svg>
      </span>
    </motion.button>
  );
}

function CounterPill({ count }: { count: number }) {
  return (
    <span className={`counter-pill glass ${count ? "counter-on" : ""}`} aria-live="polite">
      <span className="counter-num">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={count}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {count}
          </motion.span>
        </AnimatePresence>
      </span>
      <span>selected</span>
    </span>
  );
}
