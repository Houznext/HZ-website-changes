import { PropertyCard } from '@/components/property/PropertyCard';
import { useProperties } from '@/hooks/useProperties';

function Row({ title, type }: { title: string; type: string }) {
  const { data } = useProperties({ type, limit: type === 'Plot' ? 5 : 3 });
  const cols = type === 'Plot' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
  return (
    <div className="mt-10">
      <h3 className="font-montserrat text-lg font-bold text-charcoal">{title}</h3>
      <div className={`mt-4 grid gap-4 ${cols}`}>
        {(data?.items ?? []).map((p) => (
          <PropertyCard key={p.propertyId} property={p} />
        ))}
      </div>
    </div>
  );
}

export function CuratedSection() {
  return (
    <section className="bg-hzwhite py-14">
      <div className="mx-auto max-w-infra px-4 md:px-7">
        <h2 className="font-montserrat text-2xl font-extrabold text-charcoal md:text-3xl">Curated for you</h2>
        <p className="mt-2 font-inter text-sm text-muted">Featured inventory by category — powered by the Infra API.</p>
        <Row title="Featured Lands" type="Land" />
        <Row title="Featured Villas" type="Villa" />
        <Row title="Featured Apartments" type="Apartment" />
        <Row title="Plots — five feed" type="Plot" />
      </div>
    </section>
  );
}
