import type { PublicProperty } from '@/types/property.types';
import { formatPriceInr, num } from '@/lib/property-utils';
import { ExternalLink } from 'lucide-react';

export function KeyStatsBar({ cells }: { cells: { label: string; value: string; sub?: string }[] }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#dde8f5] bg-[#dde8f5] md:grid-cols-4">
      {cells.map((c) => (
        <div key={c.label} className="bg-white px-4 py-3">
          <div className="font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">{c.label}</div>
          <div className="mt-1 font-montserrat text-lg font-extrabold text-charcoal">{c.value}</div>
          {c.sub ? <div className="mt-0.5 font-inter text-xs text-muted">{c.sub}</div> : null}
        </div>
      ))}
    </div>
  );
}

export function DocumentRow({ url, label, sub }: { url?: string | null; label: string; sub?: string | null }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="mt-3 flex items-center justify-between rounded-lg border border-[#dde8f5] px-3 py-2.5 font-inter text-sm transition duration-150 hover:border-[#2f80ed] hover:bg-[#e8f1fd]"
    >
      <span>
        <span className="font-semibold text-charcoal">{label}</span>
        {sub ? <span className="ml-2 text-xs text-muted">{sub}</span> : null}
      </span>
      <ExternalLink className="h-4 w-4 text-[#2f80ed]" strokeWidth={1.8} />
    </a>
  );
}

export function LegalSection({ property }: { property: PublicProperty }) {
  return (
    <div className="mt-4 rounded-xl border border-[#dde8f5] bg-white p-5">
      <div className="font-montserrat text-sm font-bold text-charcoal">Legal & documents</div>
      <DocumentRow url={property.reraCertUrl} label="RERA certificate" sub={property.reraNumber || undefined} />
      <DocumentRow url={property.ecCertUrl} label="EC / Title certificate" />
      <DocumentRow url={property.floorPlanUrl} label="Floor plan" />
      <DocumentRow url={property.brochureUrl} label="Brochure" />
    </div>
  );
}

export function PriceBreakdownCard({ property }: { property: PublicProperty }) {
  const base = num(property.basePrice);
  const gst = base * (num(property.gstPercent) || 5) / 100;
  const reg = base * (num(property.registrationPercent) || 1) / 100;
  const maint = num(property.maintenanceDeposit);
  const other = num(property.otherCharges);
  const total = num(property.totalCost) || base + gst + reg + maint + other;

  return (
    <div className="mt-4 rounded-xl border border-[#dde8f5] bg-white p-5">
      <div className="font-montserrat text-sm font-bold text-charcoal">Price breakdown</div>
      <dl className="mt-3 space-y-2 font-inter text-sm text-charcoal">
        <div className="flex justify-between">
          <dt>Base price</dt>
          <dd className="font-montserrat font-bold">{formatPriceInr(property.basePrice)}</dd>
        </div>
        <div className="flex justify-between text-muted">
          <dt>GST ({num(property.gstPercent) || 5}%)</dt>
          <dd>{formatPriceInr(gst)}</dd>
        </div>
        <div className="flex justify-between text-muted">
          <dt>Registration ({num(property.registrationPercent) || 1}%)</dt>
          <dd>{formatPriceInr(reg)}</dd>
        </div>
        <div className="flex justify-between text-muted">
          <dt>Maintenance deposit</dt>
          <dd>{formatPriceInr(maint)}</dd>
        </div>
        <div className="flex justify-between text-muted">
          <dt>Other charges</dt>
          <dd>{formatPriceInr(other)}</dd>
        </div>
        <div className="flex justify-between border-t border-[#dde8f5] pt-2 font-montserrat font-extrabold text-charcoal">
          <dt>Total cost</dt>
          <dd className="text-[#0d9488]">{formatPriceInr(total)}</dd>
        </div>
      </dl>
    </div>
  );
}

export function AmenitiesGrid({ amenities }: { amenities: string[] }) {
  if (!amenities?.length) return null;
  return (
    <div className="mt-4 rounded-xl border border-[#dde8f5] bg-white p-5">
      <div className="font-montserrat text-sm font-bold text-charcoal">Amenities</div>
      <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-2 md:grid-cols-4">
        {amenities.map((a) => (
          <li key={a} className="flex items-center gap-2 font-inter text-sm text-charcoal">
            <span className="text-[#0d9488]" aria-hidden>
              ✓
            </span>
            {a}
          </li>
        ))}
      </ul>
    </div>
  );
}
