import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { configureLivebuildAuth, livebuildApi } from './api';
import type { LbAccountStats, LbProjectSummary } from './types';

function mobileReady(mobile?: string | null): boolean {
  return (mobile ?? '').replace(/\D/g, '').length >= 10;
}

/** Avoid full-page auth gate on every LiveBuild tab navigation. */
let lbSessionPrimed = false;

export function useLivebuildSession(requireAuth = true) {
  const router = useRouter();
  const { customer, isLoading: authLoading, isLoggedIn } = useCustomerAuth();
  const [ready, setReady] = useState(() => lbSessionPrimed);
  const [stats, setStats] = useState<LbAccountStats | null>(null);
  const [projects, setProjects] = useState<LbProjectSummary[]>([]);

  const hasMobile = mobileReady(customer?.mobile);
  const canAccess = isLoggedIn && hasMobile;

  if (customer?.token) {
    configureLivebuildAuth(customer.token);
  }

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      lbSessionPrimed = false;
      setReady(true);
      if (requireAuth) void router.replace('/login?callbackUrl=/livebuild/dashboard');
      return;
    }
    if (!hasMobile) {
      lbSessionPrimed = false;
      setReady(true);
      if (requireAuth) void router.replace('/my-account');
      return;
    }
    lbSessionPrimed = true;
    setReady(true);
    configureLivebuildAuth(customer!.token);
    let cancelled = false;
    (async () => {
      try {
        const [s, list] = await Promise.all([
          livebuildApi.myStats(),
          livebuildApi.myProjects(),
        ]);
        if (!cancelled) {
          setStats(s);
          setProjects(Array.isArray(list) ? list : []);
        }
      } catch {
        if (!cancelled) {
          setStats(null);
          setProjects([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isLoggedIn, hasMobile, customer?.token, requireAuth, router]);

  const goToPortal = useCallback(() => {
    if (!isLoggedIn) {
      void router.push('/login?callbackUrl=/livebuild/dashboard');
      return;
    }
    if (!hasMobile) {
      void router.push('/my-account');
      return;
    }
    void router.push('/livebuild/dashboard');
  }, [hasMobile, isLoggedIn, router]);

  return useMemo(
    () => ({
      ready: ready && !authLoading,
      customer,
      isLoggedIn,
      hasMobile,
      canAccess,
      stats,
      projects,
      goToPortal,
    }),
    [
      ready,
      authLoading,
      customer,
      isLoggedIn,
      hasMobile,
      canAccess,
      stats,
      projects,
      goToPortal,
    ],
  );
}
