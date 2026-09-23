import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { MagneticButton } from "../components/Controls";
import { DayDial } from "../components/DayDial";
import { Check, Clock, Info, Play } from "../components/Icons";
import { useLightBurst } from "../components/LightBurst";
import { SmartImage } from "../components/SmartImage";
import { useToast } from "../components/Toast";
import { APP, CATEGORIES, MEAL_SLOTS, WEEKDAYS } from "../data/content";
import { haptics } from "../lib/device";
import { dayPlan, planNow, upNext, type PlanContext, type Resolved } from "../lib/plan";
import { Display } from "../components/Typography";
import { formatClock, formatDateLong, formatMinutes, formatPhaseRange, greetingFor, timeZoneLabel, timeZoneShort, weekdayIndex } from "../lib/time";
import { useApp } from "../state/AppState";

const catOf = (id: string) => CATEGORIES.find((c) => c.id === id)!;

export function NowScreen({ onStart }: { onStart: (r: Resolved) => void }) {
  const app = useApp();
  const { profile, prefs, now, nowMinutes, doneToday, complete, undo } = app;
  const burst = useLightBurst();
  const toast = useToast();
  const [pinned, setPinned] = useState<string | null>(null);
  const categories = profile?.categories ?? [];

  const baseCtx = useMemo<Omit<PlanContext, "minutes">>(
    () => ({ categories, prefs, date: now, doneToday }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories.join(), prefs, now, doneToday],
  );
  const ctx: PlanContext = { ...baseCtx, minutes: nowMinutes };
  const plan = planNow(ctx, pinned && !doneToday.has(pinned) ? pinned : null);

  // A swapped-in activity belongs to its phase; let the engine choose again when the sky moves on.
  const phaseId = plan.phase.id;
  useEffect(() => setPinned(null), [phaseId]);
  const timeline = upNext(ctx);
  const weekday = weekdayIndex(now);
  const today = dayPlan(prefs, weekday);

  const markDone = (r: Resolved, origin?: { x: number; y: number }) => {
    const entry = complete(r.activity.id, r.activity.categories.length ? r.matched : categories, r.phase);
    haptics.success();
    if (origin) burst({ x: origin.x, y: origin.y, mode: "rise" });
    setPinned(null);
    toast(`Logged "${r.headline}". Nice work.`, { label: "Undo", onClick: () => undo(entry.id) });
  };

  const tz = timeZoneShort(now) || timeZoneLabel().replace(/_/g, " ");

  return (
    <div className="now-screen">
      <header className="now-head">
        <div aria-live="polite" aria-atomic="true">
          <Display as="h1" className="greeting">
            {greetingFor(nowMinutes)}, <span className="greeting-name">{profile?.name}</span>
          </Display>
        </div>
        <p className="greeting-sub">
          <time dateTime={now.toISOString()}>
            {formatDateLong(now)} · {formatClock(now)}
          </time>
          {tz && <span title={timeZoneLabel()}> · {tz}</span>}
        </p>
      </header>

      <section className="phase-row" aria-label="Current time of day">
        <span className="phase-pill glass">
          <span className="pulse-dot" aria-hidden="true" />
          {plan.phase.label} · {formatPhaseRange(plan.phase)}
        </span>
        <span className="phase-mood">{plan.phase.mood}</span>
      </section>

      <div className="now-grid">
        <div className="now-col">
          <AnimatePresence mode="popLayout" initial={false}>
            {plan.allDone ? (
              <AllDoneCard key="all-done" phaseLabel={plan.phase.label} next={timeline[0]?.headline} />
            ) : (
              <NowCard key={plan.now.activity.id} item={plan.now} onStart={() => onStart(plan.now)} onDone={markDone} />
            )}
          </AnimatePresence>

          {!plan.allDone && plan.also.length > 0 && (
            <section className="also" aria-labelledby="also-h">
              <h2 id="also-h" className="section-title">
                Also good right now
              </h2>
              <ul className="also-list">
                {plan.also.map((a) => (
                  <li key={a.activity.id}>
                    <button
                      type="button"
                      className={`also-item glass ${a.done ? "is-done" : ""}`}
                      onClick={() => {
                        haptics.select();
                        setPinned(a.activity.id);
                      }}
                      aria-label={`Show ${a.headline}${a.done ? ", done today" : ""}`}
                    >
                      <SmartImage slot={a.activity.image} className="also-thumb" scrim="none" sizes="64px" />
                      <span className="also-text">
                        <span className="also-title">{a.headline}</span>
                        <span className="also-meta">
                          {a.done ? "Done today" : `${a.minutes} min`}
                          {a.matched[0] ? ` · ${catOf(a.matched[0]).short}` : ""}
                        </span>
                      </span>
                      {a.done && <Check size={16} className="also-check" />}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="now-col">
          <section className="upnext" aria-labelledby="upnext-h">
            <h2 id="upnext-h" className="section-title">
              Up next today
            </h2>
            <ol className="timeline" tabIndex={0} aria-label="Upcoming parts of your day">
              {timeline.map((t) => (
                <li key={t.phase.id} className="timeline-item">
                  <div className="timeline-card glass">
                    <SmartImage slot={t.headline.activity.image} className="timeline-media" sizes="220px">
                      <span className="timeline-when">
                        {t.tomorrow ? "Tomorrow · " : ""}
                        {formatMinutes(t.headline.activity.window[0])}
                      </span>
                    </SmartImage>
                    <div className="timeline-body">
                      <p className="timeline-phase">
                        {t.phase.label} <span>· {formatPhaseRange(t.phase)}</span>
                      </p>
                      <p className="timeline-title">{t.headline.headline}</p>
                      <p className="timeline-meta">
                        {t.headline.minutes} min · {t.count - 1} more ideas
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="day glass" aria-labelledby="day-h">
            <div className="day-head">
              <h2 id="day-h" className="section-title">
                Your day
              </h2>
              <PreviewReset />
            </div>
            <p className="day-sub">Drag around the dial to see what's planned at any hour.</p>
            <DayDial ctx={baseCtx} />
            <details className="plate">
              <summary>
                <span>
                  Today's plate · {WEEKDAYS[weekday]} · {today.theme} {today.emoji}
                </span>
              </summary>
              <ul className="plate-list">
                {MEAL_SLOTS.map((s) => (
                  <li key={s.id}>
                    <span className="plate-slot">
                      <span aria-hidden="true">{s.emoji}</span> {s.label}
                    </span>
                    <span className="plate-meal">
                      <strong>{today[s.id].title}</strong>
                      <span>{today[s.id].detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          </section>
        </div>
      </div>

      <p className="footnote">
        <Info size={14} /> {APP.disclaimer}
      </p>
    </div>
  );
}

function PreviewReset() {
  const { previewMinutes, setPreviewMinutes } = useApp();
  return (
    <AnimatePresence>
      {previewMinutes !== null && (
        <motion.button
          type="button"
          className="chip chip-on"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={() => setPreviewMinutes(null)}
        >
          Back to now
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function NowCard({ item, onStart, onDone }: { item: Resolved; onStart: () => void; onDone: (r: Resolved, origin?: { x: number; y: number }) => void }) {
  const reduced = useReducedMotion();
  const doneRef = useRef<HTMLButtonElement>(null);
  const cats = item.matched.map(catOf);

  return (
    <motion.article
      className="now-card glass"
      aria-labelledby="now-title"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
    >
      <SmartImage slot={item.activity.image} priority className="now-media" sizes="(min-width: 1024px) 44vw, 100vw">
        <div className="now-overlay">
          <span className="now-badge">
            <span className="pulse-dot" aria-hidden="true" /> Now
          </span>
          <p className="now-eyebrow">{item.eyebrow}</p>
          <h2 id="now-title" className="display now-title">
            {item.headline}
          </h2>
          <p className="now-detail">{item.detail}</p>
          <div className="now-meta">
            <span>
              <Clock size={16} /> {item.minutes} min
            </span>
            {cats.map((c) => (
              <span key={c.id} className="now-cat">
                {c.emoji} {c.short}
              </span>
            ))}
          </div>
          <div className="now-actions">
            <MagneticButton variant="light" size="lg" onClick={onStart}>
              <Play size={18} /> Start
            </MagneticButton>
            <MagneticButton
              ref={doneRef}
              variant="glassy"
              size="lg"
              onClick={() => {
                const r = doneRef.current?.getBoundingClientRect();
                onDone(item, r ? { x: r.left + r.width / 2, y: r.top } : undefined);
              }}
            >
              <Check size={18} /> Done
            </MagneticButton>
          </div>
        </div>
      </SmartImage>
      {(item.extra || item.focusNote || item.notes.length > 0) && (
        <div className="now-notes">
          {item.extra && <p className="now-extra">{item.extra}</p>}
          {item.focusNote && (
            <p className="focus-note">
              <span className="focus-note-tag">
                {catOf(item.focusNote.category).emoji} For your {catOf(item.focusNote.category).label} focus
              </span>
              {item.focusNote.text}
            </p>
          )}
          {item.notes.map((n) => (
            <p key={n} className="now-caution">
              <Info size={14} /> {n}
            </p>
          ))}
        </div>
      )}
    </motion.article>
  );
}

function AllDoneCard({ phaseLabel, next }: { phaseLabel: string; next?: Resolved }) {
  return (
    <motion.article
      className="now-card glass all-done"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      aria-live="polite"
    >
      <div className="all-done-body">
        <p className="eyebrow">{phaseLabel} complete</p>
        <h2 className="display now-title">You're all set for now.</h2>
        <p className="now-detail">Everything for this part of the day is done. Enjoy the quiet.</p>
        {next && (
          <p className="all-done-next">
            Coming up: <strong>{next.headline}</strong>
          </p>
        )}
      </div>
    </motion.article>
  );
}
