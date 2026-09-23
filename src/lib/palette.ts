/**
 * "Living Light" — one palette per time phase.
 *
 * Single source of truth for colour: the CSS tokens for every phase are
 * generated from THEMES (see `themeCss`, inlined into index.html by
 * vite.config.ts), and scripts/check-contrast.mjs verifies WCAG AA for each
 * phase from the same object.
 */
import type { PhaseId } from "../data/content";

export interface PhaseTheme {
  scheme: "light" | "dark";
  /** Page background under the mesh. */
  base: string;
  /** Five mesh-gradient blobs. */
  blobs: readonly [string, string, string, string, string];
  /** Star field opacity (0–1). */
  stars: number;
  /** Breathing orb: highlight, body, depth. */
  orb: readonly [string, string, string];
  ink: string;
  inkSoft: string;
  glass: string;
  glassStrong: string;
  /** Frosted text panel laid over illustrations (checked against worst-case art colours). */
  panel: string;
  hairline: string;
  highlight: string;
  accent: string;
  onAccent: string;
  accentSoft: string;
  focus: string;
  /** "r g b" used for layered shadows. */
  shadow: string;
}

export const THEMES: Record<PhaseId, PhaseTheme> = {
  dawn: {
    scheme: "light",
    base: "#F4E7E5",
    blobs: ["#FFCFB2", "#DCC9F4", "#F8C2D2", "#FFE7C8", "#CCD3F6"],
    stars: 0,
    orb: ["#FFF7F0", "#F6B7A6", "#9A7AD4"],
    ink: "#2A1E30",
    inkSoft: "#584860",
    glass: "rgba(255, 250, 248, 0.56)",
    glassStrong: "rgba(255, 249, 247, 0.9)",
    panel: "rgba(255, 249, 247, 0.86)",
    hairline: "rgba(90, 55, 100, 0.16)",
    highlight: "rgba(255, 255, 255, 0.75)",
    accent: "#8E3A5E",
    onAccent: "#FFFFFF",
    accentSoft: "rgba(142, 58, 94, 0.12)",
    focus: "#5B2A7A",
    shadow: "84 48 88",
  },
  morning: {
    scheme: "light",
    base: "#FBF2DF",
    blobs: ["#FFDA94", "#FFF1D1", "#FFCA99", "#F5E3B4", "#E7EDCB"],
    stars: 0,
    orb: ["#FFFBEF", "#FFC56A", "#D9823A"],
    ink: "#2B2010",
    inkSoft: "#5A4829",
    glass: "rgba(255, 252, 244, 0.56)",
    glassStrong: "rgba(255, 251, 242, 0.9)",
    panel: "rgba(255, 251, 242, 0.86)",
    hairline: "rgba(110, 80, 20, 0.16)",
    highlight: "rgba(255, 255, 255, 0.78)",
    accent: "#8A4A0C",
    onAccent: "#FFFFFF",
    accentSoft: "rgba(138, 74, 12, 0.12)",
    focus: "#5A3000",
    shadow: "110 76 24",
  },
  midday: {
    scheme: "light",
    base: "#ECF5FA",
    blobs: ["#C1E1F8", "#FFF3C4", "#D1EEE1", "#A9D4F2", "#F7FBFF"],
    stars: 0,
    orb: ["#FFFFFF", "#9FD0F4", "#3A88C6"],
    ink: "#0E2230",
    inkSoft: "#394F60",
    glass: "rgba(250, 253, 255, 0.58)",
    glassStrong: "rgba(248, 252, 255, 0.9)",
    panel: "rgba(248, 252, 255, 0.86)",
    hairline: "rgba(20, 70, 110, 0.15)",
    highlight: "rgba(255, 255, 255, 0.8)",
    accent: "#1A5C8E",
    onAccent: "#FFFFFF",
    accentSoft: "rgba(26, 92, 142, 0.12)",
    focus: "#0B3A5E",
    shadow: "28 72 110",
  },
  afternoon: {
    scheme: "light",
    base: "#E8F1EA",
    blobs: ["#BBD8C2", "#AFD3EC", "#DDECC9", "#D0E6F0", "#F1E9D1"],
    stars: 0,
    orb: ["#F7FFF9", "#9ACFAF", "#4B8D84"],
    ink: "#122419",
    inkSoft: "#3A5243",
    glass: "rgba(250, 255, 251, 0.56)",
    glassStrong: "rgba(247, 253, 249, 0.9)",
    panel: "rgba(247, 253, 249, 0.86)",
    hairline: "rgba(30, 80, 50, 0.16)",
    highlight: "rgba(255, 255, 255, 0.78)",
    accent: "#27684A",
    onAccent: "#FFFFFF",
    accentSoft: "rgba(39, 104, 74, 0.12)",
    focus: "#153D29",
    shadow: "30 76 52",
  },
  evening: {
    scheme: "dark",
    base: "#211325",
    blobs: ["#8E4230", "#7A2E4E", "#4E2657", "#80521F", "#34234F"],
    stars: 0.2,
    orb: ["#FFE4CB", "#EE8C69", "#8A386B"],
    ink: "#FFF3EE",
    inkSoft: "#EAD3CE",
    glass: "rgba(38, 17, 38, 0.44)",
    glassStrong: "rgba(36, 17, 37, 0.9)",
    panel: "rgba(36, 17, 37, 0.8)",
    hairline: "rgba(255, 220, 210, 0.16)",
    highlight: "rgba(255, 240, 235, 0.12)",
    accent: "#FFB48E",
    onAccent: "#2A1320",
    accentSoft: "rgba(255, 180, 142, 0.16)",
    focus: "#FFD8C2",
    shadow: "10 2 12",
  },
  night: {
    scheme: "dark",
    base: "#080D22",
    blobs: ["#1B2A6B", "#0B4652", "#261D5A", "#0E3157", "#073039"],
    stars: 1,
    orb: ["#E4ECFF", "#7EA3F0", "#2A3E98"],
    ink: "#EEF2FF",
    inkSoft: "#BAC5EA",
    glass: "rgba(14, 20, 50, 0.46)",
    glassStrong: "rgba(12, 18, 46, 0.9)",
    panel: "rgba(12, 18, 46, 0.8)",
    hairline: "rgba(190, 205, 255, 0.15)",
    highlight: "rgba(220, 230, 255, 0.1)",
    accent: "#9DB9FF",
    onAccent: "#0A1030",
    accentSoft: "rgba(157, 185, 255, 0.16)",
    focus: "#D2E1FF",
    shadow: "0 2 10",
  },
};

/** CSS custom properties for every phase — inlined into index.html at build time. */
export function themeCss(): string {
  // Opaque twin of the panel colour, so an illustration can fade into it without a seam.
  const solid = (rgba: string) => rgba.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),[^)]*\)/, "rgb($1 $2 $3)");
  const block = (id: string, t: PhaseTheme) =>
    `[data-phase="${id}"]{color-scheme:${t.scheme};` +
    `--bg-base:${t.base};--ink:${t.ink};--ink-soft:${t.inkSoft};` +
    `--glass:${t.glass};--glass-strong:${t.glassStrong};--panel:${t.panel};--panel-solid:${solid(t.panel)};` +
    `--hairline:${t.hairline};--highlight:${t.highlight};` +
    `--accent:${t.accent};--on-accent:${t.onAccent};--accent-soft:${t.accentSoft};--focus:${t.focus};` +
    `--shadow-rgb:${t.shadow};` +
    t.blobs.map((c, i) => `--blob-${i + 1}:${c};`).join("") +
    t.orb.map((c, i) => `--orb-${i + 1}:${c};`).join("") +
    `--stars:${t.stars}}`;
  return Object.entries(THEMES)
    .map(([id, t]) => block(id, t))
    .join("\n");
}

// ── Colour math (OKLab interpolation keeps crossfades from going muddy) ──────
export type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const toLin = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const fromLin = (v: number) => {
  const c = v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, c)) * 255);
};

export function rgbToOklab([r, g, b]: RGB): RGB {
  const lr = toLin(r), lg = toLin(g), lb = toLin(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

export function oklabToRgb([L, a, b]: RGB): RGB {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    fromLin(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    fromLin(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    fromLin(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpLab = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
export const rgbCss = ([r, g, b]: RGB) => `rgb(${r} ${g} ${b})`;

/** Colours the living background animates, in OKLab. */
export interface LiveColors {
  base: RGB;
  blobs: RGB[];
  orb: RGB[];
  stars: number;
}

export function liveColorsFor(id: PhaseId): LiveColors {
  const t = THEMES[id];
  return {
    base: rgbToOklab(hexToRgb(t.base)),
    blobs: t.blobs.map((c) => rgbToOklab(hexToRgb(c))),
    orb: t.orb.map((c) => rgbToOklab(hexToRgb(c))),
    stars: t.stars,
  };
}

export function mixLive(a: LiveColors, b: LiveColors, t: number): LiveColors {
  return {
    base: lerpLab(a.base, b.base, t),
    blobs: a.blobs.map((c, i) => lerpLab(c, b.blobs[i], t)),
    orb: a.orb.map((c, i) => lerpLab(c, b.orb[i], t)),
    stars: lerp(a.stars, b.stars, t),
  };
}
