import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FilterSidebar } from '@/components/property/FilterSidebar';
import { PropertyCardH } from '@/components/property/PropertyCardH';
import { useProperties } from '@/hooks/useProperties';

export default function BuyPage() {
  const router = useRouter();
  const [extra, setExtra] = useState<Record<string, string>>({});

  const params = useMemo(
    () => ({
      q: (router.query.q as string) || undefined,
      hintType: (router.query.hintType as string) || undefined,
      city: (router.query.city as string) || extra.city || undefined,
      propertyType: (router.query.q as string)
        ? undefined
        : (router.query.propertyType as string) ||
          (router.query.type as string) ||
          extra.type ||
          undefined,
      bhk: extra.bhk || undefined,
      status: (router.query.status as string) || extra.status || undefined,
      minPrice: router.query.minPrice ? Number(router.query.minPrice) : extra.minPrice ? Number(extra.minPrice) : undefined,
      maxPrice: router.query.maxPrice ? Number(router.query.maxPrice) : extra.maxPrice ? Number(extra.maxPrice) : undefined,
      page: 1,
      limit: 20,
    }),
    [
      router.query.q,
      router.query.hintType,
      router.query.city,
      router.query.type,
      router.query.propertyType,
      router.query.hintType,
      router.query.status,
      router.query.minPrice,
      router.query.maxPrice,
      extra.city,
      extra.type,
      extra.bhk,
      extra.status,
      extra.minPrice,
      extra.maxPrice,
    ],
  );

  const { data, loading } = useProperties(params);

  const onFilter = (k: string, v: string) => {
    setExtra((prev) => ({ ...prev, [k]: v }));
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-offwhite">
      <Navbar />
      <div className="mx-auto max-w-infra px-4 py-6 sm:py-8 md:px-7">
        <h1 className="font-montserrat text-xl font-extrabold text-charcoal sm:text-2xl">Properties for sale</h1>
        <p className="mt-1 font-inter text-sm text-muted">
          {params.q
            ? `Results for “${params.q}” — search matches title, type, locality, details, and property ID.`
            : 'Verified inventory with filters.'}
        </p>
        <div className="mt-6 flex flex-col gap-4 sm:mt-8 sm:gap-6 md:grid md:grid-cols-[260px_1fr] lg:grid-cols-[260px_1fr]">
          <FilterSidebar
            filters={{
              city: params.city || '',
              type: params.propertyType || '',
              bhk: extra.bhk || '',
            }}
            onChange={onFilter}
          />
          <div className="min-w-0">
            {loading && <p className="font-inter text-sm text-muted">Loading…</p>}
            <div className="flex flex-col gap-4">
              {(data?.items ?? []).map((p) => (
                <PropertyCardH key={p.propertyId} property={p} />
              ))}
            </div>
            {!loading && (data?.items?.length ?? 0) === 0 && (
              <p className="mt-4 font-inter text-sm text-muted">No listings match these filters yet.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
