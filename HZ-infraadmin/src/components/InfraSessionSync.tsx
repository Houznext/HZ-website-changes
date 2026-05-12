import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useInfraPermissionStore } from '@/stores/useInfraPermissionStore';
import type { InfraBranchMembershipLite } from '@/stores/useInfraPermissionStore';

/**
 * Hydrates RBAC store from NextAuth session (HZ-admin–style memberships on session).
 */
export function InfraSessionSync() {
  const { data: session, status } = useSession();
  const initFromSession = useInfraPermissionStore((s) => s.initFromSession);
  const clear = useInfraPermissionStore((s) => s.clear);

  useEffect(() => {
    if (status === 'unauthenticated') {
      clear();
      return;
    }
    if (status !== 'authenticated' || !session?.user) return;

    const u = session.user;
    const fromUser = u.branchMemberships;
    const fromRoot = session.branchMemberships;
    const memberships = (fromRoot?.length ? fromRoot : fromUser) as InfraBranchMembershipLite[] | undefined;

    initFromSession(memberships, u.role ?? undefined, u.email ?? undefined);
  }, [session, status, initFromSession, clear]);

  return null;
}
