'use client';

import Link from 'next/link';
import { recordPreferredCity } from '@/lib/personalization';

const cities = {
  top: [
    {
      name: 'Hyderabad',
      href: '/buy?city=Hyderabad',
      count: '648 properties',
      areas: 'Gachibowli, Kokapet, HITEC City',
      gradient: 'linear-gradient(135deg,#0f2a44,#1a4060)',
      titleSize: 'text-[22px]',
      badge: true,
    },
    {
      name: 'Bengaluru',
      href: '/buy?city=Bengaluru',
      count: '312 properties',
      gradient: 'linear-gradient(135deg,#052e16,#14532d)',
      titleSize: 'text-xl',
    },
    {
      name: 'Chennai',
      href: '/buy?city=Chennai',
      count: '156 properties',
      gradient: 'linear-gradient(135deg,#1e1b4b,#312e81)',
      titleSize: 'text-xl',
    },
  ],
  mumbai: {
    name: 'Mumbai',
    href: '/buy?city=Mumbai',
    subtitle: 'Powai · BKC · Bandra · 184 properties',
    gradient: 'linear-gradient(135deg,#451a03,#78350f)',
  },
};

export function CityGrid() {
  return (
    <section className="overflow-x-hidden bg-white py-9 md:py-14">
      <div className="mx-auto max-w-infra px-4 md:px-7">
        <h2 className="font-montserrat text-[26px] font-extrabold text-charcoal">Browse by city</h2>
        <p className="mt-1.5 font-inter text-[13px] text-muted md:text-sm">
          Hyderabad · Bengaluru · Chennai · Mumbai
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-4">
          {cities.top.map((c) => (
            <Link
              key={c.name}
              href={c.href}
              onClick={() => recordPreferredCity(c.name)}
              style={{ background: c.gradient }}
              className={`group relative flex h-[180px] cursor-pointer items-end rounded-2xl p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,42,68,0.2)] md:h-[200px] ${
                c.name === 'Hyderabad' ? 'sm:col-span-2 md:col-span-2' : ''
              }`}
            >
              {c.badge ? (
                <span className="absolute right-3 top-3 rounded-md bg-[#ccfbf1] px-2 py-0.5 font-montserrat text-[10px] font-bold uppercase tracking-wide text-[#0f766e]">
                  {c.count}
                </span>
              ) : null}
              <div>
                <div className={`font-montserrat font-bold text-white ${c.titleSize}`}>{c.name}</div>
                <div className="mt-0.5 font-inter text-xs text-white/58">
                  {c.areas ?? c.count}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href={cities.mumbai.href}
          onClick={() => recordPreferredCity(cities.mumbai.name)}
          style={{ background: cities.mumbai.gradient }}
          className="group mt-3.5 flex h-[88px] cursor-pointer items-center justify-between rounded-2xl px-5 py-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,42,68,0.15)] md:mt-3.5 md:h-[100px] md:px-7"
        >
          <div>
            <div className="font-montserrat text-xl font-bold text-white">{cities.mumbai.name}</div>
            <div className="mt-0.5 font-inter text-xs text-white/58">{cities.mumbai.subtitle}</div>
          </div>
          <span className="shrink-0 rounded-md bg-[rgba(242,153,74,0.25)] px-2.5 py-1 font-montserrat text-[10px] font-bold text-[#fde68a]">
            New city
          </span>
        </Link>
      </div>
    </section>
  );
}
