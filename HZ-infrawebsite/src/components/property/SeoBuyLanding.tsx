'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PlpPropertyCard } from '@/components/property/PlpPropertyCard';
import { useProperties } from '@/hooks/useProperties';
import type { SeoCitySlug, SeoTypeSlug } from '@/lib/seoLanding';
import { SEO_CITY_SLUGS, SEO_TYPE_SLUGS, seoLandingIntro } from '@/lib/seoLanding';

type Props = {
  citySlug: SeoCitySlug;
  typeSlug: SeoTypeSlug;
};

export function SeoBuyLanding({ citySlug, typeSlug }: Props) {
  const city = SEO_CITY_SLUGS.find((c) => c.slug === citySlug)!;
  const type = SEO_TYPE_SLUGS.find((t) => t.slug === typeSlug)!;

  const apiParams = useMemo(
    () => ({
      city: city.name,
      propertyType: type.propertyType,
      sortBy: 'newest' as const,
      page: 1,
      limit: 24,
    }),
    [city.name, type.propertyType],
  );

  const { data, loading } = useProperties(apiParams);
  const items = data?.items ?? [];
  const total = data?.total ?? items.length;
  const intro = seoLandingIntro(city.name, type.label, type.propertyType);

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <Navbar />
      <main className="mx-auto max-w-infra px-4 py-8 md:px-7 md:py-10">
        <nav className="mb-4 font-inter text-xs text-muted">
          <Link href="/" className="text-hz-blue hover:underline">
            Home
          </Link>
          {' / '}
          <Link href="/buy" className="text-hz-blue hover:underline">
            Buy
          </Link>
          {` / ${city.name} / ${type.label}`}
        </nav>

        <h1 className="font-montserrat text-[26px] font-extrabold leading-tight text-charcoal md:text-[32px]">
          {type.label} in {city.name}
        </h1>
        <p className="mt-3 max-w-3xl font-inter text-[14px] leading-relaxed text-muted md:text-[15px]">{intro}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/buy?city=${encodeURIComponent(city.name)}&type=${encodeURIComponent(type.propertyType)}`}
            className="inline-flex min-h-[44px] items-center rounded-lg bg-hz-blue px-5 py-2.5 font-montserrat text-sm font-bold text-white hover:bg-hz-blue-hover"
          >
            View all {type.label.toLowerCase()} in {city.name} →
          </Link>
          <span className="font-inter text-sm text-muted">
            {loading ? 'Loading listings…' : `${total} verified listing${total === 1 ? '' : 's'}`}
          </span>
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[340px] animate-pulse rounded-2xl border border-[#dde8f5] bg-white" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-[#dde8f5] bg-white px-4 py-10 text-center font-inter text-sm text-muted">
            New {type.label.toLowerCase()} in {city.name} are added regularly.{' '}
            <Link href="/sell" className="font-semibold text-hz-blue hover:underline">
              List your property
            </Link>{' '}
            or{' '}
            <Link href="/buy" className="font-semibold text-hz-blue hover:underline">
              browse all cities
            </Link>
            .
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <PlpPropertyCard key={p.propertyId} property={p} />
            ))}
          </div>
        )}

        <section className="mt-12 rounded-2xl border border-[#dde8f5] bg-white p-6">
          <h2 className="font-montserrat text-lg font-bold text-charcoal">Explore more in {city.name}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {SEO_TYPE_SLUGS.filter((t) => t.slug !== typeSlug).map((t) => (
              <Link
                key={t.slug}
                href={`/buy/${citySlug}/${t.slug}`}
                className="rounded-full border border-[#dde8f5] px-3 py-1.5 font-inter text-xs font-semibold text-charcoal hover:border-hz-blue hover:text-hz-blue"
              >
                {t.label} in {city.name}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
