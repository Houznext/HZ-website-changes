'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Download, LayoutGrid, Plus } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import adminApi from '@/lib/axios';
import { formatDate, formatPrice } from '@/lib/utils';

type PropRow = {
  propertyId: string;
  propertyCode?: string | null;
  title: string;
  propertyType: string;
  city?: string | null;
  locality?: string | null;
  basePrice?: string | null;
  isApproved: boolean;
  isActive: boolean;
  listedBy?: string;
  createdAt: string;
};

export default function ListingsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PropRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const filters = useMemo(
    () => ({
      type: (router.query.type as string) || '',
      city: (router.query.city as string) || '',
      status: (router.query.status as string) || '',
      listedBy: (router.query.listedBy as string) || '',
    }),
    [router.query],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/admin/properties', {
        params: {
          page,
          limit,
          type: filters.type || undefined,
          city: filters.city || undefined,
        },
      });
      const rows: PropRow[] = res.data?.data ?? [];
      setData(rows);
      setTotal(res.data?.total ?? rows.length);
      setTotalPages(res.data?.totalPages ?? 1);
    } catch {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  }, [page, filters.type, filters.city]);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const active = data.filter((p) => p.isApproved && p.isActive).length;
    const pending = data.filter((p) => !p.isApproved).length;
    const archived = data.filter((p) => !p.isActive && p.isApproved).length;
    const sold = 0;
    return { total, active, pending, sold, archived };
  }, [data, total]);

  const filteredRows = useMemo(() => {
    return data.filter((p) => {
      if (filters.status === 'Active') return p.isApproved && p.isActive;
      if (filters.status === 'Pending') return !p.isApproved;
      if (filters.status === 'Sold') return false;
      if (filters.status === 'Archived') return !p.isActive && p.isApproved;
      if (filters.listedBy && (p.listedBy || '').toLowerCase() !== filters.listedBy.toLowerCase()) return false;
      return true;
    });
  }, [data, filters.status, filters.listedBy]);

  const approve = async (id: string) => {
    try {
      await adminApi.patch(`/admin/properties/${id}/approve`);
      toast.success('Approved ✓');
      void load();
    } catch {
      toast.error('Approve failed');
    }
  };

  const reject = async (id: string) => {
    if (!confirm('Reject this listing?')) return;
    try {
      await adminApi.patch(`/admin/properties/${id}/reject`);
      toast.success('Rejected');
      void load();
    } catch {
      toast.error('Reject failed');
    }
  };

  const clearFilters = () => void router.push('/listings');

  const titleLeft = (
    <>
      <LayoutGrid size={15} strokeWidth={1.8} color="var(--mu)" style={{ flexShrink: 0 }} />
      <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--ch)' }}>All properties</span>
    </>
  );

  const actions = (
    <>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => toast('Export CSV — coming soon')}>
        <Download size={14} strokeWidth={1.8} />
        Export
      </button>
      <Link
        href="/new-property"
        className="btn btn-blue btn-sm"
        onClick={() => {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('infra_listing_draft');
            sessionStorage.removeItem('infra_listing_edit_id');
          }
        }}
      >
        <Plus size={14} strokeWidth={1.8} />
        Add property
      </Link>
    </>
  );

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <AdminLayout titleLeft={titleLeft} actions={actions}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 18 }}>
        {[
          { label: 'Total', v: stats.total, color: 'var(--ch)' },
          { label: 'Active', v: stats.active, color: 'var(--blue)' },
          { label: 'Pending', v: stats.pending, color: 'var(--am)' },
          { label: 'Sold', v: stats.sold, color: 'var(--tl)' },
          { label: 'Archived', v: stats.archived, color: 'var(--mu)' },
        ].map((s) => (
          <div key={s.label} className="acard stat-card">
            <div className="label" style={{ marginBottom: 4 }}>
              {s.label}
            </div>
            <div className="stat-val" style={{ color: s.color }}>
              {s.v.toLocaleString('en-IN')}
            </div>
          </div>
        ))}
      </div>

      <div className="acard" style={{ padding: '12px 14px', marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 9, alignItems: 'center' }}>
        <select
          className="fi fi-select-auto"
          value={filters.type}
          onChange={(e) => void router.push({ query: { ...router.query, type: e.target.value } })}
        >
          <option value="">All types</option>
          {['Apartment', 'Villa', 'Land', 'Plot', 'Row House', 'Commercial', 'Studio', 'Farmhouse'].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className="fi fi-select-auto"
          value={filters.city}
          onChange={(e) => void router.push({ query: { ...router.query, city: e.target.value } })}
        >
          <option value="">All cities</option>
          {['Hyderabad', 'Bengaluru', 'Chennai', 'Mumbai'].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="fi fi-select-auto"
          value={filters.status}
          onChange={(e) => void router.push({ query: { ...router.query, status: e.target.value } })}
        >
          <option value="">All statuses</option>
          {['Active', 'Pending', 'Sold', 'Archived'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="fi fi-select-auto"
          value={filters.listedBy}
          onChange={(e) => void router.push({ query: { ...router.query, listedBy: e.target.value } })}
        >
          <option value="">Listed by: All</option>
          {['Houznext', 'Developer', 'Public'].map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-ghost btn-sm" onClick={clearFilters}>
          Clear filters
        </button>
      </div>

      <div className="acard" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--mu)' }}>Loading…</div>
        ) : (
          <table className="atbl">
            <thead>
              <tr>
                <th style={{ width: 36 }} />
                <th>Property</th>
                <th>Type</th>
                <th>City/Locality</th>
                <th>Price</th>
                <th>Status</th>
                <th>Enquiries</th>
                <th>Listed by</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((p) => (
                <tr key={p.propertyId}>
                  <td>
                    <input type="checkbox" aria-label="select" style={{ width: 14, height: 14 }} />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontFamily: 'Inter, sans-serif', fontSize: 12.5 }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--mu)' }}>#{p.propertyCode ?? p.propertyId.slice(0, 8)}</div>
                  </td>
                  <td>
                    <span className="bdg b-blue">{p.propertyType}</span>
                  </td>
                  <td>
                    {p.city ?? '—'}
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.locality}</div>
                  </td>
                  <td style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>{formatPrice(Number(p.basePrice))}</td>
                  <td>
                    {!p.isApproved ? (
                      <span className="bdg b-amber">Pending</span>
                    ) : p.isActive ? (
                      <span className="bdg b-green">Active</span>
                    ) : (
                      <span className="bdg b-gray">Archived</span>
                    )}
                  </td>
                  <td>—</td>
                  <td>{p.listedBy ?? '—'}</td>
                  <td>{formatDate(p.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button type="button" className="btn-view" onClick={() => toast('View — wire detail route')}>
                        View
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => void router.push(`/listings/${p.propertyId}/edit`)}
                      >
                        Edit
                      </button>
                      {!p.isApproved ? (
                        <>
                          <button type="button" className="btn btn-tl btn-sm" onClick={() => void approve(p.propertyId)}>
                            Approve
                          </button>
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => void reject(p.propertyId)}>
                            Reject
                          </button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="pg-bar">
          <span style={{ fontSize: 12, color: 'var(--mu)' }}>
            Showing {from}–{to} of {total.toLocaleString('en-IN')} properties
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button type="button" className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((n) => (
              <button key={n} type="button" className={`btn btn-sm ${n === page ? 'btn-blue' : 'btn-ghost'}`} onClick={() => setPage(n)}>
                {n}
              </button>
            ))}
            <button type="button" className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
