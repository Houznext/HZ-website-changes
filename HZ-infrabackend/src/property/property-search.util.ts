import { PropertyType } from '../common/enums/infra.enums';

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'in',
  'at',
  'on',
  'for',
  'of',
  'and',
  'or',
  'to',
  'with',
  'near',
  'around',
  'within',
]);

/** Normalized type hints extracted from free-text queries. */
export type ParsedPropertySearch = {
  raw: string;
  tokens: string[];
  locationTokens: string[];
  typeHints: PropertyType[];
  landUseHint: string | null;
  propertyCodeHint: string | null;
  propertyIdHint: string | null;
};

const TYPE_RULES: {
  test: (t: string) => boolean;
  types: PropertyType[];
  landUse?: string;
}[] = [
  { test: (t) => /^(apartments?|flats?|bhk)$/i.test(t) || t.includes('apartment') || t.includes('flat'), types: [PropertyType.Apartment] },
  { test: (t) => /^villas?$/i.test(t) || t.includes('villa'), types: [PropertyType.Villa] },
  { test: (t) => /^plots?$/i.test(t) || (t.includes('plot') && !t.includes('commercial')), types: [PropertyType.Plot] },
  { test: (t) => t.includes('commercial'), types: [PropertyType.Commercial] },
  { test: (t) => t.includes('row') && t.includes('house'), types: [PropertyType.RowHouse] },
  { test: (t) => t.includes('studio'), types: [PropertyType.Studio] },
  { test: (t) => t.includes('farmhouse') || t.includes('farm house'), types: [PropertyType.Farmhouse] },
  {
    test: (t) => t.includes('agricultur') || t.includes('agri') || t.includes('farm land') || t === 'farm',
    types: [PropertyType.Land],
    landUse: 'agriculture',
  },
  { test: (t) => /^lands?$/i.test(t) || (/\bland\b/.test(t) && !t.includes('island')), types: [PropertyType.Land] },
];

const SPELLING_VARIANTS: Record<string, string[]> = {
  apartment: ['apartmnt', 'apartmet', 'appartment', 'aprtment'],
  agriculture: ['agriculture', 'agricultural', 'agri', 'agricultur'],
  commercial: ['comercial', 'commerical', 'commercil'],
  madhapur: ['madapur', 'madhapor', 'madhapu'],
  vikarabad: ['vikarabaad', 'vikrabad', 'vicarabad'],
  hyderabad: ['hydrabad', 'hyderbad', 'hyderabd'],
  locality: ['localty', 'locality'],
};

export function normalizeSearchText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[+,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): string[] {
  return normalizeSearchText(text)
    .split(/[\s/]+/)
    .map((t) => t.replace(/[^a-z0-9-]/g, ''))
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cur = row[j];
      const cost = a[i - 1] === b[j - 1] ? prev : Math.min(prev, row[j], row[j - 1]) + 1;
      prev = row[j];
      row[j] = cost;
    }
  }
  return row[b.length];
}

/** Expand a token with typo-tolerant variants for SQL ILIKE / in-memory match. */
export function fuzzyTokenVariants(token: string): string[] {
  const base = normalizeSearchText(token);
  const out = new Set<string>([base]);
  if (base.length >= 4) {
    out.add(base.slice(0, -1));
    out.add(`${base}s`);
  }
  for (const [canonical, variants] of Object.entries(SPELLING_VARIANTS)) {
    if (base === canonical || variants.some((v) => v === base || levenshtein(base, v) <= 2)) {
      out.add(canonical);
      variants.forEach((v) => out.add(v));
    }
    if (levenshtein(base, canonical) <= 2) out.add(canonical);
  }
  return [...out].filter((t) => t.length >= 2);
}

export function tokenMatchesText(token: string, haystack: string): boolean {
  const h = normalizeSearchText(haystack);
  if (!h) return false;
  for (const variant of fuzzyTokenVariants(token)) {
    if (h.includes(variant)) return true;
    const words = h.split(/\s+/);
    for (const w of words) {
      if (w.includes(variant) || variant.includes(w)) return true;
      if (variant.length >= 4 && w.length >= 4 && levenshtein(variant, w) <= 2) return true;
    }
  }
  return false;
}

function detectTypeHints(phrase: string): { types: PropertyType[]; landUse: string | null } {
  const types = new Set<PropertyType>();
  let landUse: string | null = null;
  const p = normalizeSearchText(phrase);
  for (const rule of TYPE_RULES) {
    if (rule.test(p)) {
      rule.types.forEach((t) => types.add(t));
      if (rule.landUse) landUse = rule.landUse;
    }
  }
  return { types: [...types], landUse };
}

export function parsePropertySearchQuery(raw: string): ParsedPropertySearch {
  const trimmed = raw.trim();
  let working = normalizeSearchText(trimmed);
  let locationPhrase = '';

  const inMatch = working.match(/^(.+?)\s+in\s+(.+)$/);
  if (inMatch) {
    working = inMatch[1].trim();
    locationPhrase = inMatch[2].trim();
  }

  const typeFromFull = detectTypeHints(working);
  const allTokens = tokenize([working, locationPhrase].filter(Boolean).join(' '));

  const typeHints = new Set<PropertyType>(typeFromFull.types);
  const locationTokens: string[] = [];

  for (const token of allTokens) {
    const hint = detectTypeHints(token);
    if (hint.types.length) {
      hint.types.forEach((t) => typeHints.add(t));
      if (hint.landUse) typeFromFull.landUse = hint.landUse;
    } else {
      locationTokens.push(token);
    }
  }

  if (locationPhrase) {
    tokenize(locationPhrase).forEach((t) => {
      if (!typeHints.size || !detectTypeHints(t).types.length) locationTokens.push(t);
    });
  }

  const codeMatch = trimmed.match(/\b(hzi-?p?\d{3,6})\b/i);
  const uuidMatch = trimmed.match(
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i,
  );

  return {
    raw: trimmed,
    tokens: allTokens.length ? allTokens : tokenize(trimmed),
    locationTokens: [...new Set(locationTokens)],
    typeHints: [...typeHints],
    landUseHint: typeFromFull.landUse,
    propertyCodeHint: codeMatch ? codeMatch[1].toUpperCase().replace(/^HZI-?/, 'HZI-P') : null,
    propertyIdHint: uuidMatch ? uuidMatch[0] : null,
  };
}

export function buildPropertySearchBlob(p: {
  title?: string | null;
  propertyType?: string | null;
  propertyCode?: string | null;
  slug?: string | null;
  city?: string | null;
  locality?: string | null;
  address?: string | null;
  description?: string | null;
  landUseType?: string | null;
  layoutName?: string | null;
  zoneType?: string | null;
  bhkType?: string | null;
  towerName?: string | null;
  surveyNumber?: string | null;
  approvalAuthority?: string | null;
  approvalType?: string | null;
  amenities?: string[] | null;
  highlights?: string[] | null;
  additionalNotes?: string | null;
  propertyId?: string;
}): string {
  return [
    p.title,
    p.propertyType,
    p.propertyCode,
    p.propertyId,
    p.slug,
    p.city,
    p.locality,
    p.address,
    p.description,
    p.landUseType,
    p.layoutName,
    p.zoneType,
    p.bhkType,
    p.towerName,
    p.surveyNumber,
    p.approvalAuthority,
    p.approvalType,
    ...(p.amenities ?? []),
    ...(p.highlights ?? []),
    p.additionalNotes,
  ]
    .filter(Boolean)
    .join(' ');
}

export function scorePropertyMatch(
  p: Parameters<typeof buildPropertySearchBlob>[0],
  parsed: ParsedPropertySearch,
  hintType?: string,
): number {
  const blob = buildPropertySearchBlob(p);
  let score = 0;

  if (parsed.propertyIdHint && p.propertyId === parsed.propertyIdHint) score += 100;
  if (parsed.propertyCodeHint && p.propertyCode?.toUpperCase().includes(parsed.propertyCodeHint.replace(/^HZI-P/, ''))) {
    score += 80;
  }
  if (parsed.raw && p.propertyCode && tokenMatchesText(parsed.raw.replace(/\s/g, ''), p.propertyCode)) {
    score += 70;
  }

  const tokens = parsed.tokens.length ? parsed.tokens : tokenize(parsed.raw);
  for (const token of tokens) {
    if (tokenMatchesText(token, blob)) score += 12;
  }

  for (const loc of parsed.locationTokens) {
    if (tokenMatchesText(loc, [p.city, p.locality, p.address].filter(Boolean).join(' '))) score += 18;
  }

  if (parsed.typeHints.length && p.propertyType && parsed.typeHints.includes(p.propertyType as PropertyType)) {
    score += 14;
  }
  if (parsed.landUseHint && p.landUseType && tokenMatchesText(parsed.landUseHint, p.landUseType)) {
    score += 12;
  }
  if (hintType && p.propertyType === hintType) score += 6;

  return score;
}
