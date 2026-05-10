import { useCallback, useEffect, useState } from 'react';
import adminApi from '@/lib/axios';
import type { CrmRow } from '@/types/admin.types';

export function useCRM() {
  const [rows, setRows] = useState<CrmRow[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await adminApi.get('/admin/crm/leads');
      setRows(res.data ?? []);
    } catch {
      setRows([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStage = useCallback(
    async (id: string, stage: string) => {
      await adminApi.patch(`/admin/crm/leads/${id}`, { stage });
      void load();
    },
    [load],
  );

  return { rows, reload: load, updateStage };
}
