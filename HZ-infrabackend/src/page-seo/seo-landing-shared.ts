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

export function seoLandingPath(citySlug: string, typeSlug: string): string {
  return `/buy/${citySlug}/${typeSlug}`;
}

export function seoLandingTitle(cityName: string, typeLabel: string): string {
  return `${typeLabel} in ${cityName} | Houznext Infra`;
}

export function seoLandingDescription(cityName: string, typeLabel: string): string {
  return `Browse verified ${typeLabel.toLowerCase()} in ${cityName} on Houznext Infra. RERA-forward listings with title & EC checks, transparent pricing and zero brokerage.`;
}

export function allSeoLandingPaths(): string[] {
  const paths: string[] = [];
  for (const city of SEO_CITY_SLUGS) {
    for (const type of SEO_TYPE_SLUGS) {
      paths.push(seoLandingPath(city.slug, type.slug));
    }
  }
  return paths;
}
