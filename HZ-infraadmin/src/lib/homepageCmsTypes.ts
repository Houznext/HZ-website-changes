export type BrowseTypeCardContent = {
  title: string;
  desc: string;
  countLabel: string;
  href: string;
};

export type BrowseByTypeSection = {
  sectionTitle: string;
  sectionSubtitle: string;
  cards: Record<'Land' | 'Villa' | 'Apartment' | 'Plot', BrowseTypeCardContent>;
  images: Record<'Land' | 'Villa' | 'Apartment' | 'Plot', string | null>;
};

export type FeaturedProjectsContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  viewAllLabel: string;
};

export type CuratedRow = { type: string; title: string; cols: 3 | 5 };

export type CuratedContent = {
  title: string;
  defaultSubtitle: string;
  viewAllLabel: string;
  rows: CuratedRow[];
};

export type CityCard = {
  name: string;
  href: string;
  count: string;
  areas: string;
  gradient: string;
  titleSize: string;
  showBadge: boolean;
  wide: boolean;
  badgeLabel: string;
};

export type BrowseCityContent = {
  title: string;
  subtitle: string;
  defaultCity: string;
  cityOptions: string[];
  cities: CityCard[];
};

export type TestimonialItem = {
  initials: string;
  avatarBg: string;
  name: string;
  role: string;
  text: string;
};

export type TestimonialsContent = {
  eyebrow: string;
  title: string;
  items: TestimonialItem[];
};

export type ForSellersContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: string;
  primaryHref: string;
  secondaryCta: string;
  perks: string[];
};

export type WhyCard = {
  title: string;
  body: string;
  featured: boolean;
  badgeLabel: string;
};

export type WhyHouznextContent = {
  eyebrow: string;
  title: string;
  cards: WhyCard[];
};

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
