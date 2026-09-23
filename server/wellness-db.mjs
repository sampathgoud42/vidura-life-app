/**
 * Vidura Life: the wellness contacts database (SQLite, via Node's built-in
 * node:sqlite, so no extra dependency). The file and its folder are created on
 * first use. Only a person's name and email are stored here; everything else
 * (focus areas, plans, history, cycle details) stays on their device.
 *
 * Saving is an upsert keyed on the email (case-insensitive): a new email is
 * inserted, a known one is updated.
 *
 * Used by the Vite dev/preview middleware (vite.config.ts) and by the
 * standalone server (server/wellness-api.mjs).
 */
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_BODY = 4096;

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS contacts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    email       TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name        TEXT NOT NULL DEFAULT '',
    source      TEXT NOT NULL DEFAULT 'vidura-life',
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL,
    saves       INTEGER NOT NULL DEFAULT 1
  );
`;

/** Open (and create, if missing) the wellness database at `file`. */
export function openWellnessDb(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 3000;");
  db.exec(SCHEMA);
  return db;
}

const clean = (s, max) =>
  String(s ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, max);

export function validateContact(body) {
  const email = clean(body?.email, 254).toLowerCase();
  if (!EMAIL_RE.test(email)) return null;
  const previous = clean(body?.previousEmail, 254).toLowerCase();
  return {
    email,
    name: clean(body?.name, 120),
    source: clean(body?.source, 40) || "vidura-life",
    previousEmail: EMAIL_RE.test(previous) && previous !== email ? previous : null,
  };
}

/**
 * Insert the email if it's new, update it if it exists. When the person changed
 * their email (previousEmail given, new one unknown), the existing row is renamed.
 * Returns { created: boolean }.
 */
export function upsertContact(db, { email, name, source, previousEmail }) {
  const now = new Date().toISOString();
  if (previousEmail) {
    const exists = db.prepare("SELECT 1 FROM contacts WHERE email = ?").get(email);
    if (!exists) {
      const r = db
        .prepare("UPDATE contacts SET email = ?, name = CASE WHEN ? <> '' THEN ? ELSE name END, updated_at = ?, saves = saves + 1 WHERE email = ?")
        .run(email, name, name, now, previousEmail);
      if (r.changes > 0) return { created: false };
    }
  }
  const row = db
    .prepare(
      `INSERT INTO contacts (email, name, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET
         name = CASE WHEN excluded.name <> '' THEN excluded.name ELSE contacts.name END,
         updated_at = excluded.updated_at,
         saves = contacts.saves + 1
       RETURNING saves`,
    )
    .get(email, name, source, now, now);
  return { created: row?.saves === 1 };
}

const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(body));
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(Object.assign(new Error("too large"), { status: 413 }));
        req.destroy();
      } else chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

/**
 * HTTP handler for PUT/POST {base}/contact and GET {base}/health, usable as
 * connect middleware (Vite) or with node:http. Cross-origin calls are accepted
 * from `allowedOrigins` only; a small per-IP rate limit keeps it tidy.
 */
export function createWellnessHandler({ dbFile, allowedOrigins = [], base = "/api/wellness", log = console }) {
  let db = null;
  const hits = new Map();
  const allowed = (origin) => allowedOrigins.includes(origin);

  return async function wellnessHandler(req, res, next) {
    const url = new URL(req.url ?? "/", "http://local");
    // Mounted by Vite at `base` (url is then relative to it), or standalone (full path).
    const route = url.pathname.startsWith(base) ? url.pathname.slice(base.length) || "/" : url.pathname;
    if (route !== "/contact" && route !== "/health") return next ? next() : json(res, 404, { ok: false });

    const origin = req.headers.origin;
    if (origin && allowed(origin)) {
      res.setHeader("access-control-allow-origin", origin);
      res.setHeader("vary", "Origin");
      res.setHeader("access-control-allow-methods", "GET, PUT, POST, OPTIONS");
      res.setHeader("access-control-allow-headers", "content-type");
      res.setHeader("access-control-max-age", "86400");
    }
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      return res.end();
    }
    if (route === "/health") return json(res, 200, { ok: true });
    if (req.method !== "PUT" && req.method !== "POST") return json(res, 405, { ok: false });
    if (origin && !allowed(origin) && origin !== `http://${req.headers.host}` && origin !== `https://${req.headers.host}`) return json(res, 403, { ok: false });

    const ip = req.socket?.remoteAddress ?? "?";
    const now = Date.now();
    const h = hits.get(ip);
    if (h && now - h.at < 60_000) {
      if (++h.n > 30) return json(res, 429, { ok: false });
    } else hits.set(ip, { at: now, n: 1 });
    if (hits.size > 5000) hits.clear();

    try {
      const raw = await readBody(req);
      let body;
      try {
        body = JSON.parse(raw);
      } catch {
        return json(res, 400, { ok: false });
      }
      const contact = validateContact(body);
      if (!contact) return json(res, 422, { ok: false });
      db ??= openWellnessDb(dbFile);
      const { created } = upsertContact(db, contact);
      return json(res, 200, { ok: true, created });
    } catch (e) {
      if (e?.status === 413) return json(res, 413, { ok: false });
      log.warn?.(`[wellness] could not save contact: ${e?.message ?? e}`);
      return json(res, 500, { ok: false });
    }
  };
}

export const DEFAULT_ORIGINS = [
  "https://vidura-life-app.web.app",
  "https://vidura-life-app.firebaseapp.com",
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:4179",
];

export function resolveDbFile(root, env = process.env) {
  return path.resolve(root, env.WELLNESS_DB || path.join("data", "wellness.db"));
}
