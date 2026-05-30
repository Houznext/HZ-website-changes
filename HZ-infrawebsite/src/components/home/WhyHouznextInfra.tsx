import { LineChart, ShieldCheck, FileCheck2, Building2, Sparkles, Headphones } from 'lucide-react';

const points = [
  { title: 'Property Insights', body: 'Micro-market velocity, absorption, and price bands refreshed monthly.', icon: LineChart },
  { title: 'Future Growth Potential', body: 'Corridor scoring with infra & employment anchors mapped transparently.', icon: Sparkles },
  { title: '20-Year Portfolio', body: 'Execution track record across residential, plotted, and commercial assets.', icon: Building2 },
  { title: 'Title Verified', body: 'Chain-of-title diligence before a listing goes live to buyers.', icon: ShieldCheck },
  { title: 'EC Verified', body: 'Encumbrance checks aligned with lender-grade documentation standards.', icon: FileCheck2 },
  {
    title: 'Property Management — 1 year free',
    body: 'Handover-season support for buyers on select Houznext-managed inventory.',
    icon: Headphones,
  },
];

export function WhyHouznextInfra() {
  return (
    <section className="overflow-x-hidden bg-hzwhite py-9 md:py-14">
      <div className="mx-auto max-w-infra px-4 md:px-7">
        <h2 className="font-montserrat text-[22px] font-extrabold leading-tight text-charcoal md:text-3xl">Why Houznext Infra</h2>
        <p className="mt-2 max-w-2xl font-inter text-[13px] leading-relaxed text-muted md:text-sm">
          Six trust pillars — teal for verification cues, amber for growth signals, blue for data-backed decisions.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {points.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-offwhite/60 p-5">
              <p.icon className="h-8 w-8 text-hz-teal" />
              <h3 className="mt-3 font-montserrat text-base font-bold text-charcoal">{p.title}</h3>
              <p className="mt-2 font-inter text-xs leading-relaxed text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
