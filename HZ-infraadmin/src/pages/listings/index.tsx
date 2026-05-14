'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
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
    }),
    [router.query],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/admin/properties', {
        params: { page, limit, type: filters.type || undefined, city: filters.city || undefined },
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
    const archived = data.filter((p) => !p.isActive).length;
    return { total, active, pending, sold: 0, archived };
  }, [data, total]);

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

  return (
    <AdminLayout
      title="All listings"
      actions={
        <Link href="/new-property" className="btn btn-blue">
          + Add property
        </Link>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Total', v: stats.total, c: 'b-gray' },
          { label: 'Active', v: stats.active, c: 'b-blue' },
          { label: 'Pending', v: stats.pending, c: 'b-amber' },
          { label: 'Sold', v: stats.sold, c: 'b-teal' },
          { label: 'Archived', v: stats.archived, c: 'b-gray' },
        ].map((s) => (
          <div key={s.label} className="acard" style={{ padding: 14 }}>
            <div className="label">{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Montserrat, sans-serif' }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="acard" style={{ marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <select
          className="fi"
          style={{ maxWidth: 140 }}
          value={filters.type}
          onChange={(e) => void router.push({ query: { ...router.query, type: e.target.value } })}
        >
          <option value="">Type</option>
          {['Apartment', 'Villa', 'Land', 'Plot', 'Commercial', 'Row House', 'Studio', 'Farmhouse'].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className="fi"
          style={{ maxWidth: 160 }}
          value={filters.city}
          onChange={(e) => void router.push({ query: { ...router.query, city: e.target.value } })}
        >
          <option value="">City</option>
          {['Hyderabad', 'Bengaluru', 'Chennai', 'Mumbai'].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => void router.push('/listings')}>
          Clear
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => toast('Export CSV — coming soon')}>
          Export CSV
        </button>
      </div>

      <div className="acard" style={{ padding: 0, overflow: 'auto' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#5a6a7e' }}>Loading…</div>
        ) : (
          <table className="atbl">
            <thead>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>City</th>
                <th>Price</th>
                <th>Status</th>
                <th>Listed by</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.propertyId}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: '#5a6a7e' }}>#{p.propertyCode ?? p.propertyId.slice(0, 8)}</div>
                  </td>
                  <td>
                    <span className="bdg b-blue">{p.propertyType}</span>
                  </td>
                  <td>
                    {p.city ?? '—'}
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.locality}</div>
                  </td>
                  <td>{formatPrice(Number(p.basePrice))}</td>
                  <td>
                    {!p.isApproved ? (
                      <span className="bdg b-amber">Pending</span>
                    ) : p.isActive ? (
                      <span className="bdg b-green">Active</span>
                    ) : (
                      <span className="bdg b-gray">Inactive</span>
                    )}
                  </td>
                  <td>{p.listedBy ?? '—'}</td>
                  <td>{formatDate(p.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => toast('View — wire detail route')}>
                        View
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
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
        <button type="button" className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            className={`btn btn-sm ${n === page ? 'btn-blue' : 'btn-ghost'}`}
            onClick={() => setPage(n)}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </AdminLayout>
  );
}
