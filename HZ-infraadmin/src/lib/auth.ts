export const INFRA_ADMIN_TOKEN_KEY = 'infra_admin_token';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(INFRA_ADMIN_TOKEN_KEY);
}

export function clearAdminToken(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(INFRA_ADMIN_TOKEN_KEY);
}
