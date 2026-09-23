import { motion, useMotionValue, useReducedMotion, useSpring, type HTMLMotionProps } from "framer-motion";
import { forwardRef, useCallback, useRef, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { canHover, haptics } from "../lib/device";

type Variant = "primary" | "soft" | "ghost" | "danger" | "light" | "glassy";

interface MagneticProps extends HTMLMotionProps<"button"> {
  variant?: Variant;
  strength?: number;
  size?: "md" | "lg" | "sm";
}

const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));

/** A button that leans towards a fine pointer, springs back, and taps haptically on touch. */
export const MagneticButton = forwardRef<HTMLButtonElement, MagneticProps>(function MagneticButton(
  { variant = "primary", strength = 0.3, size = "md", className = "", onClick, onPointerMove, onPointerLeave, children, type = "button", ...rest },
  ref,
) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 320, damping: 17, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 320, damping: 17, mass: 0.35 });

  const move = (e: PointerEvent<HTMLButtonElement>) => {
    onPointerMove?.(e);
    if (reduced || e.pointerType !== "mouse" || !canHover()) return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set(clamp((e.clientX - (r.left + r.width / 2)) * strength, 10));
    y.set(clamp((e.clientY - (r.top + r.height / 2)) * strength, 8));
  };
  const leave = (e: PointerEvent<HTMLButtonElement>) => {
    onPointerLeave?.(e);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      className={`btn btn-${variant} btn-${size} ${className}`}
      style={{ x: sx, y: sy }}
      whileTap={reduced ? undefined : { scale: 0.96 }}
      onPointerMove={move}
      onPointerLeave={leave}
      onClick={(e) => {
        haptics.tap();
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </motion.button>
  );
});

interface GlassProps extends HTMLMotionProps<"div"> {
  glow?: boolean;
  strong?: boolean;
}

/** Frosted card with a soft glow that follows a fine pointer. */
export const GlassCard = forwardRef<HTMLDivElement, GlassProps>(function GlassCard(
  { glow = true, strong = false, className = "", onPointerMove, children, ...rest },
  ref,
) {
  return (
    <motion.div
      ref={ref}
      className={`${strong ? "glass-strong" : "glass"} ${glow ? "glow" : ""} ${className}`}
      onPointerMove={(e) => {
        onPointerMove?.(e);
        if (!glow || e.pointerType !== "mouse") return;
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
});

export function Chip({
  selected,
  onClick,
  children,
  className = "",
  ...rest
}: { selected?: boolean; onClick?: () => void; children: ReactNode; className?: string } & Omit<HTMLMotionProps<"button">, "onClick" | "children">) {
  return (
    <motion.button
      type="button"
      className={`chip ${selected ? "chip-on" : ""} ${className}`}
      aria-pressed={selected}
      onClick={() => {
        haptics.select();
        onClick?.();
      }}
      whileTap={{ scale: 0.95 }}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

interface ChoiceOption<T extends string> {
  id: T;
  label: string;
  sub?: string;
  emoji?: string;
}

/** Accessible single-choice group (radio semantics, roving tabindex, arrow keys). */
export function ChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  className = "",
  compact = false,
}: {
  label: string;
  options: readonly ChoiceOption<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  compact?: boolean;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const idx = Math.max(0, options.findIndex((o) => o.id === value));

  const onKey = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
      const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      const next = (i + dir + options.length) % options.length;
      onChange(options[next].id);
      refs.current[next]?.focus();
      haptics.select();
    },
    [options, onChange],
  );

  return (
    <div role="radiogroup" aria-label={label} className={`choice-group ${compact ? "choice-compact" : ""} ${className}`}>
      {options.map((o, i) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={i === idx ? 0 : -1}
            className={`choice ${on ? "choice-on" : ""}`}
            onClick={() => {
              haptics.select();
              onChange(o.id);
            }}
            onKeyDown={(e) => onKey(e, i)}
          >
            {o.emoji && (
              <span className="choice-emoji" aria-hidden="true">
                {o.emoji}
              </span>
            )}
            <span className="choice-text">
              <span className="choice-label">{o.label}</span>
              {o.sub && !compact && <span className="choice-sub">{o.sub}</span>}
            </span>
            {on && (
              <motion.span layoutId={`choice-dot-${label}`} className="choice-dot" aria-hidden="true" transition={{ type: "spring", stiffness: 500, damping: 34 }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Segmented control. `tabs` mode switches a panel (tablist / tab / tabpanel,
 * arrow keys move and select); `radio` mode is a small single choice.
 */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  mode = "radio",
  idPrefix,
  className = "",
}: {
  label: string;
  options: readonly { id: T; label: string; emoji?: string }[];
  value: T;
  onChange: (v: T) => void;
  mode?: "tabs" | "radio";
  idPrefix?: string;
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + options.length) % options.length;
    onChange(options[next].id);
    refs.current[next]?.focus();
    haptics.select();
  };
  const tabs = mode === "tabs";
  return (
    <div role={tabs ? "tablist" : "radiogroup"} aria-label={label} className={`segmented ${className}`}>
      {options.map((o, i) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role={tabs ? "tab" : "radio"}
            id={idPrefix ? `${idPrefix}-tab-${o.id}` : undefined}
            aria-controls={tabs && idPrefix ? `${idPrefix}-panel` : undefined}
            {...(tabs ? { "aria-selected": on } : { "aria-checked": on })}
            tabIndex={on ? 0 : -1}
            className={`segment ${on ? "segment-on" : ""}`}
            onClick={() => {
              if (on) return;
              haptics.select();
              onChange(o.id);
            }}
            onKeyDown={(e) => onKey(e, i)}
          >
            {on && <motion.span layoutId={`seg-${label}`} className="segment-pill" transition={{ type: "spring", stiffness: 480, damping: 36 }} />}
            {o.emoji && (
              <span className="segment-emoji" aria-hidden="true">
                {o.emoji}
              </span>
            )}
            <span className="segment-label">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
