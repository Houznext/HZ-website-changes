import { formatPrice } from '@/lib/format';

export function PriceBreakdown({ base, perUnit }: { base?: string | null; perUnit?: string | null }) {
  return (
    <div className="rounded-xl border border-border bg-offwhite/80 p-4">
      <div className="font-montserrat text-xs font-bold uppercase text-muted">Price breakdown</div>
      <dl className="mt-3 space-y-2 font-inter text-sm">
        <div className="flex justify-between">
          <dt>Base price</dt>
          <dd className="font-montserrat font-bold">{formatPrice(base)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Per unit</dt>
          <dd className="font-montserrat font-bold">{formatPrice(perUnit)}</dd>
        </div>
      </dl>
    </div>
  );
}
