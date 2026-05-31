import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { resolveCmsAssetUrl } from '@/lib/cmsAssetUrl';

const BROWSE_KEYS = ['Land', 'Villa', 'Apartment', 'Plot'] as const;
type BrowseKey = (typeof BROWSE_KEYS)[number];

const cards: {
  key: BrowseKey;
  href: string;
  title: string;
  desc: string;
  from: string;
  to: string;
  count: string;
  fallbackImage: string;
}[] = [
  {
    key: 'Land',
    href: '/buy?type=Land',
    title: 'Land',
    desc: 'Clear-title parcels with growth corridor visibility.',
    from: 'from-amber-600/90',
    to: 'to-navy',
    count: '120+',
    fallbackImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
  },
  {
    key: 'Villa',
    href: '/buy?type=Villa',
    title: 'Villa',
    desc: 'Spacious gated homes with verified approvals.',
    from: 'from-rose-600/90',
    to: 'to-navy',
    count: '85+',
    fallbackImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
  },
  {
    key: 'Apartment',
    href: '/buy?type=Apartment',
    title: 'Apartment',
    desc: 'RERA-forward towers with transparent pricing.',
    from: 'from-hz-blue/90',
    to: 'to-navy',
    count: '340+',
    fallbackImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
  },
  {
    key: 'Plot',
    href: '/buy?type=Plot',
    title: 'Plot',
    desc: 'Corner & facing-aware inventory for builders.',
    from: 'from-hz-teal/90',
    to: 'to-navy',
    count: '210+',
    fallbackImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
  },
];

export function PropertyTypeCards() {
  const [images, setImages] = useState<Partial<Record<BrowseKey, string>>>({});

  useEffect(() => {
    const ac = new AbortController();
    void (async () => {
      try {
        const res = await api.get<Record<string, string | null>>('/site-config/browse-by-type', {
          signal: ac.signal,
        });
        const d = res.data;
        if (d && typeof d === 'object') {
          const next: Partial<Record<BrowseKey, string>> = {};
          for (const k of BROWSE_KEYS) {
            if (d[k]) next[k] = d[k] as string;
          }
          setImages(next);
        }
      } catch {
        /* defaults via fallback per card */
      }
    })();
    return () => ac.abort();
  }, []);

  return (
    <section className="overflow-x-hidden bg-offwhite pt-9 pb-5 md:pt-14 md:pb-7">
      <div className="mx-auto max-w-infra px-4 md:px-7">
        <h2 className="font-montserrat text-[22px] font-extrabold leading-tight text-charcoal md:text-3xl">Browse by type</h2>
        <p className="mt-2 max-w-2xl font-inter text-[13px] leading-relaxed text-muted md:text-sm">
          Immersive cards with verified counts — each category opens the PLP with filters applied.
        </p>
        <div id="type-grid" className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:mt-8">
          {cards.map((c) => {
            const src = resolveCmsAssetUrl(images[c.key] ?? null, c.fallbackImage);
            return (
              <Link
                key={c.title}
                href={c.href}
                className="group relative flex h-[190px] flex-col overflow-hidden rounded-[13px] bg-navy p-4 text-white shadow-lg transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl sm:h-[210px] sm:rounded-2xl sm:p-5 lg:h-[230px]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${c.from} ${c.to} opacity-75 mix-blend-multiply`}
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy via-navy/55 to-navy/20"
                  aria-hidden
                />
                <span className="relative z-[1] ml-auto rounded-full bg-black/35 px-2.5 py-1 font-montserrat text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm">
                  {c.count} listings
                </span>
                <div className="relative z-[1] mt-auto">
                  <div className="font-montserrat text-[15px] font-extrabold sm:text-lg lg:text-xl">{c.title}</div>
                  <p className="mt-1 font-inter text-[11px] leading-relaxed text-white/85 sm:text-xs">{c.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}


