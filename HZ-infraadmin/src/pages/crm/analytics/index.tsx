'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { CrmLayout } from '@/components/crm/CrmLayout';
import adminApi from '@/lib/axios';
import { CRM_STAGES } from '@/components/crm/crmConstants';

type Stats = {
  totalLeads?: number;
  registered?: number;
  conversionRate?: number;
  pipelineValue?: number;
  avgDaysToClose?: number;
  stageCounts?: Record<string, number>;
  sourceCounts?: Record<string, number>;
};

export default function CrmAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [range, setRange] = useState('all');

  const load = useCallback(async () => {
    try {
      const res = await adminApi.get<Stats>('/admin/crm/stats', { params: { range } });
      setStats(res.data);
    } catch {
      toast.error('Failed to load analytics');
    }
  }, [range]);

  useEffect(() => {
    void load();
  }, [load]);

  const total = stats?.totalLeads ?? 1;

  return (
    <AdminLayout title="CRM — Analytics">
      <CrmLayout>
        <div className="tab-bar" style={{ marginBottom: 14 }}>
          {(['all', 'week', 'month'] as const).map((r) => (
            <button key={r} type="button" className={`tab ${range === r ? 'on' : ''}`} onClick={() => setRange(r)}>
              {r === 'all' ? 'All time' : r === 'week' ? 'This week' : 'This month'}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }} className="max-lg:grid-cols-2">
          {[
            ['Total leads', stats?.totalLeads ?? 0],
            ['Registered', stats?.registered ?? 0],
            ['Conversion %', `${stats?.conversionRate ?? 0}%`],
            ['Revenue closed (est.)', `₹${(stats?.pipelineValue ?? 0).toLocaleString('en-IN')}`],
            ['Avg close time', `${stats?.avgDaysToClose ?? '—'}d`],
          ].map(([a, b]) => (
            <div key={String(a)} className="stat" style={{ cursor: 'default' }}>
              <div>
                <div className="stat-lbl">{a}</div>
                <div className="stat-val">{b}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 18 }} className="max-lg:grid-cols-1">
          <div className="acard">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Stage funnel</div>
            {CRM_STAGES.slice(0, 8).map((s) => {
              const n = stats?.stageCounts?.[s.id] ?? 0;
              const pct = Math.round((n / total) * 100);
              return (
                <div key={s.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                    <span>{s.label}</span>
                    <strong>
                      {n} ({pct}%)
                    </strong>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden', marginTop: 4 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: s.border }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="acard">
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Lead source breakdown</div>
            {Object.entries(stats?.sourceCounts ?? {})
              .sort((a, b) => b[1] - a[1])
              .map(([src, c]) => {
                const pct = Math.round((c / total) * 100);
                return (
                  <div key={src} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                      <span>{src}</span>
                      <strong>
                        {c} ({pct}%)
                      </strong>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden', marginTop: 4 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#2f80ed' }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </CrmLayout>
    </AdminLayout>
  );
}
