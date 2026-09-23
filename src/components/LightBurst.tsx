import { useReducedMotion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { livePalette } from "../lib/livePalette";
import { oklabToRgb, rgbCss } from "../lib/palette";

export interface BurstOptions {
  x: number;
  y: number;
  /** "rise" = confetti of light floating up (completion); "radial" = particles dispersing (orb bloom). */
  mode?: "rise" | "radial";
  count?: number;
  colors?: string[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  sprite: HTMLCanvasElement;
  drift: number;
}

type Burst = (o: BurstOptions) => void;
const Ctx = createContext<Burst>(() => {});
export const useLightBurst = () => useContext(Ctx);

function makeSprite(color: string, dark: boolean): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.18, dark ? "rgba(255,255,255,0.9)" : color);
  grad.addColorStop(0.45, color);
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return c;
}

export function LightBurstProvider({ children }: { children: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parts = useRef<Particle[]>([]);
  const raf = useRef(0);
  const last = useRef(0);
  const reduced = useReducedMotion();

  const loop = useCallback((t: number) => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const dt = Math.min(48, t - (last.current || t)) / 16.67;
    last.current = t;
    const dpr = cv.width / cv.clientWidth || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = document.documentElement.dataset.scheme === "dark" ? "lighter" : "source-over";
    parts.current = parts.current.filter((p) => (p.life += dt) < p.max);
    for (const p of parts.current) {
      p.vx *= 0.985 ** dt;
      p.vy = p.vy * 0.985 ** dt - 0.018 * dt; // light floats up, gently
      p.x += (p.vx + Math.sin((p.life + p.drift) / 9) * 0.35) * dt;
      p.y += p.vy * dt;
      const k = p.life / p.max;
      ctx.globalAlpha = Math.max(0, (1 - k) ** 1.4) * (0.75 + 0.25 * Math.sin(p.life / 3 + p.drift));
      const s = p.size * (1 - k * 0.35);
      ctx.drawImage(p.sprite, p.x - s / 2, p.y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
    if (parts.current.length) raf.current = requestAnimationFrame(loop);
    else {
      raf.current = 0;
      last.current = 0;
    }
  }, []);

  const burst = useCallback<Burst>(
    ({ x, y, mode = "rise", count = mode === "rise" ? 70 : 110, colors }) => {
      if (reduced) return;
      const cv = canvasRef.current;
      if (!cv) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (cv.width !== Math.round(innerWidth * dpr)) {
        cv.width = Math.round(innerWidth * dpr);
        cv.height = Math.round(innerHeight * dpr);
      }
      const dark = document.documentElement.dataset.scheme === "dark";
      const palette = colors ?? livePalette.get().orb.map((c) => rgbCss(oklabToRgb(c)));
      const sprites = palette.map((c) => makeSprite(c, dark));
      for (let i = 0; i < count; i++) {
        const a = mode === "radial" ? Math.random() * Math.PI * 2 : -Math.PI / 2 + (Math.random() - 0.5) * 2.1;
        const speed = mode === "radial" ? 2.5 + Math.random() * 7.5 : 2.2 + Math.random() * 5.2;
        parts.current.push({
          x: x + (Math.random() - 0.5) * 18,
          y: y + (Math.random() - 0.5) * 10,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          life: 0,
          max: 55 + Math.random() * 65,
          size: 8 + Math.random() * Math.random() * 26,
          sprite: sprites[i % sprites.length],
          drift: Math.random() * 20,
        });
      }
      if (!raf.current) raf.current = requestAnimationFrame(loop);
    },
    [reduced, loop],
  );

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <Ctx.Provider value={burst}>
      {children}
      <canvas ref={canvasRef} className="light-burst" aria-hidden="true" />
    </Ctx.Provider>
  );
}
