import { IMAGE_META, type ImageMeta } from "../data/images.generated";

export const assetUrl = (path: string): string => `${import.meta.env.BASE_URL}${path}`;

export const imageMeta = (src: string): ImageMeta | undefined => IMAGE_META[src];

/** `assets/dawn/move.webp` → `assets/dawn/move-sm.webp` */
export const smallVariant = (src: string): string => src.replace(/\.webp$/, "-sm.webp");
