import { motion, useReducedMotion } from "framer-motion";

export type LineState = "idle" | "focus" | "invalid" | "valid";

/**
 * Animated underline for the borderless onboarding inputs. On success the
 * line gathers into its right end and a checkmark draws itself there.
 */
export function InputLine({ state }: { state: LineState }) {
  const reduced = useReducedMotion();
  const valid = state === "valid";
  const t = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 260, damping: 30 };

  return (
    <div className="input-line" data-state={state} aria-hidden="true">
      <motion.span className="input-line-base" animate={{ scaleX: valid ? 0 : 1, opacity: valid ? 0 : 1 }} style={{ originX: 1 }} transition={t} />
      <motion.span
        className="input-line-fill"
        initial={false}
        animate={{ scaleX: state === "idle" || valid ? 0 : 1 }}
        style={{ originX: valid ? 1 : 0 }}
        transition={t}
      />
      <svg className="input-check" viewBox="0 0 24 24" width="28" height="28">
        <motion.path
          d="M4 12.5l5.2 5.2L20.5 6.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: valid ? 1 : 0, opacity: valid ? 1 : 0 }}
          transition={reduced ? { duration: 0 } : { pathLength: { delay: valid ? 0.22 : 0, duration: 0.5, ease: [0.65, 0, 0.35, 1] }, opacity: { duration: 0.15, delay: valid ? 0.2 : 0 } }}
        />
      </svg>
    </div>
  );
}
