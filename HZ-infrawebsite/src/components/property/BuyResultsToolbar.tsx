'use client';

import { clsx } from 'clsx';
import { activeFilterChips, type BuyFilters } from '@/lib/buyFilters';

type Props = {
  filters: BuyFilters;
  onChange: (patch: Partial<BuyFilters>) => void;
  className?: string;
};

export function BuyResultsToolbar({ filters, onChange, className }: Props) {
  const chips = activeFilterChips(filters);

  return (
    <div className={clsx('mb-2.5 flex flex-wrap items-center gap-2', className)}>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        {chips.length > 0 ? (
          <>
            <span className="font-inter text-[11.5px] text-muted">Active:</span>
            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => onChange({ ...chip.remove, page: 1 })}
                className="inline-flex items-center gap-1 rounded-full bg-[#e8f1fd] px-2.5 py-0.5 font-montserrat text-[11px] font-bold text-[#1e40af] hover:bg-[#dbeafe]"
              >
                {chip.label}
                <span aria-hidden>×</span>
              </button>
            ))}
          </>
        ) : (
          <span className="font-inter text-[11.5px] text-muted">All verified listings</span>
        )}
      </div>
    </div>
  );
}
