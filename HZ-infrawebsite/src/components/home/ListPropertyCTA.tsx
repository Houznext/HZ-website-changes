import Link from 'next/link';
import { Check } from 'lucide-react';
import { infraWhatsAppMeUrl } from '@/lib/infra-public-contact';

const perks = ['Free listing', 'EC & title verified', '1 year free property management', 'Zero brokerage'];

export function ListPropertyCTA() {
  const waUrl = infraWhatsAppMeUrl('Hi, I would like to list my property with Houznext Infra.');

  return (
    <section
      className="overflow-x-hidden py-9 md:py-14"
      style={{ background: 'linear-gradient(135deg,#0f2a44,#1a4060)' }}
    >
      <div className="mx-auto max-w-infra px-4 text-center md:px-7">
        <div className="font-montserrat text-[11px] font-bold uppercase tracking-[0.15em] text-hz-teal">
          For sellers
        </div>
        <h2 className="mt-3 font-montserrat text-[clamp(24px,3.5vw,40px)] font-extrabold leading-tight text-white">
          List your property with Houznext Infra
        </h2>
        <p className="mx-auto mt-2.5 max-w-[520px] font-inter text-sm leading-relaxed text-white/60">
          Reach thousands of verified buyers. We handle EC &amp; title checks, RERA compliance, photography and
          more. Zero hidden fees.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/sell"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-hz-blue px-7 py-3 font-montserrat text-sm font-bold text-white transition hover:bg-hz-blue-hover"
          >
            List your property →
          </Link>
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-white/30 bg-transparent px-7 py-3 font-montserrat text-sm font-bold text-white transition hover:bg-white/10"
          >
            Talk to our team
          </a>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {perks.map((perk) => (
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
