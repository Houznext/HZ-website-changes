/** Project-wide GA4 kill switch — set to true and configure env to re-enable. */
export const GA4_ENABLED = false;

/** GA4 server reporting is disabled. */
export function isGa4Configured(): boolean {
  return false;
}

export function getGa4PropertyId(): string {
  return "";
}

export function getGa4Client(): null {
  return null;
}
