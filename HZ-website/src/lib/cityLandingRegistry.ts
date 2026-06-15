export const CITY_SLUGS = [
  'vikarabad',
  'mahabubnagar',
  'sangareddy',
  'siddipet',
  'adilabad',
  'suryapet',
] as const

export type CitySlug = (typeof CITY_SLUGS)[number]

export type CityLandingMeta = {
  slug: CitySlug
  name: string
  cmsKey: string
  path: string
  leadSource: string
  surroundingAreas: string[]
  schemaAreasNote: string
}

export const CITY_LANDING_REGISTRY: Record<CitySlug, CityLandingMeta> = {
  vikarabad: {
    slug: 'vikarabad',
    name: 'Vikarabad',
    cmsKey: 'landing_vikarabad',
    path: '/interior-designers-in-vikarabad',
    leadSource: 'vikarabad-landing',
    surroundingAreas: ['Vikarabad town', 'Tandur', 'Parigi', 'Kodangal', 'Other'],
    schemaAreasNote: 'Vikarabad town, Tandur, Parigi, Kodangal',
  },
  mahabubnagar: {
    slug: 'mahabubnagar',
    name: 'Mahabubnagar',
    cmsKey: 'landing_mahabubnagar',
    path: '/interior-designers-in-mahabubnagar',
    leadSource: 'mahabubnagar-landing',
    surroundingAreas: ['Mahabubnagar town', 'Jadcherla', 'Shadnagar', 'Narayanpet', 'Wanaparthy', 'Other'],
    schemaAreasNote: 'Mahabubnagar town, Jadcherla, Shadnagar, Narayanpet, Wanaparthy',
  },
  sangareddy: {
    slug: 'sangareddy',
    name: 'Sangareddy',
    cmsKey: 'landing_sangareddy',
    path: '/interior-designers-in-sangareddy',
    leadSource: 'sangareddy-landing',
    surroundingAreas: ['Sangareddy town', 'Patancheru', 'Zaheerabad', 'Narayankhed', 'Jogipet', 'Other'],
    schemaAreasNote: 'Sangareddy town, Patancheru, Zaheerabad, Narayankhed, Jogipet',
  },
  siddipet: {
    slug: 'siddipet',
    name: 'Siddipet',
    cmsKey: 'landing_siddipet',
    path: '/interior-designers-in-siddipet',
    leadSource: 'siddipet-landing',
    surroundingAreas: ['Siddipet town', 'Gajwel', 'Husnabad', 'Cheriyal', 'Dubbak', 'Other'],
    schemaAreasNote: 'Siddipet town, Gajwel, Husnabad, Cheriyal, Dubbak',
  },
  adilabad: {
    slug: 'adilabad',
    name: 'Adilabad',
    cmsKey: 'landing_adilabad',
    path: '/interior-designers-in-adilabad',
    leadSource: 'adilabad-landing',
    surroundingAreas: ['Adilabad town', 'Nirmal', 'Mancherial', 'Bellampalli', 'Bhainsa', 'Other'],
    schemaAreasNote: 'Adilabad town, Nirmal, Mancherial, Bellampalli, Bhainsa',
  },
  suryapet: {
    slug: 'suryapet',
    name: 'Suryapet',
    cmsKey: 'landing_suryapet',
    path: '/interior-designers-in-suryapet',
    leadSource: 'suryapet-landing',
    surroundingAreas: ['Suryapet town', 'Kodad', 'Huzurnagar', 'Tirumalagiri', 'Mothey', 'Other'],
    schemaAreasNote: 'Suryapet town, Kodad, Huzurnagar, Tirumalagiri, Mothey',
  },
}

export function getCityMeta(slug: CitySlug): CityLandingMeta {
  return CITY_LANDING_REGISTRY[slug]
}

export function buildCitySchema(slug: CitySlug) {
  const meta = getCityMeta(slug)
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `Houznext Interiors — ${meta.name}`,
    description: `Fixed-price home interior designers serving ${meta.name}. 2BHK, 3BHK and villa interiors with 45-day delivery and 10-year warranty.`,
    image: 'https://houznext.com/og-home.jpg',
    url: `https://houznext.com${meta.path}`,
    telephone: '+91-9759750770',
    areaServed: {
      '@type': 'City',
      name: meta.name,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: 'Telangana',
      },
    },
    priceRange: '₹4.5L – ₹18L',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '680',
    },
  }
}

export function whatsappUrlForCity(cityName: string): string {
  const text = encodeURIComponent(`Hi Houznext, I want a free consultation for ${cityName}`)
  return `https://wa.me/919759750770?text=${text}`
}
