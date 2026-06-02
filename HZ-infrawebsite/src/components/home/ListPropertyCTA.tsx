'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import api from '@/lib/axios';
import { infraWhatsAppMeUrl } from '@/lib/infra-public-contact';

const DEFAULT = {
  eyebrow: 'For sellers',
  title: 'List your property with Houznext Infra',
  subtitle:
    'Reach thousands of verified buyers. We handle EC & title checks, RERA compliance, photography and more. Zero hidden fees.',
  primaryCta: 'List your property →',
  primaryHref: '/sell',
  secondaryCta: 'Talk to our team',
  perks: ['Free listing', 'EC & title verified', '1 year free property management', 'Zero brokerage'],
};

export function ListPropertyCTA() {
  const [cms, setCms] = useState(DEFAULT);
  const waUrl = infraWhatsAppMeUrl('Hi, I would like to list my property with Houznext Infra.');

  useEffect(() => {
    const ac = new AbortController();
    void (async () => {
      try {
        const res = await api.get<Partial<typeof DEFAULT>>('/site-config/for-sellers', { signal: ac.signal });
        setCms((prev) => ({ ...prev, ...res.data, perks: res.data.perks?.length ? res.data.perks : prev.perks }));
      } catch {
        /* defaults */
      }
    })();
    return () => ac.abort();
  }, []);

  return (
    <section
      className="overflow-x-hidden py-9 md:py-14"
      style={{ background: 'linear-gradient(135deg,#0f2a44,#1a4060)' }}
    >
      <div className="mx-auto max-w-infra px-4 text-center md:px-7">
        <div className="font-montserrat text-[11px] font-bold uppercase tracking-[0.15em] text-hz-teal">{cms.eyebrow}</div>
        <h2 className="mt-3 font-montserrat text-[clamp(24px,3.5vw,40px)] font-extrabold leading-tight text-white">
          {cms.title}
        </h2>
        <p className="mx-auto mt-2.5 max-w-[520px] font-inter text-sm leading-relaxed text-white/60">{cms.subtitle}</p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={cms.primaryHref}
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-hz-blue px-7 py-3 font-montserrat text-sm font-bold text-white transition hover:bg-hz-blue-hover"
          >
            {cms.primaryCta}
          </Link>
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-white/30 bg-transparent px-7 py-3 font-montserrat text-sm font-bold text-white transition hover:bg-white/10"
          >
            {cms.secondaryCta}
          </a>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {cms.perks.map((perk) => (
            <div key={perk} className="flex items-center gap-1.5 font-inter text-xs text-white/60">
              <Check className="h-3.5 w-3.5 shrink-0 text-[#22c55e]" strokeWidth={2} />
              {perk}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
