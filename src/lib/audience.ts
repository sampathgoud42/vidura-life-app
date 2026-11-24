/** Items that can be tagged for one sex ("For men" / "For women"). */
export interface AudienceTagged {
  audience?: "women" | "men";
}

/**
 * Shows an item once when the same text exists for both men and women: the
 * first copy stays, without a tag, like any everyday item; the other copy is dropped.
 */
export function mergeAudiencePairs<T extends AudienceTagged>(items: readonly T[], key: (item: T) => string): T[] {
  const tagged = new Map<string, Set<string>>();
  for (const i of items) {
    if (!i.audience) continue;
    const k = key(i).trim().toLowerCase();
    tagged.set(k, (tagged.get(k) ?? new Set()).add(i.audience));
  }
  const seen = new Set<string>();
  const out: T[] = [];
  for (const i of items) {
    const k = key(i).trim().toLowerCase();
    if (!i.audience || (tagged.get(k)?.size ?? 0) < 2) {
      out.push(i);
      continue;
    }
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ ...i, audience: undefined });
  }
  return out;
}
