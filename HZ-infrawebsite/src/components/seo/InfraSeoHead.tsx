import Head from 'next/head';
import type { InfraPageSeoPublic } from '@/lib/fetchPageSeo';
import type { InfraSeoGeo } from '@/lib/fetchSeoGeo';
import { schemasForPage } from '@/lib/infraSeoSchemas';
import { resolveCmsAssetUrl } from '@/lib/cmsAssetUrl';

type Props = {
  page: InfraPageSeoPublic;
  geo: InfraSeoGeo;
  canonicalPath: string;
  /** Extra JSON-LD objects appended after CMS schemas */
  extraSchema?: object | object[];
};

function canonicalUrl(geo: InfraSeoGeo, path: string): string {
  const base = geo.siteUrl.replace(/\/$/, '');
  if (path === '/') return `${base}/`;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function InfraSeoHead({ page, geo, canonicalPath, extraSchema }: Props) {
  const siteName = geo.siteName;
  const title = page.metaTitle.includes(siteName) ? page.metaTitle : `${page.metaTitle} | ${siteName}`;
  const description = page.metaDescription;
  const keywords = page.keywords?.trim() || geo.defaultKeywords;
  const url = canonicalUrl(geo, canonicalPath);
  const image = resolveCmsAssetUrl(page.ogImageUrl, geo.defaultOgImage);
  const robots = page.noIndex
    ? 'noindex,nofollow'
    : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';

  const schemas = schemasForPage(geo, page, canonicalPath);
  const extras = extraSchema
    ? Array.isArray(extraSchema)
      ? extraSchema
      : [extraSchema]
    : [];
  const allSchema = [...schemas, ...extras];

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      <link rel="canonical" href={url} />
      <meta name="robots" content={robots} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:site_name" content={siteName} />

      <meta name="twitter:card" content="summary_large_image" />
      {geo.twitterSite ? <meta name="twitter:site" content={geo.twitterSite} /> : null}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <meta name="geo.region" content={geo.geoRegion} />
      <meta name="geo.placename" content={geo.geoPlacename} />
      <meta name="geo.position" content={geo.geoPosition} />
      <meta name="ICBM" content={geo.icbm} />
      <meta name="language" content="en-IN" />

      {geo.aiSummary ? <meta name="abstract" content={geo.aiSummary} /> : null}

      {allSchema.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Head>
  );
}
