import { useCallback, useEffect, useState } from 'react';
import adminApi from '@/lib/axios';
import type { InfraProject } from '@/types/infra.types';

export function useProjects() {
  const [rows, setRows] = useState<InfraProject[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await adminApi.get('/projects');
      setRows(res.data ?? []);
    } catch {
      setRows([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { rows, reload: load };
}
