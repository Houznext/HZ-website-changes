import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/axios';
import { invalidateSavedPropertyCache } from '@/lib/savedPropertiesApi';
import type { InfraProperty } from '@/types/infra.types';

export function useSavedProperties() {
  const { status } = useSession();
  const [items, setItems] = useState<InfraProperty[]>([]);

  const load = useCallback(async () => {
    if (status !== 'authenticated') return;
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('infra_token')) return;
    invalidateSavedPropertyCache();
    const res = await api.get('/saved/me');
    setItems(res.data ?? []);
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated') void load();
  }, [status, load]);

  return { items, reload: load };
}
