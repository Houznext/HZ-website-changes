'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { clsx } from 'clsx';
import type { BuyFilters, BuySort } from '@/lib/buyFilters';

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

export function BuySearchSortBar({ filters, hasSearch, onChange, className }: Props) {
  const [draft, setDraft] = useState(filters.q);

  useEffect(() => {
    setDraft(filters.q);
  }, [filters.q]);

  const sortOptions = hasSearch
    ? SORT_OPTIONS
    : SORT_OPTIONS.filter((o) => o.value !== 'relevance');

  const sortValue = filters.sort === 'relevance' && !hasSearch ? 'newest' : filters.sort;

  const submitSearch = () => {
    const q = draft.trim();
    onChange({
      q,
      sort: q
        ? filters.sort === 'newest'
          ? 'relevance'
          : filters.sort
        : filters.sort === 'relevance'
          ? 'newest'
          : filters.sort,
      page: 1,
    });
  };

  return (
    <div
      className={clsx(
        'flex flex-col gap-2.5 sm:flex-row sm:items-stretch md:gap-3',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-row items-stretch overflow-hidden rounded-xl border border-[#dde8f5] bg-white shadow-sm">
        <div className="flex shrink-0 items-center pl-3 md:pl-4" aria-hidden>
          <Search className="h-[18px] w-[18px] text-muted" strokeWidth={2} />
        </div>
        <input
          type="search"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submitSearch();
            }
          }}
          placeholder="Search by title, locality, property ID…"
          className="min-w-0 flex-1 border-0 bg-transparent px-2 py-3 font-inter text-sm text-charcoal outline-none ring-0 placeholder:text-muted md:py-3.5 md:text-[15px]"
          autoComplete="off"
          spellCheck={false}
          aria-label="Search properties"
        />
        <div className="flex shrink-0 items-center p-1.5 pr-2">
          <button
            type="button"
            onClick={submitSearch}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2f80ed] text-white shadow-sm transition hover:bg-[#1a6dd6] active:scale-[0.98] sm:h-auto sm:min-h-[40px] sm:w-auto sm:px-4 sm:py-2"
            aria-label="Search"
          >
            <Search className="h-[18px] w-[18px] sm:hidden" strokeWidth={2.25} />
            <span className="hidden font-montserrat text-[13px] font-bold sm:inline">Search</span>
          </button>
        </div>
      </div>

      <label className="flex shrink-0 flex-col gap-1 sm:min-w-[148px] md:min-w-[172px]">
        <span className="font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted sm:sr-only">
          Sort
        </span>
        <select
          className="min-h-[44px] w-full rounded-xl border border-[#dde8f5] bg-white px-3 py-2.5 font-inter text-sm text-charcoal shadow-sm outline-none focus:border-[#2f80ed] focus:ring-2 focus:ring-[#2f80ed]/10 sm:min-h-[48px] md:text-[15px]"
          value={sortValue}
          onChange={(e) => onChange({ sort: e.target.value as BuySort, page: 1 })}
          aria-label="Sort results"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
