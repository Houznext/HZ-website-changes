export type SeoFaqItem = { question: string; answer: string };

export type InfraSeoGeoDto = {
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
  /** Generative-engine / AI discovery summary */
  aiSummary: string;
  faqItems: SeoFaqItem[];
};

export const SEO_GEO_CONFIG_KEY = 'seo_geo';

export const DEFAULT_SEO_GEO: InfraSeoGeoDto = {
  siteName: 'Houznext Infra',
  siteUrl: 'https://infra.houznext.com',
  defaultOgImage: 'https://infra.houznext.com/web-app-manifest-512x512.png',
  organizationName: 'Houznext Infra',
  organizationDescription:
    "India's trusted platform to buy and sell land, villas, apartments and plots — RERA-verified listings with title & EC checks.",
  telephone: '+919759750770',
  geoRegion: 'IN-TG',
  geoPlacename: 'Hyderabad',
  geoPosition: '17.385044;78.486671',
  icbm: '17.385044, 78.486671',
  latitude: 17.385044,
  longitude: 78.486671,
  areaServed: ['Hyderabad', 'Bengaluru', 'Chennai', 'Mumbai'],
  twitterSite: '@houznext',
  defaultKeywords:
    'real estate, property, RERA, land, villa, apartment, plot, Hyderabad, Bengaluru, Chennai, Mumbai, Houznext Infra',
  openingHours: 'Mo-Su 09:00-18:00',
  streetAddress: '',
  addressLocality: 'Hyderabad',
  addressRegion: 'Telangana',
  postalCode: '500032',
  aiSummary:
    'Houznext Infra helps buyers and sellers find RERA-verified land, villas, apartments and plots in Hyderabad, Bengaluru, Chennai and Mumbai with title verification, EC checks and zero brokerage.',
  faqItems: [
    {
      question: 'What is Houznext Infra?',
      answer:
        'Houznext Infra is a verified real estate platform for buying and selling land, villas, apartments and plots across major Indian cities.',
    },
    {
      question: 'Which cities does Houznext Infra serve?',
      answer: 'Hyderabad, Bengaluru, Chennai and Mumbai with expanding inventory.',
    },
    {
      question: 'Are listings RERA verified?',
      answer: 'Featured projects and listings follow RERA and title verification standards before publication.',
    },
  ],
};

export function mergeSeoGeo(raw: Partial<InfraSeoGeoDto> | null | undefined): InfraSeoGeoDto {
  const base = DEFAULT_SEO_GEO;
  if (!raw || typeof raw !== 'object') return { ...base, areaServed: [...base.areaServed], faqItems: [...base.faqItems] };
  return {
    siteName: raw.siteName?.trim() || base.siteName,
    siteUrl: raw.siteUrl?.trim() || base.siteUrl,
    defaultOgImage: raw.defaultOgImage?.trim() || base.defaultOgImage,
    organizationName: raw.organizationName?.trim() || base.organizationName,
    organizationDescription: raw.organizationDescription?.trim() || base.organizationDescription,
    telephone: raw.telephone?.trim() || base.telephone,
    geoRegion: raw.geoRegion?.trim() || base.geoRegion,
    geoPlacename: raw.geoPlacename?.trim() || base.geoPlacename,
    geoPosition: raw.geoPosition?.trim() || base.geoPosition,
    icbm: raw.icbm?.trim() || base.icbm,
    latitude: typeof raw.latitude === 'number' ? raw.latitude : base.latitude,
    longitude: typeof raw.longitude === 'number' ? raw.longitude : base.longitude,
    areaServed: Array.isArray(raw.areaServed) && raw.areaServed.length ? raw.areaServed : base.areaServed,
    twitterSite: raw.twitterSite?.trim() || base.twitterSite,
    defaultKeywords: raw.defaultKeywords?.trim() || base.defaultKeywords,
    openingHours: raw.openingHours?.trim() || base.openingHours,
    streetAddress: raw.streetAddress?.trim() ?? base.streetAddress,
    addressLocality: raw.addressLocality?.trim() || base.addressLocality,
    addressRegion: raw.addressRegion?.trim() || base.addressRegion,
    postalCode: raw.postalCode?.trim() || base.postalCode,
    aiSummary: raw.aiSummary?.trim() || base.aiSummary,
    faqItems:
      Array.isArray(raw.faqItems) && raw.faqItems.length
        ? raw.faqItems.map((f, i) => ({
            question: f.question?.trim() || base.faqItems[i]?.question || '',
            answer: f.answer?.trim() || base.faqItems[i]?.answer || '',
          }))
        : base.faqItems,
  };
}
