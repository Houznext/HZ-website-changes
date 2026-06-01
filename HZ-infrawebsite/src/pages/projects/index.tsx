'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import api from '@/lib/axios';
import type { InfraProject } from '@/types/infra.types';
import { TYPE_FILTER_PILLS, type ProjectTypeKey } from '@/lib/projects/constants';
import { BUDGET_OPTIONS, countByType, filterProjects, type BudgetFilter } from '@/lib/projects/utils';
import { ProjCard } from '@/components/projects/ProjCard';

const CITIES = ['All', 'Hyderabad', 'Bengaluru', 'Chennai', 'Mumbai'];
const STATUSES = ['Any', 'New Launch', 'Under Construction', 'Ready to Move', 'Sold Out'];

export default function ProjectsListingPage() {
  const router = useRouter();
  const [items, setItems] = useState<InfraProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<ProjectTypeKey | 'all'>('all');
  const [city, setCity] = useState('All');
  const [status, setStatus] = useState('Any');
  const [budget, setBudget] = useState<BudgetFilter>('');

  useEffect(() => {
    if (!router.isReady) return;
    const t = router.query.type as string;
    if (t && t !== 'all') setTypeFilter(t as ProjectTypeKey);
  }, [router.isReady, router.query.type]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<InfraProject[]>('/projects', { params: { limit: 50 } });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => countByType(items), [items]);

  const filtered = useMemo(
    () =>
      filterProjects(items, {
        type: typeFilter,
        city: city === 'All' ? undefined : city,
        status: status === 'Any' ? undefined : status,
        budget,
      }),
    [items, typeFilter, city, status, budget],
  );

  const typePills = [
    { id: 'all' as const, label: `All (${counts.all})` },
    { id: 'apartment' as const, label: `Apartments (${counts.apartment})` },
    { id: 'villa' as const, label: `Villas (${counts.villa})` },
    { id: 'venture' as const, label: `Ventures (${counts.venture})` },
    { id: 'villaplot' as const, label: `Villa Plots (${counts.villaplot})` },
  ];

  return (
    <div id="pg-projects" className="min-h-screen overflow-x-hidden bg-offwhite">
      <Navbar />
      <div className="pg-projects-header">
        <div className="mx-auto max-w-infra px-4 md:px-7">
          <h1 className="mb-3 font-montserrat text-[22px] font-extrabold text-charcoal">Real Estate Projects</h1>
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between lg:gap-3">
            <div className="projects-filter-bar flex gap-1.5">
              {typePills.map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  className={`proj-filter-pill ${typeFilter === pill.id ? 'on' : ''}`}
                  onClick={() => setTypeFilter(pill.id)}
                >
                  {pill.label}
                </button>
              ))}
            </div>
            <div className="projects-filter-selects flex w-full flex-row items-stretch gap-2 lg:w-auto lg:shrink-0">
              <select
                className="min-w-0 flex-1 rounded-lg border-[1.5px] border-[#dde8f5] px-2 py-2 font-inter text-[11px] outline-none focus:border-hz-blue sm:px-3 sm:text-[12.5px] lg:flex-none"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                aria-label="Filter by city"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All cities' : c}
                  </option>
                ))}
              </select>
              <select
                className="min-w-0 flex-1 rounded-lg border-[1.5px] border-[#dde8f5] px-2 py-2 font-inter text-[11px] outline-none focus:border-hz-blue sm:px-3 sm:text-[12.5px] lg:flex-none"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                aria-label="Filter by status"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === 'Any' ? 'Any status' : s}
                  </option>
                ))}
              </select>
              <select
                className="min-w-0 flex-1 rounded-lg border-[1.5px] border-[#dde8f5] px-2 py-2 font-inter text-[11px] outline-none focus:border-hz-blue sm:px-3 sm:text-[12.5px] lg:flex-none"
                value={budget}
                onChange={(e) => setBudget(e.target.value as BudgetFilter)}
                aria-label="Filter by budget"
              >
                {BUDGET_OPTIONS.map((b) => (
                  <option key={b.label} value={b.value}>
                    {b.label === 'Any budget' ? 'Any budget' : b.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="pg-projects-grid-wrap">
        {loading ? (
          <div className="projects-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[340px] animate-pulse rounded-2xl border border-[#dde8f5] bg-white" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#dde8f5] bg-white px-4 py-12 text-center font-inter text-sm text-muted">
            No projects match your filters.{' '}
            <Link href="/projects" className="font-semibold text-hz-blue">
              Clear filters
            </Link>
          </p>
        ) : (
          <div className="projects-grid">
            {filtered.map((p) => (
              <ProjCard key={p.projectId} project={p} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
