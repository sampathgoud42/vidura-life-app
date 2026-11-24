/**
 * Email ownership check with Firebase Authentication's passwordless email link,
 * called through its REST API (no SDK dependency).
 *
 *   1. sendSignInLink(email)   → Firebase emails a one-tap link back to this page
 *   2. readLinkFromUrl()       → on that page, pick the one-time code out of the URL
 *   3. completeSignIn(email, code) → Firebase confirms the code belongs to that email
 *
 * Turned on by VITE_FIREBASE_API_KEY (build-time; the project's public Web API key).
 * Without it the app keeps the old format-only email check.
 *
 * Firebase console setup: Authentication → Sign-in method → Email/Password with
 * "Email link (passwordless sign-in)" on, and every host the app runs on listed under
 * Authentication → Settings → Authorized domains.
 */

const API_KEY = (import.meta.env.VITE_FIREBASE_API_KEY as string | undefined)?.trim() || "";
const API = "https://identitytoolkit.googleapis.com/v1/accounts";

export const EMAIL_LINK_ENABLED = API_KEY.length > 0;

/** Who asked for a link on this device, so the link can finish without retyping. */
const PENDING_KEY = "vidura.pendingSignIn";

export interface PendingSignIn {
  email: string;
  name: string;
  at: string;
}

export function savePending(p: Omit<PendingSignIn, "at">): void {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify({ ...p, at: new Date().toISOString() }));
  } catch {
    /* private mode: the link page will ask for the email again */
  }
}

export function loadPending(): PendingSignIn | null {
  try {
    const o = JSON.parse(localStorage.getItem(PENDING_KEY) || "null");
    return o && typeof o.email === "string" && typeof o.name === "string" ? o : null;
  } catch {
    return null;
  }
}

export function clearPending(): void {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}

export type LinkError = "not-enabled" | "domain" | "expired" | "mismatch" | "too-many" | "network" | "unknown";

export const LINK_ERROR_TEXT: Record<LinkError, string> = {
  "not-enabled": "Email sign-in isn't switched on yet. Please try again later.",
  domain: "This address isn't allowed to send sign-in links yet. Please try again later.",
  expired: "That link has expired or was already used. I'll send you a fresh one.",
  mismatch: "That email doesn't match the link. Use the address the link was sent to.",
  "too-many": "Too many tries just now. Please wait a minute and try again.",
  network: "I couldn't reach the server. Check your connection and try again.",
  unknown: "Something went wrong. Please try again.",
};

function mapError(message: string | undefined): LinkError {
  const m = message || "";
  if (/OPERATION_NOT_ALLOWED|CONFIGURATION_NOT_FOUND/.test(m)) return "not-enabled";
  if (/UNAUTHORIZED_DOMAIN|INVALID_CONTINUE_URI/.test(m)) return "domain";
  if (/INVALID_OOB_CODE|EXPIRED_OOB_CODE/.test(m)) return "expired";
  if (/INVALID_EMAIL|EMAIL_NOT_FOUND/.test(m)) return "mismatch";
  if (/TOO_MANY_ATTEMPTS|QUOTA_EXCEEDED/.test(m)) return "too-many";
  return "unknown";
}

async function call(path: string, body: unknown): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; error: LinkError }> {
  try {
    const res = await fetch(`${API}:${path}?key=${encodeURIComponent(API_KEY)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown> & { error?: { message?: string } };
    return res.ok ? { ok: true, data } : { ok: false, error: mapError(data.error?.message) };
  } catch {
    return { ok: false, error: "network" };
  }
}

/** The page the emailed link returns to: this app, without any query or hash. */
const continueUrl = () => `${window.location.origin}${window.location.pathname}`;

export async function sendSignInLink(email: string) {
  return call("sendOobCode", { requestType: "EMAIL_SIGNIN", email, continueUrl: continueUrl(), canHandleCodeInApp: true });
}

/** Returns the verified email (as Firebase stores it) or an error. */
export async function completeSignIn(email: string, oobCode: string): Promise<{ ok: true; email: string } | { ok: false; error: LinkError }> {
  const r = await call("signInWithEmailLink", { email, oobCode });
  if (!r.ok) return r;
  return { ok: true, email: typeof r.data.email === "string" ? r.data.email : email };
}

/** The one-time code if this page was opened from a sign-in email, else null. */
export function readLinkFromUrl(href = window.location.href): string | null {
  if (!EMAIL_LINK_ENABLED) return null;
  const find = (u: URL, depth: number): string | null => {
    if (u.searchParams.get("mode") === "signIn" && u.searchParams.get("oobCode")) return u.searchParams.get("oobCode");
    if (depth > 0) {
      for (const k of ["link", "deep_link_id", "continueUrl"]) {
        const inner = u.searchParams.get(k);
        if (inner) {
          try {
            const hit = find(new URL(inner), depth - 1);
            if (hit) return hit;
          } catch {
            /* not a URL */
          }
        }
      }
    }
    return null;
  };
  try {
    return find(new URL(href), 2);
  } catch {
    return null;
  }
}

/** Drop the one-time code from the address bar so a refresh or share doesn't reuse it. */
export function clearLinkFromUrl(): void {
  window.history.replaceState(null, "", continueUrl() + window.location.hash);
}
