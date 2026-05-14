'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import adminApi from '@/lib/axios';
import { formatDate } from '@/lib/utils';

type Lead = {
  leadId: string;
  name: string;
  phone: string;
  email?: string | null;
  stage: string;
  budget?: string | null;
  assignedTo?: string | null;
  nextFollowUpAt?: string | null;
  lastContactNote?: string | null;
  createdAt?: string;
  property?: { title?: string; propertyCode?: string | null } | null;
};

const STAGES = ['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost'] as const;

const stageClass: Record<string, string> = {
  new: 'b-blue',
  contacted: 'b-purple',
  qualified: 'b-teal',
  proposal_sent: 'b-amber',
  won: 'b-green',
  lost: 'b-red',
};

export default function CrmPage() {
  const [rows, setRows] = useState<Lead[]>([]);
  const [drawer, setDrawer] = useState<Lead | null>(null);
  const [filter, setFilter] = useState('');

  const load = async () => {
    try {
      const res = await adminApi.get('/admin/crm/leads', { params: filter ? { stage: filter } : {} });
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load leads');
    }
  };

  useEffect(() => {
    void load();
  }, [filter]);

  const patch = async (id: string, body: Record<string, unknown>) => {
    try {
      await adminApi.patch(`/admin/crm/leads/${id}`, body);
      toast.success('Updated');
      void load();
      setDrawer((d) => (d && d.leadId === id ? { ...d, ...(body as Partial<Lead>) } : d));
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <AdminLayout title="CRM leads">
      <div className="acard" style={{ marginBottom: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <select className="fi" style={{ maxWidth: 220 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="acard" style={{ padding: 0, overflow: 'auto' }}>
        <table className="atbl">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Interest</th>
              <th>Status</th>
              <th>Assigned</th>
              <th>Follow-up</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.leadId} style={{ cursor: 'pointer' }} onClick={() => setDrawer(r)}>
                <td style={{ fontWeight: 600 }}>{r.name}</td>
                <td>{r.phone}</td>
                <td>{r.property?.title ?? r.property?.propertyCode ?? '—'}</td>
                <td>
                  <span className={`bdg ${stageClass[r.stage] ?? 'b-gray'}`}>{r.stage}</span>
                </td>
                <td>{r.assignedTo ?? '—'}</td>
                <td>{r.nextFollowUpAt ? formatDate(r.nextFollowUpAt) : '—'}</td>
                <td>{r.createdAt ? formatDate(r.createdAt) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {drawer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 200 }} onClick={() => setDrawer(null)}>
          <div className="acard" style={{ position: 'absolute', top: 0, right: 0, width: 420, height: '100%', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3>{drawer.name}</h3>
            <p style={{ color: '#64748b', marginTop: 6 }}>{drawer.phone}</p>
            {drawer.email ? <p style={{ fontSize: 12 }}>{drawer.email}</p> : null}
            {drawer.budget ? <p style={{ fontSize: 12 }}>Budget: {drawer.budget}</p> : null}
            <label className="label" style={{ marginTop: 12 }}>
              Status
            </label>
            <select className="fi" value={drawer.stage} onChange={(e) => void patch(drawer.leadId, { stage: e.target.value })}>
              {Array.from(new Set([...STAGES, drawer.stage])).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <label className="label" style={{ marginTop: 12 }}>
              Assigned to
            </label>
            <input
              className="fi"
              defaultValue={drawer.assignedTo ?? ''}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v !== (drawer.assignedTo ?? '')) void patch(drawer.leadId, { assignedTo: v || null });
              }}
            />
            <label className="label" style={{ marginTop: 12 }}>
              Note
            </label>
            <textarea
              className="fi"
              rows={3}
              defaultValue={drawer.lastContactNote ?? ''}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v !== (drawer.lastContactNote ?? '')) void patch(drawer.leadId, { lastContactNote: v || null });
              }}
            />
            <button type="button" className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => setDrawer(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
