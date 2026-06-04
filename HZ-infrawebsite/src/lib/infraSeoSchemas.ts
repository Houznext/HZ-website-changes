import type { InfraPageSeoPublic } from '@/lib/fetchPageSeo';
import type { InfraSeoGeo } from '@/lib/fetchSeoGeo';

export function buildOrganizationSchema(geo: InfraSeoGeo, pageUrl: string) {
  const address: Record<string, string> = {
    '@type': 'PostalAddress',
    addressLocality: geo.addressLocality,
    addressRegion: geo.addressRegion,
    addressCountry: 'IN',
  };
  if (geo.streetAddress) address.streetAddress = geo.streetAddress;
  if (geo.postalCode) address.postalCode = geo.postalCode;

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${geo.siteUrl}#organization`,
    name: geo.organizationName,
    description: geo.organizationDescription,
    url: geo.siteUrl,
    telephone: geo.telephone,
    image: geo.defaultOgImage,
    address,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: geo.latitude,
      longitude: geo.longitude,
    },
    openingHours: geo.openingHours,
    areaServed: geo.areaServed.map((name) => ({ '@type': 'City', name })),
    sameAs: ['https://houznext.com'],
  };
}

export function buildWebSiteSchema(geo: InfraSeoGeo) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${geo.siteUrl}#website`,
    name: geo.siteName,
    url: geo.siteUrl,
    description: geo.organizationDescription,
    publisher: { '@id': `${geo.siteUrl}#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${geo.siteUrl}/buy?city={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildFaqSchema(geo: InfraSeoGeo) {
  if (!geo.faqItems?.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: geo.faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function buildPageWebPageSchema(
  geo: InfraSeoGeo,
  page: InfraPageSeoPublic,
  canonicalPath: string,
) {
  const url = `${geo.siteUrl}${canonicalPath === '/' ? '' : canonicalPath}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: page.metaTitle,
    description: page.metaDescription,
    isPartOf: { '@id': `${geo.siteUrl}#website` },
    about: { '@id': `${geo.siteUrl}#organization` },
    ...(geo.aiSummary ? { abstract: geo.aiSummary } : {}),
  };
}

export function schemasForPage(
  geo: InfraSeoGeo,
  page: InfraPageSeoPublic,
  canonicalPath: string,
): object[] {
  const out: object[] = [buildOrganizationSchema(geo, canonicalPath), buildWebSiteSchema(geo)];
  if (page.hasStructuredData) {
    out.push(buildPageWebPageSchema(geo, page, canonicalPath));
    const faq = buildFaqSchema(geo);
    if (faq) out.push(faq);
  }
  return out;
}
