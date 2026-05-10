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
      city: (router.query.city as string) || extra.city || undefined,
      type: (router.query.type as string) || extra.type || undefined,
      bhk: extra.bhk || undefined,
      page: 1,
      limit: 12,
    }),
    [router.query.city, router.query.type, extra.city, extra.type, extra.bhk],
  );

  const { data, loading } = useProperties(params);

  const onFilter = (k: string, v: string) => {
    setExtra((prev) => ({ ...prev, [k]: v }));
  };

  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <div className="mx-auto max-w-infra px-4 py-8 md:px-7">
        <h1 className="font-montserrat text-2xl font-extrabold text-charcoal">Properties for sale</h1>
        <p className="mt-1 font-inter text-sm text-muted">Verified inventory with filters.</p>
        <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
          <FilterSidebar
            filters={{
              city: params.city || '',
              type: params.type || '',
              bhk: extra.bhk || '',
            }}
            onChange={onFilter}
          />
          <div>
            {loading && <p className="font-inter text-sm text-muted">Loading…</p>}
            <div className="flex flex-col gap-4">
              {(data?.items ?? []).map((p) => (
                <PropertyCardH key={p.propertyId} property={p} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
