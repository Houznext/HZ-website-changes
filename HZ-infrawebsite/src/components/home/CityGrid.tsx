'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
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
    },
    {
      name: 'Bengaluru',
      href: '/buy?city=Bengaluru',
      count: '312 properties',
      areas: '312 properties',
      gradient: 'linear-gradient(135deg,#052e16,#14532d)',
      titleSize: 'text-xl',
      showBadge: false,
      wide: false,
      badgeLabel: '',
    },
    {
      name: 'Chennai',
      href: '/buy?city=Chennai',
      count: '156 properties',
      areas: '156 properties',
      gradient: 'linear-gradient(135deg,#1e1b4b,#312e81)',
      titleSize: 'text-xl',
      showBadge: false,
      wide: false,
      badgeLabel: '',
    },
    {
      name: 'Mumbai',
      href: '/buy?city=Mumbai',
      count: '184 properties',
      areas: 'Powai · BKC · Bandra · 184 properties',
      gradient: 'linear-gradient(135deg,#451a03,#78350f)',
      titleSize: 'text-xl',
      showBadge: false,
      wide: true,
      badgeLabel: 'New city',
    },
  ] as CityCard[],
};

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

  const { gridCities, wideCities } = useMemo(() => {
    const grid = cms.cities.filter((c) => !c.wide);
    const wide = cms.cities.filter((c) => c.wide);
    return { gridCities: grid, wideCities: wide };
  }, [cms.cities]);

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
          {gridCities.map((c) => (
            <Link
              key={c.name}
              href={c.href}
              onClick={() => recordPreferredCity(c.name)}
              style={{ background: c.gradient }}
              className={`group relative flex h-[180px] cursor-pointer items-end rounded-2xl p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,42,68,0.2)] md:h-[200px] ${
                c.name === selectedCity ? 'ring-2 ring-hz-blue ring-offset-2' : ''
              } ${c.name === 'Hyderabad' ? 'sm:col-span-2 md:col-span-2' : ''}`}
            >
              {c.showBadge ? (
                <span className="absolute right-3 top-3 rounded-md bg-[#ccfbf1] px-2 py-0.5 font-montserrat text-[10px] font-bold uppercase tracking-wide text-[#0f766e]">
                  {c.count}
                </span>
              ) : null}
              <div>
                <div className={`font-montserrat font-bold text-white ${c.titleSize}`}>{c.name}</div>
                <div className="mt-0.5 font-inter text-xs text-white/58">{c.areas || c.count}</div>
              </div>
            </Link>
          ))}
        </div>

        {wideCities.map((c) => (
          <Link
            key={c.name}
            href={c.href}
            onClick={() => recordPreferredCity(c.name)}
            style={{ background: c.gradient }}
            className={`group mt-3.5 flex h-[88px] cursor-pointer items-center justify-between rounded-2xl px-5 py-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,42,68,0.15)] md:mt-3.5 md:h-[100px] md:px-7 ${
              c.name === selectedCity ? 'ring-2 ring-hz-blue ring-offset-2' : ''
            }`}
          >
            <div>
              <div className="font-montserrat text-xl font-bold text-white">{c.name}</div>
              <div className="mt-0.5 font-inter text-xs text-white/58">{c.areas || c.count}</div>
            </div>
            {c.badgeLabel ? (
              <span className="shrink-0 rounded-md bg-[rgba(242,153,74,0.25)] px-2.5 py-1 font-montserrat text-[10px] font-bold text-[#fde68a]">
                {c.badgeLabel}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
