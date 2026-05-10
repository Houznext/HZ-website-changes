import { useCallback, useEffect, useState } from 'react';
import adminApi from '@/lib/axios';
import type { InfraProperty } from '@/types/infra.types';

export function useListings() {
  const [rows, setRows] = useState<InfraProperty[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/admin/properties');
      setRows(res.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { rows, loading, reload: load };
}
