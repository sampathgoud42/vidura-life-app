import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BreathingOrb } from "../components/BreathingOrb";
import { MagneticButton } from "../components/Controls";
import { ArrowRight, Check, Close, Info, Music, Pause, Play, Voice } from "../components/Icons";
import { useLightBurst } from "../components/LightBurst";
import { PracticeTime } from "../components/PracticeTime";
import { SmartImage } from "../components/SmartImage";
import type { CategoryId } from "../data/content";
import {
  BREATH_EVIDENCE_LABEL,
  BREATH_SAFETY_ALL,
  dirgaPart,
  program,
  programSeconds,
  type Options,
  GUIDE_LEVELS,
  loadGuideLevel,
  saveGuideLevel,
  type Segment,
  type Technique,
} from "../data/breathwork";
import { BreathAudio, loadAudioSettings, saveAudioSettings, type AudioSettings, type ClipName } from "../lib/breathAudio";
import { haptics, requestWakeLock } from "../lib/device";
import { HandPoseCard } from "../components/HandPoseCard";
import { formatDuration } from "../lib/time";

const RING_R = 46;
const RING_C = 2 * Math.PI * RING_R;
const FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]),[tabindex]:not([tabindex="-1"])';
const LO = 0.68;
const HI = 1;
const ease = (p: number) => 0.5 - Math.cos(Math.PI * Math.min(1, Math.max(0, p))) / 2;

/** How big the orb is at a moment in a segment (0.68–1). */
function orbScale(seg: Segment, at: number, prev: number): number {
  const p = at / seg.secs;
  switch (seg.kind) {
    case "in":
      return LO + (HI - LO) * ease(p);
    case "out":
      return HI - (HI - LO) * ease(p);
    case "hold":
      return prev;
    case "pump":
      // A quick squeeze on the exhale, then the passive refill.
      return 0.92 - 0.16 * Math.sin(Math.PI * Math.min(1, p * 2.2)) * (p < 0.46 ? 1 : 0);
    case "rest":
      return 0.84 + 0.08 * Math.sin((2 * Math.PI * at) / 8 - Math.PI / 2);
    case "ready":
      return 0.86;
  }
}

export interface BreathLaunch {
  technique: Technique;
  /** Start straight in the session (e.g. started from today's plan). */
  skipSetup?: boolean;
  minutes?: number;
  /** Shown in the header when started from an activity. */
  eyebrow?: string;
}

/**
 * The interactive breathing player: a short setup (length, options and, for fast
 * techniques, a safety check that must be confirmed), then the session itself with
 * the orb, a progress ring, spoken cues, a soft beat for fast techniques, an ocean
 * or hum tone for Ujjayi and Bhramari, and the calm music loop underneath.
 */
export function BreathPlayer({
  launch,
  categories,
  onClose,
  onComplete,
  onOpenGuide,
}: {
  launch: BreathLaunch;
  categories: readonly CategoryId[];
  onClose: () => void;
  onComplete: (origin?: { x: number; y: number }) => void;
  onOpenGuide?: () => void;
}) {
  const t = launch.technique;
  const holdBlocked = categories.includes("bp") || categories.includes("fertility");
  const [stage, setStage] = useState<"setup" | "session">(launch.skipSetup && !t.fast ? "session" : "setup");
  const [opts, setOpts] = useState<Options>({
    minutes: launch.minutes ?? t.defaultMinutes,
    hold: false,
    reps: t.id === "kapalbhati" ? 20 : 10,
    rounds: 3,
    guide: loadGuideLevel(),
  });
  const [safe, setSafe] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const audio = useRef<BreathAudio | null>(null);
  const reduced = useReducedMotion();

  // One audio engine for the whole dialog, created on the opening tap.
  useEffect(() => {
    const a = new BreathAudio();
    a.init();
    a.resume();
    audio.current = a;
    return () => {
      a.dispose();
      audio.current = null;
    };
  }, []);

  // Dialog focus handling.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const main = document.getElementById("app-main");
    main?.setAttribute("inert", "");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
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

  useEffect(() => {
    panel.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, [stage]);

  return createPortal(
    <motion.div
      ref={panel}
      className={`guided breath-player breath-${t.id}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="breath-title"
      tabIndex={-1}
      onPointerDown={() => audio.current?.resume()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.15 : 0.45 }}
    >
      <SmartImage slot={t.image} fill scrim="full" className="guided-bg" />
      <AnimatePresence mode="wait" initial={false}>
        {stage === "setup" ? (
          <Setup
            key="setup"
            t={t}
            opts={opts}
            setOpts={setOpts}
            holdBlocked={holdBlocked}
            safe={safe}
            setSafe={setSafe}
            onClose={onClose}
            onOpenGuide={onOpenGuide}
            onStart={() => {
              audio.current?.resume();
              haptics.tap();
              setStage("session");
            }}
          />
        ) : (
          <Session key="session" t={t} opts={opts} eyebrow={launch.eyebrow} audio={audio} onClose={onClose} onComplete={onComplete} />
        )}
      </AnimatePresence>
    </motion.div>,
    document.body,
  );
}

function Setup({
  t,
  opts,
  setOpts,
  holdBlocked,
  safe,
  setSafe,
  onClose,
  onStart,
  onOpenGuide,
}: {
  t: Technique;
  opts: Options;
  setOpts: (fn: (o: Options) => Options) => void;
  holdBlocked: boolean;
  safe: boolean;
  setSafe: (v: boolean) => void;
  onClose: () => void;
  onStart: () => void;
  onOpenGuide?: () => void;
}) {
  const total = programSeconds(program(t, opts));
  const canStart = !t.fast || safe;
  return (
    <motion.div className="guided-inner breath-setup" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
      <header className="guided-head">
        <div>
          <p className="eyebrow guided-eyebrow">
            {t.emoji} {t.aka}
          </p>
          <h2 id="breath-title" className="display guided-title">
            {t.name}
          </h2>
        </div>
        <div className="guided-head-actions">
          <button type="button" className="icon-btn icon-btn-light" onClick={onClose} aria-label="Close" data-autofocus>
            <Close />
          </button>
        </div>
      </header>

      <div className="breath-setup-body glass">
        <p className="breath-tagline">{t.tagline}</p>
        <p className="breath-meta">
          <span className={`ev-tag ev-${t.evidence}`}>{BREATH_EVIDENCE_LABEL[t.evidence]}</span> Best: {t.bestTime}
        </p>
        <ol className="breath-how">
          {t.how.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ol>

        <HandPoseCard id={t.id} light />

        {t.lengths && (
          <div className="breath-opt" role="radiogroup" aria-label="Session length">
            <span className="breath-opt-label">Length</span>
            {t.lengths.map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={opts.minutes === m}
                className={`chip chip-light ${opts.minutes === m ? "chip-on" : ""}`}
                onClick={() => {
                  haptics.select();
                  setOpts((o) => ({ ...o, minutes: m }));
                }}
              >
                {m} min
              </button>
            ))}
          </div>
        )}

        {t.fast && (
          <div className="breath-opt" role="radiogroup" aria-label={t.id === "kapalbhati" ? "Exhales per round" : "Breaths per round"}>
            <span className="breath-opt-label">Per round</span>
            {(t.id === "kapalbhati" ? [20, 30] : [10, 15]).map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={opts.reps === n}
                className={`chip chip-light ${opts.reps === n ? "chip-on" : ""}`}
                onClick={() => {
                  haptics.select();
                  setOpts((o) => ({ ...o, reps: n }));
                }}
              >
                {n} {n === 20 || n === 10 ? "· beginner" : "· practised"}
              </button>
            ))}
          </div>
        )}

        {t.fast && (
          <div className="breath-opt" role="radiogroup" aria-label="Rounds">
            <span className="breath-opt-label">Rounds</span>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={opts.rounds === n}
                className={`chip chip-light ${opts.rounds === n ? "chip-on" : ""}`}
                onClick={() => {
                  haptics.select();
                  setOpts((o) => ({ ...o, rounds: n }));
                }}
              >
                {n} {n === 1 ? "round" : "rounds"}
              </button>
            ))}
          </div>
        )}

        {t.id === "nadi-shodhana" && (
          <label className={`breath-check ${holdBlocked ? "is-off" : ""}`}>
            <input
              type="checkbox"
              checked={!!opts.hold && !holdBlocked}
              disabled={holdBlocked}
              onChange={(e) => setOpts((o) => ({ ...o, hold: e.target.checked }))}
            />
            <span>
              Add a gentle 4-second hold after each inhale (experienced only)
              {holdBlocked && <em> · Turned off for your blood-pressure or fertility focus</em>}
            </span>
          </label>
        )}

        {!t.fast && (
          <>
            <div className="breath-opt breath-guide-level" role="radiogroup" aria-label="Voice guide">
              <span className="breath-opt-label">Voice</span>
              {GUIDE_LEVELS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  role="radio"
                  aria-checked={opts.guide === g.id}
                  className={`chip chip-light ${opts.guide === g.id ? "chip-on" : ""}`}
                  onClick={() => {
                    haptics.select();
                    saveGuideLevel(g.id);
                    setOpts((o) => ({ ...o, guide: g.id }));
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <p className="breath-guide-hint">{GUIDE_LEVELS.find((g) => g.id === opts.guide)?.hint}</p>
          </>
        )}

        {t.fast && (
          <div className="breath-safety" role="group" aria-labelledby="breath-safety-h">
            <p id="breath-safety-h" className="breath-safety-h">
              <Info size={16} /> Before you start: skip this if any apply
            </p>
            <ul>
              {t.avoid.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <label className="breath-check">
              <input type="checkbox" checked={safe} onChange={(e) => setSafe(e.target.checked)} />
              <span>None of these apply to me, and my stomach is empty.</span>
            </label>
          </div>
        )}

        <PracticeTime t={t} light />

        <p className="breath-small">
          <Info size={14} /> {BREATH_SAFETY_ALL[0]} {BREATH_SAFETY_ALL[1]}
        </p>
        {onOpenGuide && (
          <button type="button" className="link-btn breath-guide-link" onClick={onOpenGuide}>
            Benefits, best time and when not to do it <ArrowRight size={14} />
          </button>
        )}
      </div>

      <footer className="guided-actions">
        <MagneticButton variant="light" size="lg" onClick={onStart} disabled={!canStart} aria-describedby={t.fast && !safe ? "breath-safety-h" : undefined}>
          <Play size={18} /> Start · {formatDuration(total)}
        </MagneticButton>
      </footer>
    </motion.div>
  );
}

function Session({
  t,
  opts,
  eyebrow,
  audio,
  onClose,
  onComplete,
}: {
  t: Technique;
  opts: Options;
  eyebrow?: string;
  audio: React.MutableRefObject<BreathAudio | null>;
  onClose: () => void;
  onComplete: (origin?: { x: number; y: number }) => void;
}) {
  const burst = useLightBurst();
  const segs = useMemo(() => program(t, opts), [t, opts]);
  const starts = useMemo(() => segs.reduce<number[]>((acc, _s, i) => (acc.push(i ? acc[i - 1] + segs[i - 1].secs : 0), acc), []), [segs]);
  const total = programSeconds(segs);
  // 3… 2… 1… Start before the clock runs (only when the session opens, not on resume).
  const [countdown, setCountdown] = useState<number | null>(3);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [segIndex, setSegIndex] = useState(0);
  const [part, setPart] = useState<"belly" | "ribs" | "chest">("belly");
  const [sound, setSound] = useState<AudioSettings>(loadAudioSettings);
  const soundRef = useRef(sound);
  soundRef.current = sound;
  const acc = useRef(0);
  const since = useRef(performance.now());
  const ringRef = useRef<SVGCircleElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const doneBtn = useRef<HTMLButtonElement>(null);
  const spoken = useRef("");
  const lastSeg = useRef(-1);
  const resumeAt = useRef(0);
  const lastScale = useRef(LO);
  const finished = elapsed >= total;
  const seg = segs[Math.min(segIndex, segs.length - 1)];

  useEffect(() => {
    audio.current?.music(sound.music && running && !finished);
  }, [audio, sound.music, running, finished]);

  useEffect(() => {
    if (!running || finished) audio.current?.toneLevel(null, 0);
  }, [audio, running, finished]);

  const setSoundPref = (patch: Partial<AudioSettings>) => {
    audio.current?.resume();
    haptics.tap();
    setSound((s) => {
      const next = { ...s, ...patch };
      saveAudioSettings(next);
      return next;
    });
  };

  useEffect(() => {
    if (countdown === null) return;
    const a = audio.current;
    if (countdown > 0) {
      if (soundRef.current.voice) a?.say(`n${countdown}` as ClipName);
      haptics.tap();
    } else {
      a?.chime();
    }
    const id = window.setTimeout(() => {
      if (countdown > 0) setCountdown(countdown - 1);
      else {
        setCountdown(null);
        setRunning(true);
      }
    }, 1000);
    return () => window.clearTimeout(id);
  }, [countdown, audio]);

  // The clock: timestamp-based, so it stays right if the tab sleeps.
  useEffect(() => {
    if (!running || finished) return;
    since.current = performance.now();
    let raf = 0;
    let lastSec = -1;
    let i = resumeAt.current;
    const tick = () => {
      const e = Math.min(total, acc.current + (performance.now() - since.current) / 1000);
      ringRef.current?.style.setProperty("stroke-dashoffset", String(RING_C * (1 - e / total)));
      while (i < segs.length - 1 && e >= starts[i + 1]) i++;
      while (i > 0 && e < starts[i]) i--;
      const s = segs[i];
      const at = e - starts[i];
      const a = audio.current;
      const voice = soundRef.current.voice;

      if (i !== lastSeg.current) {
        lastSeg.current = i;
        setSegIndex(i);
        if (a) {
          if (s.say && voice) a.say(s.say);
          if (s.beat) a.beat(s.beat);
          if (s.kind === "ready" || (s.kind === "rest" && i === segs.length - 1)) a.chime();
          if (s.tone === "ocean") a.toneLevel("ocean", s.kind === "in" ? 0.9 : 1, s.secs * 0.85, s.kind === "in" ? 0.8 : 0.35);
          else if (s.tone === "hum") a.toneLevel("hum", 1, 0.6);
          else if (segs.some((x) => x.tone)) a.toneLevel(segs.some((x) => x.tone === "ocean") ? "ocean" : "hum", s.kind === "in" ? 0.25 : 0, 0.6, 0.5);
        }
        if (!t.fast && (s.kind === "in" || s.kind === "out")) haptics.tap();
      }

      // Spoken extras: the Dirga parts and the countdown after the opening cue.
      if (a && voice && e < total) {
        for (const [when, clip] of s.cues ?? []) {
          const key = `${i}:cue:${when}`;
          if (at >= when && at < when + 0.6 && spoken.current !== key && a.say(clip)) spoken.current = key;
        }
        if (s.count) {
          const sec = Math.floor(at);
          const wait = Math.max(1, Math.ceil((s.say ? a.duration(s.say as ClipName) : 0) + 0.15));
          const n = Math.ceil(s.secs - sec);
          const key = `${i}:n:${sec}`;
          if (sec >= wait && n >= 1 && n <= 10 && spoken.current !== key) {
            if (a.say(`n${n}` as ClipName) || at - sec > 0.5) spoken.current = key;
          }
        }
      }

      const sc = orbScale(s, at, lastScale.current);
      if (s.kind !== "hold") lastScale.current = sc;
      orbRef.current?.style.setProperty("transform", `scale(${sc.toFixed(4)})`);
      if (t.id === "dirga") setPart(dirgaPart(s, at));

      const sec = Math.floor(e);
      if (sec !== lastSec) {
        lastSec = sec;
        setElapsed(e);
      }
      if (e < total) raf = requestAnimationFrame(tick);
      else setElapsed(total);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      acc.current = Math.min(total, acc.current + (performance.now() - since.current) / 1000);
      resumeAt.current = i;
      lastSeg.current = -1; // re-announce the current segment on resume
    };
  }, [running, finished, total, segs, starts, audio, t.fast, t.id]);

  // Celebrate the natural end.
  useEffect(() => {
    if (!finished) return;
    haptics.success();
    if (soundRef.current.voice) audio.current?.say("done");
    audio.current?.chime();
    const r = doneBtn.current?.getBoundingClientRect();
    if (r) burst({ x: r.left + r.width / 2, y: r.top, mode: "rise", count: 50 });
    doneBtn.current?.focus();
  }, [finished, burst, audio]);

  // Keep the screen awake.
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

  const toggle = () => {
    haptics.tap();
    audio.current?.resume();
    setRunning((r) => !r);
  };

  const segLeft = Math.max(0, Math.ceil(seg.secs - (elapsed - starts[Math.min(segIndex, segs.length - 1)])));

  return (
    <motion.div className="guided-inner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <header className="guided-head">
        <div>
          <p className="eyebrow guided-eyebrow">{eyebrow ?? `${t.emoji} Guided breathing`}</p>
          <h2 id="breath-title" className="display guided-title">
            {t.name}
          </h2>
        </div>
        <div className="guided-head-actions">
          <button
            type="button"
            className="icon-btn icon-btn-light"
            onClick={() => setSoundPref({ voice: !sound.voice })}
            aria-pressed={sound.voice}
            aria-label={sound.voice ? "Turn voice guidance off" : "Turn voice guidance on"}
            title={sound.voice ? "Voice on" : "Voice off"}
          >
            <Voice off={!sound.voice} />
          </button>
          <button
            type="button"
            className="icon-btn icon-btn-light"
            onClick={() => setSoundPref({ music: !sound.music })}
            aria-pressed={sound.music}
            aria-label={sound.music ? "Turn background music off" : "Turn background music on"}
            title={sound.music ? "Music on" : "Music off"}
          >
            <Music off={!sound.music} />
          </button>
          <button type="button" className="icon-btn icon-btn-light" onClick={onClose} aria-label="Close breathing session" data-autofocus>
            <Close />
          </button>
        </div>
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
          <div ref={orbRef} className="breath-orb" style={{ transform: `scale(${LO})` }}>
            <BreathingOrb size="100%" breathing={false} interactive={false} />
          </div>
          {countdown !== null && (
            <div className="breath-countdown" role="status" aria-live="assertive">
              <span key={countdown} className="breath-countdown-n">
                {countdown > 0 ? countdown : "Start"}
              </span>
            </div>
          )}
          {seg.side && !finished && (
            <div className="nostrils" aria-hidden="true">
              <span className={`nostril ${seg.side === "left" ? "on" : ""}`}>L</span>
              <span className={`nostril ${seg.side === "right" ? "on" : ""}`}>R</span>
            </div>
          )}
        </div>
        <div className="guided-readout">
          <span className="guided-time" role="timer" aria-live="off">
            {finished ? "Complete" : formatDuration(total - elapsed)}
          </span>
          {!finished && (
            <span className="guided-cue breath-cue" aria-live="polite">
              {countdown !== null ? "Get ready" : running ? seg.label : "Paused"}
              {running && !t.fast && seg.kind !== "rest" && <span className="breath-left"> · {segLeft}</span>}
            </span>
          )}
          {!finished && seg.round && (
            <span className="breath-round">
              Round {seg.round} of {seg.rounds}
              {seg.rep ? ` · ${seg.rep} / ${seg.reps}` : ""}
            </span>
          )}
          {t.id === "dirga" && !finished && (
            <span className="dirga-parts" aria-hidden="true">
              {(["belly", "ribs", "chest"] as const).map((p) => (
                <span key={p} className={`dirga-part ${part === p ? "on" : ""}`}>
                  {p}
                </span>
              ))}
            </span>
          )}
        </div>
      </div>

      <footer className="guided-actions">
        {!finished && countdown === null && (
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
    </motion.div>
  );
}
