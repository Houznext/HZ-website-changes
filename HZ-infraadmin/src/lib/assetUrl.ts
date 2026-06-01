const publicBase = () =>
  (process.env.NEXT_PUBLIC_INFRA_API_URL || 'http://localhost:4001').replace(/\/$/, '');

export function resolveAssetUrl(input?: string | null): string | null {
  if (!input?.trim()) return null;
  const u = input.trim();
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith('//')) return `https:${u}`;
  const base = publicBase();
  return u.startsWith('/') ? `${base}${u}` : `${base}/${u}`;
}
