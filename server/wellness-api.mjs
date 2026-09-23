#!/usr/bin/env node
/**
 * Standalone Vidura Life wellness API: the same contact endpoint the Vite dev /
 * preview servers mount, for serving the hosted site.
 *
 *   node server/wellness-api.mjs          # http://0.0.0.0:8791/api/wellness/contact
 *
 * Env (.env.local is loaded automatically):
 *   WELLNESS_DB               SQLite file (default data/wellness.db, created if missing)
 *   WELLNESS_PORT             default 8791
 *   WELLNESS_ALLOWED_ORIGINS  comma-separated extra origins allowed to call it
 *
 * The hosted app calls it only when built with VITE_WELLNESS_API pointing here,
 * e.g. VITE_WELLNESS_API=https://wellness.example.com/api/wellness.
 */
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_ORIGINS, createWellnessHandler, resolveDbFile } from "./wellness-db.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
try {
  process.loadEnvFile(path.join(root, ".env.local"));
} catch {
  /* optional */
}

const dbFile = resolveDbFile(root);
const port = Number(process.env.WELLNESS_PORT || 8791);
const extra = (process.env.WELLNESS_ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
const handler = createWellnessHandler({ dbFile, allowedOrigins: [...DEFAULT_ORIGINS, ...extra] });

http
  .createServer((req, res) => handler(req, res, null))
  .listen(port, () => console.log(`Wellness API on :${port} · db ${dbFile}`));
