'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import type { InfraProject } from '@/types/infra.types';
import { TYPE_FILTER_PILLS, type ProjectTypeKey } from '@/lib/projects/constants';
import { filterProjects } from '@/lib/projects/utils';
import { ProjCard } from '@/components/projects/ProjCard';

async function loadFeatured(): Promise<InfraProject[]> {
  try {
    const res = await api.get<InfraProject[]>('/projects', { params: { featured: true, limit: 20 } });
    const list = Array.isArray(res.data) ? res.data : [];
    if (list.length) return list;
    const all = await api.get<InfraProject[]>('/projects', { params: { limit: 20 } });
    return Array.isArray(all.data) ? all.data : [];
  } catch {
    return [];
  }
}

export function FeaturedProjects() {
  const [items, setItems] = useState<InfraProject[]>([]);
  const [typeFilter, setTypeFilter] = useState<ProjectTypeKey | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setItems(await loadFeatured());
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(
    () => filterProjects(items, { type: typeFilter }).slice(0, 8),
    [items, typeFilter],
  );

  return (
    <section id="pg-home" className="overflow-x-hidden border-t border-[#e8eff5] bg-offwhite pt-8 pb-9 md:pt-10 md:pb-14">
      <div className="mx-auto max-w-infra px-4 md:px-7">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-3 sm:mb-3">
          <div>
            <div className="font-montserrat text-[11px] font-bold uppercase tracking-[0.12em] text-hz-teal">
              RERA Registered Projects
            </div>
            <h2 className="mt-1.5 font-montserrat text-[22px] font-extrabold leading-tight text-charcoal md:text-[28px]">
              Featured Projects
            </h2>
            <p className="mt-1 font-inter text-[13px] text-muted">
              Curated apartment, villa, venture &amp; plotted projects from verified developers
            </p>
          </div>
          <Link
            href="/projects"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg border-[1.5px] border-[#dde8f5] bg-white px-4 py-2 font-montserrat text-[13px] font-bold text-charcoal transition hover:border-hz-blue hover:bg-hz-blue-light hover:text-hz-blue"
          >
            View all projects →
          </Link>
        </div>

        <div className="proj-type-filter-bar">
          {TYPE_FILTER_PILLS.map((pill) => (
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

        {loading ? (
          <div id="home-proj-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[340px] animate-pulse rounded-2xl border border-[#dde8f5] bg-white" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#dde8f5] bg-white px-4 py-10 text-center font-inter text-[13px] text-muted">
            No featured projects in this category yet.
          </p>
        ) : (
          <div id="home-proj-grid">
            {filtered.map((p) => (
              <ProjCard key={p.projectId} project={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
