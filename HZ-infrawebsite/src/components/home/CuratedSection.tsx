'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PropertyCard } from '@/components/property/PropertyCard';
import { usePersonalizedCurated, type CuratedSectionData } from '@/hooks/usePersonalizedCurated';
import type { PublicProperty } from '@/types/property.types';
import type { PropertyTypeKey } from '@/lib/personalization';

type FallbackProps = Partial<Record<PropertyTypeKey, PublicProperty[]>>;

function SkeletonGrid({ cols }: { cols: 3 | 5 }) {
  const grid = cols === 5 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
  return (
    <div className={`grid gap-4 ${grid}`}>
      {Array.from({ length: cols }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl border border-[#dde8f5] bg-white"
        >
          <div className="h-[190px] bg-[#f0f4f8]" />
          <div className="space-y-2 p-4">
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

function GridSection({
  title,
  href,
  items,
  cols,
  loading,
}: {
  title: string;
  href: string;
  items: PublicProperty[];
  cols: 3 | 5;
  loading: boolean;
}) {
  const grid = cols === 5 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4';

  return (
    <div className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-montserrat text-lg font-bold text-charcoal">{title}</h3>
        <Link href={href} className="font-inter text-sm font-semibold text-[#2f80ed] hover:underline">
          See all →
        </Link>
      </div>
      {loading ? (
        <SkeletonGrid cols={cols} />
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#dde8f5] bg-[#f5f7fa] px-4 py-8 text-center font-inter text-[13px] text-muted">
          No listings in this category for your area yet. Try{' '}
          <Link href={href} className="font-semibold text-[#2f80ed] hover:underline">
            browsing all
          </Link>
          .
        </p>
      ) : (
        <div className={`grid ${grid}`}>
          {items.map((p) => (
            <PropertyCard key={p.propertyId} property={p} />
          ))}
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
        <GridSection
          key={s.type}
          title={s.title}
          href={s.href}
          items={s.items}
          cols={s.cols}
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
  const { data, loading, reload } = usePersonalizedCurated(fallback);

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
            Properties curated for you
          </h2>
          <Link
            href={data ? `/buy?city=${encodeURIComponent(data.profile.city)}` : '/buy'}
            className="inline-flex items-center justify-center rounded-lg border-[1.5px] border-[#dde8f5] px-4 py-2 font-montserrat text-sm font-bold text-[#2f80ed] transition-all duration-150 hover:border-[#2f80ed] hover:bg-[#e8f1fd]"
          >
            View all →
          </Link>
        </div>
        <CuratedBody data={data} loading={loading} />
      </div>
    </section>
  );
}
