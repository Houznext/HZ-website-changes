'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import adminApi from '@/lib/axios';
import { formatDate } from '@/lib/utils';

export type EnquiryRow = {
  enquiryId: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: string;
  createdAt: string;
  propertyId: string | null;
  propertyTitle: string | null;
  propertyCode: string | null;
  city: string | null;
  locality: string | null;
};

export default function EnquiriesPage() {
  const [rows, setRows] = useState<EnquiryRow[]>([]);
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

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
        const blob = [r.name, r.phone, r.email, r.message, r.propertyTitle, r.propertyCode, r.city, r.locality]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return blob.includes(needle);
      })
    : rows;

  return (
    <AdminLayout title="Enquiries">
      <p style={{ fontSize: 13, color: 'var(--mu)', marginBottom: 14, maxWidth: 720 }}>
        Website visitors who used <strong style={{ color: 'var(--ch)' }}>Send enquiry</strong> on a property page.
        Each row is also created as a CRM lead. Notification emails go to{' '}
        <strong style={{ color: 'var(--ch)' }}>business@houznext.com</strong> when SMTP is configured.
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

      <div className="acard" style={{ padding: 0, overflow: 'auto' }}>
        <table className="atbl">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Property</th>
              <th>Status</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: 'var(--mu)' }}>
                  {rows.length === 0 ? 'No enquiries yet.' : 'No matches for your search.'}
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.enquiryId}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{r.createdAt ? formatDate(r.createdAt) : '—'}</td>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{r.phone}</td>
                  <td>
                    <div style={{ fontWeight: 600, maxWidth: 220 }}>{r.propertyTitle ?? '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--mu)' }}>
                      {[r.propertyCode, r.city, r.locality].filter(Boolean).join(' · ') || r.propertyId || '—'}
                    </div>
                  </td>
                  <td>
                    <span className="bdg b-blue">{r.status}</span>
                  </td>
                  <td>
                    {r.message ? (
                      <>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '2px 8px', fontSize: 11 }}
                          onClick={() => setExpanded((id) => (id === r.enquiryId ? null : r.enquiryId))}
                        >
                          {expanded === r.enquiryId ? 'Hide' : 'View'}
                        </button>
                        {expanded === r.enquiryId ? (
                          <p style={{ marginTop: 8, fontSize: 12, color: 'var(--ch)', whiteSpace: 'pre-wrap', maxWidth: 360 }}>
                            {r.message}
                          </p>
                        ) : (
                          <p
                            style={{
                              marginTop: 4,
                              fontSize: 11,
                              color: 'var(--mu)',
                              maxWidth: 280,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical' as const,
                              overflow: 'hidden',
                            }}
                          >
                            {r.message}
                          </p>
                        )}
                      </>
                    ) : (
                      '—'
                    )}
                    {r.email ? <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 4 }}>{r.email}</div> : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
