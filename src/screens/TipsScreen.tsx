import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "framer-motion";
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { Chip, Segmented } from "../components/Controls";
import { ArrowLeft, ArrowRight, Info } from "../components/Icons";
import { Display } from "../components/Typography";
import { APP, CATEGORIES, FOOD_GUIDES, TIPS, type CategoryId, type Tip } from "../data/content";
import { haptics } from "../lib/device";
import { useApp } from "../state/AppState";
import { FoodGuideCard, RoutinesSection, TricksSection } from "./TipsSections";

export type TipsView = "tips" | "tricks" | "routines" | "foods";
const VIEWS: { id: TipsView; label: string }[] = [
  { id: "tips", label: "Tips" },
  { id: "tricks", label: "Tricks" },
  { id: "routines", label: "Routines" },
  { id: "foods", label: "Foods" },
];
const LEDE: Record<TipsView, string> = {
  tips: "Small, practical ideas for your focus. Swipe a card away for the next one.",
  tricks: "Kitchen tricks and traditional remedies, matched to your approach.",
  routines: "A daily ritual, morning add-ons and a rhythm for the rest of your day.",
  foods: "What to enjoy often and what to go easy on, with rough protein per serving.",
};

const KIND_LABEL: Record<Tip["kind"], string> = {
  habit: "Habit",
  food: "Food",
  mind: "Mind",
  move: "Movement",
  rest: "Rest",
  care: "Care",
};

export function TipsScreen({ onOpenGuide }: { onOpenGuide: () => void }) {
  const { profile, prefs } = useApp();
  const cats = profile?.categories ?? [];
  const [view, setView] = useState<TipsView>("tips");
  const [filter, setFilter] = useState<CategoryId | "all">("all");
  const [index, setIndex] = useState(0);
  const scope: CategoryId[] = filter === "all" ? (cats.length ? cats : CATEGORIES.map((c) => c.id)) : [filter];

  const deck = useMemo(
    () =>
      TIPS.filter(
        (t) =>
          (filter === "all" ? t.category === "all" || cats.includes(t.category) : t.category === filter) &&
          (!t.audience || t.audience === prefs.audience),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filter, cats.join(), prefs.audience],
  );

  useEffect(() => setIndex(0), [filter]);

  return (
    <div className="tips-screen">
      <header className="screen-head">
        <Display as="h1" className="t-title">
          Tips &amp; ideas
        </Display>
        <p className="lede">{LEDE[view]}</p>
      </header>

      <Segmented label="Show" options={VIEWS} value={view} onChange={setView} mode="tabs" idPrefix="tips" className="tips-views" />

      <div className="chip-row" role="group" aria-label="Filter tips by focus">
        <Chip selected={filter === "all"} onClick={() => setFilter("all")}>
          All
        </Chip>
        {cats.map((c) => {
          const cat = CATEGORIES.find((x) => x.id === c)!;
          return (
            <Chip key={c} selected={filter === c} onClick={() => setFilter(c)}>
              <span aria-hidden="true">{cat.emoji}</span> {cat.label}
            </Chip>
          );
        })}
      </div>

      {scope.includes("fertility") && (
        <button type="button" className="guide-link glass" onClick={onOpenGuide}>
          <span className="guide-link-emoji" aria-hidden="true">
            🧬
          </span>
          <span className="guide-link-text">
            <span className="guide-link-title">Fertility guide</span>
            <span className="guide-link-sub">Cycle and fertile window, best time to try, egg and sperm health, myths, supplements</span>
          </span>
          <ArrowRight size={18} />
        </button>
      )}

      <div id="tips-panel" role="tabpanel" aria-labelledby={`tips-tab-${view}`} className="tips-panel">
        {view === "tips" &&
          (deck.length ? <CardStack deck={deck} index={index} setIndex={setIndex} /> : <p className="empty">No tips for this filter yet.</p>)}
        {view === "tricks" && <TricksSection cats={scope} prefs={prefs} />}
        {view === "routines" && <RoutinesSection cats={scope} prefs={prefs} />}
        {view === "foods" && (
          <div className="tips-section">
            {FOOD_GUIDES.filter((g) => scope.includes(g.category)).map((g) => (
              <FoodGuideCard key={g.category} guide={g} audience={prefs.audience} diet={prefs.diet} />
            ))}
          </div>
        )}
      </div>

      <p className="footnote">
        <Info size={14} /> {APP.disclaimer}
      </p>
    </div>
  );
}

function CardStack({ deck, index, setIndex }: { deck: readonly Tip[]; index: number; setIndex: (fn: (i: number) => number) => void }) {
  const n = deck.length;
  const at = (k: number) => deck[((k % n) + n) % n];
  const [dir, setDir] = useState<1 | -1>(1);
  const go = (d: 1 | -1) => {
    haptics.tap();
    setDir(d);
    setIndex((i) => i + d);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };

  const shown = Math.min(3, n);
  const pos = (((index % n) + n) % n) + 1;

  return (
    <div className="stack-wrap">
      <div
        className="stack"
        tabIndex={0}
        onKeyDown={onKey}
        role="region"
        aria-roledescription="card stack"
        aria-label={`Tip ${pos} of ${n}. Use the left and right arrow keys to move through tips.`}
      >
        <AnimatePresence initial={false}>
          {Array.from({ length: shown }, (_, depth) => {
            const k = index + depth;
            const tip = at(k);
            return <StackCard key={`${tip.id}-${k}`} tip={tip} depth={depth} enterFromLeft={depth === 0 && dir === -1} onDismiss={() => go(1)} />;
          })}
        </AnimatePresence>
      </div>

      <div className="stack-nav">
        <button type="button" className="icon-btn" onClick={() => go(-1)} aria-label="Previous tip">
          <ArrowLeft />
        </button>
        <span className="stack-count" aria-live="polite">
          {pos} / {n}
        </span>
        <button type="button" className="icon-btn" onClick={() => go(1)} aria-label="Next tip">
          <ArrowRight />
        </button>
      </div>
    </div>
  );
}

/**
 * One card in the stack. The top card drags on x: past the threshold it flies
 * off and the next card is promoted; otherwise it springs back.
 */
function StackCard({ tip, depth, enterFromLeft, onDismiss }: { tip: Tip; depth: number; enterFromLeft: boolean; onDismiss: () => void }) {
  const reduced = useReducedMotion();
  const x = useMotionValue(enterFromLeft && !reduced ? -360 : 0);
  const rotate = useTransform(x, [-300, 0, 300], [-12, 0, 12]);
  const isTop = depth === 0;

  useEffect(() => {
    if (enterFromLeft && !reduced) animate(x, 0, { type: "spring", stiffness: 260, damping: 28 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const d = info.offset.x;
    const v = info.velocity.x;
    if (Math.abs(d) > 110 || Math.abs(v) > 520) {
      const sign = (Math.abs(d) > 20 ? d : v) > 0 ? 1 : -1;
      haptics.select();
      animate(x, sign * 560, { type: "spring", stiffness: 180, damping: 28, velocity: v }).then(onDismiss);
    } else {
      animate(x, 0, { type: "spring", stiffness: 420, damping: 26 });
    }
  };

  return (
    <motion.article
      className={`tip-card glass-strong ${isTop ? "tip-top" : "tip-behind"}`}
      aria-hidden={isTop ? undefined : true}
      style={{ x, rotate, zIndex: 20 - depth }}
      drag={isTop && !reduced ? "x" : false}
      dragElastic={0.9}
      dragMomentum={false}
      onDragEnd={onDragEnd}
      initial={reduced ? { opacity: 0 } : enterFromLeft ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.88, y: 34 }}
      animate={{ opacity: 1 - depth * 0.3, scale: 1 - depth * 0.05, y: depth * 14 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      whileDrag={{ cursor: "grabbing" }}
    >
      <TipFace tip={tip} />
    </motion.article>
  );
}

function TipFace({ tip }: { tip: Tip }) {
  const cat = tip.category === "all" ? null : CATEGORIES.find((c) => c.id === tip.category);
  return (
    <>
      <div className="tip-top-row">
        <span className="tip-cat">{cat ? `${cat.emoji} ${cat.label}` : "✨ Everyday"}</span>
        <span className="tip-kind">{KIND_LABEL[tip.kind]}</span>
      </div>
      <span className="tip-icon" aria-hidden="true">
        {tip.icon}
      </span>
      <div className="tip-copy">
        <h2 className="display tip-title">{tip.title}</h2>
        <p className="tip-body">{tip.body}</p>
        {tip.audience && <span className="tip-audience">{tip.audience === "women" ? "Women's health note" : "Men's health note"}</span>}
      </div>
    </>
  );
}
