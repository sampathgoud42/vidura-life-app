#!/usr/bin/env node
/**
 * WCAG contrast audit for every phase palette in src/lib/palette.ts.
 * Text checks use the worst case: text sitting directly on the most
 * contrasting mesh blob, and glass cards composited over every blob.
 *
 * Usage: node scripts/check-contrast.mjs   (exit code 1 on any failure)
 */
import { THEMES } from "../src/lib/palette.ts";

const hex = (h) => {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const parse = (c) => {
  if (c.startsWith("#")) return { rgb: hex(c), a: 1 };
  const m = c.match(/rgba?\(([^)]+)\)/);
  const [r, g, b, a = "1"] = m[1].split(/[\s,/]+/).filter(Boolean);
  return { rgb: [+r, +g, +b], a: +a };
};
const over = (fg, bg) => {
  const { rgb, a } = parse(fg);
  return rgb.map((c, i) => Math.round(a * c + (1 - a) * bg[i]));
};
const lum = ([r, g, b]) => {
  const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

let failures = 0;
const rows = [];
const check = (phase, label, fg, bg, min) => {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) failures++;
  rows.push({ phase, check: label, ratio: r.toFixed(2), min, result: ok ? "pass" : "FAIL" });
  return r;
};
const worst = (phase, label, fg, bgs, min) => {
  let lowest = Infinity;
  let at = "";
  for (const [name, bg] of bgs) {
    const r = ratio(fg, bg);
    if (r < lowest) [lowest, at] = [r, name];
  }
  const ok = lowest >= min;
  if (!ok) failures++;
  rows.push({ phase, check: `${label} (worst: ${at})`, ratio: lowest.toFixed(2), min, result: ok ? "pass" : "FAIL" });
};

for (const [id, t] of Object.entries(THEMES)) {
  const base = hex(t.base);
  const surfaces = [["base", base], ...t.blobs.map((b, i) => [`blob-${i + 1}`, hex(b)])];
  const glass = surfaces.map(([n, bg]) => [`glass/${n}`, over(t.glass, bg)]);
  const sheet = surfaces.map(([n, bg]) => [`sheet/${n}`, over(t.glassStrong, bg)]);
  const ink = hex(t.ink);
  const soft = hex(t.inkSoft);

  worst(id, "ink on mesh", ink, surfaces, 4.5);
  worst(id, "ink-soft on mesh", soft, surfaces, 4.5);
  worst(id, "ink on glass", ink, glass, 4.5);
  worst(id, "ink-soft on glass", soft, glass, 4.5);
  worst(id, "ink-soft on sheet", soft, sheet, 4.5);
  check(id, "on-accent on accent", hex(t.onAccent), hex(t.accent), 4.5);
  worst(id, "accent text on glass", hex(t.accent), glass, 4.5);
  worst(id, "accent (UI) vs mesh", hex(t.accent), surfaces, 3);
  worst(id, "focus ring vs mesh", hex(t.focus), surfaces, 3);
  worst(id, "focus ring vs glass", hex(t.focus), glass, 3);
}

// Text over photography: white text sits in the scrim zone (≥ 0.72 of #0A0814).
const scrimOnWhite = over("rgba(10, 8, 20, 0.72)", [255, 255, 255]);
check("images", "white text on scrim over a white photo", [255, 255, 255], scrimOnWhite, 4.5);

console.table(rows);
console.log(failures ? `\n✖ ${failures} contrast check(s) failed` : "\n✔ All phase palettes pass WCAG AA");
process.exit(failures ? 1 : 0);
