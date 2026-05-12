/**
 * Parses persisted org state from the pre–file-store zustand key `hz-infraadmin-org`.
 * For use in the browser only (`window`).
 */
import type { InfraOrgBranch, InfraOrgRole, InfraOrgUser } from '@/types/infra-admin-org.types';

const LEGACY_STORAGE_KEY = 'hz-infraadmin-org';
export const INFRA_ORG_LEGACY_LS_KEY = LEGACY_STORAGE_KEY;

export type LegacyOrgPayload = {
  branches: InfraOrgBranch[];
  roles: InfraOrgRole[];
  users: InfraOrgUser[];
};

export function readLegacyOrgFromLocalStorage(): LegacyOrgPayload | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const state = parsed.state as Record<string, unknown> | undefined;
    const src = state && typeof state === 'object' ? state : parsed;
    if (!src || typeof src !== 'object') return null;
    if (!Array.isArray(src.branches) || !Array.isArray(src.roles) || !Array.isArray(src.users)) return null;
    return {
      branches: src.branches as InfraOrgBranch[],
      roles: src.roles as InfraOrgRole[],
      users: src.users as InfraOrgUser[],
    };
  } catch {
    return null;
  }
}
