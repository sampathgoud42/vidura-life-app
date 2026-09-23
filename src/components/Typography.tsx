import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

interface TypeInProps {
  text: string;
  as?: ElementType;
  className?: string;
  id?: string;
  speed?: number;
  delay?: number;
  onDone?: () => void;
}

/**
 * Types a line in, character by character. Screen readers get the full text
 * at once; the untyped remainder reserves its space so nothing reflows.
 */
export function TypeIn({ text, as: Tag = "h1", className = "", id, speed = 42, delay = 350, onDone }: TypeInProps) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(reduced ? text.length : 0);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    if (reduced) {
      setN(text.length);
      done.current?.();
      return;
    }
    setN(0);
    let i = 0;
    let t = 0;
    const tick = () => {
      i++;
      setN(i);
      if (i >= text.length) {
        done.current?.();
        return;
      }
      const ch = text[i - 1];
      t = window.setTimeout(tick, /[,?.!]/.test(ch) ? speed + 240 : speed + Math.random() * 30);
    };
    t = window.setTimeout(tick, delay);
    return () => window.clearTimeout(t);
  }, [text, reduced, speed, delay]);

  const complete = n >= text.length;
  return (
    <Tag id={id} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, n)}
        <span className={`caret ${complete ? "caret-done" : ""}`} />
        <span className="invisible">{text.slice(n)}</span>
      </span>
    </Tag>
  );
}

const MOTION_TAGS = { h1: motion.h1, h2: motion.h2, h3: motion.h3, p: motion.p, div: motion.div } as const;

interface DisplayProps {
  as?: keyof typeof MOTION_TAGS;
  className?: string;
  children: ReactNode;
  delay?: number;
  id?: string;
}

/** Display serif that settles in along Fraunces' weight / optical-size / softness axes. */
export function Display({ as = "h1", className = "", children, delay = 0, id }: DisplayProps) {
  const reduced = useReducedMotion();
  const MotionTag = MOTION_TAGS[as];
  return (
    <MotionTag
      id={id}
      className={`display ${reduced ? "" : "display-in"} ${className}`}
      style={{ animationDelay: `${delay}s` }}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
      transition={{ duration: reduced ? 0.3 : 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}
