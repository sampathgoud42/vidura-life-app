import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BreathingOrb } from "../components/BreathingOrb";
import { MagneticButton } from "../components/Controls";
import { ArrowLeft, ArrowRight, Check, Close, Pause, Play } from "../components/Icons";
import { useLightBurst } from "../components/LightBurst";
import { SmartImage } from "../components/SmartImage";
import { haptics, requestWakeLock } from "../lib/device";
import type { Resolved } from "../lib/plan";
import { formatDuration } from "../lib/time";

const RING_R = 46;
const RING_C = 2 * Math.PI * RING_R;
const FOCUSABLE = 'button:not([disabled]),[href],input,[tabindex]:not([tabindex="-1"])';

/**
 * Full-screen guided session: the breathing orb inside a circular progress
 * timer, step prompts, pause/resume, and a wake lock while it runs.
 * Timing is timestamp-based, so it stays correct if the tab sleeps.
 */
export function GuidedMode({ item, onClose, onComplete }: { item: Resolved; onClose: () => void; onComplete: (origin?: { x: number; y: number }) => void }) {
  const reduced = useReducedMotion();
  const burst = useLightBurst();
  const total = item.minutes * 60;
  const [running, setRunning] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [stepOverride, setStepOverride] = useState<number | null>(null);
  const [breathEpoch, setBreathEpoch] = useState(0);
  const [cue, setCue] = useState<"in" | "hold" | "out">("in");
  const acc = useRef(0);
  const since = useRef(performance.now());
  const ringRef = useRef<SVGCircleElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const doneBtn = useRef<HTMLButtonElement>(null);
  const finished = elapsed >= total;
  const breath = item.activity.breath ?? { inhale: 5, exhale: 5 };
  const cycle = breath.inhale + (breath.hold ?? 0) + breath.exhale;
  const showBreath = item.activity.kind === "breathe" || item.activity.kind === "rest";

  // Clock
  useEffect(() => {
    if (!running || finished) return;
    since.current = performance.now();
    let raf = 0;
    let lastSec = -1;
    const tick = () => {
      const e = Math.min(total, acc.current + (performance.now() - since.current) / 1000);
      ringRef.current?.style.setProperty("stroke-dashoffset", String(RING_C * (1 - e / total)));
      const sec = Math.floor(e);
      if (sec !== lastSec) {
        lastSec = sec;
        setElapsed(e);
      }
      const inCycle = ((performance.now() - since.current) / 1000) % cycle;
      setCue(inCycle < breath.inhale ? "in" : inCycle < breath.inhale + (breath.hold ?? 0) ? "hold" : "out");
      if (e < total) raf = requestAnimationFrame(tick);
      else setElapsed(total);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      acc.current = Math.min(total, acc.current + (performance.now() - since.current) / 1000);
    };
  }, [running, finished, total, cycle, breath.inhale, breath.hold]);

  // Celebrate the natural end of a session.
  useEffect(() => {
    if (!finished) return;
    haptics.success();
    const r = doneBtn.current?.getBoundingClientRect();
    if (r) burst({ x: r.left + r.width / 2, y: r.top, mode: "rise", count: 50 });
    doneBtn.current?.focus();
  }, [finished, burst]);

  // Keep the screen awake while guiding (re-acquired when the tab comes back).
  useEffect(() => {
    let lock: Awaited<ReturnType<typeof requestWakeLock>> = null;
    let alive = true;
    const get = async () => {
      const l = await requestWakeLock();
      if (alive) lock = l;
      else l?.release().catch(() => {});
    };
    get();
    const onVis = () => document.visibilityState === "visible" && get();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      document.removeEventListener("visibilitychange", onVis);
      lock?.release().catch(() => {});
    };
  }, []);

  // Dialog focus handling.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const main = document.getElementById("app-main");
    main?.setAttribute("inert", "");
    panel.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " " && document.activeElement === panel.current) {
        e.preventDefault();
        setRunning((r) => !r);
      }
      if (e.key !== "Tab" || !panel.current) return;
      const els = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      main?.removeAttribute("inert");
      document.body.style.overflow = "";
      opener?.focus?.();
    };
  }, [onClose]);

  const steps = item.steps.length ? item.steps : [item.detail];
  const autoStep = Math.min(steps.length - 1, Math.floor((elapsed / total) * steps.length));
  const step = stepOverride ?? autoStep;
  const remaining = total - elapsed;
  const cueText = cue === "in" ? "Breathe in" : cue === "hold" ? "Hold" : "Breathe out";

  const toggle = () => {
    haptics.tap();
    setRunning((r) => {
      if (!r) setBreathEpoch((n) => n + 1); // restart the orb so it matches the cue
      return !r;
    });
  };

  return createPortal(
    <motion.div
      ref={panel}
      className="guided"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guided-title"
      tabIndex={-1}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.15 : 0.45 }}
    >
      <SmartImage slot={item.activity.image} fill scrim="full" className="guided-bg" />
      <div className="guided-inner">
        <header className="guided-head">
          <div>
            <p className="eyebrow guided-eyebrow">{item.eyebrow}</p>
            <h2 id="guided-title" className="display guided-title">
              {item.headline}
            </h2>
          </div>
          <button type="button" className="icon-btn icon-btn-light" onClick={onClose} aria-label="Close guided session" data-autofocus>
            <Close />
          </button>
        </header>

        <div className="guided-center">
          <div className="guided-orb-wrap">
            <svg className="guided-ring" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r={RING_R} className="guided-ring-track" />
              <circle
                ref={ringRef}
                cx="50"
                cy="50"
                r={RING_R}
                className="guided-ring-fill"
                strokeDasharray={RING_C}
                strokeDashoffset={RING_C * (1 - elapsed / total)}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <BreathingOrb key={breathEpoch} size="62%" breath={breath} breathing={running && !finished} interactive={false} />
          </div>
          <div className="guided-readout">
            <span className="guided-time" role="timer" aria-live="off">
              {finished ? "Complete" : formatDuration(remaining)}
            </span>
            {showBreath && running && !finished && (
              <span className="guided-cue" aria-hidden="true">
                {cueText}
              </span>
            )}
          </div>
        </div>

        <div className="guided-step glass" aria-live="polite">
          <span className="guided-step-count">
            Step {step + 1} of {steps.length}
          </span>
          <motion.p key={step} className="guided-step-text" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {steps[step]}
          </motion.p>
          <div className="guided-step-nav">
            <button type="button" className="icon-btn icon-btn-light" disabled={step === 0} onClick={() => setStepOverride(Math.max(0, step - 1))} aria-label="Previous step">
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              className="icon-btn icon-btn-light"
              disabled={step === steps.length - 1}
              onClick={() => setStepOverride(Math.min(steps.length - 1, step + 1))}
              aria-label="Next step"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <footer className="guided-actions">
          {!finished && (
            <MagneticButton variant="glassy" size="lg" onClick={toggle} aria-label={running ? "Pause" : "Resume"}>
              {running ? <Pause size={18} /> : <Play size={18} />} {running ? "Pause" : "Resume"}
            </MagneticButton>
          )}
          <MagneticButton
            ref={doneBtn}
            variant="light"
            size="lg"
            onClick={() => {
              const r = doneBtn.current?.getBoundingClientRect();
              onComplete(r ? { x: r.left + r.width / 2, y: r.top } : undefined);
            }}
          >
            <Check size={18} /> {finished ? "Mark as done" : "Done"}
          </MagneticButton>
        </footer>
      </div>
    </motion.div>,
    document.body,
  );
}
