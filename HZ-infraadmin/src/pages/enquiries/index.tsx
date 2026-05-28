'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import adminApi from '@/lib/axios';
import { formatDate } from '@/lib/utils';
import { ENQUIRY_STATUS_OPTIONS, enquiryStatusLabel } from '@/lib/enquiryStatus';

export type EnquiryRow = {
  enquiryId: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: string;
  source: string | null;
  crmLeadId: string | null;
  adminResponse: string | null;
  createdAt: string;
  propertyId: string | null;
  propertyTitle: string | null;
  propertyCode: string | null;
  city: string | null;
  locality: string | null;
};

function EnquiryCard({
  row,
  onUpdated,
}: {
  row: EnquiryRow;
  onUpdated: (r: EnquiryRow) => void;
}) {
  const [status, setStatus] = useState(row.status);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setStatus(row.status);
  }, [row.status]);

  const saveStatus = async () => {
    setBusy(true);
    try {
      const res = await adminApi.patch<EnquiryRow>(`/admin/enquiries/${row.enquiryId}`, { status });
      onUpdated(res.data);
      toast.success('Status updated');
    } catch {
      toast.error('Could not update status');
    } finally {
      setBusy(false);
    }
  };

  const submitResponse = async () => {
    if (!note.trim()) {
      toast.error('Enter a response message');
      return;
    }
    setBusy(true);
    try {
      const res = await adminApi.patch<EnquiryRow>(`/admin/enquiries/${row.enquiryId}`, {
        responseNote: note.trim(),
      });
      setNote('');
      onUpdated(res.data);
      toast.success('Response added — visible on customer profile');
    } catch {
      toast.error('Could not save response');
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="infra-enquiry-card" style={{ marginBottom: 12 }}>
      <div className="infra-enquiry-card-hd">
        <div>
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--ch)' }}>
            {row.propertyTitle ?? 'Property enquiry'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--mu)', marginTop: 2 }}>
            {row.name} · {row.phone}
            {row.email ? ` · ${row.email}` : ''}
          </div>
          <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 4 }}>
            {[row.propertyCode, row.city, row.locality].filter(Boolean).join(' · ') || row.propertyId || '—'}
            {' · '}
            {row.createdAt ? formatDate(row.createdAt) : '—'}
            {row.source ? ` · ${row.source}` : ''}
          </div>
        </div>
        <span className="bdg b-blue">{enquiryStatusLabel(status)}</span>
      </div>

      {row.message ? (
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--brd)', fontSize: 13, color: 'var(--mu)' }}>
          <strong style={{ color: 'var(--ch)' }}>Customer: </strong>
          {row.message}
        </div>
      ) : null}

      {row.adminResponse ? (
        <div
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid var(--brd)',
            fontSize: 13,
            color: 'var(--ch)',
            whiteSpace: 'pre-wrap',
            background: '#f8fafc',
          }}
        >
          <strong style={{ color: '#2f80ed' }}>Responses: </strong>
          {row.adminResponse}
        </div>
      ) : null}

      <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--mu)' }}>
            Status
          </label>
          <select className="fi" style={{ maxWidth: 260 }} value={status} onChange={(e) => setStatus(e.target.value)}>
            {ENQUIRY_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button type="button" className="btn btn-tl btn-sm" disabled={busy} onClick={() => void saveStatus()}>
            Update status
          </button>
        </div>

        <div>
          <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--mu)' }}>
            Add response (shown on website)
          </label>
          <textarea
            className="fi"
            rows={3}
            placeholder="e.g. Site visit scheduled 6 Jan at 11 AM…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ width: '100%', marginTop: 4 }}
          />
          <button
            type="button"
            className="btn btn-blue btn-sm"
            style={{ marginTop: 8 }}
            disabled={busy}
            onClick={() => void submitResponse()}
          >
            Add &amp; submit
          </button>
        </div>
      </div>
    </article>
  );
}

export default function EnquiriesPage() {
  const [rows, setRows] = useState<EnquiryRow[]>([]);
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await adminApi.get<EnquiryRow[]>('/admin/enquiries');
      const data = Array.isArray(res.data) ? res.data : [];
      setRows(
        data.map((r) => ({
          ...r,
          createdAt: typeof r.createdAt === 'string' ? r.createdAt : String(r.createdAt ?? ''),
        })),
      );
    } catch {
      toast.error('Failed to load enquiries');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const needle = q.trim().toLowerCase();
  const filtered = needle
    ? rows.filter((r) => {
        const blob = [r.name, r.phone, r.email, r.message, r.propertyTitle, r.propertyCode, r.city, r.locality, r.status]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return blob.includes(needle);
      })
    : rows;

  return (
    <AdminLayout title="Enquiries">
      <p style={{ fontSize: 13, color: 'var(--mu)', marginBottom: 14, maxWidth: 720 }}>
        Website property enquiries. Each submission creates a CRM lead with source{' '}
        <strong style={{ color: 'var(--ch)' }}>Website enquiry</strong>. Update status and add responses — customers
        see them under <strong style={{ color: 'var(--ch)' }}>My profile → My enquiries</strong>.
      </p>

      <div className="acard" style={{ marginBottom: 12 }}>
        <input
          type="search"
          className="fi"
          placeholder="Search name, phone, property, message…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: 420, width: '100%' }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="acard" style={{ padding: 24, textAlign: 'center', color: 'var(--mu)' }}>
          {rows.length === 0 ? 'No enquiries yet.' : 'No matches for your search.'}
        </div>
      ) : (
        filtered.map((r) => (
          <EnquiryCard
            key={r.enquiryId}
            row={r}
            onUpdated={(updated) => setRows((prev) => prev.map((x) => (x.enquiryId === updated.enquiryId ? updated : x)))}
          />
        ))
      )}
    </AdminLayout>
  );
}


