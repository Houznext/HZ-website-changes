import { SEO_CITY_SLUGS, SEO_TYPE_SLUGS, seoLandingDescription, seoLandingPath, seoLandingTitle } from './seo-landing-shared';
import type { InfraPageSeoDefaultRow } from './infra-page-seo-defaults';
import { INFRA_SEO_OG_DEFAULT } from './infra-page-seo-defaults';

export function buildSeoLandingDefaultRows(): InfraPageSeoDefaultRow[] {
  const rows: InfraPageSeoDefaultRow[] = [];
  for (const city of SEO_CITY_SLUGS) {
    for (const type of SEO_TYPE_SLUGS) {
      const path = seoLandingPath(city.slug, type.slug);
      rows.push({
        path,
        label: `${type.label} in ${city.name}`,
        metaTitle: seoLandingTitle(city.name, type.label),
        metaDescription: seoLandingDescription(city.name, type.label),
        ogImageUrl: INFRA_SEO_OG_DEFAULT,
        hasStructuredData: true,
        noIndex: false,
        keywords: `${type.label.toLowerCase()} ${city.name}, property ${city.name}, Houznext Infra, RERA`,
      });
    }
  }
  return rows;
}
