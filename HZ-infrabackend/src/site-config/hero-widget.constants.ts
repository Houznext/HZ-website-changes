export type HeroMetricItem = {
  value: string;
  label: string;
  accent?: boolean;
};

export const DEFAULT_HERO_POPULAR_TAGS = [
  '2BHK Hyderabad',
  'Villas Kokapet',
  'Plots Bengaluru',
  'Ready to move Mumbai',
  'Apartments Chennai',
];

export const DEFAULT_HERO_METRICS: HeroMetricItem[] = [
  { value: '1,200+', label: 'Listed properties' },
  { value: '48', label: 'Active projects' },
  { value: '4', label: 'Cities' },
  { value: 'RERA', label: 'All verified', accent: true },
];

export function normalizePopularTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [...DEFAULT_HERO_POPULAR_TAGS];
  const tags = raw
    .filter((t): t is string => typeof t === 'string')
    .map((t) => t.trim())
    .filter(Boolean);
  return tags.length ? tags.slice(0, 12) : [...DEFAULT_HERO_POPULAR_TAGS];
}

export function normalizeHeroMetrics(raw: unknown): HeroMetricItem[] {
  if (!Array.isArray(raw) || !raw.length) return [...DEFAULT_HERO_METRICS];
  const items = raw
    .map((m) => {
      if (!m || typeof m !== 'object') return null;
      const o = m as Record<string, unknown>;
      const value = typeof o.value === 'string' ? o.value.trim() : '';
      const label = typeof o.label === 'string' ? o.label.trim() : '';
      if (!value || !label) return null;
      return {
        value,
        label,
        accent: o.accent === true,
      };
    })
    .filter((m): m is HeroMetricItem => m !== null);
  return items.length ? items.slice(0, 6) : [...DEFAULT_HERO_METRICS];
}
