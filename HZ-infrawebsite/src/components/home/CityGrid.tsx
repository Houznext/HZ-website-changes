import Link from 'next/link';

const cities = [
  { name: 'Hyderabad', span: 'md:col-span-2', href: '/buy?city=Hyderabad', count: '420+' },
  { name: 'Bengaluru', span: '', href: '/buy?city=Bengaluru', count: '310+' },
  { name: 'Chennai', span: '', href: '/buy?city=Chennai', count: '180+' },
  { name: 'Mumbai', span: '', href: '/buy?city=Mumbai', count: '260+' },
];

export function CityGrid() {
  return (
    <section className="bg-offwhite py-14">
      <div className="mx-auto max-w-infra px-4 md:px-7">
        <h2 className="font-montserrat text-2xl font-extrabold text-charcoal">Browse by city</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {cities.map((c) => (
            <Link
              key={c.name}
              href={c.href}
              className={`rounded-2xl border border-border bg-hzwhite p-6 shadow-sm transition hover:-translate-y-1 hover:border-hz-blue/40 hover:shadow-lg ${c.span}`}
            >
              <div className="font-montserrat text-xl font-extrabold text-charcoal">{c.name}</div>
              <div className="mt-2 font-inter text-xs text-muted">{c.count} verified listings</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
