import type { IncomingMessage, ServerResponse } from "node:http";

export const EMAIL_RE: RegExp;
export const DEFAULT_ORIGINS: string[];
export function resolveDbFile(root: string, env?: Record<string, string | undefined>): string;
export function createWellnessHandler(opts: {
  dbFile: string;
  allowedOrigins?: string[];
  base?: string;
  log?: Pick<Console, "warn">;
}): (req: IncomingMessage, res: ServerResponse, next?: (() => void) | null) => Promise<void>;
