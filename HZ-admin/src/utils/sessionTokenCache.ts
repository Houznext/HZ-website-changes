import { getSession } from "next-auth/react";

const SESSION_CACHE_MS = 5000;
let cachedSessionToken: string | null = null;
let cachedSessionAt = 0;

export function bearerFromSession(session: unknown): string | null {
  if (!session || typeof session !== "object") return null;
  const s = session as Record<string, unknown>;
  const user = s.user as Record<string, unknown> | undefined;
  const raw =
    (s.accessToken as string | undefined) ??
    (s.token as string | undefined) ??
    (user?.token as string | undefined) ??
    "";
  const str = typeof raw === "string" ? raw.trim() : "";
  return str.length > 0 ? str : null;
}

/** Bust cache when SessionSync applies a new login (see SessionSync). */
export function clearSessionTokenCache() {
  cachedSessionToken = null;
  cachedSessionAt = 0;
}

export async function getSessionTokenOnce(
  options: { force?: boolean } = {},
): Promise<string | null> {
  const force = Boolean(options.force);
  const now = Date.now();
  if (
    !force &&
    cachedSessionToken &&
    now - cachedSessionAt < SESSION_CACHE_MS
  ) {
    return cachedSessionToken;
  }
  let session = await getSession();
  let resolved = bearerFromSession(session);
  if (!resolved && typeof window !== "undefined") {
    await new Promise((r) => setTimeout(r, 120));
    session = await getSession();
    resolved = bearerFromSession(session);
  }
  if (!resolved) {
    cachedSessionToken = null;
    cachedSessionAt = 0;
    return null;
  }
  cachedSessionToken = resolved;
  cachedSessionAt = now;
  return cachedSessionToken;
}
