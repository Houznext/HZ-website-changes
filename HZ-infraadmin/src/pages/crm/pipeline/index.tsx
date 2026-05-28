'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { CrmLayout } from '@/components/crm/CrmLayout';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import type { KanbanLead } from '@/components/crm/KanbanCard';
import adminApi from '@/lib/axios';

export default function CrmPipelinePage() {
  const [pipe, setPipe] = useState<Record<string, KanbanLead[]>>({});
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);

  const load = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([adminApi.get<Record<string, KanbanLead[]>>('/admin/crm/pipeline'), adminApi.get('/admin/crm/stats')]);
      setPipe(p.data ?? {});
      setStats(s.data ?? null);
    } catch {
      toast.error('Failed to load pipeline');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminLayout title="CRM — Pipeline">
      <CrmLayout>
        <div className="crm-pipeline-bar">
            {[
              ['Pipeline value', `₹${Number(stats?.pipelineValue ?? 0).toLocaleString('en-IN')}`],
              ['Weighted value', `₹${Number(stats?.weightedValue ?? 0).toLocaleString('en-IN')}`],
              ['Avg deal size', `₹${Number(stats?.avgDealSize ?? 0).toLocaleString('en-IN')}`],
              ['Conversion', `${stats?.conversionRate ?? 0}%`],
              ['Avg days to close', String(stats?.avgDaysToClose ?? '—')],
            ].map(([a, b], i, arr) => (
              <div key={String(a)} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div>
                  <div className="crm-pipeline-metric-lbl">{a}</div>
                  <div className="crm-pipeline-metric-val">{b}</div>
                </div>
                {i < arr.length - 1 ? <div className="crm-pipeline-divider" /> : null}
              </div>
            ))}
        </div>
        <KanbanBoard pipeline={pipe} onRefresh={() => void load()} />
      </CrmLayout>
    </AdminLayout>
  );
}
