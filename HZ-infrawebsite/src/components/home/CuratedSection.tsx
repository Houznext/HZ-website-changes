'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/axios';
import { PropertyCard } from '@/components/property/PropertyCard';
import { usePersonalizedCurated, type CuratedCmsConfig, type CuratedSectionData } from '@/hooks/usePersonalizedCurated';
import type { PublicProperty } from '@/types/property.types';
import type { PropertyTypeKey } from '@/lib/personalization';

const DEFAULT_CMS = {
  title: 'Properties curated for you',
  defaultSubtitle: 'Picks tailored to your city and browsing — updates as you explore',
  viewAllLabel: 'View all →',
};

/** Desktop shows 5 cards; carousel scrolls through the rest. */
const DESKTOP_VISIBLE = 5;

type FallbackProps = Partial<Record<PropertyTypeKey, PublicProperty[]>>;

function SkeletonCarousel() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {Array.from({ length: DESKTOP_VISIBLE }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl border border-[#dde8f5] bg-white"
        >
          <div className="h-[160px] bg-[#f0f4f8] md:h-[150px]" />
          <div className="space-y-2 p-3">
            <div className="h-2 w-1/3 rounded bg-[#e8eff5]" />
            <div className="h-4 w-full rounded bg-[#e8eff5]" />
            <div className="h-3 w-2/3 rounded bg-[#f0f4f8]" />
            <div className="h-6 w-1/2 rounded bg-[#e8eff5]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CarouselSection({
  title,
  href,
  items,
  loading,
}: {
  title: string;
  href: string;
  items: PublicProperty[];
  loading: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const syncArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) {
      setCanPrev(false);
      setCanNext(false);
      return;
    }
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(maxScroll > 4 && el.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    syncArrows();
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => syncArrows();
    el.addEventListener('scroll', onScroll, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => syncArrows()) : null;
    ro?.observe(el);
    window.addEventListener('resize', syncArrows);
    return () => {
      el.removeEventListener('scroll', onScroll);
      ro?.disconnect();
      window.removeEventListener('resize', syncArrows);
    };
  }, [items, loading, syncArrows]);

  const scrollByPage = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-curated-card]');
    const gap = 12;
    const cardW = card?.offsetWidth ?? el.clientWidth / DESKTOP_VISIBLE;
    const page = Math.max(1, Math.round(el.clientWidth / (cardW + gap)));
    el.scrollBy({ left: dir * page * (cardW + gap), behavior: 'smooth' });
  };

  const showArrows = !loading && items.length > DESKTOP_VISIBLE;

  return (
    <div className="mt-10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-montserrat text-lg font-bold text-charcoal">{title}</h3>
        <div className="flex items-center gap-2">
          {showArrows ? (
            <div className="hidden items-center gap-1.5 sm:flex">
              <button
                type="button"
                aria-label={`Previous ${title}`}
                disabled={!canPrev}
                onClick={() => scrollByPage(-1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dde8f5] bg-white text-charcoal transition hover:border-[#2f80ed] hover:bg-[#e8f1fd] hover:text-[#2f80ed] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[#dde8f5] disabled:hover:bg-white disabled:hover:text-charcoal"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2.25} />
              </button>
              <button
                type="button"
                aria-label={`Next ${title}`}
                disabled={!canNext}
                onClick={() => scrollByPage(1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dde8f5] bg-white text-charcoal transition hover:border-[#2f80ed] hover:bg-[#e8f1fd] hover:text-[#2f80ed] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[#dde8f5] disabled:hover:bg-white disabled:hover:text-charcoal"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2.25} />
              </button>
            </div>
          ) : null}
          <Link href={href} className="font-inter text-sm font-semibold text-[#2f80ed] hover:underline">
            See all →
          </Link>
        </div>
      </div>

      {loading ? (
        <SkeletonCarousel />
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#dde8f5] bg-[#f5f7fa] px-4 py-8 text-center font-inter text-[13px] text-muted">
          No listings in this category for your area yet. Try{' '}
          <Link href={href} className="font-semibold text-[#2f80ed] hover:underline">
            browsing all
          </Link>
          .
        </p>
      ) : (
        <div className="relative">
          {showArrows ? (
            <>
              <button
                type="button"
                aria-label={`Previous ${title}`}
                disabled={!canPrev}
                onClick={() => scrollByPage(-1)}
                className="absolute -left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#dde8f5] bg-white/95 text-charcoal shadow-md transition hover:border-[#2f80ed] hover:text-[#2f80ed] disabled:pointer-events-none disabled:opacity-0 lg:flex xl:-left-3"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2.25} />
              </button>
              <button
                type="button"
                aria-label={`Next ${title}`}
                disabled={!canNext}
                onClick={() => scrollByPage(1)}
                className="absolute -right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#dde8f5] bg-white/95 text-charcoal shadow-md transition hover:border-[#2f80ed] hover:text-[#2f80ed] disabled:pointer-events-none disabled:opacity-0 lg:flex xl:-right-3"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2.25} />
              </button>
            </>
          ) : null}

          <div
            ref={scrollerRef}
            className="flex gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
          >
            {items.map((p) => (
              <div
                key={p.propertyId}
                data-curated-card
                className="w-[calc((100%-0.75rem)/2)] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/3)] md:w-[calc((100%-3rem)/5)]"
              >
                <PropertyCard property={p} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CuratedBody({ data, loading }: { data: CuratedSectionData | null; loading: boolean }) {
  const sections = data?.sections ?? [];
  const subtitle =
    data?.profile.subtitle ?? 'Picks tailored to your city and browsing — updates as you explore';

  return (
    <>
      <p className="mt-2 font-inter text-[13px] leading-relaxed text-muted md:text-sm">{subtitle}</p>
      {sections.map((s) => (
        <CarouselSection
          key={s.type}
          title={s.title}
          href={s.href}
          items={s.items}
          loading={loading}
        />
      ))}
    </>
  );
}

type Props = {
  fallback?: FallbackProps;
};

export function CuratedSection({ fallback }: Props) {
  const router = useRouter();
  const [cms, setCms] = useState<{ title: string; viewAllLabel: string } & CuratedCmsConfig>(DEFAULT_CMS);

  useEffect(() => {
    const ac = new AbortController();
    void (async () => {
      try {
        const res = await api.get<Partial<typeof DEFAULT_CMS & CuratedCmsConfig>>('/site-config/curated-properties', {
          signal: ac.signal,
        });
        setCms((prev) => ({ ...prev, ...res.data }));
      } catch {
        /* defaults */
      }
    })();
    return () => ac.abort();
  }, []);

  const { data, loading, reload } = usePersonalizedCurated(fallback, cms);

  useEffect(() => {
    if (router.pathname !== '/') return;
    void reload();
  }, [router.asPath, router.pathname, reload]);

  useEffect(() => {
    const onFocus = () => void reload();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [reload]);

  return (
    <section className="overflow-x-hidden bg-white py-9 md:py-14">
      <div className="mx-auto max-w-infra px-4 md:px-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-montserrat text-[22px] font-extrabold leading-tight text-charcoal md:text-3xl">
            {cms.title}
          </h2>
          <Link
            href={data ? `/buy?city=${encodeURIComponent(data.profile.city)}` : '/buy'}
            className="inline-flex items-center justify-center rounded-lg border-[1.5px] border-[#dde8f5] px-4 py-2 font-montserrat text-sm font-bold text-[#2f80ed] transition-all duration-150 hover:border-[#2f80ed] hover:bg-[#e8f1fd]"
          >
            {cms.viewAllLabel}
          </Link>
        </div>
        <CuratedBody data={data} loading={loading} />
      </div>
    </section>
  );
}
