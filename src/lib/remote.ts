/**
 * Best-effort save of a person's name and email to the Vidura wellness database
 * (server/wellness-db.mjs: insert if new, update if the email is known).
 *
 * It's an optional step: it never throws, never blocks and never shows an
 * error. If the database can't be reached, the app carries on as normal.
 * Nothing else leaves the device: no focus areas, meals, history or cycle data.
 *
 * Where it goes: VITE_WELLNESS_API (build-time, e.g. https://host/api/wellness),
 * otherwise the same-origin /api/wellness that the local dev / preview server
 * mounts. On other hosts without VITE_WELLNESS_API it's skipped.
 */
import { markContactSynced, contactSynced } from "./storage";

const CONFIGURED = (import.meta.env.VITE_WELLNESS_API as string | undefined)?.trim().replace(/\/+$/, "");
const LOCAL_HOST = /^(?:localhost|127\.\d+\.\d+\.\d+|\[::1\]|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+)$/;

function contactUrl(): string | null {
  try {
    if (CONFIGURED) return `${CONFIGURED}/contact`;
    return LOCAL_HOST.test(window.location.hostname) ? new URL("api/wellness/contact", document.baseURI).href : null;
  } catch {
    return null;
  }
}

export interface ContactPayload {
  name: string;
  email: string;
  /** When the person changed their email: the one to update. */
  previousEmail?: string;
}

export async function saveContact(c: ContactPayload): Promise<boolean> {
  try {
    const url = contactUrl();
    if (!url) return false;
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 6000);
    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: c.name, email: c.email, previousEmail: c.previousEmail, source: "vidura-life" }),
        credentials: "omit",
        keepalive: true,
        signal: ctrl.signal,
      });
      if (res.ok) markContactSynced(c.email);
      return res.ok;
    } finally {
      window.clearTimeout(timer);
    }
  } catch {
    return false; // offline, blocked, no server: silently skip
  }
}

/** For people who signed up before this existed: save once per email, quietly. */
export function syncContactOnce(c: ContactPayload): void {
  try {
    if (contactSynced() !== c.email.toLowerCase()) void saveContact(c);
  } catch {
    /* optional */
  }
}
