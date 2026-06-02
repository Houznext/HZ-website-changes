import { BROWSE_TYPE_KEYS, BrowseTypeKey } from './browse-type.constants';

export const SECTION_KEYS = {
  FEATURED_PROJECTS: 'featured_projects',
  CURATED: 'curated_properties',
  BROWSE_CITY: 'browse_by_city',
  TESTIMONIALS: 'testimonials',
  FOR_SELLERS: 'for_sellers',
  WHY_HOUZNEXT: 'why_houznext',
} as const;

export type BrowseTypeCardContent = {
  title: string;
  desc: string;
  countLabel: string;
  href: string;
};

export type BrowseByTypeContentDto = {
  sectionTitle: string;
  sectionSubtitle: string;
  cards: Record<BrowseTypeKey, BrowseTypeCardContent>;
};

export type FeaturedProjectsContentDto = {
  eyebrow: string;
  title: string;
  subtitle: string;
  viewAllLabel: string;
};

export type CuratedRowDto = {
  type: string;
  title: string;
  cols: 3 | 5;
};

export type CuratedContentDto = {
  title: string;
  defaultSubtitle: string;
  viewAllLabel: string;
  rows: CuratedRowDto[];
};

export type CityCardDto = {
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

export type BrowseCityContentDto = {
  title: string;
  subtitle: string;
  defaultCity: string;
  cityOptions: string[];
  cities: CityCardDto[];
};

export type TestimonialItemDto = {
  initials: string;
  avatarBg: string;
  name: string;
  role: string;
  text: string;
};

export type TestimonialsContentDto = {
  eyebrow: string;
  title: string;
  items: TestimonialItemDto[];
};

export type ForSellersContentDto = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: string;
  primaryHref: string;
  secondaryCta: string;
  perks: string[];
};

export type WhyCardDto = {
  title: string;
  body: string;
  featured: boolean;
  badgeLabel: string;
};

export type WhyHouznextContentDto = {
  eyebrow: string;
  title: string;
  cards: WhyCardDto[];
};

export const DEFAULT_BROWSE_BY_TYPE_CONTENT: BrowseByTypeContentDto = {
  sectionTitle: 'Browse by type',
  sectionSubtitle: 'Immersive cards with verified counts — each category opens the PLP with filters applied.',
  cards: {
    Land: {
      title: 'Land',
      desc: 'Clear-title parcels with growth corridor visibility.',
      countLabel: '120+ listings',
      href: '/buy?type=Land',
    },
    Villa: {
      title: 'Villa',
      desc: 'Spacious gated homes with verified approvals.',
      countLabel: '85+ listings',
      href: '/buy?type=Villa',
    },
    Apartment: {
      title: 'Apartment',
      desc: 'RERA-forward towers with transparent pricing.',
      countLabel: '340+ listings',
      href: '/buy?type=Apartment',
    },
    Plot: {
      title: 'Plot',
      desc: 'Corner & facing-aware inventory for builders.',
      countLabel: '210+ listings',
      href: '/buy?type=Plot',
    },
  },
};

export const DEFAULT_FEATURED_PROJECTS: FeaturedProjectsContentDto = {
  eyebrow: 'RERA Registered Projects',
  title: 'Featured Projects',
  subtitle: 'Curated apartment, villa, venture & plotted projects from verified developers',
  viewAllLabel: 'View all projects →',
};

export const DEFAULT_CURATED: CuratedContentDto = {
  title: 'Properties curated for you',
  defaultSubtitle: 'Picks tailored to your city and browsing — updates as you explore',
  viewAllLabel: 'View all →',
  rows: [
    { type: 'Land', title: 'Featured Lands', cols: 3 },
    { type: 'Villa', title: 'Featured Villas', cols: 3 },
    { type: 'Apartment', title: 'Featured Apartments', cols: 3 },
    { type: 'Plot', title: 'Plots — Five feed', cols: 5 },
  ],
};

export const DEFAULT_BROWSE_CITY: BrowseCityContentDto = {
  title: 'Browse by city',
  subtitle: 'Hyderabad · Bengaluru · Chennai · Mumbai',
  defaultCity: 'Hyderabad',
  cityOptions: ['Hyderabad', 'Bengaluru', 'Chennai', 'Mumbai'],
  cities: [
    {
      name: 'Hyderabad',
      href: '/buy?city=Hyderabad',
      count: '648 properties',
      areas: 'Gachibowli, Kokapet, HITEC City',
      gradient: 'linear-gradient(135deg,#0f2a44,#1a4060)',
      titleSize: 'text-[22px]',
      showBadge: true,
      wide: false,
      badgeLabel: '',
    },
    {
      name: 'Bengaluru',
      href: '/buy?city=Bengaluru',
      count: '312 properties',
      areas: '312 properties',
      gradient: 'linear-gradient(135deg,#052e16,#14532d)',
      titleSize: 'text-xl',
      showBadge: false,
      wide: false,
      badgeLabel: '',
    },
    {
      name: 'Chennai',
      href: '/buy?city=Chennai',
      count: '156 properties',
      areas: '156 properties',
      gradient: 'linear-gradient(135deg,#1e1b4b,#312e81)',
      titleSize: 'text-xl',
      showBadge: false,
      wide: false,
      badgeLabel: '',
    },
    {
      name: 'Mumbai',
      href: '/buy?city=Mumbai',
      count: '184 properties',
      areas: 'Powai · BKC · Bandra · 184 properties',
      gradient: 'linear-gradient(135deg,#451a03,#78350f)',
      titleSize: 'text-xl',
      showBadge: false,
      wide: true,
      badgeLabel: 'New city',
    },
  ],
};

export const DEFAULT_TESTIMONIALS: TestimonialsContentDto = {
  eyebrow: 'Customer stories',
  title: 'What our customers say',
  items: [
    {
      initials: 'RK',
      avatarBg: '#2f80ed',
      name: 'Ravi Kumar',
      role: 'Hyderabad · Villa buyer',
      text: 'Found my dream villa in Kokapet through Houznext Infra. RERA verified, title clear, zero brokerage. The property insights helped me understand the area growth potential.',
    },
    {
      initials: 'SM',
      avatarBg: '#db2777',
      name: 'Sunita Mehta',
      role: 'Bengaluru · Apartment seller',
      text: 'Sold my apartment in 3 weeks! The listing process was smooth and the Houznext team handled everything including the EC verification and documentation.',
    },
    {
      initials: 'VR',
      avatarBg: '#0d9488',
      name: 'Venkat Rao',
      role: 'Hyderabad · Plot buyer',
      text: 'The property value calculator was spot on. Got a fair deal on a plot in ORR. Free 1-year property management support is a bonus that none of the others offer.',
    },
  ],
};

export const DEFAULT_FOR_SELLERS: ForSellersContentDto = {
  eyebrow: 'For sellers',
  title: 'List your property with Houznext Infra',
  subtitle:
    'Reach thousands of verified buyers. We handle EC & title checks, RERA compliance, photography and more. Zero hidden fees.',
  primaryCta: 'List your property →',
  primaryHref: '/sell',
  secondaryCta: 'Talk to our team',
  perks: ['Free listing', 'EC & title verified', '1 year free property management', 'Zero brokerage'],
};

export const DEFAULT_WHY_HOUZNEXT: WhyHouznextContentDto = {
  eyebrow: 'Our edge',
  title: 'Why Houznext Infra?',
  cards: [
    {
      title: 'Property Insights',
      body: 'Deep market data, locality trends, price history and future growth projections for every listing.',
      featured: false,
      badgeLabel: '',
    },
    {
      title: 'Future Growth Potential',
      body: 'Our analysts forecast 5-year appreciation rates for every locality based on infrastructure, demand and policy.',
      featured: false,
      badgeLabel: '',
    },
    {
      title: '20-Year Portfolio Track',
      body: "Houznext's 20-year portfolio history across Hyderabad, Chennai and Bengaluru — proven track record.",
      featured: false,
      badgeLabel: '',
    },
    {
      title: 'Title Verified',
      body: 'Every property undergoes thorough title search. Clear ownership chain guaranteed before listing.',
      featured: false,
      badgeLabel: '',
    },
    {
      title: 'EC Verified',
      body: 'Encumbrance Certificate verified for every listing. No hidden loans or legal disputes on your property.',
      featured: false,
      badgeLabel: '',
    },
    {
      title: 'Property Management Support',
      body: '1 year free property management after purchase. Rent collection, maintenance, tenant management.',
      featured: true,
      badgeLabel: 'Free 1 year',
    },
  ],
};

export function mergeBrowseTypeContent(raw: Partial<BrowseByTypeContentDto> | null | undefined): BrowseByTypeContentDto {
  const base = DEFAULT_BROWSE_BY_TYPE_CONTENT;
  const cards = { ...base.cards };
  for (const key of BROWSE_TYPE_KEYS) {
    const patch = raw?.cards?.[key];
    if (patch) cards[key] = { ...cards[key], ...patch };
  }
  return {
    sectionTitle: raw?.sectionTitle?.trim() || base.sectionTitle,
    sectionSubtitle: raw?.sectionSubtitle?.trim() || base.sectionSubtitle,
    cards,
  };
}

export function mergePayload<T extends object>(defaults: T, raw: Partial<T> | null | undefined): T {
  if (!raw || typeof raw !== 'object') return { ...defaults };
  return { ...defaults, ...raw };
}
