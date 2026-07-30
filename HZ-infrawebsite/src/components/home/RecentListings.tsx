'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import api from '@/lib/axios';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { PublicProperty } from '@/types/property.types';
import { resolveCmsAssetUrl } from '@/lib/cmsAssetUrl';
import {
  formatPriceInr,
  getPropertyGradient,
  propertyImageUrls,
  showEmiBlock,
  showsConstructionStatus,
} from '@/lib/property-utils';

const DEFAULT_COPY = {
  eyebrow: 'Fresh on the market',
  title: 'Recent Listings',
  subtitle: 'Newly added land, villas, apartments and plots — verified before they go live',
  viewAllLabel: 'View all listings →',
  emptyMessage: 'No Recent Listings Available.',
};

/** Backend caps public list at 50 per page — we walk pages until all are loaded. */
const PAGE_SIZE = 50;
const MAX_PAGES = 20;

type Props = {
  initialItems?: PublicProperty[];
};

type ListPayload = {
  data?: PublicProperty[];
  items?: PublicProperty[];
  totalPages?: number;
  total?: number;
};

function parsePropertyList(payload: unknown): PublicProperty[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    const j = payload as ListPayload;
    return j.data ?? j.items ?? [];
  }
  return [];
}

function totalPagesFrom(payload: unknown, pageItems: number): number {
  if (payload && typeof payload === 'object') {
    const j = payload as ListPayload;
    if (typeof j.totalPages === 'number' && j.totalPages > 0) return j.totalPages;
    if (typeof j.total === 'number' && j.total > 0) return Math.ceil(j.total / PAGE_SIZE);
  }
  return pageItems < PAGE_SIZE ? 1 : MAX_PAGES;
}

async function loadAllRecentListings(): Promise<PublicProperty[]> {
  const all: PublicProperty[] = [];
  try {
    let page = 1;
    let totalPages = 1;
    while (page <= totalPages && page <= MAX_PAGES) {
      const res = await api.get('/properties', {
        params: { sortBy: 'newest', limit: PAGE_SIZE, page },
      });
      const batch = parsePropertyList(res.data);
      all.push(...batch);
      totalPages = totalPagesFrom(res.data, batch.length);
      if (!batch.length) break;
      page += 1;
    }
  } catch {
    /* keep whatever was collected */
  }
  return all;
}

function RecentListingCard({ property }: { property: PublicProperty }) {
  const slug = property.slug || property.propertyId;
  const href = `/property/${slug}`;
  const rawImg = propertyImageUrls(property)[0];
  const img = rawImg ? resolveCmsAssetUrl(rawImg, '') : '';
  const location = [property.locality, property.city].filter(Boolean).join(', ') || 'India';
  const showBhk = Boolean(property.bhkType) && showEmiBlock(property.propertyType);
  const showStatus = showsConstructionStatus(property.propertyType) && Boolean(property.constructionStatus);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#dde8f5] bg-white transition-all duration-200 hover:-translate-y-1 hover:border-[#93c5fd] hover:shadow-[0_16px_48px_rgba(15,42,68,0.10)]">
      <Link href={href} className="relative block h-[190px] w-full shrink-0 overflow-hidden">
        {img ? (
          <Image
            src={img}
            alt={property.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width:480px) 100vw, (max-width:1100px) 50vw, 25vw"
            unoptimized={img.includes('127.0.0.1') || img.includes('localhost')}
          />
        ) : (
          <div className="h-full w-full" style={{ background: getPropertyGradient(property.propertyType) }} />
        )}
        {showStatus ? (
          <div className="pointer-events-none absolute bottom-2 left-2">
            <StatusBadge status={property.constructionStatus} propertyType={property.propertyType} />
          </div>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">
          {property.propertyType}
        </div>
        <Link
          href={href}
          className="mt-0.5 font-montserrat text-[15px] font-bold leading-snug text-charcoal line-clamp-2 hover:text-hz-blue"
        >
          {property.title}
        </Link>
        <div className="mt-1 flex items-center gap-1 font-inter text-xs text-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
          <span className="truncate">{location}</span>
        </div>

        {showBhk ? (
          <div className="mt-2">
            <span className="rounded border border-[#0d9488]/25 bg-[#ccfbf1] px-1.5 py-0.5 font-inter text-[10px] font-semibold text-[#0f766e]">
              {property.bhkType}
            </span>
          </div>
        ) : null}

        <div className="mt-auto pt-3">
          <div className="font-montserrat text-xl font-extrabold text-charcoal">
            {formatPriceInr(property.basePrice)}
          </div>
          <Link
            href={href}
            className="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[#2f80ed] px-3 py-2.5 text-center font-montserrat text-sm font-bold text-white transition duration-150 hover:bg-[#1a6dd6]"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

export function RecentListings({ initialItems = [] }: Props) {
  const [items, setItems] = useState<PublicProperty[]>(initialItems);
  const [loading, setLoading] = useState(initialItems.length === 0);
  const [copy, setCopy] = useState(DEFAULT_COPY);

  useEffect(() => {
    const ac = new AbortController();
    void (async () => {
      try {
        const res = await api.get<Partial<typeof DEFAULT_COPY>>('/site-config/recent-listings', {
          signal: ac.signal,
        });
        setCopy((prev) => ({ ...prev, ...res.data }));
      } catch {
        /* keep defaults */
      }
    })();
    return () => ac.abort();
  }, []);

  useEffect(() => {
    let alive = true;
    void (async () => {
      if (initialItems.length === 0) setLoading(true);
      const fresh = await loadAllRecentListings();
      if (!alive) return;
      if (fresh.length) setItems(fresh);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
    // SSR props are a first paint only; client refresh loads the full newest set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      id="recent-listings"
      aria-labelledby="recent-listings-heading"
      className="overflow-x-hidden border-t border-[#e8eff5] bg-offwhite pt-8 pb-9 md:pt-10 md:pb-12"
    >
      <div className="mx-auto max-w-infra px-4 md:px-7">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-7">
          <div>
            <div className="font-montserrat text-[11px] font-bold uppercase tracking-[0.12em] text-hz-blue">
              {copy.eyebrow}
            </div>
            <h2
              id="recent-listings-heading"
              className="mt-1.5 font-montserrat text-[22px] font-extrabold leading-tight text-charcoal md:text-[28px]"
            >
              {copy.title}
            </h2>
            <p className="mt-1 max-w-2xl font-inter text-[13px] leading-relaxed text-muted">
              {copy.subtitle}
            </p>
          </div>
          <Link
            href="/buy"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg border-[1.5px] border-[#dde8f5] bg-white px-4 py-2 font-montserrat text-[13px] font-bold text-charcoal transition hover:border-hz-blue hover:bg-hz-blue-light hover:text-hz-blue"
          >
            {copy.viewAllLabel}
          </Link>
        </div>

        {loading ? (
          <div id="home-recent-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[360px] animate-pulse rounded-2xl border border-[#dde8f5] bg-white" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#dde8f5] bg-white px-4 py-10 text-center font-inter text-[14px] font-medium text-muted">
            {copy.emptyMessage}
          </p>
        ) : (
          <div id="home-recent-grid">
            {items.map((p) => (
              <RecentListingCard key={p.propertyId} property={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/** Server / ISR fetch — walks every page so homepage SSR includes the full recent set. */
export async function fetchRecentListings(base: string): Promise<PublicProperty[]> {
  const root = base.replace(/\/$/, '');
  const all: PublicProperty[] = [];
  try {
    let page = 1;
    let totalPages = 1;
    while (page <= totalPages && page <= MAX_PAGES) {
      const url = `${root}/properties?sortBy=newest&limit=${PAGE_SIZE}&page=${page}`;
      const res = await fetch(url);
      if (!res.ok) break;
      const j = await res.json();
      const batch = parsePropertyList(j);
      all.push(...batch);
      totalPages = totalPagesFrom(j, batch.length);
      if (!batch.length) break;
      page += 1;
    }
  } catch {
    return all;
  }
  return all;
}
