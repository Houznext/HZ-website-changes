/** Redirect to login with return URL; returns true if redirect was triggered. */
export function requireLogin(router: { push: (url: string) => void }, returnPath?: string): boolean {
  if (typeof window === 'undefined') return false;
  const path = returnPath || `${window.location.pathname}${window.location.search}`;
  void router.push(`/login?callbackUrl=${encodeURIComponent(path)}`);
  return true;
}
