/** Seed + public fallback when DB row is missing for a path. */
export type PageSeoDefaultRow = {
  path: string;
  label: string;
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string | null;
  hasStructuredData: boolean;
};

/** Default Open Graph image when a page has no unique asset. */
export const PAGE_SEO_OG_DEFAULT = 'https://houznext.com/og-default.jpg';

/**
 * All static marketing / app routes we manage in SEO Settings (HZ-website).
 * Order: main site → store → account → legal → auth.
 */
export const PAGE_SEO_DEFAULT_ROWS: PageSeoDefaultRow[] = [
  {
    path: '/',
    label: 'Homepage (/)',
    metaTitle: 'Home Interiors in Hyderabad | Houznext',
    metaDescription:
      'Interior design for 2BHK, 3BHK and villas across Telangana. 45–60 day delivery, LiveBuild live tracking, 1-year warranty. Packages from ₹4.5L. 15+ homes delivered.',
    ogImageUrl: 'https://houznext.com/og-home.jpg',
    hasStructuredData: true,
  },
  {
    path: '/interiors',
    label: 'Interiors',
    metaTitle: 'Home Interiors Hyderabad | Fixed-Price Packages | Houznext',
    metaDescription:
      'Modular kitchen, wardrobes, false ceiling, TV unit — fixed-price interior packages from ₹4.5L for 2BHK. 45-day delivery in Hyderabad, Warangal, Karimnagar. Free 3D design.',
    ogImageUrl: PAGE_SEO_OG_DEFAULT,
    hasStructuredData: true,
  },
  {
    path: '/pricing',
    label: 'Pricing',
    metaTitle: 'Interior Design Cost in Hyderabad 2025 | Houznext Pricing',
    metaDescription:
      'Houznext interior packages: Essential from ₹4.5L, Premium from ₹7.5L, Luxury from ₹13L for 2BHK. All-inclusive fixed price — materials, labour, and 1-year warranty included.',
    ogImageUrl: PAGE_SEO_OG_DEFAULT,
    hasStructuredData: true,
  },
  {
    path: '/design-ideas',
    label: 'Design ideas',
    metaTitle: 'Interior Design Ideas & Inspiration | Houznext',
    metaDescription:
      'Browse modern interior design ideas for living rooms, bedrooms, kitchens and more. Save designs and request a free estimate from Houznext.',
    ogImageUrl: PAGE_SEO_OG_DEFAULT,
    hasStructuredData: false,
  },
  {
    path: '/blog',
    label: 'Blog',
    metaTitle: 'Home Design Blog | Interiors, Construction & Home Design | Houznext',
    metaDescription:
      'Expert guides on modular kitchens, interior costs, RERA compliance, and home design for Indian homeowners in Telangana. Tips from 500+ delivered projects.',
    ogImageUrl: PAGE_SEO_OG_DEFAULT,
    hasStructuredData: false,
  },
  {
    path: '/contact-us',
    label: 'Contact us',
    metaTitle: 'Contact Houznext | Free Interior Design Consultation | Hyderabad',
    metaDescription:
      'Get in touch with Houznext for fixed-price home interiors, design ideas, the Houznext Store, and BuildLive project tracking in Hyderabad, Telangana. Free consultation, same-day callback.',
    ogImageUrl: PAGE_SEO_OG_DEFAULT,
    hasStructuredData: false,
  },
  {
    path: '/about-us',
    label: 'About us',
    metaTitle: 'About Houznext | Interior Design Company in Hyderabad & Telangana',
    metaDescription:
      "Houznext is Telangana's leading fixed-price home interior design company. 500+ homes delivered with 45-day delivery guarantee, real-time LiveBuild tracking and 10-year warranty. Meet our team.",
    ogImageUrl: PAGE_SEO_OG_DEFAULT,
    hasStructuredData: false,
  },
  {
    path: '/buildlive',
    label: 'LiveBuild',
    metaTitle: 'LiveBuild — Track Your Interior Live Daily | Houznext',
    metaDescription:
      "Room-by-room live photo updates, design approvals, milestone payments and snag management. Know exactly what's happening at your site every day — from your phone.",
    ogImageUrl: PAGE_SEO_OG_DEFAULT,
    hasStructuredData: true,
  },
  {
    path: '/careers',
    label: 'Careers',
    metaTitle: 'Careers at Houznext | Interior Design & BuildLive Jobs in Hyderabad',
    metaDescription:
      "Join Houznext — Hyderabad's fastest-growing home interiors company. Open roles in interior design, project management, operations, and more. Apply now.",
    ogImageUrl: PAGE_SEO_OG_DEFAULT,
    hasStructuredData: false,
  },
  {
    path: '/projects',
    label: 'Projects',
    metaTitle: 'Our Projects | Real Home Transformations | Houznext Hyderabad',
    metaDescription:
      'Browse completed home interior projects by Houznext across Telangana. 2BHK, 3BHK and villas — fixed price, on-time delivery.',
    ogImageUrl: 'https://houznext.com/og-projects.jpg',
    hasStructuredData: false,
  },
  {
    path: '/terms-and-condition',
    label: 'Terms & conditions',
    metaTitle: 'Terms & Conditions | Houznext',
    metaDescription: 'Terms of use for Houznext website and services.',
    ogImageUrl: PAGE_SEO_OG_DEFAULT,
    hasStructuredData: false,
  },
  {
    path: '/privacy-policy',
    label: 'Privacy policy',
    metaTitle: 'Privacy Policy | Houznext',
    metaDescription: 'How Houznext collects, uses and protects your personal data.',
    ogImageUrl: PAGE_SEO_OG_DEFAULT,
    hasStructuredData: false,
  },
  {
    path: '/login',
    label: 'Login',
    metaTitle: 'Login | My Home Portal | Houznext',
    metaDescription:
      'Login to your Houznext portal. Track your interior project live, approve designs, view payments, and manage snags from your phone.',
    ogImageUrl: PAGE_SEO_OG_DEFAULT,
    hasStructuredData: false,
  },
  {
    path: '/saved-designs',
    label: 'Saved designs',
    metaTitle: 'Saved designs | Houznext',
    metaDescription: 'Your saved interior design ideas from the Houznext gallery.',
    ogImageUrl: PAGE_SEO_OG_DEFAULT,
    hasStructuredData: false,
  },
  {
    path: '/interiors/cost-calculator',
    label: 'Interior cost calculator',
    metaTitle: 'Interior Cost Calculator | Houznext',
    metaDescription:
      'Estimate your home interior cost in minutes with Houznext’s calculator.',
    ogImageUrl: PAGE_SEO_OG_DEFAULT,
    hasStructuredData: false,
  },
  {
    path: '/store',
    label: 'Store',
    metaTitle: 'Houznext Store | Furniture, Decor & Interiors Shopping',
    metaDescription:
      'Shop Houznext Store for sofas, beds, dining tables, wardrobes, TV units and custom furniture. Premium designs, secure checkout, and curated picks for your home.',
    ogImageUrl: PAGE_SEO_OG_DEFAULT,
    hasStructuredData: false,
  },
  {
    path: '/store/cart',
    label: 'Store — Cart',
    metaTitle: 'Cart | Houznext Store',
    metaDescription:
      'Review items in your Houznext Store cart, apply coupons, and proceed to secure checkout.',
    ogImageUrl: PAGE_SEO_OG_DEFAULT,
    hasStructuredData: false,
  },
  {
    path: '/store/checkout',
    label: 'Store — Checkout',
    metaTitle: 'Checkout | Houznext Store',
    metaDescription:
      'Complete your Houznext Store purchase with secure payment and delivery details.',
    ogImageUrl: PAGE_SEO_OG_DEFAULT,
    hasStructuredData: false,
  },
  {
    path: '/my-account',
    label: 'My account',
    metaTitle: 'My Account | Houznext',
    metaDescription:
      'Manage your quotations, invoices, saved designs and LiveBuild project.',
    ogImageUrl: PAGE_SEO_OG_DEFAULT,
    hasStructuredData: false,
  },
  {
    path: '/my-account/quotations',
    label: 'My account — Quotations',
    metaTitle: 'My Quotations | Houznext',
    metaDescription: 'Track your interior quotations.',
    ogImageUrl: PAGE_SEO_OG_DEFAULT,
    hasStructuredData: false,
  },
  {
    path: '/my-account/invoices',
    label: 'My account — Invoices',
    metaTitle: 'Invoices | Houznext',
    metaDescription: 'View your invoices.',
    ogImageUrl: PAGE_SEO_OG_DEFAULT,
    hasStructuredData: false,
  },
  {
    path: '/my-account/livebuild',
    label: 'My account — LiveBuild',
    metaTitle: 'My Home — LiveBuild | Houznext',
    metaDescription: 'Track your interior projects.',
    ogImageUrl: PAGE_SEO_OG_DEFAULT,
    hasStructuredData: false,
  },
  {
    path: '/my-account/saved-designs',
    label: 'My account — Saved designs',
    metaTitle: 'Saved Designs | Houznext',
    metaDescription: 'Your saved design ideas.',
    ogImageUrl: PAGE_SEO_OG_DEFAULT,
    hasStructuredData: false,
  },
];

export function getDefaultRowForPath(path: string): PageSeoDefaultRow | undefined {
  const p = path === '' ? '/' : path.startsWith('/') ? path : `/${path}`;
  return PAGE_SEO_DEFAULT_ROWS.find((r) => r.path === p);
}
