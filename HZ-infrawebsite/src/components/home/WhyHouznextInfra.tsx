'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { BarChart3, TrendingUp, CalendarDays, Shield, FileText, Users } from 'lucide-react';
import api from '@/lib/axios';

type CmsCard = { title: string; body: string; featured: boolean; badgeLabel: string };

const ICONS: ReactNode[] = [
  <div key="0" className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f1fd]">
    <BarChart3 className="h-[22px] w-[22px] text-hz-blue" strokeWidth={1.6} />
  </div>,
  <div key="1" className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fef3c7]">
    <TrendingUp className="h-[22px] w-[22px] text-hz-amber" strokeWidth={1.6} />
  </div>,
  <div key="2" className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#dcfce7]">
    <CalendarDays className="h-[22px] w-[22px] text-[#16a34a]" strokeWidth={1.6} />
  </div>,
  <div key="3" className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ccfbf1]">
    <Shield className="h-[22px] w-[22px] text-hz-teal" strokeWidth={1.6} />
  </div>,
  <div key="4" className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e0f2fe]">
    <FileText className="h-[22px] w-[22px] text-[#0284c7]" strokeWidth={1.6} />
  </div>,
  <div key="5" className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(242,153,74,0.2)]">
    <Users className="h-[22px] w-[22px] text-hz-accent" strokeWidth={1.6} />
  </div>,
];

const DEFAULT = {
  eyebrow: 'Our edge',
  title: 'Why Houznext Infra?',
  cards: [
    {
      title: 'Property Insights',
      body: 'Deep market data, locality trends, price history and future growth projections for every listing.',
      featured: false,
      badgeLabel: '',
    },
    {
      title: 'Future Growth Potential',
      body: 'Our analysts forecast 5-year appreciation rates for every locality based on infrastructure, demand and policy.',
      featured: false,
      badgeLabel: '',
    },
    {
      title: '20-Year Portfolio Track',
      body: "Houznext's 20-year portfolio history across Hyderabad, Chennai and Bengaluru — proven track record.",
      featured: false,
      badgeLabel: '',
    },
    {
      title: 'Title Verified',
      body: 'Every property undergoes thorough title search. Clear ownership chain guaranteed before listing.',
      featured: false,
      badgeLabel: '',
    },
    {
      title: 'EC Verified',
      body: 'Encumbrance Certificate verified for every listing. No hidden loans or legal disputes on your property.',
      featured: false,
      badgeLabel: '',
    },
    {
      title: 'Property Management Support',
      body: '1 year free property management after purchase. Rent collection, maintenance, tenant management.',
      featured: true,
      badgeLabel: 'Free 1 year',
    },
  ] as CmsCard[],
};

export function WhyHouznextInfra() {
  const [cms, setCms] = useState(DEFAULT);

  useEffect(() => {
    const ac = new AbortController();
    void (async () => {
      try {
        const res = await api.get<Partial<typeof DEFAULT>>('/site-config/why-houznext', { signal: ac.signal });
        setCms((prev) => ({
          ...prev,
          ...res.data,
          cards: res.data.cards?.length ? res.data.cards : prev.cards,
        }));
      } catch {
        /* defaults */
      }
    })();
    return () => ac.abort();
  }, []);

  const points = useMemo(
    () =>
      cms.cards.map((p, i) => ({
        ...p,
        icon: ICONS[i] ?? ICONS[0],
      })),
    [cms.cards],
  );

  return (
    <section className="overflow-x-hidden bg-offwhite py-9 md:py-14">
      <div className="mx-auto max-w-infra px-4 md:px-7">
        <div className="mb-8 text-center md:mb-9">
          <div className="font-montserrat text-[11px] font-bold uppercase tracking-[0.12em] text-hz-teal">
            {cms.eyebrow}
          </div>
          <h2 className="mt-2 font-montserrat text-[28px] font-extrabold text-charcoal">{cms.title}</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {points.map((p) =>
            p.featured ? (
              <div
                key={p.title}
                className="rounded-[14px] border border-white/[0.08] p-5 md:p-[22px]"
                style={{ background: 'linear-gradient(135deg,#0f2a44,#1a4060)' }}
              >
                {p.icon}
                <h3 className="mt-3.5 font-montserrat text-[17px] font-bold text-white">{p.title}</h3>
                <p className="mt-1.5 font-inter text-xs leading-relaxed text-white/58">{p.body}</p>
                {p.badgeLabel ? (
                  <span className="mt-2.5 inline-flex rounded-md bg-[#fef3c7] px-2 py-0.5 font-montserrat text-[10px] font-bold uppercase tracking-wide text-[#92400e]">
                    {p.badgeLabel}
                  </span>
                ) : null}
              </div>
            ) : (
              <div key={p.title} className="rounded-[14px] border border-[#dde8f5] bg-white p-5 md:p-[22px]">
                {p.icon}
                <h3 className="mt-3.5 font-montserrat text-[17px] font-bold text-charcoal">{p.title}</h3>
                <p className="mt-1.5 font-inter text-xs leading-relaxed text-muted">{p.body}</p>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
