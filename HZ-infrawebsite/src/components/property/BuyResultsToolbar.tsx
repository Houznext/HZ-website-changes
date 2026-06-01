'use client';

import { clsx } from 'clsx';
import { activeFilterChips, type BuyFilters, type BuySort } from '@/lib/buyFilters';

const SORT_OPTIONS: { value: BuySort; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest first' },
];

type Props = {
  filters: BuyFilters;
  hasSearch: boolean;
  onChange: (patch: Partial<BuyFilters>) => void;
  className?: string;
};

export function BuyResultsToolbar({ filters, hasSearch, onChange, className }: Props) {
  const chips = activeFilterChips(filters);
  const sortOptions = hasSearch
    ? SORT_OPTIONS
    : SORT_OPTIONS.filter((o) => o.value !== 'relevance');

  const sortValue = filters.sort === 'relevance' && !hasSearch ? 'newest' : filters.sort;

  return (
    <div className={clsx('mb-2.5 flex flex-wrap items-center justify-between gap-2', className)}>
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
      <select
        className="fi w-auto shrink-0 rounded-lg border border-[#dde8f5] px-2.5 py-1.5 font-inter text-xs"
        value={sortValue}
        onChange={(e) => onChange({ sort: e.target.value as BuySort, page: 1 })}
      >
        {sortOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
