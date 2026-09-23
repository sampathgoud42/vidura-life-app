#!/usr/bin/env node
/**
 * Finds generated illustrations that came back with a thin frame (the model
 * occasionally draws a white or cream border despite "no border") and
 * re-encodes them without it, from the raw PNG in assets-src/. Free; no API calls.
 *
 * A frame = a uniform band on at least 3 sides, each between 0.5 % and 6 % deep.
 * Flat backgrounds that run to the edge trim much deeper and are left alone.
 *
 *   node scripts/fix-borders.mjs          # report + fix
 *   node scripts/fix-borders.mjs --check  # report only
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHECK = process.argv.includes("--check");
const OUT = { "1:1": [720, 720], "4:5": [864, 1080], "16:9": [1440, 810] };
sharp.cache(false); // Windows: don't hold files open that we're about to overwrite

const walk = (d) =>
  fs.existsSync(d)
    ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]))
    : [];

/** Trim the edge colour away and report how deep each side went (fractions). */
async function frameDepth(input) {
  const { width: W, height: H } = await sharp(input).metadata();
  const { info } = await sharp(input).trim({ threshold: 22 }).toBuffer({ resolveWithObject: true });
  const left = -(info.trimOffsetLeft ?? 0);
  const top = -(info.trimOffsetTop ?? 0);
  const right = W - left - info.width;
  const bottom = H - top - info.height;
  return { left: left / W, right: right / W, top: top / H, bottom: bottom / H };
}

const isBand = (d) => {
  const sides = Object.values(d);
  return sides.filter((v) => v >= 0.005 && v <= 0.06).length >= 3 && sides.every((v) => v <= 0.08);
};

/**
 * A band only counts as a frame when it is pale (white / cream) and that colour is
 * rare inside the picture. A flat background that simply surrounds an inset
 * composition (sky blue, navy, sand…) is part of the style and stays.
 */
async function edgeColour(input, d) {
  const { data, info } = await sharp(input).removeAlpha().resize(200, null).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const px = (x, y) => {
    const i = (y * w + x) * 3;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const ring = [];
  for (let x = 0; x < w; x++) ring.push(px(x, 0), px(x, h - 1));
  for (let y = 0; y < h; y++) ring.push(px(0, y), px(w - 1, y));
  const mean = [0, 1, 2].map((k) => ring.reduce((s, c) => s + c[k], 0) / ring.length);
  const lin = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const lum = 0.2126 * lin(mean[0]) + 0.7152 * lin(mean[1]) + 0.0722 * lin(mean[2]);
  const x0 = Math.ceil(d.left * w) + 2;
  const x1 = Math.floor((1 - d.right) * w) - 2;
  const y0 = Math.ceil(d.top * h) + 2;
  const y1 = Math.floor((1 - d.bottom) * h) - 2;
  let same = 0;
  let total = 0;
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      const c = px(x, y);
      total++;
      if (Math.hypot(c[0] - mean[0], c[1] - mean[1], c[2] - mean[2]) < 22) same++;
    }
  const hex = "#" + mean.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
  return { hex, lum, inside: total ? same / total : 1 };
}

const raws = walk(path.join(root, "assets-src", "assets")).filter((f) => f.endsWith(".png"));
let flagged = 0;
let fixed = 0;
for (const raw of raws) {
  const rel = path.relative(path.join(root, "assets-src"), raw).split(path.sep).join("/").replace(/\.png$/, ".webp");
  const published = path.join(root, "public", rel);
  if (!fs.existsSync(published)) continue;
  // Detect on what users actually get; repair from the raw original.
  const d = await frameDepth(published);
  if (!isBand(d)) continue;
  const e = await edgeColour(published, d);
  const pct = (v) => `${(v * 100).toFixed(1)}%`;
  const frame = e.lum > 0.6 && e.inside < 0.1;
  console.log(
    `${frame ? "▢ frame" : "· inset background, kept"}: ${rel}  edge ${e.hex} (lum ${e.lum.toFixed(2)}, ${pct(e.inside)} inside) · ` +
      `top ${pct(d.top)} · right ${pct(d.right)} · bottom ${pct(d.bottom)} · left ${pct(d.left)}`,
  );
  if (!frame) continue;
  flagged++;
  if (CHECK) continue;

  const meta = await sharp(raw).metadata();
  const ratio = Object.entries(OUT).find(([, [w, h]]) => Math.abs(w / h - meta.width / meta.height) < 0.03)?.[0] ?? "4:5";
  const [w, h] = OUT[ratio];
  const trimmed = await sharp(raw).trim({ threshold: 22 }).toBuffer();
  // Shave 0.6 % more so no anti-aliased sliver of the frame survives the crop.
  const tm = await sharp(trimmed).metadata();
  const sx = Math.round(tm.width * 0.006);
  const sy = Math.round(tm.height * 0.006);
  const clean = await sharp(trimmed).extract({ left: sx, top: sy, width: tm.width - 2 * sx, height: tm.height - 2 * sy }).toBuffer();
  const base = sharp(clean).median(3);
  const webp = (q) => ({ quality: q, effort: 6, smartSubsample: true });
  await base.clone().resize(w, h, { fit: "cover" }).webp(webp(76)).toFile(published);
  await base.clone().resize(Math.round(w / 2), Math.round(h / 2), { fit: "cover" }).webp(webp(72)).toFile(published.replace(/\.webp$/, "-sm.webp"));
  fixed++;
  console.log("  ✔ re-encoded without the frame");
}
console.log(flagged ? `\n${flagged} framed · ${fixed} fixed` : "✔ No framed images found.");
if (!CHECK) await import("./build-lqip.mjs");
