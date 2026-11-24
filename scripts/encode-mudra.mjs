// Encodes the Hands-and-posture pose images (raw PNGs from Topview in assets-src/assets/mudra)
// to WebP for the app: a 900px-wide copy and a 480px "-sm" copy, both 4:5.
// Usage: node scripts/encode-mudra.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const src = path.join(root, "assets-src/assets/mudra");
const out = path.join(root, "public/assets/mudra");
fs.mkdirSync(out, { recursive: true });
for (const f of fs.readdirSync(src).filter((n) => n.endsWith(".png"))) {
  const name = f.replace(/\.png$/, "");
  for (const [w, suffix] of [[900, ""], [480, "-sm"]]) {
    const dest = path.join(out, `${name}${suffix}.webp`);
    await sharp(path.join(src, f)).resize(w, Math.round((w * 5) / 4), { fit: "cover", position: "centre" }).webp({ quality: 80 }).toFile(dest);
    console.log(path.relative(root, dest), Math.round(fs.statSync(dest).size / 1024) + " KB");
  }
}
