import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, type CSSProperties } from "react";
import type { BreathPattern } from "../data/content";
import { livePalette } from "../lib/livePalette";
import { oklabToRgb, rgbCss } from "../lib/palette";

interface OrbProps {
  size?: number | string;
  /** Default: 6 breaths per minute (5 s in, 5 s out). */
  breath?: BreathPattern;
  breathing?: boolean;
  bloom?: boolean;
  interactive?: boolean;
  layoutId?: string;
  className?: string;
  style?: CSSProperties;
}

const SIX_BPM: BreathPattern = { inhale: 5, exhale: 5 };
const clamp = (v: number) => Math.max(-1, Math.min(1, v));

/**
 * The brand element: a soft 3D-feeling sphere built from layered CSS
 * gradients (no WebGL), breathing at 6 breaths/min, with gentle pointer
 * and touch parallax. Colours follow the live sky palette.
 */
export function BreathingOrb({
  size = 220,
  breath = SIX_BPM,
  breathing = true,
  bloom = false,
  interactive = true,
  layoutId,
  className = "",
  style,
}: OrbProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 55, damping: 16, mass: 0.9 });
  const sy = useSpring(my, { stiffness: 55, damping: 16, mass: 0.9 });
  const bodyX = useTransform(sx, (v) => v * 9);
  const bodyY = useTransform(sy, (v) => v * 9);
  const specX = useTransform(sx, (v) => v * -12);
  const specY = useTransform(sy, (v) => v * -12);
  const haloX = useTransform(sx, (v) => v * 16);
  const haloY = useTransform(sy, (v) => v * 16);

  // Tint from the live (crossfading) palette.
  useEffect(() => {
    const write = () => {
      const el = ref.current;
      if (!el) return;
      livePalette.get().orb.forEach((c, i) => el.style.setProperty(`--orb-${i + 1}`, rgbCss(oklabToRgb(c))));
    };
    write();
    return livePalette.subscribe(write);
  }, []);

  useEffect(() => {
    if (!interactive || reduced) return;
    let raf = 0;
    let last: PointerEvent | null = null;
    const apply = () => {
      raf = 0;
      const el = ref.current;
      if (!el || !last) return;
      const r = el.getBoundingClientRect();
      mx.set(clamp((last.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
      my.set(clamp((last.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const reset = () => {
      mx.set(0);
      my.set(0);
    };
    const onUp = (e: PointerEvent) => e.pointerType !== "mouse" && reset();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", reset);
    };
  }, [interactive, reduced, mx, my]);

  const hold = breath.hold ?? 0;
  const total = breath.inhale + hold + breath.exhale;
  const times = [0, breath.inhale / total, (breath.inhale + hold) / total, 1];
  const live = breathing && !reduced;
  const cycle = { duration: total, times, ease: "easeInOut" as const, repeat: Infinity };

  return (
    <motion.div
      ref={ref}
      layoutId={layoutId}
      className={`orb ${className}`}
      style={{ width: size, height: size, ...style }}
      aria-hidden="true"
    >
      <motion.div
        className="orb-halo"
        style={{ x: haloX, y: haloY }}
        animate={
          bloom
            ? { scale: 2.1, opacity: 1 }
            : live
              ? { scale: [1, 1.14, 1.14, 1], opacity: [0.5, 0.9, 0.9, 0.5] }
              : { scale: 1, opacity: 0.65 }
        }
        transition={bloom ? { duration: 1.1, ease: [0.22, 1, 0.36, 1] } : live ? cycle : { duration: 0.6 }}
      />
      <motion.div
        className="orb-body"
        style={{ x: bodyX, y: bodyY }}
        animate={bloom ? { scale: 1.3 } : live ? { scale: [0.94, 1.06, 1.06, 0.94] } : { scale: 1 }}
        transition={bloom ? { type: "spring", stiffness: 70, damping: 11 } : live ? cycle : { duration: 0.6 }}
      >
        <div className="orb-core" />
        <div className="orb-aurora" />
        <div className="orb-caustic" />
        <motion.div className="orb-spec" style={{ x: specX, y: specY, rotate: -24 }} />
        <div className="orb-rim" />
      </motion.div>
    </motion.div>
  );
}
