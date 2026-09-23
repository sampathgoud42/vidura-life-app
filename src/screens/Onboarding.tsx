import { AnimatePresence, LayoutGroup, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { BreathingOrb } from "../components/BreathingOrb";
import { MagneticButton } from "../components/Controls";
import { ArrowLeft, ArrowRight } from "../components/Icons";
import { InputLine, type LineState } from "../components/InputLine";
import { useLightBurst } from "../components/LightBurst";
import { Display, TypeIn } from "../components/Typography";
import { APP, MESSAGES } from "../data/content";
import { haptics } from "../lib/device";
import { saveContact } from "../lib/remote";
import { EMAIL_HINTS, NAME_HINTS, NAME_MAX, graphemeLength, validateEmail, validateName } from "../lib/validation";
import { useApp } from "../state/AppState";

type Step = "name" | "email" | "welcome";

const SHAKE = { x: [0, -9, 8, -6, 4, -2, 0], transition: { duration: 0.45 } };

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setV(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { createProfile } = useApp();
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <LayoutGroup>
      <main className="screen onboarding" id="app-main">
        <AnimatePresence mode="popLayout" initial={false}>
          {step === "name" && (
            <motion.div key="name" className="onb-stage" exit={{ opacity: 0, transition: { duration: 0.35 } }}>
              <NameStep
                initial={name}
                onNext={(v) => {
                  setName(v);
                  setStep("email");
                }}
              />
            </motion.div>
          )}
          {step === "email" && (
            <motion.div key="email" className="onb-stage" exit={{ opacity: 0, transition: { duration: 0.3 } }}>
              <EmailStep
                name={name}
                initial={email}
                onBack={() => setStep("name")}
                onNext={(v) => {
                  setEmail(v);
                  createProfile(name, v);
                  void saveContact({ name, email: v }); // optional: silent if it can't be saved
                  setStep("welcome");
                }}
              />
            </motion.div>
          )}
          {step === "welcome" && (
            <motion.div key="welcome" className="onb-stage" exit={{ opacity: 0, transition: { duration: 0.4 } }}>
              <WelcomeReveal name={name} onDone={onDone} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </LayoutGroup>
  );
}

// ── 1 · Name ──────────────────────────────────────────────────────────────────
function NameStep({ initial, onNext }: { initial: string; onNext: (name: string) => void }) {
  const [value, setValue] = useState(initial);
  const [focused, setFocused] = useState(false);
  const [hint, setHint] = useState("");
  const [leaving, setLeaving] = useState(false);
  const shake = useAnimationControls();
  const reduced = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const len = graphemeLength(value.trim());

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), reduced ? 50 : 900);
    return () => window.clearTimeout(t);
  }, [reduced]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (leaving) return;
    const r = validateName(value);
    if (!r.ok) {
      setHint(NAME_HINTS[r.reason]);
      haptics.warn();
      if (!reduced) shake.start(SHAKE);
      inputRef.current?.focus();
      return;
    }
    setHint("");
    haptics.success();
    // Swap the input for a measurable text node first, so the name can morph into the next header.
    setValue(r.value);
    setLeaving(true);
    window.setTimeout(() => onNext(r.value), reduced ? 0 : 60);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    if (e.key === "ArrowRight" && el.selectionStart === el.value.length && el.selectionEnd === el.value.length && value.trim()) {
      e.preventDefault();
      submit();
    }
  };

  const state: LineState = hint ? "invalid" : focused || value ? "focus" : "idle";

  return (
    <motion.section
      className="onb-step"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      aria-labelledby="name-q"
    >
      <BreathingOrb layoutId="orb" size="clamp(170px, 46vw, 260px)" className="onb-orb" />
      <TypeIn id="name-q" text="How should I call you?" className="display onb-question" />
      <motion.form className="onb-form" onSubmit={submit} animate={shake} noValidate>
        <label htmlFor="name-input" className="sr-only">
          Your name
        </label>
        <div className="onb-field">
          {leaving ? (
            <motion.span layoutId="name-text" className="onb-input onb-input-ghost">
              {value.trim()}
            </motion.span>
          ) : (
            <input
              ref={inputRef}
              id="name-input"
              className="onb-input"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (hint) setHint("");
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={onKeyDown}
              autoComplete="given-name"
              autoCapitalize="words"
              enterKeyHint="next"
              spellCheck={false}
              placeholder="Your name"
              aria-describedby="name-hint"
              aria-invalid={!!hint}
            />
          )}
          <InputLine state={state} />
          <MagneticButton type="submit" variant="soft" className="onb-next" aria-label="Continue">
            <ArrowRight />
          </MagneticButton>
        </div>
        <p id="name-hint" className="onb-hint" role="status" aria-live="polite">
          {hint || (len > NAME_MAX - 6 ? `${len}/${NAME_MAX}` : " ")}
        </p>
      </motion.form>
    </motion.section>
  );
}

// ── 2 · Email ─────────────────────────────────────────────────────────────────
function EmailStep({ name, initial, onBack, onNext }: { name: string; initial: string; onBack: () => void; onNext: (email: string) => void }) {
  const [value, setValue] = useState(initial);
  const [focused, setFocused] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const shake = useAnimationControls();
  const reduced = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounced = useDebounced(value, 300);
  const live = validateEmail(debounced);
  const now = validateEmail(value);

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), reduced ? 50 : 650);
    return () => window.clearTimeout(t);
  }, [reduced]);

  // Live state follows the debounced value (300 ms): a typo only reads as "invalid"
  // once typing pauses. After a submit attempt, feedback is immediate.
  const settled = debounced === value;
  let state: LineState = focused || value ? "focus" : "idle";
  let hint = "";
  if (settled && live.ok) state = "valid";
  else if ((settled || attempted) && !now.ok && now.reason === "format") {
    state = "invalid";
    hint = EMAIL_HINTS.format;
  } else if (attempted && !now.ok && now.reason === "empty") {
    state = "invalid";
    hint = EMAIL_HINTS.empty;
  }

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    setAttempted(true);
    if (!now.ok) {
      haptics.warn();
      if (!reduced) shake.start(SHAKE);
      inputRef.current?.focus();
      return;
    }
    haptics.success();
    onNext(now.value);
  };

  return (
    <motion.section className="onb-step onb-step-email" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }} aria-labelledby="email-q">
      <div className="onb-greeting" aria-live="polite">
        <BreathingOrb layoutId="orb" size={64} className="onb-orb-sm" />
        <p className="display onb-hi">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
            Hi,
          </motion.span>
          <motion.span layoutId="name-text" className="onb-hi-name">
            {name}
          </motion.span>
        </p>
      </div>

      <motion.div
        className="onb-rise"
        initial={reduced ? { opacity: 0 } : { y: 90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={reduced ? { duration: 0.3 } : { type: "spring", stiffness: 150, damping: 20, delay: 0.18 }}
      >
        <TypeIn id="email-q" as="h1" text="And your email?" className="display onb-question" delay={500} />
        <p className="onb-sub">So I can recognise you next time. {APP.privacyNote}</p>
        <motion.form className="onb-form" onSubmit={submit} animate={shake} noValidate>
          <label htmlFor="email-input" className="sr-only">
            Email address
          </label>
          <div className="onb-field">
            <input
              ref={inputRef}
              id="email-input"
              className="onb-input onb-input-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="go"
              placeholder="name@example.com"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              aria-describedby="email-hint"
              aria-invalid={state === "invalid"}
            />
            <InputLine state={state} />
            <MagneticButton type="submit" variant={state === "valid" ? "primary" : "soft"} className="onb-next" aria-label="Continue">
              <ArrowRight />
            </MagneticButton>
          </div>
          <p id="email-hint" className="onb-hint" role="status" aria-live="polite">
            {hint || (state === "valid" ? "Lovely, that works." : " ")}
          </p>
        </motion.form>
        <button type="button" className="link-btn onb-back" onClick={onBack}>
          <ArrowLeft size={16} /> Change name
        </button>
      </motion.div>
    </motion.section>
  );
}

// ── 3 · Welcome ───────────────────────────────────────────────────────────────
export function WelcomeReveal({ name, onDone, returning = false, greeting }: { name: string; onDone: () => void; returning?: boolean; greeting?: string }) {
  const reduced = useReducedMotion();
  const burst = useLightBurst();
  const orbWrap = useRef<HTMLDivElement>(null);
  const [message] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
  const [bloom, setBloom] = useState(!returning);
  const started = useRef(performance.now());
  const doneRef = useRef(false);
  const continueRef = useRef<HTMLButtonElement>(null);
  const HOLD = returning ? 2800 : 3000;
  const REVEAL = reduced ? 400 : returning ? 900 : 1500;

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  useEffect(() => {
    continueRef.current?.focus({ preventScroll: true });
    if (!returning) {
      const b = window.setTimeout(() => {
        const r = orbWrap.current?.getBoundingClientRect();
        if (r) burst({ x: r.left + r.width / 2, y: r.top + r.height / 2, mode: "radial" });
        haptics.success();
      }, 380);
      const s = window.setTimeout(() => setBloom(false), 1300);
      const t = window.setTimeout(finish, REVEAL + HOLD);
      return () => [b, s, t].forEach(window.clearTimeout);
    }
    const t = window.setTimeout(finish, REVEAL + HOLD);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skip = () => performance.now() - started.current > 450 && finish();

  return (
    <motion.section
      className="onb-step welcome"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
      onClick={skip}
    >
      <div ref={orbWrap} className="welcome-orb">
        <BreathingOrb layoutId="orb" size="clamp(150px, 40vw, 220px)" bloom={bloom} />
      </div>
      <div className="welcome-copy" aria-live="polite">
        {greeting && (
          <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            {greeting}
          </motion.p>
        )}
        <Display as="h1" className="welcome-title" delay={reduced ? 0 : returning ? 0.2 : 0.7}>
          {returning ? (
            <>
              Welcome back, <span className="welcome-name">{name}</span>
            </>
          ) : (
            <>
              Welcome to {APP.name}, <span className="welcome-name">{name}</span>
            </>
          )}
        </Display>
        <motion.p
          className="welcome-message"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: REVEAL / 1000, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="welcome-message-text">{message.text}</span>
          <span className="welcome-message-sub">{message.sub}</span>
        </motion.p>
      </div>
      <div className="welcome-progress" aria-hidden="true">
        <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: REVEAL / 1000, duration: HOLD / 1000, ease: "linear" }} />
      </div>
      <button ref={continueRef} type="button" className="welcome-tap" onClick={(e) => (e.stopPropagation(), finish())}>
        Tap anywhere to continue
      </button>
    </motion.section>
  );
}
