export type InfraPageSeoDefaultRow = {
  path: string;
  label: string;
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string | null;
  hasStructuredData: boolean;
  noIndex: boolean;
  keywords: string | null;
};

export const INFRA_SEO_OG_DEFAULT = 'https://infra.houznext.com/web-app-manifest-512x512.png';

export const INFRA_PAGE_SEO_DEFAULT_ROWS: InfraPageSeoDefaultRow[] = [
  {
    path: '/',
    label: 'Homepage (/)',
    metaTitle: 'Buy Land, Villa, Apartment & Plot | Houznext Infra',
    metaDescription:
      'RERA-verified properties across Hyderabad, Bengaluru, Chennai and Mumbai. Browse land, villas, apartments and plots with title & EC verification. Zero brokerage.',
    ogImageUrl: INFRA_SEO_OG_DEFAULT,
    hasStructuredData: true,
    noIndex: false,
    keywords: 'real estate, property, RERA, Hyderabad, Bengaluru, Chennai, Mumbai, Houznext Infra',
  },
  {
    path: '/buy',
    label: 'Buy properties',
    metaTitle: 'Buy Properties — Land, Villa, Apartment, Plot | Houznext Infra',
    metaDescription:
      'Search verified listings by city, type, BHK and budget. Filter land, villas, apartments and plots with transparent pricing.',
    ogImageUrl: INFRA_SEO_OG_DEFAULT,
    hasStructuredData: true,
    noIndex: false,
    keywords: 'buy property, real estate listings, apartments Hyderabad',
  },
  {
    path: '/projects',
    label: 'Projects',
    metaTitle: 'RERA Registered Projects | Houznext Infra',
    metaDescription:
      'Featured apartment, villa, venture and plotted developments from verified developers across India.',
    ogImageUrl: INFRA_SEO_OG_DEFAULT,
    hasStructuredData: true,
    noIndex: false,
    keywords: 'RERA projects, new projects, real estate developers',
  },
  {
    path: '/sell',
    label: 'Sell / List property',
    metaTitle: 'List Your Property | Houznext Infra',
    metaDescription:
      'List with Houznext Infra — free listing, EC & title verification, RERA compliance support and zero hidden fees.',
    ogImageUrl: INFRA_SEO_OG_DEFAULT,
    hasStructuredData: false,
    noIndex: false,
    keywords: 'sell property, list property, zero brokerage',
  },
  {
    path: '/about',
    label: 'About',
    metaTitle: 'About Houznext Infra | Verified Real Estate Platform',
    metaDescription:
      "India's trusted property platform for buying and selling land, villas, apartments and plots with verification and insights.",
    ogImageUrl: INFRA_SEO_OG_DEFAULT,
    hasStructuredData: false,
    noIndex: false,
    keywords: 'Houznext Infra, about us, real estate platform',
  },
  {
    path: '/services',
    label: 'Services',
    metaTitle: 'Property Services | Houznext Infra',
    metaDescription:
      'Property insights, valuation, documentation support and management services for buyers and sellers.',
    ogImageUrl: INFRA_SEO_OG_DEFAULT,
    hasStructuredData: false,
    noIndex: false,
    keywords: null,
  },
  {
    path: '/developers',
    label: 'Developers',
    metaTitle: 'Verified Developers | Houznext Infra',
    metaDescription: 'Explore trusted developers and their RERA-registered projects on Houznext Infra.',
    ogImageUrl: INFRA_SEO_OG_DEFAULT,
    hasStructuredData: false,
    noIndex: false,
    keywords: null,
  },
  {
    path: '/news',
    label: 'News',
    metaTitle: 'Real Estate News & Insights | Houznext Infra',
    metaDescription: 'Market updates, locality trends and guides for property buyers and sellers.',
    ogImageUrl: INFRA_SEO_OG_DEFAULT,
    hasStructuredData: false,
    noIndex: false,
    keywords: null,
  },
  {
    path: '/property-insights',
    label: 'Property insights',
    metaTitle: 'Property Insights & Market Data | Houznext Infra',
    metaDescription: 'Locality trends, price history and growth projections to make informed property decisions.',
    ogImageUrl: INFRA_SEO_OG_DEFAULT,
    hasStructuredData: false,
    noIndex: false,
    keywords: null,
  },
  {
    path: '/value-calculator',
    label: 'Value calculator',
    metaTitle: 'Property Value Calculator | Houznext Infra',
    metaDescription: 'Estimate property value with Houznext market data and comparable listings.',
    ogImageUrl: INFRA_SEO_OG_DEFAULT,
    hasStructuredData: false,
    noIndex: false,
    keywords: null,
  },
  {
    path: '/emi-calculator',
    label: 'EMI calculator',
    metaTitle: 'Home Loan EMI Calculator | Houznext Infra',
    metaDescription: 'Calculate monthly EMI for your home loan with adjustable rate and tenure.',
    ogImageUrl: INFRA_SEO_OG_DEFAULT,
    hasStructuredData: false,
    noIndex: false,
    keywords: null,
  },
  {
    path: '/login',
    label: 'Login',
    metaTitle: 'Login | Houznext Infra',
    metaDescription: 'Sign in to save properties and manage your Houznext Infra account.',
    ogImageUrl: null,
    hasStructuredData: false,
    noIndex: true,
    keywords: null,
  },
  {
    path: '/profile',
    label: 'Profile',
    metaTitle: 'My Profile | Houznext Infra',
    metaDescription: 'Your saved and recently viewed properties.',
    ogImageUrl: null,
    hasStructuredData: false,
    noIndex: true,
    keywords: null,
  },
];

export function getInfraDefaultRowForPath(path: string): InfraPageSeoDefaultRow | undefined {
  return INFRA_PAGE_SEO_DEFAULT_ROWS.find((r) => r.path === path);
}
