const defaultCityBg =
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=85';

export function publicApiOrigin(): string {
  const raw =
    (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_INFRA_API_URL : undefined) ||
    process.env.INFRA_BACKEND_URL ||
    'http://127.0.0.1:4001';
  return raw.trim().replace(/\/+$/, '');
}

/** Absolute URL for CMS images (hero, browse-by-type, etc.). */
export function resolveCmsAssetUrl(input: string | null | undefined, fallback = defaultCityBg): string {
  if (!input?.trim()) return fallback;
  const u = input.trim();
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith('//')) return `https:${u}`;
  const base = publicApiOrigin();
  return u.startsWith('/') ? `${base}${u}` : `${base}/${u}`;
}
