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

const DEFAULT_POPULAR_TAGS = [
  '2BHK Hyderabad',
  'Villas Kokapet',
  'Plots Bengaluru',
  'Ready to move Mumbai',
  'Apartments Chennai',
];

type HeroMetric = { value: string; label: string; accent?: boolean };

const DEFAULT_HERO_METRICS: HeroMetric[] = [
  { value: '1,200+', label: 'Listed properties' },
  { value: '48', label: 'Active projects' },
  { value: '4', label: 'Cities' },
  { value: 'RERA', label: 'All verified', accent: true },
];

const CAROUSEL_MS = 4000;

const defaultCityBg =
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=85';

const DEFAULT_HEADLINE = "India's most trusted\nproperty platform.";
const DEFAULT_SUBHEADLINE = 'Buy · Sell · Land · Villa · Apartment · Plot — verified by Houznext';

export type HeroCmsData = {
  heroImageUrl?: string | null;
  heroImageUrls?: string[];
  heroHeadline?: string;
  heroSubheadline?: string;
  heroOpacity?: number;
  heroPopularTags?: string[];
  heroMetrics?: HeroMetric[];
};

function publicApiOrigin(): string {
  const raw =
    (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_INFRA_API_URL : undefined) ||
    process.env.INFRA_BACKEND_URL ||
    'http://127.0.0.1:4001';
  return raw.trim().replace(/\/+$/, '');
}

/** Absolute URL for <img src>; relative paths resolve against the infra API origin (not the Next site). */
export function resolveHeroImageUrl(input: string | null | undefined): string {
  if (!input?.trim()) return defaultCityBg;
  const u = input.trim();
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith('//')) return `https:${u}`;
  const base = publicApiOrigin();
  return u.startsWith('/') ? `${base}${u}` : `${base}/${u}`;
}

function HeroHeadline({ text }: { text: string }) {
  const lines = text.split('\n').map((l) => l.trimEnd()).filter((l, i, arr) => l.length > 0 || arr.length === 1);
  if (!lines.length) return null;
  return (
    <h1 className="font-montserrat text-[clamp(26px,8vw,36px)] font-extrabold leading-[1.15] tracking-tight text-white md:text-5xl md:leading-[1.12]">
      {lines.map((line, i) => (
        <span key={`${i}-${line.slice(0, 12)}`}>
          {i > 0 ? <br /> : null}
          <span className={i > 0 ? 'text-hz-accent' : undefined}>{line}</span>
        </span>
      ))}
    </h1>
  );
}

export function HeroSection() {
  const { activeTab, setActiveTab, setQuery } = useSearchStore();
  const [hero, setHero] = useState<HeroCmsData>({ heroOpacity: 18 });
  const [slide, setSlide] = useState(0);
  const [brokenSlides, setBrokenSlides] = useState<Set<number>>(new Set());

  useEffect(() => {
    const ac = new AbortController();
    void (async () => {
      try {
        const res = await api.get<HeroCmsData>('/site-config/hero', { signal: ac.signal });
        const d = res.data;
        setHero({
          heroImageUrls: Array.isArray(d?.heroImageUrls) ? d.heroImageUrls : undefined,
          heroImageUrl: d?.heroImageUrl,
          heroHeadline: d?.heroHeadline,
          heroSubheadline: d?.heroSubheadline,
          heroOpacity:
            typeof d?.heroOpacity === 'number' && Number.isFinite(d.heroOpacity) ? d.heroOpacity : 18,
          heroPopularTags: Array.isArray(d?.heroPopularTags) ? d.heroPopularTags : undefined,
          heroMetrics: Array.isArray(d?.heroMetrics) ? d.heroMetrics : undefined,
        });
        setSlide(0);
        setBrokenSlides(new Set());
      } catch {
        if (!ac.signal.aborted) {
          /* keep defaults */
        }
      }
    })();
    return () => ac.abort();
  }, []);

  const rawOp = Number(hero.heroOpacity);
  const opacityPct = Number.isFinite(rawOp) ? rawOp : 18;
  /** CMS 5 = darker stack, 40 = lighter (legacy heroOpacity semantics). */
  const cms = Math.min(40, Math.max(5, opacityPct));
  const overlayDarkness = 0.9 - ((cms - 5) / 35) * 0.22;

  const slides = useMemo(() => {
    const urls =
      hero.heroImageUrls?.filter((u) => u?.trim()).map((u) => resolveHeroImageUrl(u)) ?? [];
    if (urls.length) return urls;
    if (hero.heroImageUrl?.trim()) return [resolveHeroImageUrl(hero.heroImageUrl)];
    return [defaultCityBg];
  }, [hero.heroImageUrl, hero.heroImageUrls]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setSlide((s) => (s + 1) % slides.length);
    }, CAROUSEL_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const headline = hero.heroHeadline?.trim() || DEFAULT_HEADLINE;
  const subheadline = hero.heroSubheadline?.trim() || DEFAULT_SUBHEADLINE;
  const popularTags =
    hero.heroPopularTags?.filter((t) => t?.trim()).length ? hero.heroPopularTags! : DEFAULT_POPULAR_TAGS;
  const metrics =
    hero.heroMetrics?.filter((m) => m?.value?.trim() && m?.label?.trim()).length
      ? hero.heroMetrics!
      : DEFAULT_HERO_METRICS;

  return (
    <section className="relative min-h-[min(92vh,820px)] overflow-hidden bg-navy">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        {slides.map((src, i) => {
          const active = i === slide % slides.length;
          const failed = brokenSlides.has(i);
          const displaySrc = failed ? defaultCityBg : src;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${src}-${i}`}
              src={displaySrc}
              alt=""
              width={1920}
              height={1080}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={i === 0 ? 'high' : 'low'}
              className="absolute inset-0 h-full w-full min-h-full object-cover transition-opacity duration-[1200ms] ease-in-out"
              style={{ opacity: active ? 1 : 0 }}
              onError={() => setBrokenSlides((prev) => new Set(prev).add(i))}
            />
          );
        })}
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#050d18] via-[#0a1628] to-[#0f2a44]"
        style={{ opacity: overlayDarkness }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-navy/25" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-[min(92vh,820px)] max-w-infra flex-col items-center justify-center px-4 pb-12 pt-10 sm:pb-16 sm:pt-14 md:px-7 md:pb-20 md:pt-16">
        <div className="flex w-full max-w-3xl flex-col items-center px-0 text-center sm:px-8 md:px-12">
          <HeroHeadline text={headline} />

          <p className="mt-3 max-w-xl font-inter text-[13px] leading-relaxed text-white/85 sm:mt-4 md:text-[15px]">
            {subheadline}
          </p>

          <div className="mt-6 w-full max-w-2xl rounded-2xl border border-white/20 bg-white/[0.12] p-2.5 shadow-[0_8px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:mt-10 sm:p-3 md:p-4">
            <div className="flex gap-0.5 rounded-xl bg-black/20 p-0.5 sm:gap-1 sm:p-1">
              {tabs.map(({ key, label, Icon }) => {
                const active = activeTab === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    className={`flex min-h-[40px] flex-1 items-center justify-center gap-1 rounded-lg py-2.5 font-montserrat text-[11px] font-bold transition sm:gap-2 sm:py-3 sm:text-xs md:text-[13px] ${
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

            <div className="mt-4 border-t border-white/10 pt-3 sm:mt-5 sm:pt-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
                <span className="shrink-0 font-inter text-xs font-semibold text-white/90 sm:text-sm">Popular:</span>
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setQuery(tag)}
                    className="shrink-0 rounded-full border border-white/35 bg-white/[0.06] px-3 py-1.5 font-inter text-xs text-white/95 transition hover:border-white/55 hover:bg-white/10 md:text-[13px]"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div
              className={`mt-4 grid gap-3 rounded-xl border border-white/10 bg-black/15 px-3 py-4 sm:mt-6 sm:gap-4 sm:px-4 sm:py-5 md:gap-6 md:px-6 ${
                metrics.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'
              }`}
            >
              {metrics.map((m) => (
                <div key={`${m.value}-${m.label}`} className="min-w-0 text-center sm:text-left">
                  <p
                    className={`font-montserrat text-xl font-extrabold leading-tight sm:text-2xl md:text-3xl ${
                      m.accent ? 'text-hero-teal' : 'text-white'
                    }`}
                  >
                    {m.value}
                  </p>
                  <p className="mt-0.5 font-inter text-[11px] leading-snug text-white/55 md:text-xs">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


