/** Shared between Edge middleware and client components — do not import middleware.ts in the browser. */
export const PROTECTED_PREFIXES = ["/user"] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}
