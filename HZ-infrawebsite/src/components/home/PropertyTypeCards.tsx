import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { resolveCmsAssetUrl } from '@/lib/cmsAssetUrl';

const BROWSE_KEYS = ['Land', 'Villa', 'Apartment', 'Plot'] as const;
type BrowseKey = (typeof BROWSE_KEYS)[number];

const GRADIENTS: Record<BrowseKey, { from: string; to: string }> = {
  Land: { from: 'from-amber-600/90', to: 'to-navy' },
  Villa: { from: 'from-rose-600/90', to: 'to-navy' },
  Apartment: { from: 'from-hz-blue/90', to: 'to-navy' },
  Plot: { from: 'from-hz-teal/90', to: 'to-navy' },
};

const FALLBACK_IMAGES: Record<BrowseKey, string> = {
  Land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
  Villa: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
  Apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
  Plot: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
};

const DEFAULT_SECTION = {
  sectionTitle: 'Browse by type',
  sectionSubtitle:
    'Immersive cards with verified counts — each category opens the PLP with filters applied.',
};

type CmsCard = { title: string; desc: string; countLabel: string; href: string };
type CmsResponse = {
  sectionTitle?: string;
  sectionSubtitle?: string;
  cards?: Partial<Record<BrowseKey, Partial<CmsCard>>>;
  images?: Partial<Record<BrowseKey, string | null>>;
};

export function PropertyTypeCards() {
  const [sectionTitle, setSectionTitle] = useState(DEFAULT_SECTION.sectionTitle);
  const [sectionSubtitle, setSectionSubtitle] = useState(DEFAULT_SECTION.sectionSubtitle);
  const [cards, setCards] = useState<Record<BrowseKey, CmsCard>>({
    Land: { title: 'Land', desc: 'Clear-title parcels with growth corridor visibility.', countLabel: '120+ listings', href: '/buy?type=Land' },
    Villa: { title: 'Villa', desc: 'Spacious gated homes with verified approvals.', countLabel: '85+ listings', href: '/buy?type=Villa' },
    Apartment: { title: 'Apartment', desc: 'RERA-forward towers with transparent pricing.', countLabel: '340+ listings', href: '/buy?type=Apartment' },
    Plot: { title: 'Plot', desc: 'Corner & facing-aware inventory for builders.', countLabel: '210+ listings', href: '/buy?type=Plot' },
  });
  const [images, setImages] = useState<Partial<Record<BrowseKey, string>>>({});

  useEffect(() => {
    const ac = new AbortController();
    void (async () => {
      try {
        const res = await api.get<CmsResponse>('/site-config/browse-by-type', { signal: ac.signal });
        const d = res.data;
        if (d.sectionTitle) setSectionTitle(d.sectionTitle);
        if (d.sectionSubtitle) setSectionSubtitle(d.sectionSubtitle);
        if (d.cards) {
          setCards((prev) => {
            const next = { ...prev };
            for (const k of BROWSE_KEYS) {
              if (d.cards?.[k]) next[k] = { ...next[k], ...d.cards[k]! };
            }
            return next;
          });
        }
        if (d.images && typeof d.images === 'object') {
          const next: Partial<Record<BrowseKey, string>> = {};
          for (const k of BROWSE_KEYS) {
            if (d.images[k]) next[k] = d.images[k] as string;
          }
          setImages(next);
        }
      } catch {
        /* defaults */
      }
    })();
    return () => ac.abort();
  }, []);

  return (
    <section className="overflow-x-hidden bg-offwhite pt-9 pb-5 md:pt-14 md:pb-7">
      <div className="mx-auto max-w-infra px-4 md:px-7">
        <h2 className="font-montserrat text-[22px] font-extrabold leading-tight text-charcoal md:text-3xl">{sectionTitle}</h2>
        <p className="mt-2 max-w-2xl font-inter text-[13px] leading-relaxed text-muted md:text-sm">{sectionSubtitle}</p>
        <div id="type-grid" className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:mt-8">
          {BROWSE_KEYS.map((key) => {
            const c = cards[key];
            const grad = GRADIENTS[key];
            const src = resolveCmsAssetUrl(images[key] ?? null, FALLBACK_IMAGES[key]);
            return (
              <Link
                key={key}
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
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${grad.from} ${grad.to} opacity-75 mix-blend-multiply`}
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy via-navy/55 to-navy/20"
                  aria-hidden
                />
                <span className="relative z-[1] ml-auto rounded-full bg-black/35 px-2.5 py-1 font-montserrat text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm">
                  {c.countLabel}
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
