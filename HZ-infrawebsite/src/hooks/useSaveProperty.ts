'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import {
  fetchSavedPropertyIds,
  savePropertyApi,
  unsavePropertyApi,
} from '@/lib/savedPropertiesApi';
import { requireLogin } from '@/lib/requireLogin';

type Ref = {
  propertyId?: string;
  slug: string;
};

export function useSaveProperty({ propertyId, slug }: Ref) {
  const router = useRouter();
  const { status } = useSession();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated' || !propertyId) {
      setSaved(false);
      return;
    }
    let cancelled = false;
    void fetchSavedPropertyIds().then((ids) => {
      if (!cancelled) setSaved(ids.has(propertyId));
    });
    return () => {
      cancelled = true;
    };
  }, [status, propertyId]);

  const toggle = useCallback(
    async (e?: { preventDefault?: () => void; stopPropagation?: () => void }) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      if (status !== 'authenticated') {
        requireLogin(router);
        return;
      }
      if (!propertyId) return;
      if (busy) return;
      setBusy(true);
      try {
        if (saved) {
          await unsavePropertyApi(propertyId);
          setSaved(false);
        } else {
          await savePropertyApi(propertyId);
          setSaved(true);
        }
      } catch {
        /* keep prior state */
      } finally {
        setBusy(false);
      }
    },
    [status, propertyId, saved, busy, router],
  );

  return { saved, toggle, busy, authed: status === 'authenticated' };
}
