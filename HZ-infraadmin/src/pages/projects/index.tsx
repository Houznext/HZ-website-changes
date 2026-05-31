'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Home, LayoutGrid, List, Plus, Search } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AdminProjectCard } from '@/components/projects/AdminProjectCard';
import { ProjectStatusBadge, ProjectTypeBadge } from '@/components/projects/ProjectBadges';
import adminApi from '@/lib/axios';
import { CITIES, TYPE_FILTER_PILLS, type ProjectTypeKey } from '@/lib/projects/constants';
import type { ProjectRecord } from '@/lib/projects/types';

const ic = { size: 14, strokeWidth: 1.8, fill: 'none' as const };

export default function ProjectsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'card' | 'list'>('card');
  const [search, setSearch] = useState('');

  const filters = useMemo(
    () => ({
      type: (router.query.type as string) || '',
      city: (router.query.city as string) || '',
      status: (router.query.status as string) || '',
    }),
    [router.query],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/admin/projects', { params: { q: search || undefined } });
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    return rows.filter((p) => {
      if (filters.type && p.projectType !== filters.type) return false;
      if (filters.city && (p.city || '') !== filters.city) return false;
      if (filters.status === 'Active' && !p.published) return false;
      if (filters.status === 'Draft' && p.published) return false;
      if (filters.status === 'Archived' && p.visibility !== 'archived') return false;
      if (filters.status && ['Active', 'Draft', 'Archived'].includes(filters.status) === false && p.status !== filters.status) return false;
      return true;
    });
  }, [rows, filters]);

  const stats = useMemo(() => {
    const byType = (t: ProjectTypeKey) => rows.filter((p) => p.projectType === t).length;
    return {
      total: rows.length,
      apartment: byType('apartment'),
      villa: byType('villa'),
      venture: byType('venture'),
      villaplot: byType('villaplot'),
    };
  }, [rows]);

  const setFilter = (key: string, value: string) => {
    const q = { ...router.query } as Record<string, string>;
    if (value) q[key] = value;
    else delete q[key];
    void router.push({ pathname: '/projects', query: q }, undefined, { shallow: true });
  };

  const clearFilters = () => void router.push('/projects', undefined, { shallow: true });

  const titleLeft = (
    <>
      <Home {...ic} color="var(--mu)" style={{ flexShrink: 0 }} />
      <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--ch)' }}>Projects</span>
    </>
  );

  const actions = (
    <>
      <div className="search-wrap" style={{ width: 200 }}>
        <Search {...ic} />
        <input
          className="fi"
          placeholder="Search projects…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void load();
          }}
          style={{ width: '100%', fontSize: 12.5 }}
        />
      </div>
      <div style={{ display: 'flex', gap: 4, border: '1.5px solid #e2e8f0', borderRadius: 8, padding: 2 }}>
        <button type="button" className={`btn btn-sm ${view === 'card' ? 'btn-blue' : 'btn-ghost'}`} onClick={() => setView('card')} aria-label="Card view">
          <LayoutGrid size={14} strokeWidth={1.8} />
        </button>
        <button type="button" className={`btn btn-sm ${view === 'list' ? 'btn-blue' : 'btn-ghost'}`} onClick={() => setView('list')} aria-label="List view">
          <List size={14} strokeWidth={1.8} />
        </button>
      </div>
      <Link
        href="/projects/new"
        className="btn btn-blue btn-sm"
        onClick={() => {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('infra_project_draft');
            sessionStorage.removeItem('infra_project_draft_id');
          }
        }}
      >
        <Plus size={14} strokeWidth={1.8} />
        Add project
      </Link>
    </>
  );

  return (
    <AdminLayout titleLeft={titleLeft} actions={actions} hideSearch>
      <div className="admin-proj-stats">
        {[
          { label: 'Total', v: stats.total, color: 'var(--ch)' },
          { label: 'Apartment', v: stats.apartment, color: 'var(--blue)' },
          { label: 'Villa', v: stats.villa, color: '#be185d' },
          { label: 'Venture/Plot', v: stats.venture, color: 'var(--am)' },
          { label: 'Villa Plots', v: stats.villaplot, color: 'var(--tl)' },
        ].map((s) => (
          <div key={s.label} className="acard stat-card">
            <div className="stat-lbl">{s.label}</div>
            <div className="stat-val" style={{ color: s.color }}>
              {s.v.toLocaleString('en-IN')}
            </div>
          </div>
        ))}
      </div>

      <div className="acard" style={{ padding: '11px 14px', marginBottom: 14, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="fi fi-select-auto" value={filters.type} onChange={(e) => setFilter('type', e.target.value)}>
          {TYPE_FILTER_PILLS.map((p) => (
            <option key={p.id} value={p.id === 'all' ? '' : p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <select className="fi fi-select-auto" value={filters.city} onChange={(e) => setFilter('city', e.target.value)}>
          <option value="">All cities</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select className="fi fi-select-auto" value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
          <option value="">All status</option>
          <option value="Active">Active</option>
          <option value="Draft">Draft</option>
          <option value="Archived">Archived</option>
          <option value="New Launch">New Launch</option>
          <option value="Under Construction">Under Construction</option>
          <option value="Ready to Move">Ready to Move</option>
          <option value="Sold Out">Sold Out</option>
        </select>
        <button type="button" className="btn btn-ghost btn-sm" onClick={clearFilters}>
          Clear
        </button>
        <span style={{ fontSize: 12, color: 'var(--mu)', marginLeft: 'auto' }}>
          {loading ? 'Loading…' : `${filtered.length} project${filtered.length === 1 ? '' : 's'}`}
        </span>
      </div>

      {view === 'card' ? (
        <div className="admin-proj-card-grid">
          {filtered.map((p) => (
            <AdminProjectCard key={p.projectId} project={p} />
          ))}
          {!loading && filtered.length === 0 ? (
            <div className="acard" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: 'var(--mu)' }}>
              No projects found
            </div>
          ) : null}
        </div>
      ) : (
        <div className="acard" style={{ padding: 0, overflow: 'auto' }}>
          <table className="atbl">
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Developer</th>
                <th>City</th>
                <th>Status</th>
                <th>Units</th>
                <th>RERA</th>
                <th>Banks</th>
                <th>Enquiries</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.projectId} onClick={() => void router.push(`/projects/${p.projectId}`)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{p.refCode || p.projectId.slice(0, 8)}</td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>
                    <ProjectTypeBadge type={p.projectType as ProjectTypeKey} />
                  </td>
                  <td>{p.developerName || '—'}</td>
                  <td>{p.city || '—'}</td>
                  <td>
                    <ProjectStatusBadge status={p.status} />
                    {!p.published ? <span className="bdg b-amber" style={{ marginLeft: 4 }}>Draft</span> : null}
                  </td>
                  <td>{p.unitsLabel || p.totalUnits || '—'}</td>
                  <td>{p.reraVerified || p.reraNumber ? '✓' : '—'}</td>
                  <td>
                    <span className="bdg b-teal">{p.bankCount ?? 0}</span>
                  </td>
                  <td>
                    <span className="bdg b-blue">{p.enquiryCount ?? 0}</span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Link href={`/projects/${p.projectId}`} className="btn btn-ghost btn-xs">
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--mu)' }}>No projects found</div>
          ) : null}
        </div>
      )}
    </AdminLayout>
  );
}
