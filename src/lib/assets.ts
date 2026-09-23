import { IMAGE_META, type ImageMeta } from "../data/images.generated";

export const assetUrl = (path: string): string => `${import.meta.env.BASE_URL}${path}`;

export const imageMeta = (src: string): ImageMeta | undefined => IMAGE_META[src];

/** `assets/dawn/move.webp` → `assets/dawn/move-sm.webp` */
export const smallVariant = (src: string): string => src.replace(/\.webp$/, "-sm.webp");

/** Asset URL with its content hash, so a regenerated image always gets a fresh URL. */
export const versionedUrl = (path: string, meta?: ImageMeta): string => `${assetUrl(path)}${meta?.v ? `?v=${meta.v}` : ""}`;
