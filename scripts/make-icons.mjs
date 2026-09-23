#!/usr/bin/env node
/**
 * Renders the Vidura orb mark to every icon the PWA needs (sharp renders SVG).
 * Usage: node scripts/make-icons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "public", "icons");
fs.mkdirSync(out, { recursive: true });

/** @param {{ pad?: number, bg?: boolean }} o */
const mark = ({ pad = 0, bg = true } = {}) => {
  const r = 50 - pad;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFE7C8"/><stop offset=".55" stop-color="#F8C2D2"/><stop offset="1" stop-color="#CCD3F6"/>
    </linearGradient>
    <radialGradient id="orb" cx=".36" cy=".3" r=".75">
      <stop offset="0" stop-color="#FFF8EE"/><stop offset=".22" stop-color="#FFD2A6"/>
      <stop offset=".58" stop-color="#EE8C69"/><stop offset="1" stop-color="#8A386B"/>
    </radialGradient>
    <radialGradient id="glow" cx=".5" cy=".5" r=".5">
      <stop offset=".55" stop-color="#FFB48E" stop-opacity=".55"/><stop offset="1" stop-color="#FFB48E" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="spec" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  ${bg ? `<rect width="100" height="100" rx="${pad ? 0 : 22}" fill="url(#sky)"/>` : ""}
  <circle cx="50" cy="52" r="${(r * 0.78).toFixed(2)}" fill="url(#glow)"/>
  <circle cx="50" cy="50" r="${(r * 0.56).toFixed(2)}" fill="url(#orb)"/>
  <ellipse cx="${(50 - r * 0.17).toFixed(2)}" cy="${(50 - r * 0.24).toFixed(2)}" rx="${(r * 0.2).toFixed(2)}" ry="${(r * 0.12).toFixed(2)}" fill="url(#spec)" transform="rotate(-24 ${(50 - r * 0.17).toFixed(2)} ${(50 - r * 0.24).toFixed(2)})"/>
</svg>`;
};

const jobs = [
  ["icon-192.png", 192, mark()],
  ["icon-512.png", 512, mark()],
  ["maskable-512.png", 512, mark({ pad: 10 })],
  ["apple-touch-icon.png", 180, mark({ pad: 4 })],
  ["favicon-32.png", 32, mark()],
];

fs.writeFileSync(path.join(out, "favicon.svg"), mark());
for (const [name, size, svg] of jobs) {
  await sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toFile(path.join(out, name));
  console.log(`✔ icons/${name}`);
}
console.log("✔ icons/favicon.svg");
