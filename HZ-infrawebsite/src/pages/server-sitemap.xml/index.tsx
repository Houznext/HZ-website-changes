import type { GetServerSideProps } from 'next';
import { getServerSideSitemapLegacy, type ISitemapField } from 'next-sitemap';
import { allSeoLandingPaths } from '@/lib/seoLanding';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://infra.houznext.com').replace(/\/$/, '');

type SlugEntry = { slug: string; updatedAt: string };

async function fetchSitemapEntries(): Promise<{
  properties: SlugEntry[];
  projects: SlugEntry[];
  news: SlugEntry[];
}> {
  const base = (
    process.env.INFRA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_INFRA_API_URL ||
    'http://127.0.0.1:4001'
  ).replace(/\/$/, '');
  try {
    const res = await fetch(`${base}/sitemap/entries`);
    if (!res.ok) return { properties: [], projects: [], news: [] };
    const body = (await res.json()) as {
      properties?: SlugEntry[];
      projects?: SlugEntry[];
      news?: SlugEntry[];
    };
    return {
      properties: body.properties ?? [],
      projects: body.projects ?? [],
      news: body.news ?? [],
    };
  } catch {
    return { properties: [], projects: [], news: [] };
  }
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { properties, projects, news } = await fetchSitemapEntries();
  const now = new Date().toISOString();

  const fields: ISitemapField[] = [
    ...allSeoLandingPaths().map(({ path }) => ({
      loc: `${SITE_URL}${path}`,
      lastmod: now,
      changefreq: 'daily' as const,
      priority: 0.85,
    })),
    ...properties.map((p) => ({
      loc: `${SITE_URL}/property/${encodeURIComponent(p.slug)}`,
      lastmod: p.updatedAt || now,
      changefreq: 'weekly' as const,
      priority: 0.75,
    })),
    ...projects.map((p) => ({
      loc: `${SITE_URL}/projects/${encodeURIComponent(p.slug)}`,
      lastmod: p.updatedAt || now,
      changefreq: 'weekly' as const,
      priority: 0.75,
    })),
    ...news.map((n) => ({
      loc: `${SITE_URL}/news/${encodeURIComponent(n.slug)}`,
      lastmod: n.updatedAt || now,
      changefreq: 'monthly' as const,
      priority: 0.6,
    })),
  ];

  return getServerSideSitemapLegacy(ctx, fields);
};

export default function ServerSitemap() {}
