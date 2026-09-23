import { useState, type CSSProperties, type ReactNode } from "react";
import type { ImageSlot } from "../data/content";
import { imageMeta, smallVariant, versionedUrl } from "../lib/assets";
import { THEMES } from "../lib/palette";

interface Props {
  slot: ImageSlot;
  className?: string;
  /** Above-the-fold hero: eager + high fetch priority. */
  priority?: boolean;
  sizes?: string;
  scrim?: "bottom" | "full" | "none";
  /** Fill the parent instead of reserving the slot's aspect ratio. */
  fill?: boolean;
  /** Images here sit behind text that already says what they show. */
  decorative?: boolean;
  style?: CSSProperties;
  children?: ReactNode;
}

function gradientFor(slot: ImageSlot): string {
  const t = THEMES[slot.tone];
  const [a, b, c, d] = t.blobs;
  return [
    `radial-gradient(60% 45% at 72% 30%, ${t.orb[0]}cc 0%, transparent 60%)`,
    `radial-gradient(120% 90% at 15% 10%, ${a} 0%, transparent 62%)`,
    `radial-gradient(90% 80% at 90% 85%, ${c} 0%, transparent 66%)`,
    `radial-gradient(70% 60% at 55% 45%, ${b} 0%, transparent 72%)`,
    `linear-gradient(165deg, ${d}, ${t.base})`,
  ].join(",");
}

/**
 * Fixed-ratio image slot: phase-tinted gradient (or the generated blurred
 * LQIP) first, then the flat illustration fades in over it. Text over art uses
 * frosted theme panels (see .now-body / .tile-text); an optional scrim remains
 * for the dimmed guided-mode backdrop. Slots without an image keep the gradient.
 */
export function SmartImage({
  slot,
  className = "",
  priority = false,
  sizes = "(min-width: 1024px) 40vw, 100vw",
  scrim = "none",
  fill = false,
  decorative = true,
  style,
  children,
}: Props) {
  const meta = imageMeta(slot.src);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const showImg = !!meta && !failed;

  return (
    <div
      className={`smart-img ${fill ? "smart-img-fill" : ""} ${className}`}
      style={{ ...(fill ? {} : { aspectRatio: slot.ratio.replace(":", " / ") }), ...style }}
      data-loaded={loaded || undefined}
    >
      <div
        className={`smart-img-ph ${meta?.lqip ? "is-lqip" : ""}`}
        style={{ backgroundImage: meta?.lqip ? `url("${meta.lqip}")` : gradientFor(slot) }}
        aria-hidden="true"
      />
      {showImg && (
        <img
          src={versionedUrl(slot.src, meta)}
          srcSet={meta.sm ? `${versionedUrl(smallVariant(slot.src), meta)} ${Math.round(meta.w / 2)}w, ${versionedUrl(slot.src, meta)} ${meta.w}w` : undefined}
          sizes={meta.sm ? sizes : undefined}
          width={meta.w}
          height={meta.h}
          alt={decorative ? "" : slot.alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
      {scrim !== "none" && <div className={`scrim scrim-${scrim}`} aria-hidden="true" />}
      {children}
    </div>
  );
}
