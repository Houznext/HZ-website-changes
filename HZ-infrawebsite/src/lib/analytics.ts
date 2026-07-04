/** GA4 is disabled project-wide. */
export const GA4_ENABLED = false;

export function initGA(): void {}

export function trackPageView(_url: string): void {}

export function trackEvent(_category: string, _action: string, _label?: string): void {}
