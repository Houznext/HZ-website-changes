import type { ParsedUrlQuery } from 'querystring';

export type ListingMode = 'Buy' | 'Rent';

export type BudgetKey = 'under40' | '40-80' | '80-150' | 'above150' | '';

export type BuySort = 'relevance' | 'price_asc' | 'price_desc' | 'newest';

export type BuyFilters = {
  q: string;
  hintType: string;
  city: string;
  listingFor: ListingMode;
  types: string[];
  bhk: string[];
  budget: BudgetKey;
  statuses: string[];
  furnishing: string[];
  sort: BuySort;
  page: number;
};

export const PLP_PROPERTY_TYPES = ['Apartment', 'Villa', 'Land', 'Plot'] as const;

export const PLP_BHK_OPTIONS = ['1RK', '1BHK', '2BHK', '3BHK', '4BHK', '5+'] as const;

export const PLP_STATUS_OPTIONS = ['Ready to Move', 'Under Construction', 'New Launch'] as const;

export const PLP_FURNISHING_OPTIONS = [
  { label: 'Furnished', value: 'Fully-Furnished' },
  { label: 'Semi-furnished', value: 'Semi-Furnished' },
  { label: 'Unfurnished', value: 'Unfurnished' },
] as const;

export const BUDGET_OPTIONS: { key: BudgetKey; label: string; min?: number; max?: number }[] = [
  { key: 'under40', label: 'Under ₹40L', max: 3999999 },
  { key: '40-80', label: '₹40L – ₹80L', min: 4000000, max: 7999999 },
  { key: '80-150', label: '₹80L – ₹1.5Cr', min: 8000000, max: 14999999 },
  { key: 'above150', label: 'Above ₹1.5Cr', min: 15000000 },
];

const DEFAULT_CITY = 'Hyderabad';

function csv(q: string | string[] | undefined): string[] {
  if (!q) return [];
  const raw = Array.isArray(q) ? q.join(',') : q;
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function one(q: string | string[] | undefined): string {
  if (!q) return '';
  return Array.isArray(q) ? q[0] : q;
}

export function defaultBuyFilters(): BuyFilters {
  return {
    q: '',
    hintType: '',
    city: DEFAULT_CITY,
    listingFor: 'Buy',
    types: [],
    bhk: [],
    budget: '',
    statuses: [],
    furnishing: [],
    sort: 'newest',
    page: 1,
  };
}

export function parseBuyFiltersFromQuery(query: ParsedUrlQuery): BuyFilters {
  const d = defaultBuyFilters();
  const q = one(query.q);
  const sort = one(query.sort) as BuySort;
  return {
    q,
    hintType: one(query.hintType),
    city: one(query.city) || d.city,
    listingFor: one(query.listingFor) === 'Rent' ? 'Rent' : 'Buy',
    types: csv(query.types).length ? csv(query.types) : csv(query.propertyType ? [one(query.propertyType)] : query.type),
    bhk: csv(query.bhk).map((b) => (b === '5BHK+' ? '5+' : b)),
    budget: (one(query.budget) as BudgetKey) || '',
    statuses: csv(query.statuses).length ? csv(query.statuses) : csv(query.status),
    furnishing: csv(query.furnishing),
    sort: ['relevance', 'price_asc', 'price_desc', 'newest'].includes(sort) ? sort : q ? 'relevance' : 'newest',
    page: Math.max(1, Number(one(query.page)) || 1),
  };
}

export function buyFiltersToQuery(f: BuyFilters): Record<string, string> {
  const q: Record<string, string> = {};
  if (f.q.trim()) q.q = f.q.trim();
  if (f.hintType.trim()) q.hintType = f.hintType.trim();
  if (f.city.trim()) q.city = f.city.trim();
  if (f.listingFor === 'Rent') q.listingFor = 'Rent';
  if (f.types.length) q.types = f.types.join(',');
  if (f.bhk.length) q.bhk = f.bhk.map((b) => (b === '5+' ? '5BHK+' : b)).join(',');
  if (f.budget) q.budget = f.budget;
  if (f.statuses.length) q.statuses = f.statuses.join(',');
  if (f.furnishing.length) q.furnishing = f.furnishing.join(',');
  if (f.sort && f.sort !== 'newest') q.sort = f.sort;
  if (f.page > 1) q.page = String(f.page);
  return q;
}

export function buyFiltersToApiParams(f: BuyFilters): Record<string, string | number | undefined> {
  const budget = BUDGET_OPTIONS.find((b) => b.key === f.budget);
  const sortBy =
    f.sort === 'price_asc'
      ? 'price_asc'
      : f.sort === 'price_desc'
        ? 'price_desc'
        : f.sort === 'newest'
          ? 'newest'
          : undefined;

  return {
    q: f.q.trim() || undefined,
    hintType: f.hintType.trim() || undefined,
    city: f.city.trim() || undefined,
    listingFor: f.listingFor,
    types: f.types.length ? f.types.join(',') : undefined,
    bhkTypes: f.bhk.length ? f.bhk.map((b) => (b === '5+' ? '5BHK+' : b)).join(',') : undefined,
    statuses: f.statuses.length ? f.statuses.join(',') : undefined,
    furnishing: f.furnishing.length ? f.furnishing.join(',') : undefined,
    minPrice: budget?.min,
    maxPrice: budget?.max,
    sortBy,
    page: f.page,
    limit: 20,
  };
}

export type ActiveChip = { key: string; label: string; remove: Partial<BuyFilters> };

export function activeFilterChips(f: BuyFilters): ActiveChip[] {
  const chips: ActiveChip[] = [];
  if (f.city && f.city !== DEFAULT_CITY) {
    chips.push({ key: 'city', label: f.city, remove: { city: DEFAULT_CITY } });
  }
  f.types.forEach((t) =>
    chips.push({
      key: `type-${t}`,
      label: t,
      remove: { types: f.types.filter((x) => x !== t) },
    }),
  );
  f.bhk.forEach((b) =>
    chips.push({
      key: `bhk-${b}`,
      label: b === '5BHK+' ? '5+' : b,
      remove: { bhk: f.bhk.filter((x) => x !== b) },
    }),
  );
  if (f.budget) {
    const b = BUDGET_OPTIONS.find((x) => x.key === f.budget);
    if (b) chips.push({ key: 'budget', label: b.label, remove: { budget: '' } });
  }
  f.statuses.forEach((s) =>
    chips.push({
      key: `st-${s}`,
      label: s,
      remove: { statuses: f.statuses.filter((x) => x !== s) },
    }),
  );
  f.furnishing.forEach((fu) => {
    const label = PLP_FURNISHING_OPTIONS.find((o) => o.value === fu)?.label ?? fu;
    chips.push({
      key: `fu-${fu}`,
      label,
      remove: { furnishing: f.furnishing.filter((x) => x !== fu) },
    });
  });
  if (f.listingFor === 'Rent') {
    chips.push({ key: 'rent', label: 'Rent', remove: { listingFor: 'Buy' } });
  }
  return chips;
}

export function buyPageTitle(f: BuyFilters): string {
  const city = f.city.trim() || 'India';
  const mode = f.listingFor === 'Rent' ? 'for Rent' : 'for Sale';
  if (f.q.trim()) return `Search results for “${f.q.trim()}”`;
  return `Properties ${mode} in ${city}`;
}
