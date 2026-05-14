import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/axios';
import type { PublicProperty } from '@/types/property.types';

export function useProperties(params: Record<string, string | number | undefined>) {
  const [data, setData] = useState<{ items: PublicProperty[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const key = JSON.stringify(params);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') qs.set(k, String(v));
      });
      const res = await api.get(`/properties?${qs.toString()}`);
      const body = res.data as {
        data?: PublicProperty[];
        items?: PublicProperty[];
        total?: number;
      };
      const items = body.data ?? body.items ?? [];
      const total = body.total ?? items.length;
      setData({ items, total });
    } catch {
      setError('Failed to load properties');
      setData({ items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}
