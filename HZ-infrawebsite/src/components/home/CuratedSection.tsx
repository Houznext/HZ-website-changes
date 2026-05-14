import Link from 'next/link';
import { PropertyCard } from '@/components/property/PropertyCard';
import type { PublicProperty } from '@/types/property.types';

type SectionProps = {
  title: string;
  href: string;
  items: PublicProperty[];
  cols: 3 | 5;
};

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

function GridSection({ title, href, items, cols }: SectionProps) {
  const grid = cols === 5 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4';
  const empty = !items || items.length === 0;

  return (
    <div className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-montserrat text-lg font-bold text-charcoal">{title}</h3>
        <Link href={href} className="font-inter text-sm font-semibold text-[#2f80ed] hover:underline">
          See all →
        </Link>
      </div>
      {empty ? (
        <SkeletonGrid cols={cols} />
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

type Props = {
  lands: PublicProperty[];
  villas: PublicProperty[];
  apartments: PublicProperty[];
  plots: PublicProperty[];
};

export function CuratedSection({ lands, villas, apartments, plots }: Props) {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-infra px-4 md:px-7">
        <p className="font-montserrat text-[10px] font-bold uppercase tracking-[0.12em] text-[#0d9488]">
          Section 2 — Curated for purpose
        </p>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-montserrat text-2xl font-extrabold text-charcoal md:text-3xl">Properties curated for you</h2>
          <Link
            href="/buy"
            className="inline-flex items-center justify-center rounded-lg border-[1.5px] border-[#dde8f5] px-4 py-2 font-montserrat text-sm font-bold text-[#2f80ed] transition-all duration-150 hover:border-[#2f80ed] hover:bg-[#e8f1fd]"
          >
            View all →
          </Link>
        </div>
        <p className="mt-2 font-inter text-sm text-muted">Featured inventory from the Infra API — refreshed every minute.</p>

        <GridSection title="Featured Lands" href="/buy?propertyType=Land" items={lands} cols={3} />
        <GridSection title="Featured Villas" href="/buy?propertyType=Villa" items={villas} cols={3} />
        <GridSection title="Featured Apartments" href="/buy?propertyType=Apartment" items={apartments} cols={3} />
        <GridSection title="Plots — Five feed" href="/buy?propertyType=Plot" items={plots} cols={5} />
      </div>
    </section>
  );
}
