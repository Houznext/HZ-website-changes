'use client';

import type { ReactNode } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { CITIES } from '@/lib/constants';
import {
  activeFilterChips,
  BUDGET_OPTIONS,
  PLP_BHK_OPTIONS,
  PLP_FURNISHING_OPTIONS,
  PLP_PROPERTY_TYPES,
  PLP_STATUS_OPTIONS,
  type BuyFilters,
  type ListingMode,
} from '@/lib/buyFilters';

type Props = {
  filters: BuyFilters;
  onChange: (patch: Partial<BuyFilters>) => void;
  onClear: () => void;
};

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 font-montserrat text-[11.5px] font-semibold whitespace-nowrap transition ${
        active
          ? 'border-navy bg-navy text-white'
          : 'border-[#dde8f5] bg-offwhite text-charcoal active:bg-[#e8f1fd]'
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-0.5 w-px shrink-0 self-stretch bg-[#dde8f5]" aria-hidden />;
}

export function BuyFilterMobileBar({ filters, onChange, onClear }: Props) {
  const toggleArr = (key: 'types' | 'bhk' | 'statuses' | 'furnishing', value: string) => {
    const list = filters[key];
    const next = list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
    onChange({ [key]: next, page: 1 });
  };

  const chips = activeFilterChips(filters);

  return (
    <div className="plp-filter-bar sticky top-14 z-20 -mx-4 mb-3 w-[calc(100%+2rem)] max-w-[100vw] border-b border-[#dde8f5] bg-white shadow-[0_4px_12px_rgba(15,42,68,0.06)] md:top-16 lg:hidden">
      <div className="flex items-center gap-2 px-4 py-2">
        <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted" strokeWidth={1.8} aria-hidden />
        <span className="shrink-0 font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">Filters</span>
        <button
          type="button"
          onClick={onClear}
          className="ml-auto shrink-0 font-montserrat text-[11px] font-bold text-[#2f80ed]"
        >
          Clear
        </button>
      </div>
      <div className="plp-filter-bar-scroll flex w-full flex-nowrap items-center gap-2 overflow-x-auto px-4 pb-3">
        {(['Buy', 'Rent'] as ListingMode[]).map((mode) => (
          <Pill
            key={mode}
            active={filters.listingFor === mode}
            onClick={() => onChange({ listingFor: mode, page: 1 })}
          >
            {mode}
          </Pill>
        ))}

        <Divider />

        {CITIES.map((c) => (
          <Pill key={c} active={filters.city === c} onClick={() => onChange({ city: c, page: 1 })}>
            {c}
          </Pill>
        ))}

        <Divider />

        {PLP_PROPERTY_TYPES.map((t) => (
          <Pill key={t} active={filters.types.includes(t)} onClick={() => toggleArr('types', t)}>
            {t}
          </Pill>
        ))}

        <Divider />

        {PLP_BHK_OPTIONS.map((b) => (
          <Pill key={b} active={filters.bhk.includes(b)} onClick={() => toggleArr('bhk', b === '5+' ? '5+' : b)}>
            {b}
          </Pill>
        ))}

        <Divider />

        {BUDGET_OPTIONS.map((b) => (
          <Pill
            key={b.key}
            active={filters.budget === b.key}
            onClick={() => onChange({ budget: filters.budget === b.key ? '' : b.key, page: 1 })}
          >
            {b.label}
          </Pill>
        ))}

        <Divider />

        {PLP_STATUS_OPTIONS.map((s) => (
          <Pill key={s} active={filters.statuses.includes(s)} onClick={() => toggleArr('statuses', s)}>
            {s === 'Under Construction' ? 'Under const.' : s === 'Ready to Move' ? 'Ready' : s}
          </Pill>
        ))}

        <Divider />

        {PLP_FURNISHING_OPTIONS.map((f) => (
          <Pill
            key={f.value}
            active={filters.furnishing.includes(f.value)}
            onClick={() => toggleArr('furnishing', f.value)}
          >
            {f.label}
          </Pill>
        ))}

      </div>

      {chips.length > 0 ? (
        <div className="plp-filter-bar-scroll flex w-full flex-nowrap items-center gap-1.5 overflow-x-auto border-t border-[#e8eff5] px-4 py-2">
          <span className="shrink-0 font-inter text-[10px] font-semibold text-muted">Active</span>
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => onChange({ ...chip.remove, page: 1 })}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#e8f1fd] px-2.5 py-1 font-montserrat text-[10px] font-bold whitespace-nowrap text-[#1e40af]"
            >
              {chip.label}
              <span aria-hidden>×</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
