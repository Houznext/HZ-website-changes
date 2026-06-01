'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Download, LayoutGrid, List, Plus, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AdminPropertyCard, type AdminPropertyRow } from '@/components/listings/AdminPropertyCard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import adminApi from '@/lib/axios';
import { formatDate, formatPrice } from '@/lib/utils';

type PropRow = AdminPropertyRow;

export default function ListingsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PropRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'card' | 'list'>('card');
  const [deleteTarget, setDeleteTarget] = useState<PropRow | null>(null);
  const [deleting, setDeleting] = useState(false);
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
    try {
      await adminApi.patch(`/admin/properties/${id}/reject`);
      toast.success('Rejected');
      void load();
    } catch {
      toast.error('Reject failed');
    }
  };

  const confirmDeleteProperty = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.delete(`/admin/properties/${deleteTarget.propertyId}`);
      toast.success('Property deleted. Notification email sent.');
      setDeleteTarget(null);
      void load();
    } catch {
      toast.error('Failed to delete property');
    } finally {
      setDeleting(false);
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
      <div style={{ display: 'flex', gap: 4, border: '1.5px solid #e2e8f0', borderRadius: 8, padding: 2 }}>
        <button type="button" className={`btn btn-sm ${view === 'card' ? 'btn-blue' : 'btn-ghost'}`} onClick={() => setView('card')} aria-label="Card view">
          <LayoutGrid size={14} strokeWidth={1.8} />
        </button>
        <button type="button" className={`btn btn-sm ${view === 'list' ? 'btn-blue' : 'btn-ghost'}`} onClick={() => setView('list')} aria-label="List view">
          <List size={14} strokeWidth={1.8} />
        </button>
      </div>
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
        <span style={{ fontSize: 12, color: 'var(--mu)', marginLeft: 'auto' }}>
          {loading ? 'Loading…' : `${filteredRows.length} on this page`}
        </span>
      </div>

      {view === 'card' ? (
        <div className="admin-prop-card-grid">
          {loading ? (
            <div className="acard" style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: 'var(--mu)' }}>
              Loading…
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="acard" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: 'var(--mu)' }}>
              No properties found
            </div>
          ) : (
            filteredRows.map((p) => (
              <AdminPropertyCard
                key={p.propertyId}
                property={p}
                onDelete={setDeleteTarget}
                onApprove={(id) => void approve(id)}
                onReject={(id) => void reject(id)}
              />
            ))
          )}
        </div>
      ) : (
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
                        <button type="button" className="btn btn-ghost btn-xs" onClick={() => void router.push(`/listings/${p.propertyId}/edit`)}>
                          Edit
                        </button>
                        {!p.isApproved ? (
                          <>
                            <button type="button" className="btn btn-tl btn-xs" onClick={() => void approve(p.propertyId)}>
                              Approve
                            </button>
                            <button type="button" className="btn btn-danger btn-xs" onClick={() => void reject(p.propertyId)}>
                              Reject
                            </button>
                          </>
                        ) : null}
                        <button type="button" className="btn btn-danger btn-xs" onClick={() => setDeleteTarget(p)}>
                          <Trash2 size={12} strokeWidth={1.8} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filteredRows.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--mu)' }}>No properties found</div>
          ) : null}
        </div>
      )}

      <div className="pg-bar" style={{ marginTop: 14 }}>
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

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete property?"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"? This cannot be undone. A notification email will be sent to the team.`
            : ''
        }
        confirmLabel="Yes, delete"
        cancelLabel="No"
        danger
        loading={deleting}
        onConfirm={() => void confirmDeleteProperty()}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />
    </AdminLayout>
  );
}
