'use client';

import type { ReactNode } from 'react';
import { CITIES } from '@/lib/constants';
import {
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

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-[#dde8f5] pt-3 first:border-t-0 first:pt-0">
      <div className="mb-2 font-montserrat text-[10px] font-bold uppercase tracking-[0.06em] text-muted">{title}</div>
      {children}
    </div>
  );
}

export function BuyFilterSidebar({ filters, onChange, onClear }: Props) {
  const toggleArr = (key: 'types' | 'bhk' | 'statuses' | 'furnishing', value: string) => {
    const list = filters[key];
    const next = list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
    onChange({ [key]: next, page: 1 });
  };

  const toggleBhk = (value: string) => {
    const norm = value === '5+' ? '5+' : value;
    toggleArr('bhk', norm);
  };

  return (
    <aside className="plp-filters sticky top-[108px] hidden rounded-[14px] border border-[#dde8f5] bg-white p-4 lg:block">
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="font-montserrat text-base font-bold text-charcoal">Filters</h2>
        <button
          type="button"
          onClick={onClear}
          className="border-0 bg-transparent font-montserrat text-[11px] font-bold text-[#2f80ed] hover:underline"
        >
          Clear all
        </button>
      </div>

      <Section title="Looking for">
        <div className="flex flex-wrap gap-1.5">
          {(['Buy', 'Rent'] as ListingMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange({ listingFor: mode, page: 1 })}
              className={`rounded-full px-3 py-1 font-montserrat text-xs font-semibold transition ${
                filters.listingFor === mode
                  ? 'bg-navy text-white'
                  : 'border border-[#dde8f5] bg-offwhite text-charcoal hover:border-[#93c5fd]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </Section>

      <Section title="City">
        <select
          className="fi w-full rounded-lg border border-[#dde8f5] px-2.5 py-1.5 font-inter text-xs"
          value={filters.city}
          onChange={(e) => onChange({ city: e.target.value, page: 1 })}
        >
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Section>

      <Section title="Property type">
        <div className="flex flex-col gap-1.5">
          {PLP_PROPERTY_TYPES.map((t) => (
            <label key={t} className="flex cursor-pointer items-center gap-2 font-inter text-[12.5px] text-charcoal">
              <input
                type="checkbox"
                className="chk h-3.5 w-3.5 rounded border-[#dde8f5] accent-[#2f80ed]"
                checked={filters.types.includes(t)}
                onChange={() => toggleArr('types', t)}
              />
              {t}
            </label>
          ))}
        </div>
      </Section>

      <Section title="BHK type">
        <div className="flex flex-wrap gap-1.5">
          {PLP_BHK_OPTIONS.map((b) => {
            const active = filters.bhk.includes(b);
            return (
              <button
                key={b}
                type="button"
                onClick={() => toggleBhk(b)}
                className={`rounded-full border px-2.5 py-1 font-montserrat text-[11.5px] font-semibold transition ${
                  active
                    ? 'border-navy bg-navy text-white'
                    : 'border-[#dde8f5] bg-offwhite text-charcoal hover:border-[#93c5fd]'
                }`}
              >
                {b}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Budget">
        <div className="flex flex-col gap-1.5">
          {BUDGET_OPTIONS.map((b) => (
            <label key={b.key} className="flex cursor-pointer items-center gap-2 font-inter text-[12.5px] text-charcoal">
              <input
                type="radio"
                name="budget"
                className="chk h-3.5 w-3.5 accent-[#2f80ed]"
                checked={filters.budget === b.key}
                onChange={() => onChange({ budget: b.key, page: 1 })}
              />
              {b.label}
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2 font-inter text-[12.5px] text-muted">
            <input
              type="radio"
              name="budget"
              className="chk h-3.5 w-3.5 accent-[#2f80ed]"
              checked={!filters.budget}
              onChange={() => onChange({ budget: '', page: 1 })}
            />
            Any budget
          </label>
        </div>
      </Section>

      <Section title="Status">
        <div className="flex flex-col gap-1.5">
          {PLP_STATUS_OPTIONS.map((s) => (
            <label key={s} className="flex cursor-pointer items-center gap-2 font-inter text-[12.5px] text-charcoal">
              <input
                type="checkbox"
                className="chk h-3.5 w-3.5 rounded border-[#dde8f5] accent-[#2f80ed]"
                checked={filters.statuses.includes(s)}
                onChange={() => toggleArr('statuses', s)}
              />
              {s}
            </label>
          ))}
        </div>
      </Section>

      <Section title="Furnishing">
        <div className="flex flex-col gap-1.5">
          {PLP_FURNISHING_OPTIONS.map((f) => (
            <label key={f.value} className="flex cursor-pointer items-center gap-2 font-inter text-[12.5px] text-charcoal">
              <input
                type="checkbox"
                className="chk h-3.5 w-3.5 rounded border-[#dde8f5] accent-[#2f80ed]"
                checked={filters.furnishing.includes(f.value)}
                onChange={() => toggleArr('furnishing', f.value)}
              />
              {f.label}
            </label>
          ))}
        </div>
      </Section>
    </aside>
  );
}
