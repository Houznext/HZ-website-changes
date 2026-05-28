'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { CrmLayout } from '@/components/crm/CrmLayout';
import { LeadFormModal } from '@/components/crm/LeadFormModal';
import { StageBadge } from '@/components/crm/StageBadge';
import { LeadScoreRing } from '@/components/crm/LeadScoreRing';
import { BUDGET_RANGES, CRM_STAGES, getAvatarColor, PROPERTY_TYPES, SOURCES } from '@/components/crm/crmConstants';
import adminApi from '@/lib/axios';
import { formatDate } from '@/lib/utils';
import { Columns2, Download, Filter, Phone, Plus, Search } from 'lucide-react';

type Lead = {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  propertyType: string;
  bhkPreference?: string | null;
  budgetRange?: string | null;
  source?: string;
  stage: string;
  priority: string;
  leadScore: number;
  assignedTo?: string | null;
  nextFollowUpAt?: string | null;
  createdAt?: string;
};

const TABS = ['all', 'hot', 'site_visit', 'negotiation', 'token_booked', 'registered', 'lost_nurture'] as const;

export default function CrmLeadsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    stage: '',
    priority: '',
    propertyType: '',
    budgetRange: '',
    source: '',
    assignedTo: '',
    q: '',
  });
  const [tab, setTab] = useState<(typeof TABS)[number]>('all');
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAgent, setBulkAgent] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await adminApi.get<{ data: Lead[]; total: number; page: number }>('/admin/crm/leads', {
        params: {
          page,
          limit: 25,
          ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
          tab: tab === 'all' ? undefined : tab,
        },
      });
      setRows(res.data?.data ?? []);
      setTotal(res.data?.total ?? 0);
    } catch {
      toast.error('Failed to load leads');
    }
  }, [page, filters, tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const exportCsv = () => {
    const h = ['id', 'fullName', 'phone', 'stage', 'priority', 'budget', 'source'];
    const lines = [h.join(',')].concat(
      rows.map((r) => [r.id, `"${r.fullName}"`, r.phone, r.stage, r.priority, r.budgetRange ?? '', r.source ?? ''].join(',')),
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'crm-leads.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const toggleSel = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const bulkApply = async () => {
    if (!selected.size || !bulkAgent.trim()) {
      toast.error('Select leads and enter assignee');
      return;
    }
    try {
      await adminApi.post('/admin/crm/leads/bulk-assign', { leadIds: Array.from(selected), assignedTo: bulkAgent.trim(), agentName: 'Admin' });
      toast.success('Bulk assign done ✓ · Notification sent');
      setSelected(new Set());
      void load();
    } catch {
      toast.error('Bulk assign failed');
    }
  };

  return (
    <AdminLayout title="CRM — All leads">
      <CrmLayout>
        <div className="acard" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--mu)' }}>
              <Filter size={14} strokeWidth={1.8} />
            </span>
            <select className="fi" style={{ maxWidth: 160 }} value={filters.stage} onChange={(e) => setFilters({ ...filters, stage: e.target.value })}>
              <option value="">All stages</option>
              {CRM_STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <select className="fi" style={{ maxWidth: 140 }} value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
              <option value="">All priority</option>
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
            </select>
            <select className="fi" style={{ maxWidth: 150 }} value={filters.propertyType} onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}>
              <option value="">All types</option>
              {PROPERTY_TYPES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select className="fi" style={{ maxWidth: 160 }} value={filters.budgetRange} onChange={(e) => setFilters({ ...filters, budgetRange: e.target.value })}>
              <option value="">All budgets</option>
              {BUDGET_RANGES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <select className="fi" style={{ maxWidth: 160 }} value={filters.source} onChange={(e) => setFilters({ ...filters, source: e.target.value })}>
              <option value="">All sources</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input className="fi" style={{ maxWidth: 200 }} placeholder="Agent name" value={filters.assignedTo} onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })} />
            <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
              <Search size={14} strokeWidth={1.8} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--mu)' }} />
              <input
                className="fi"
                style={{ paddingLeft: 32, width: '100%' }}
                placeholder="Search…"
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              />
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFilters({ stage: '', priority: '', propertyType: '', budgetRange: '', source: '', assignedTo: '', q: '' })}>
              Clear
            </button>
            <button type="button" className="btn btn-ghost btn-sm" style={{ gap: 6 }} onClick={exportCsv}>
              <Download size={14} strokeWidth={1.8} /> Export CSV
            </button>
            <button type="button" className="btn btn-blue btn-sm" style={{ marginLeft: 'auto', gap: 6 }} onClick={() => setModal(true)}>
              <Plus size={15} strokeWidth={1.8} /> Add lead
            </button>
            <Link href="/crm/pipeline" className="btn btn-ghost btn-sm" title="Kanban">
              <Columns2 size={15} strokeWidth={1.8} />
            </Link>
          </div>
        </div>

        <div className="tab-bar" style={{ marginBottom: 12 }}>
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              className={`tab ${tab === t ? 'on' : ''}`}
              onClick={() => {
                setTab(t);
                setPage(1);
              }}
            >
              {t === 'all' ? `All (${total})` : t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {selected.size > 0 ? (
          <div className="acard" style={{ marginBottom: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>{selected.size} selected</span>
            <input className="fi" placeholder="Assign to (name)" value={bulkAgent} onChange={(e) => setBulkAgent(e.target.value)} style={{ maxWidth: 220 }} />
            <button type="button" className="btn btn-tl btn-sm" onClick={() => void bulkApply()}>
              Apply
            </button>
          </div>
        ) : null}

        <div className="acard" style={{ padding: 0, overflow: 'auto' }}>
          <table className="atbl crm-table">
            <thead>
              <tr>
                <th style={{ width: 36 }} />
                <th>Lead</th>
                <th>Interested in</th>
                <th>Budget</th>
                <th>Source</th>
                <th>Assigned</th>
                <th>Stage</th>
                <th>Priority</th>
                <th>Score</th>
                <th>Follow-up</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const overdue = r.nextFollowUpAt && new Date(r.nextFollowUpAt) < new Date(new Date().toDateString());
                return (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => void router.push(`/crm/leads/${r.id}`)}>
                    <td onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSel(r.id)} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            background: getAvatarColor(r.fullName),
                            color: '#fff',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'Montserrat, sans-serif',
                            fontSize: 13,
                          }}
                        >
                          {r.fullName.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <div style={{ fontWeight: 700 }}>{r.fullName}</div>
                          <div style={{ fontSize: 10.5, color: 'var(--mu)' }}>
                            {r.phone} · #{r.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {r.propertyType}
                      {r.bhkPreference ? ` · ${r.bhkPreference}` : ''}
                    </td>
                    <td style={{ fontWeight: 800, color: '#2f80ed' }}>{r.budgetRange ?? '—'}</td>
                    <td style={{ fontSize: 11.5 }}>{r.source ?? '—'}</td>
                    <td style={{ fontSize: 12 }}>{r.assignedTo ?? '—'}</td>
                    <td>
                      <StageBadge stage={r.stage} />
                    </td>
                    <td>
                      <span className={`bdg ${r.priority === 'hot' ? 'p-hot' : r.priority === 'warm' ? 'p-warm' : 'p-cold'}`}>
                        {r.priority}
                      </span>
                    </td>
                    <td>
                      <LeadScoreRing score={r.leadScore} />
                    </td>
                    <td className={overdue ? 'date-overdue' : 'date-normal'} style={{ fontSize: 12 }}>{r.nextFollowUpAt ? formatDate(r.nextFollowUpAt) : '—'}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <a href={`tel:${r.phone}`} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
                        <Phone size={14} strokeWidth={1.8} />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="pg-bar">
            <span style={{ fontSize: 12, color: 'var(--mu)' }}>
              Page {page} · {total} total
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Prev
              </button>
              <button type="button" className="btn btn-ghost btn-sm" disabled={page * 25 >= total} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          </div>
        </div>

        <LeadFormModal open={modal} onClose={() => setModal(false)} onCreated={() => void load()} />
      </CrmLayout>
    </AdminLayout>
  );
}
