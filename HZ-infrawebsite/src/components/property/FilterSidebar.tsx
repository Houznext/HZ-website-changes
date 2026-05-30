import { CITIES, PROPERTY_TYPES, BHK_TYPES } from '@/lib/constants';

type Props = {
  filters: Record<string, string>;
  onChange: (k: string, v: string) => void;
};

export function FilterSidebar({ filters, onChange }: Props) {
  return (
    <aside className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-hzwhite p-4 sm:grid-cols-3 lg:grid-cols-1 lg:gap-5">
      <div>
        <label className="font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">City</label>
        <select
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-inter text-sm"
          value={filters.city || ''}
          onChange={(e) => onChange('city', e.target.value)}
        >
          <option value="">All</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">Type</label>
        <select
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-inter text-sm"
          value={filters.type || ''}
          onChange={(e) => onChange('type', e.target.value)}
        >
          <option value="">All</option>
          {PROPERTY_TYPES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">BHK</label>
        <select
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-inter text-sm"
          value={filters.bhk || ''}
          onChange={(e) => onChange('bhk', e.target.value)}
        >
          <option value="">Any</option>
          {BHK_TYPES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
