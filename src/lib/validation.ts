export const NAME_MAX = 30;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Segmenter = { segment(input: string): Iterable<unknown> };
const segmenter: Segmenter | null = (() => {
  try {
    const S = (Intl as unknown as { Segmenter?: new (l?: string, o?: { granularity: string }) => Segmenter }).Segmenter;
    return S ? new S(undefined, { granularity: "grapheme" }) : null;
  } catch {
    return null;
  }
})();

/** User-perceived characters, so "👩🏽‍⚕️" or "é" count as one. */
export function graphemeLength(s: string): number {
  if (segmenter) {
    let n = 0;
    for (const _ of segmenter.segment(s)) n++;
    return n;
  }
  return Array.from(s).length;
}

/** Trim, collapse inner whitespace, drop control characters. */
export function cleanName(raw: string): string {
  return raw.replace(/\p{Cc}/gu, "").replace(/\s+/g, " ").trim();
}

export type NameResult = { ok: true; value: string } | { ok: false; value: string; reason: "empty" | "long" };

export function validateName(raw: string): NameResult {
  const value = cleanName(raw);
  const len = graphemeLength(value);
  if (len === 0) return { ok: false, value, reason: "empty" };
  if (len > NAME_MAX) return { ok: false, value, reason: "long" };
  return { ok: true, value };
}

export const NAME_HINTS: Record<"empty" | "long", string> = {
  empty: "I'd love to know what to call you.",
  long: `Could you keep it to ${NAME_MAX} characters? A nickname works too.`,
};

export type EmailResult = { ok: true; value: string } | { ok: false; value: string; reason: "empty" | "format" };

export function validateEmail(raw: string): EmailResult {
  const value = raw.trim();
  if (!value) return { ok: false, value, reason: "empty" };
  if (value.length > 254 || !EMAIL_RE.test(value)) return { ok: false, value, reason: "format" };
  return { ok: true, value };
}

export const EMAIL_HINTS: Record<"empty" | "format", string> = {
  empty: "Your email helps you find your way back.",
  format: "That doesn't look quite right yet. Something like name@example.com.",
};
