/** Project-wide GA4 kill switch — set to true and configure env to re-enable. */
export const GA4_ENABLED = false;

export function pushDataLayer(_payload: Record<string, unknown>): void {
  if (!GA4_ENABLED || typeof window === "undefined") return;
  const w = window as Window & { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push(_payload);
}

export function trackEvent(
  _category: string,
  _action: string,
  _label?: string
): void {
  if (!GA4_ENABLED) return;
}
