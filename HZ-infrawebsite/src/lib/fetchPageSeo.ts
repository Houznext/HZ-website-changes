export type InfraPageSeoPublic = {
  path: string;
  label: string;
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string | null;
  hasStructuredData: boolean;
  noIndex: boolean;
  keywords: string | null;
  source: 'database' | 'default';
};

function apiBase(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_INFRA_API_URL ||
    process.env.INFRA_BACKEND_URL ||
    (typeof window !== 'undefined' ? '' : 'http://127.0.0.1:4001');
  if (!raw) return null;
  return String(raw).replace(/\/$/, '');
}

export async function fetchPageSeo(path: string): Promise<InfraPageSeoPublic | null> {
  const base = apiBase();
  if (!base) return null;
  const normalized = path.trim() === '' ? '/' : path.trim().startsWith('/') ? path.trim() : `/${path.trim()}`;
  const url = `${base}/page-seo/public/by-path?path=${encodeURIComponent(normalized)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as InfraPageSeoPublic;
  } catch {
    return null;
  }
}
