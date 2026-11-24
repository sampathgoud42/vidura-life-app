import type { IncomingMessage, ServerResponse } from "node:http";

export const EMAIL_RE: RegExp;
export const DEFAULT_ORIGINS: string[];
export function resolveDbFile(root: string, env?: Record<string, string | undefined>): string;
export function createWellnessHandler(opts: {
  dbFile: string;
  allowedOrigins?: string[];
  base?: string;
  log?: Pick<Console, "warn">;
  /** Firebase Web API key, used to verify the ID token on DELETE. */
  firebaseApiKey?: string;
  /** Override for tests: resolves an ID token to its verified email. */
  verifyToken?: (idToken: unknown, apiKey: string) => Promise<string | null>;
}): (req: IncomingMessage, res: ServerResponse, next?: (() => void) | null) => Promise<void>;

export function deleteContactRow(db: unknown, email: string): boolean;
export function emailFromIdToken(idToken: unknown, apiKey: string): Promise<string | null>;
