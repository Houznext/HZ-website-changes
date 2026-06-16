'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { resolveCmsAssetUrl } from '@/lib/cmsAssetUrl';
import { recordPreferredCity } from '@/lib/personalization';

type CityCard = {
  name: string;
  href: string;
  count: string;
  areas: string;
  gradient: string;
  titleSize: string;
  showBadge: boolean;
  wide: boolean;
  badgeLabel: string;
  parentCity?: string;
  imageUrl?: string | null;
  overlayOpacity?: number;
};

const FALLBACK_IMAGES: Record<string, string> = {
  Hyderabad: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=80',
  Vikarabad: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80',
  Shadnagar: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
  Tukkuguda: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200&q=80',
  Bengaluru: 'https://images.unsplash.com/photo-1596176530549-39796fdce287?w=1200&q=80',
  Chennai: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&q=80',
  Mumbai: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=1200&q=80',
};

const DEFAULT_CMS = {
  title: 'Browse by city',
  subtitle: 'Hyderabad · Bengaluru · Chennai · Mumbai',
  defaultCity: 'Hyderabad',
  cityOptions: ['Hyderabad', 'Bengaluru', 'Chennai', 'Mumbai'],
  cities: [
    {
      name: 'Hyderabad',
      href: '/buy?city=Hyderabad',
      count: '648 properties',
      areas: 'Gachibowli, Kokapet, HITEC City',
      gradient: 'linear-gradient(135deg,#0f2a44,#1a4060)',
      titleSize: 'text-[22px]',
      showBadge: true,
      wide: false,
      badgeLabel: '',
      parentCity: '',
      imageUrl: null,
      overlayOpacity: 60,
    },
    {
      name: 'Vikarabad',
      href: '/buy/vikarabad/land',
      count: '48 properties',
      areas: 'Agriculture land & farm plots',
      gradient: 'linear-gradient(135deg,#052e16,#14532d)',
      titleSize: 'text-xl',
      showBadge: false,
      wide: false,
      badgeLabel: '',
      parentCity: 'Hyderabad',
      imageUrl: null,
      overlayOpacity: 60,
    },
    {
      name: 'Shadnagar',
      href: '/buy?city=Hyderabad&locality=Shadnagar',
      count: '92 properties',
      areas: 'ORR corridor · plotted ventures',
      gradient: 'linear-gradient(135deg,#1e1b4b,#312e81)',
      titleSize: 'text-xl',
      showBadge: false,
      wide: false,
      badgeLabel: '',
      parentCity: 'Hyderabad',
      imageUrl: null,
      overlayOpacity: 60,
    },
    {
      name: 'Tukkuguda',
      href: '/buy?city=Hyderabad&locality=Tukkuguda',
      count: '36 properties',
      areas: 'East Hyderabad growth corridor',
      gradient: 'linear-gradient(135deg,#451a03,#78350f)',
      titleSize: 'text-xl',
      showBadge: false,
      wide: true,
      badgeLabel: 'New city',
      parentCity: 'Hyderabad',
      imageUrl: null,
      overlayOpacity: 60,
    },
    {
      name: 'Bengaluru',
      href: '/buy?city=Bengaluru',
      count: '312 properties',
      areas: 'Whitefield, Sarjapur, Electronic City',
      gradient: 'linear-gradient(135deg,#052e16,#14532d)',
      titleSize: 'text-xl',
      showBadge: false,
      wide: false,
      badgeLabel: '',
      parentCity: '',
      imageUrl: null,
      overlayOpacity: 60,
    },
    {
      name: 'Chennai',
      href: '/buy?city=Chennai',
      count: '156 properties',
      areas: 'OMR, Velachery, Anna Nagar',
      gradient: 'linear-gradient(135deg,#1e1b4b,#312e81)',
      titleSize: 'text-xl',
      showBadge: false,
      wide: false,
      badgeLabel: '',
      parentCity: '',
      imageUrl: null,
      overlayOpacity: 60,
    },
    {
      name: 'Mumbai',
      href: '/buy?city=Mumbai',
      count: '184 properties',
      areas: 'Powai · BKC · Bandra',
      gradient: 'linear-gradient(135deg,#451a03,#78350f)',
      titleSize: 'text-xl',
      showBadge: false,
      wide: false,
      badgeLabel: '',
      parentCity: '',
      imageUrl: null,
      overlayOpacity: 60,
    },
  ] as CityCard[],
};

function isMainCityCard(card: CityCard): boolean {
  return !card.parentCity?.trim();
}

function overlayAlpha(opacity?: number): number {
  const v = Math.min(90, Math.max(10, opacity ?? 60));
  return 0.78 - ((v - 10) / 80) * 0.58;
}

function CityCardLink({
  card,
  featured,
  selected,
}: {
  card: CityCard;
  featured?: boolean;
  selected?: boolean;
}) {
  const fallback = FALLBACK_IMAGES[card.name] ?? FALLBACK_IMAGES.Hyderabad;
  const img = resolveCmsAssetUrl(card.imageUrl, fallback);
  const gradOpacity = overlayAlpha(card.overlayOpacity);

  if (card.wide) {
    return (
      <Link
        href={card.href}
        onClick={() => recordPreferredCity(card.parentCity || card.name)}
        className={`group relative mt-3.5 flex h-[88px] cursor-pointer items-center justify-between overflow-hidden rounded-2xl px-5 py-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,42,68,0.15)] md:mt-3.5 md:h-[100px] md:px-7 ${
          selected ? 'ring-2 ring-hz-blue ring-offset-2' : ''
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="pointer-events-none absolute inset-0" style={{ background: card.gradient, opacity: gradOpacity }} aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f2a44]/80 via-[#0f2a44]/35 to-transparent" aria-hidden />
        {card.showBadge ? (
          <span className="absolute right-3 top-3 z-[1] rounded-md bg-[#ccfbf1] px-2 py-0.5 font-montserrat text-[10px] font-bold uppercase tracking-wide text-[#0f766e]">
            {card.count}
          </span>
        ) : null}
        <div className="relative z-[1]">
          <div className="font-montserrat text-xl font-bold text-white">{card.name}</div>
          <div className="mt-0.5 font-inter text-xs text-white">{card.areas || card.count}</div>
        </div>
        {card.badgeLabel ? (
          <span className="relative z-[1] shrink-0 rounded-md bg-[rgba(242,153,74,0.25)] px-2.5 py-1 font-montserrat text-[10px] font-bold text-[#fde68a]">
            {card.badgeLabel}
          </span>
        ) : null}
      </Link>
    );
  }

  return (
    <Link
      href={card.href}
      onClick={() => recordPreferredCity(card.parentCity || card.name)}
      className={`group relative flex h-[180px] cursor-pointer items-end overflow-hidden rounded-2xl p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,42,68,0.2)] md:h-[200px] ${
        selected ? 'ring-2 ring-hz-blue ring-offset-2' : ''
      } ${featured ? 'sm:col-span-2 md:col-span-2' : ''}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <div className="pointer-events-none absolute inset-0" style={{ background: card.gradient, opacity: gradOpacity }} aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f2a44]/85 via-[#0f2a44]/40 to-transparent" aria-hidden />
      {card.showBadge ? (
        <span className="absolute right-3 top-3 z-[1] rounded-md bg-[#ccfbf1] px-2 py-0.5 font-montserrat text-[10px] font-bold uppercase tracking-wide text-[#0f766e]">
          {card.count}
        </span>
      ) : null}
      <div className="relative z-[1]">
        <div className={`font-montserrat font-bold text-white ${card.titleSize}`}>{card.name}</div>
        <div className="mt-0.5 font-inter text-xs text-white">{card.areas || card.count}</div>
      </div>
    </Link>
  );
}

export function CityGrid() {
  const [cms, setCms] = useState(DEFAULT_CMS);
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CMS.defaultCity);

  useEffect(() => {
    const ac = new AbortController();
    void (async () => {
      try {
        const res = await api.get<Partial<typeof DEFAULT_CMS>>('/site-config/browse-by-city', { signal: ac.signal });
        const d = res.data;
        setCms((prev) => ({
          ...prev,
          ...d,
          cities: d.cities?.length ? d.cities : prev.cities,
          cityOptions: d.cityOptions?.length ? d.cityOptions : prev.cityOptions,
        }));
        if (d.defaultCity) setSelectedCity(d.defaultCity);
      } catch {
        /* defaults */
      }
    })();
    return () => ac.abort();
  }, []);

  const { mainCard, gridAreas, wideAreas, legacyMode } = useMemo(() => {
    const hasParentField = cms.cities.some((c) => c.parentCity !== undefined && c.parentCity !== null);
    if (!hasParentField) {
      const grid = cms.cities.filter((c) => !c.wide);
      const wide = cms.cities.filter((c) => c.wide);
      return { mainCard: null, gridAreas: grid, wideAreas: wide, legacyMode: true };
    }

    const main =
      cms.cities.find((c) => c.name === selectedCity && isMainCityCard(c)) ??
      cms.cities.find((c) => c.name === selectedCity && !c.parentCity?.trim());
    const areas = cms.cities.filter((c) => c.parentCity === selectedCity);
    return {
      mainCard: main ?? null,
      gridAreas: areas.filter((c) => !c.wide),
      wideAreas: areas.filter((c) => c.wide),
      legacyMode: false,
    };
  }, [cms.cities, selectedCity]);

  const onCityChange = (city: string) => {
    setSelectedCity(city);
    recordPreferredCity(city);
  };

  return (
    <section className="overflow-x-hidden bg-white py-9 md:py-14">
      <div className="mx-auto max-w-infra px-4 md:px-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-montserrat text-[26px] font-extrabold text-charcoal">{cms.title}</h2>
            <p className="mt-1.5 font-inter text-[13px] text-muted md:text-sm">{cms.subtitle}</p>
          </div>
          <label className="flex flex-col gap-1.5 sm:min-w-[200px]">
            <span className="font-montserrat text-[11px] font-bold uppercase tracking-wide text-muted">Select city</span>
            <select
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              className="min-h-[44px] rounded-lg border border-[#dde8f5] bg-white px-3 font-inter text-sm text-charcoal outline-none focus:border-hz-blue"
            >
              {cms.cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-4">
          {legacyMode ? (
            <>
              {gridAreas.map((c) => (
                <CityCardLink
                  key={c.name}
                  card={c}
                  featured={c.name === 'Hyderabad'}
                  selected={c.name === selectedCity}
                />
              ))}
            </>
          ) : (
            <>
              {mainCard ? <CityCardLink card={mainCard} featured selected /> : null}
              {gridAreas.map((c) => (
                <CityCardLink key={c.name} card={c} />
              ))}
              {!mainCard && gridAreas.length === 0 ? (
                <p className="col-span-full font-inter text-sm text-muted">No cards configured for {selectedCity}.</p>
              ) : null}
            </>
          )}
        </div>

        {(legacyMode ? cms.cities.filter((c) => c.wide) : wideAreas).map((c) => (
          <CityCardLink key={c.name} card={c} selected={c.name === selectedCity} />
        ))}
      </div>
    </section>
  );
}
