import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/axios';
import type { InfraProperty } from '@/types/infra.types';

export function useProperties(params: Record<string, string | number | undefined>) {
  const [data, setData] = useState<{ items: InfraProperty[]; total: number } | null>(null);
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
      setData(res.data);
    } catch (e: unknown) {
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
