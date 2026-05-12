import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useInfraOrgStore } from '@/stores/useInfraOrgStore';

/** Loads org data from server JSON (after sign-in). */
export function InfraOrgRehydrate() {
  const { status } = useSession();
  const hydrate = useInfraOrgStore((s) => s.hydrate);

  useEffect(() => {
    if (status === 'authenticated') void hydrate();
  }, [status, hydrate]);

  return null;
}
