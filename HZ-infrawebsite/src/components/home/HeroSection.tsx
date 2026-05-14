import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Home,
  Landmark,
  MapPinned,
} from 'lucide-react';
import { useSearchStore, type HeroTab } from '@/store/searchStore';
import { HeroSearch } from '@/components/search/HeroSearch';
import api from '@/lib/axios';

const tabs: { key: HeroTab; label: string; Icon: typeof Landmark }[] = [
  { key: 'Land', label: 'Land', Icon: Landmark },
  { key: 'Villa', label: 'Villa', Icon: Home },
  { key: 'Apartment', label: 'Apartment', Icon: Building2 },
  { key: 'Plot', label: 'Plot', Icon: MapPinned },
];

const popularTags = [
  '2BHK Hyderabad',
  'Villas Kokapet',
  'Plots Bengaluru',
  'Ready to move Mumbai',
  'Apartments Chennai',
];

const defaultCityBg =
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=85';

function publicApiOrigin(): string {
  const raw =
    (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_INFRA_API_URL : undefined) ||
    process.env.INFRA_BACKEND_URL ||
    'http://127.0.0.1:4001';
  return raw.trim().replace(/\/+$/, '');
}

/** Absolute URL for <img src>; relative paths resolve against the infra API origin (not the Next site). */
function resolveHeroImageUrl(input: string | null | undefined): string {
  if (!input?.trim()) return defaultCityBg;
  const u = input.trim();
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith('//')) return `https:${u}`;
  const base = publicApiOrigin();
  return u.startsWith('/') ? `${base}${u}` : `${base}/${u}`;
}

export function HeroSection() {
  const { activeTab, setActiveTab, setQuery } = useSearchStore();
  const [hero, setHero] = useState<{ heroImageUrl: string | null; heroOpacity: number }>({
    heroImageUrl: null,
    heroOpacity: 18,
  });
  const [useFallbackImage, setUseFallbackImage] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    void (async () => {
      try {
        const res = await api.get('/site-config/hero', { signal: ac.signal });
        const d = res.data as { heroImageUrl?: string | null; heroOpacity?: number } | undefined;
        setHero((prev) => ({
          heroImageUrl: d?.heroImageUrl != null && d.heroImageUrl !== '' ? d.heroImageUrl : prev.heroImageUrl,
          heroOpacity:
            typeof d?.heroOpacity === 'number' && Number.isFinite(d.heroOpacity)
              ? d.heroOpacity
              : prev.heroOpacity,
        }));
      } catch {
        if (!ac.signal.aborted) {
          /* keep defaults */
        }
      }
    })();
    return () => ac.abort();
  }, []);

  useEffect(() => {
    setUseFallbackImage(false);
  }, [hero.heroImageUrl]);

  const rawOp = Number(hero.heroOpacity);
  const opacityPct = Number.isFinite(rawOp) ? rawOp : 18;
  /** CMS 5 = darker stack, 40 = lighter (legacy heroOpacity semantics). */
  const cms = Math.min(40, Math.max(5, opacityPct));
  const overlayDarkness = 0.9 - ((cms - 5) / 35) * 0.22;

  const resolvedSrc = useMemo(() => {
    if (useFallbackImage) return defaultCityBg;
    return resolveHeroImageUrl(hero.heroImageUrl);
  }, [hero.heroImageUrl, useFallbackImage]);

  return (
    <section className="relative min-h-[min(92vh,820px)] overflow-hidden bg-navy">
      {/* Photo at full opacity — dimming is done only by overlays so the image never fades out from CSS opacity on the photo layer. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolvedSrc}
        alt=""
        width={1920}
        height={1080}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full min-h-full object-cover"
        onError={() => setUseFallbackImage(true)}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#050d18] via-[#0a1628] to-[#0f2a44]"
        style={{ opacity: overlayDarkness }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-navy/25" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-[min(92vh,820px)] max-w-infra flex-col items-center justify-center px-4 pb-16 pt-14 md:px-7 md:pb-20 md:pt-16">
        <div className="flex w-full max-w-3xl flex-col items-center text-center">
          <h1 className="font-montserrat text-3xl font-extrabold leading-[1.15] tracking-tight text-white md:text-5xl md:leading-[1.12]">
            India&apos;s most trusted
            <br />
            <span className="text-hz-accent">property platform.</span>
          </h1>

          <p className="mt-4 max-w-xl font-inter text-sm leading-relaxed text-white/85 md:text-[15px]">
            Buy · Sell · Land · Villa · Apartment · Plot — verified by Houznext
          </p>

          <div className="mt-10 w-full max-w-2xl rounded-2xl border border-white/20 bg-white/[0.12] p-3 shadow-[0_8px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl md:p-4">
            <div className="flex gap-1 rounded-xl bg-black/20 p-1 md:gap-1.5">
              {tabs.map(({ key, label, Icon }) => {
                const active = activeTab === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 font-montserrat text-xs font-bold transition md:text-[13px] ${
                      active
                        ? 'bg-hero-blue text-white shadow-md'
                        : 'text-white/85 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-95" strokeWidth={active ? 2.25 : 2} aria-hidden />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4">
              <HeroSearch />
            </div>

            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
                <span className="font-inter text-xs font-semibold text-white/90 md:text-sm">Popular:</span>
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setQuery(tag)}
                    className="rounded-full border border-white/35 bg-white/[0.06] px-3 py-1.5 font-inter text-xs text-white/95 transition hover:border-white/55 hover:bg-white/10 md:text-[13px]"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-white/10 bg-black/15 px-4 py-5 md:grid-cols-4 md:gap-6 md:px-6">
              <div>
                <p className="font-montserrat text-2xl font-extrabold text-white md:text-3xl">1,200+</p>
                <p className="mt-0.5 font-inter text-[11px] text-white/55 md:text-xs">Listed properties</p>
              </div>
              <div>
                <p className="font-montserrat text-2xl font-extrabold text-white md:text-3xl">48</p>
                <p className="mt-0.5 font-inter text-[11px] text-white/55 md:text-xs">Active projects</p>
              </div>
              <div>
                <p className="font-montserrat text-2xl font-extrabold text-white md:text-3xl">4</p>
                <p className="mt-0.5 font-inter text-[11px] text-white/55 md:text-xs">Cities</p>
              </div>
              <div>
                <p className="font-montserrat text-2xl font-extrabold text-hero-teal md:text-3xl">RERA</p>
                <p className="mt-0.5 font-inter text-[11px] text-white/55 md:text-xs">All verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
