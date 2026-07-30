import type { PublicProperty } from '@/types/property.types';
import type { StoredPropertyRef } from '@/lib/propertyListsLocal';

export type PropertyTypeKey = 'Land' | 'Villa' | 'Apartment' | 'Plot';

const CITY_KEY = 'infra_preferred_city';
const TYPE_SCORES_KEY = 'infra_type_interest';

const ALL_TYPES: PropertyTypeKey[] = ['Land', 'Villa', 'Apartment', 'Plot'];

const DEFAULT_CITY = 'Hyderabad';

const TYPE_LIMITS: Record<PropertyTypeKey, number> = {
  Land: 12,
  Villa: 12,
  Apartment: 12,
  Plot: 12,
};

export type PersonalizationProfile = {
  city: string;
  citySource: 'explicit' | 'behavior' | 'default';
  typeOrder: PropertyTypeKey[];
  typeScores: Record<PropertyTypeKey, number>;
  subtitle: string;
};

function readJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

function normalizeCity(city?: string | null): string | null {
  const c = city?.trim();
  if (!c || c.length < 2) return null;
  return c;
}

function normalizeType(t?: string | null): PropertyTypeKey | null {
  if (!t) return null;
  const map: Record<string, PropertyTypeKey> = {
    land: 'Land',
    villa: 'Villa',
    apartment: 'Apartment',
    plot: 'Plot',
    studio: 'Apartment',
    'row house': 'Villa',
    farmhouse: 'Villa',
  };
  return map[t.trim().toLowerCase()] ?? (ALL_TYPES.includes(t as PropertyTypeKey) ? (t as PropertyTypeKey) : null);
}

/** User picked a city (city grid, buy filter, etc.). */
export function recordPreferredCity(city: string) {
  const c = normalizeCity(city);
  if (!c) return;
  writeJson(CITY_KEY, { city: c, at: new Date().toISOString() });
}

export function getExplicitPreferredCity(): string | null {
  const row = readJson<{ city?: string }>(CITY_KEY);
  return normalizeCity(row?.city);
}

function bumpTypeScore(scores: Record<PropertyTypeKey, number>, type: PropertyTypeKey, points: number) {
  scores[type] = (scores[type] ?? 0) + points;
}

function loadTypeScores(): Record<PropertyTypeKey, number> {
  const stored = readJson<Partial<Record<PropertyTypeKey, number>>>(TYPE_SCORES_KEY);
  const base: Record<PropertyTypeKey, number> = { Land: 0, Villa: 0, Apartment: 0, Plot: 0 };
  if (!stored) return base;
  for (const t of ALL_TYPES) {
    if (typeof stored[t] === 'number') base[t] = stored[t]!;
  }
  return base;
}

/** Hero tab, buy filter, or property view. */
export function recordTypeInterest(type: string, points = 3) {
  const t = normalizeType(type);
  if (!t) return;
  const scores = loadTypeScores();
  bumpTypeScore(scores, t, points);
  writeJson(TYPE_SCORES_KEY, scores);
}

function scoreCityFromRefs(refs: { city?: string | null; viewedAt?: string; savedAt?: string }[]): Map<string, number> {
  const counts = new Map<string, number>();
  refs.forEach((r, i) => {
    const c = normalizeCity(r.city);
    if (!c) return;
    const recency = Math.max(1, 5 - Math.floor(i / 3));
    counts.set(c, (counts.get(c) ?? 0) + recency);
  });
  return counts;
}

function pickTopCity(counts: Map<string, number>, fallback: string): string {
  let best = fallback;
  let bestScore = 0;
  counts.forEach((score, city) => {
    if (score > bestScore) {
      bestScore = score;
      best = city;
    }
  });
  return best;
}

function orderTypes(scores: Record<PropertyTypeKey, number>): PropertyTypeKey[] {
  return [...ALL_TYPES].sort((a, b) => {
    const d = (scores[b] ?? 0) - (scores[a] ?? 0);
    if (d !== 0) return d;
    return ALL_TYPES.indexOf(a) - ALL_TYPES.indexOf(b);
  });
}

function buildSubtitle(city: string, typeOrder: PropertyTypeKey[], scores: Record<PropertyTypeKey, number>): string {
  const topTypes = typeOrder.filter((t) => (scores[t] ?? 0) > 0).slice(0, 2);
  if (topTypes.length === 0) {
    return `Picks in ${city} — updated as you browse`;
  }
  const labels = topTypes.join(' & ');
  return `Based on your interest in ${city} · ${labels}`;
}

export function buildPersonalizationProfile(input: {
  seen: StoredPropertyRef[];
  savedLocal: StoredPropertyRef[];
  savedApi?: { city?: string | null; propertyType?: string }[];
}): PersonalizationProfile {
  const typeScores = loadTypeScores();

  for (const ref of input.seen) {
    const t = normalizeType((ref as StoredPropertyRef & { propertyType?: string }).propertyType);
    if (t) bumpTypeScore(typeScores, t, 2);
  }
  for (const ref of input.savedLocal) {
    const t = normalizeType((ref as StoredPropertyRef & { propertyType?: string }).propertyType);
    if (t) bumpTypeScore(typeScores, t, 4);
  }
  for (const p of input.savedApi ?? []) {
    const t = normalizeType(p.propertyType);
    if (t) bumpTypeScore(typeScores, t, 5);
  }

  const explicitCity = getExplicitPreferredCity();
  const cityCounts = scoreCityFromRefs([
    ...input.seen,
    ...input.savedLocal,
    ...(input.savedApi ?? []).map((p) => ({ city: p.city })),
  ]);

  let city = DEFAULT_CITY;
  let citySource: PersonalizationProfile['citySource'] = 'default';

  if (explicitCity) {
    city = explicitCity;
    citySource = 'explicit';
  } else if (cityCounts.size > 0) {
    city = pickTopCity(cityCounts, DEFAULT_CITY);
    citySource = 'behavior';
  }

  const typeOrder = orderTypes(typeScores);
  const subtitle = buildSubtitle(city, typeOrder, typeScores);

  return { city, citySource, typeOrder, typeScores, subtitle };
}

export function getTypeLimits(): Record<PropertyTypeKey, number> {
  return { ...TYPE_LIMITS };
}

export type CuratedBuckets = Record<PropertyTypeKey, PublicProperty[]>;

/** Merge API results without duplicates; prefer earlier (more relevant) lists. */
export function mergePropertyLists(...lists: PublicProperty[][]): PublicProperty[] {
  const seen = new Set<string>();
  const out: PublicProperty[] = [];
  for (const list of lists) {
    for (const p of list) {
      const id = p.propertyId;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push(p);
    }
  }
  return out;
}

export function sliceToLimit(items: PublicProperty[], limit: number): PublicProperty[] {
  return items.slice(0, limit);
}
