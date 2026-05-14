import type { BranchMembership } from '@/types/infra-portal';

const TOKEN_KEY = 'infra_admin_token';
const USER_KEY = 'infra_admin_user';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  kind: string;
  branchMemberships: BranchMembership[];
}

export function saveSession(token: string, user: AdminUser) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  document.cookie = `infra_admin_logged_in=1; path=/; max-age=${8 * 60 * 60}; SameSite=Lax`;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = 'infra_admin_logged_in=; path=/; max-age=0';
}

export function isLoggedIn(): boolean {
  return !!getToken();
}
