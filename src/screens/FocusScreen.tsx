import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useEffect, useState, type PointerEvent } from "react";
import { BreathingOrb } from "../components/BreathingOrb";
import { MagneticButton } from "../components/Controls";
import { ArrowRight } from "../components/Icons";
import { SmartImage } from "../components/SmartImage";
import { Display } from "../components/Typography";
import { APP, CATEGORIES, type Category, type CategoryId } from "../data/content";
import { haptics } from "../lib/device";
import { useApp } from "../state/AppState";

/** Bento order: the big tile goes to the artifact's headline goal. */
const ORDER: CategoryId[] = ["cholesterol", "sugar", "gut", "inflammation", "hormonal", "fertility"];
const AREAS = ["a", "b", "c", "d", "e", "f"];

export function FocusScreen({ onDone }: { onDone: () => void }) {
  const { profile, updateProfile } = useApp();
  const [selected, setSelected] = useState<CategoryId[]>(profile?.categories ?? []);
  const [hint, setHint] = useState("");
  const shake = useAnimationControls();
  const reduced = useReducedMotion();

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
    const ordered = ORDER.filter((c) => selected.includes(c));
    updateProfile({ categories: ordered });
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

      <div className="bento" role="group" aria-label="Focus areas">
        {ORDER.map((id, i) => (
          <FocusTile
            key={id}
            cat={CATEGORIES.find((c) => c.id === id)!}
            area={AREAS[i]}
            index={i}
            selected={selected.includes(id)}
            onToggle={() => toggle(id)}
          />
        ))}
      </div>

      <motion.footer className="focus-footer" animate={shake}>
        <CounterPill count={selected.length} />
        <MagneticButton variant="primary" size="lg" onClick={next} aria-describedby="focus-hint">
          Continue <ArrowRight size={18} />
        </MagneticButton>
      </motion.footer>
      <p id="focus-hint" className="focus-hint" role="status" aria-live="polite">
        {hint || APP.privacyNote}
      </p>
    </main>
  );
}

function FocusTile({ cat, area, index, selected, onToggle }: { cat: Category; area: string; index: number; selected: boolean; onToggle: () => void }) {
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
      style={{ gridArea: area }}
      aria-pressed={selected}
      onClick={onToggle}
      onPointerMove={glow}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.97 }}
      animate={{ opacity: 1, y: selected && !reduced ? -5 : 0, scale: selected && !reduced ? 1.018 : 1 }}
      whileTap={reduced ? undefined : { scale: 0.975 }}
      transition={{ type: "spring", stiffness: 300, damping: 24, delay: entered ? 0 : 0.15 + index * 0.07 }}
    >
      <SmartImage slot={cat.image} fill scrim="bottom" sizes="(min-width: 768px) 33vw, 50vw" />
      <span className="tile-emoji" aria-hidden="true">
        {cat.emoji}
      </span>
      <span className="tile-text">
        <span className="tile-label">{cat.label}</span>
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
