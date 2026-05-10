import Link from 'next/link';
import { Mountain, Home, Building2, Map } from 'lucide-react';

const cards = [
  {
    href: '/buy?type=Land',
    title: 'Land',
    desc: 'Clear-title parcels with growth corridor visibility.',
    icon: Mountain,
    from: 'from-amber-600/90',
    to: 'to-navy',
    count: '120+',
  },
  {
    href: '/buy?type=Villa',
    title: 'Villa',
    desc: 'Spacious gated homes with verified approvals.',
    icon: Home,
    from: 'from-rose-600/90',
    to: 'to-navy',
    count: '85+',
  },
  {
    href: '/buy?type=Apartment',
    title: 'Apartment',
    desc: 'RERA-forward towers with transparent pricing.',
    icon: Building2,
    from: 'from-hz-blue/90',
    to: 'to-navy',
    count: '340+',
  },
  {
    href: '/buy?type=Plot',
    title: 'Plot',
    desc: 'Corner & facing-aware inventory for builders.',
    icon: Map,
    from: 'from-hz-teal/90',
    to: 'to-navy',
    count: '210+',
  },
];

export function PropertyTypeCards() {
  return (
    <section className="bg-offwhite py-14">
      <div className="mx-auto max-w-infra px-4 md:px-7">
        <h2 className="font-montserrat text-2xl font-extrabold text-charcoal md:text-3xl">Browse by type</h2>
        <p className="mt-2 max-w-2xl font-inter text-sm text-muted">
          Immersive cards with verified counts — each category opens the PLP with filters applied.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className={`group relative flex h-[230px] flex-col overflow-hidden rounded-2xl bg-gradient-to-br ${c.from} ${c.to} p-5 text-white shadow-lg transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl`}
            >
              <c.icon className="h-7 w-7 opacity-90" />
              <span className="ml-auto rounded-full bg-black/25 px-2.5 py-1 font-montserrat text-[10px] font-bold uppercase tracking-wide">
                {c.count} listings
              </span>
              <div className="mt-auto">
                <div className="font-montserrat text-xl font-extrabold">{c.title}</div>
                <p className="mt-1 font-inter text-xs leading-relaxed text-white/80">{c.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
