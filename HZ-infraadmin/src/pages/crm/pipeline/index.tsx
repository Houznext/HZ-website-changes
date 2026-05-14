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
        <div className="acard" style={{ marginBottom: 16, padding: '14px 18px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
            {[
              ['Pipeline value', `₹${Number(stats?.pipelineValue ?? 0).toLocaleString('en-IN')}`],
              ['Weighted value', `₹${Number(stats?.weightedValue ?? 0).toLocaleString('en-IN')}`],
              ['Avg deal size', `₹${Number(stats?.avgDealSize ?? 0).toLocaleString('en-IN')}`],
              ['Conversion', `${stats?.conversionRate ?? 0}%`],
              ['Avg days to close', String(stats?.avgDaysToClose ?? '—')],
            ].map(([a, b], i, arr) => (
              <div key={String(a)} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8' }}>{a}</div>
                  <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 16, fontWeight: 800, color: '#1f2933' }}>{b}</div>
                </div>
                {i < arr.length - 1 ? <div style={{ width: 1, height: 32, background: '#e2e8f0' }} /> : null}
              </div>
            ))}
          </div>
        </div>
        <KanbanBoard pipeline={pipe} onRefresh={() => void load()} />
      </CrmLayout>
    </AdminLayout>
  );
}
