/** SEO landing pages: /buy/{citySlug}/{typeSlug} */

export const SEO_CITY_SLUGS = [
  { slug: 'hyderabad', name: 'Hyderabad' },
  { slug: 'bengaluru', name: 'Bengaluru' },
  { slug: 'chennai', name: 'Chennai' },
  { slug: 'mumbai', name: 'Mumbai' },
  { slug: 'vikarabad', name: 'Vikarabad' },
] as const;

export const SEO_TYPE_SLUGS = [
  { slug: 'apartments', label: 'Apartments', propertyType: 'Apartment' },
  { slug: 'villas', label: 'Villas', propertyType: 'Villa' },
  { slug: 'land', label: 'Land', propertyType: 'Land' },
  { slug: 'plots', label: 'Plots', propertyType: 'Plot' },
] as const;

export type SeoCitySlug = (typeof SEO_CITY_SLUGS)[number]['slug'];
export type SeoTypeSlug = (typeof SEO_TYPE_SLUGS)[number]['slug'];

export function resolveSeoCity(slug: string): (typeof SEO_CITY_SLUGS)[number] | null {
  return SEO_CITY_SLUGS.find((c) => c.slug === slug.toLowerCase()) ?? null;
}

export function resolveSeoType(slug: string): (typeof SEO_TYPE_SLUGS)[number] | null {
  return SEO_TYPE_SLUGS.find((t) => t.slug === slug.toLowerCase()) ?? null;
}

export function seoLandingPath(citySlug: string, typeSlug: string): string {
  return `/buy/${citySlug}/${typeSlug}`;
}

export function allSeoLandingPaths(): { city: SeoCitySlug; type: SeoTypeSlug; path: string }[] {
  const out: { city: SeoCitySlug; type: SeoTypeSlug; path: string }[] = [];
  for (const city of SEO_CITY_SLUGS) {
    for (const type of SEO_TYPE_SLUGS) {
      out.push({ city: city.slug, type: type.slug, path: seoLandingPath(city.slug, type.slug) });
    }
  }
  return out;
}

export function seoLandingTitle(cityName: string, typeLabel: string): string {
  return `${typeLabel} in ${cityName} | Houznext Infra`;
}

export function seoLandingDescription(cityName: string, typeLabel: string): string {
  return `Browse verified ${typeLabel.toLowerCase()} in ${cityName} on Houznext Infra. RERA-forward listings with title & EC checks, transparent pricing and zero brokerage.`;
}

export function seoLandingIntro(cityName: string, typeLabel: string, propertyType: string): string {
  const localityHint =
    cityName === 'Hyderabad'
      ? 'Gachibowli, Kokapet, HITEC City and ORR corridors'
      : cityName === 'Vikarabad'
        ? 'Vikarabad town, Tandur road belt and highway-facing parcels'
        : `prime localities across ${cityName}`;
  return `Find ${typeLabel.toLowerCase()} for sale in ${cityName} on Houznext Infra. Explore RERA-verified ${propertyType.toLowerCase()} listings in ${localityHint} with clear titles, EC verification and expert property insights. Filter by budget, BHK and status — or talk to our team for a curated shortlist.`;
}
