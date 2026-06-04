export type SeoFaqItem = { question: string; answer: string };

export type InfraSeoGeo = {
  siteName: string;
  siteUrl: string;
  defaultOgImage: string;
  organizationName: string;
  organizationDescription: string;
  telephone: string;
  geoRegion: string;
  geoPlacename: string;
  geoPosition: string;
  icbm: string;
  latitude: number;
  longitude: number;
  areaServed: string[];
  twitterSite: string;
  defaultKeywords: string;
  openingHours: string;
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  aiSummary: string;
  faqItems: SeoFaqItem[];
};

function apiBase(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_INFRA_API_URL ||
    process.env.INFRA_BACKEND_URL ||
    (typeof window !== 'undefined' ? '' : 'http://127.0.0.1:4001');
  if (!raw) return null;
  return String(raw).replace(/\/$/, '');
}

export async function fetchSeoGeo(): Promise<InfraSeoGeo | null> {
  const base = apiBase();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/site-config/seo-geo`);
    if (!res.ok) return null;
    return (await res.json()) as InfraSeoGeo;
  } catch {
    return null;
  }
}
