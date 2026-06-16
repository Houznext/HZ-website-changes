'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { List, Map } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BuyFilterMobileBar } from '@/components/property/BuyFilterMobileBar';
import { BuyFilterSidebar } from '@/components/property/BuyFilterSidebar';
import { BuyResultsToolbar } from '@/components/property/BuyResultsToolbar';
import { BuySearchSortBar } from '@/components/property/BuySearchSortBar';
import { PlpPropertyCard } from '@/components/property/PlpPropertyCard';
import { SearchProjectsRow } from '@/components/projects/SearchProjectsRow';
import { useProperties } from '@/hooks/useProperties';
import {
  buyFiltersToApiParams,
  buyFiltersToQuery,
  buyPageTitle,
  defaultBuyFilters,
  parseBuyFiltersFromQuery,
} from '@/lib/buyFilters';
import { getExplicitPreferredCity, recordPreferredCity, recordTypeInterest } from '@/lib/personalization';

export default function BuyPage() {
  const router = useRouter();
  const [view, setView] = useState<'list' | 'map'>('list');

  const filters = useMemo(() => {
    if (!router.isReady) return defaultBuyFilters();
    const parsed = parseBuyFiltersFromQuery(router.query);
    if (!router.query.city && !parsed.q) {
      const preferred = getExplicitPreferredCity();
      if (preferred) parsed.city = preferred;
    }
    return parsed;
  }, [router.isReady, router.query]);

  const apiParams = useMemo(() => buyFiltersToApiParams(filters), [filters]);
  const { data, loading } = useProperties(apiParams);

  const applyFilters = useCallback(
    (patch: Partial<typeof filters>) => {
      const next = { ...filters, ...patch };
      if (patch.city?.trim()) recordPreferredCity(patch.city);
      if (patch.types?.length) patch.types.forEach((t) => recordTypeInterest(t, 2));
      void router.push({ pathname: '/buy', query: buyFiltersToQuery(next) }, undefined, { shallow: true });
    },
    [filters, router],
  );

  const clearFilters = useCallback(() => {
    void router.push({ pathname: '/buy', query: buyFiltersToQuery(defaultBuyFilters()) }, undefined, { shallow: true });
  }, [router]);

  useEffect(() => {
    if (!router.isReady) return;
    if (filters.city?.trim()) recordPreferredCity(filters.city);
    filters.types.forEach((t) => recordTypeInterest(t, 2));
  }, [router.isReady, filters.city, filters.types]);

  const title = buyPageTitle(filters);
  const total = data?.total ?? 0;
  const page = data?.page ?? filters.page;
  const totalPages = data?.totalPages ?? 1;
  const primaryType = filters.types[0];

  const goPage = (p: number) => {
    const next = Math.min(totalPages, Math.max(1, p));
    void router.push({ pathname: '/buy', query: buyFiltersToQuery({ ...filters, page: next }) }, undefined, {
      shallow: true,
    });
  };

  const pageNums = useMemo(() => {
    const nums: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  }, [page, totalPages]);

  return (
    <div id="pg-buy" className="min-h-screen overflow-x-clip bg-offwhite">
      <Navbar />
      <div className="mx-auto max-w-infra px-4 pb-12 pt-5 md:px-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
          <div>
            <nav className="mb-1 flex items-center gap-1 font-inter text-[11px] text-muted">
              <Link href="/" className="text-[#2f80ed] hover:underline">
                Home
              </Link>
              <span aria-hidden>›</span>
              <span>Buy</span>
              {filters.city ? (
                <>
                  <span aria-hidden>›</span>
                  <span>{filters.city}</span>
                </>
              ) : null}
            </nav>
            <h1 className="font-montserrat text-xl font-extrabold text-charcoal">{title}</h1>
            <p className="mt-0.5 font-inter text-xs text-muted">
              <strong className="font-semibold text-charcoal">{loading ? '…' : total.toLocaleString('en-IN')}</strong>{' '}
              verified results
            </p>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setView('list')}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-montserrat text-xs font-bold transition ${
                view === 'list'
                  ? 'border-[#2f80ed] bg-[#e8f1fd] text-[#2f80ed]'
                  : 'border-[#dde8f5] bg-white text-charcoal hover:border-[#93c5fd]'
              }`}
            >
              <List className="h-3.5 w-3.5" strokeWidth={1.8} />
              List
            </button>
            <button
              type="button"
              onClick={() => setView('map')}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-montserrat text-xs font-bold transition ${
                view === 'map'
                  ? 'border-[#2f80ed] bg-[#2f80ed] text-white'
                  : 'border-[#dde8f5] bg-white text-charcoal hover:border-[#93c5fd]'
              }`}
            >
              <Map className="h-3.5 w-3.5" strokeWidth={1.8} />
              Map
            </button>
          </div>
        </div>

        <BuySearchSortBar
          filters={filters}
          hasSearch={!!filters.q.trim()}
          onChange={applyFilters}
          className="mb-3 md:mb-4"
        />

        <BuyFilterMobileBar filters={filters} onChange={applyFilters} onClear={clearFilters} />

        <div className="plp-grid grid grid-cols-1 items-start gap-5 lg:grid-cols-[256px_minmax(0,1fr)] lg:gap-5">
          <div className="hidden lg:sticky lg:top-16 lg:z-[5] lg:block lg:max-h-[calc(100vh-4.5rem)] lg:self-start">
            <BuyFilterSidebar filters={filters} onChange={applyFilters} onClear={clearFilters} />
          </div>

          <div className="min-w-0">
            <BuyResultsToolbar filters={filters} onChange={applyFilters} className="mb-3 hidden md:flex" />

            {view === 'map' ? (
              <div className="rounded-2xl border border-dashed border-[#dde8f5] bg-white px-4 py-16 text-center">
                <p className="font-montserrat text-base font-bold text-charcoal">Map view</p>
                <p className="mt-2 font-inter text-sm text-muted">
                  Map view is coming soon. Switch to list view to browse {total} listings.
                </p>
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="mt-4 rounded-lg bg-[#2f80ed] px-4 py-2 font-montserrat text-sm font-bold text-white"
                >
                  Show list
                </button>
              </div>
            ) : (
              <>
                {loading ? (
                  <div className="flex flex-col gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-[140px] animate-pulse rounded-[14px] border border-[#dde8f5] bg-white" />
                    ))}
                  </div>
                ) : (
                  <>
                    <SearchProjectsRow propertyType={primaryType} city={filters.city} />
                    <div className="flex flex-col gap-3">
                      {(data?.items ?? []).map((p) => (
                        <PlpPropertyCard key={p.propertyId} property={p} />
                      ))}
                    </div>
                    {!data?.items?.length ? (
                      <p className="mt-4 rounded-2xl border border-dashed border-[#dde8f5] bg-white px-4 py-10 text-center font-inter text-sm text-muted">
                        No listings match these filters. Try clearing filters or choosing another city.
                      </p>
                    ) : null}
                  </>
                )}

                {totalPages > 1 ? (
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => goPage(page - 1)}
                      className="rounded-lg border border-[#dde8f5] bg-white px-3 py-1.5 font-montserrat text-xs font-bold text-charcoal disabled:opacity-40"
                    >
                      ‹ Prev
                    </button>
                    {pageNums.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => goPage(n)}
                        className={`rounded-lg border px-3 py-1.5 font-montserrat text-xs font-bold ${
                          n === page
                            ? 'border-[#2f80ed] bg-[#2f80ed] text-white'
                            : 'border-[#dde8f5] bg-white text-charcoal hover:border-[#93c5fd]'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => goPage(page + 1)}
                      className="rounded-lg border border-[#dde8f5] bg-white px-3 py-1.5 font-montserrat text-xs font-bold text-charcoal disabled:opacity-40"
                    >
                      Next ›
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
