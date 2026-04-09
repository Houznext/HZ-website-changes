// All JSON-LD structured data schemas for Houznext pages

// ─── OG image reminder (dev only) ─────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  // TODO: Place these 1200×630px images in /public/ before launch.
  // Dark navy (#0f2a44) background, Houznext logo centered, page tagline below.
  // Required: /og-default.jpg  /og-home.jpg  /og-interiors.jpg
  // /og-pricing.jpg  /og-real-estate.jpg  /og-buildlive.jpg
}

// ─── Local Business ───────────────────────────────────────────────────────────
export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Houznext',
  url: 'https://houznext.com',
  logo: 'https://houznext.com/logo.png',
  image: 'https://houznext.com/og-default.jpg',
  description:
    'Fixed-price home interiors, RERA-verified real estate, and live BuildLive construction tracking for homeowners across Telangana.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Hyderabad',
    addressRegion: 'Telangana',
    postalCode: '500001',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 17.385,
    longitude: 78.4867,
  },
  telephone: '+918498823043',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+918498823043',
    contactType: 'customer service',
    availableLanguage: ['English', 'Telugu', 'Hindi'],
    contactOption: 'TollFree',
  },
  priceRange: '₹₹',
  openingHours: 'Mo-Sa 09:00-19:00',
  sameAs: [
    'https://instagram.com/houznext',
    'https://facebook.com/houznext',
    'https://wa.me/918498823043',
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '680',
    bestRating: '5',
    worstRating: '1',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Interior Design Packages',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Essential Interior Package' },
        price: '450000',
        priceCurrency: 'INR',
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Premium Interior Package' },
        price: '750000',
        priceCurrency: 'INR',
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Luxury Interior Package' },
        price: '1300000',
        priceCurrency: 'INR',
      },
    ],
  },
}

// ─── Interior Service ─────────────────────────────────────────────────────────
export const interiorServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Home Interior Design & Execution',
  serviceType: 'Interior Design',
  description:
    'Fixed-price modular kitchen, wardrobes, false ceiling, TV unit, and full home interior packages for 2BHK, 3BHK and villas in Telangana.',
  areaServed: [
    { '@type': 'City', name: 'Hyderabad' },
    { '@type': 'City', name: 'Warangal' },
    { '@type': 'City', name: 'Karimnagar' },
    { '@type': 'City', name: 'Nizamabad' },
    { '@type': 'City', name: 'Khammam' },
  ],
  provider: {
    '@type': 'LocalBusiness',
    name: 'Houznext',
    url: 'https://houznext.com',
  },
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'INR',
    lowPrice: '450000',
    highPrice: '4000000',
    offerCount: '3',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Interior Packages',
    itemListElement: [
      { '@type': 'Offer', name: 'Essential', price: '450000', priceCurrency: 'INR' },
      { '@type': 'Offer', name: 'Premium',   price: '750000', priceCurrency: 'INR' },
      { '@type': 'Offer', name: 'Luxury',    price: '1300000', priceCurrency: 'INR' },
    ],
  },
}

// ─── Pricing FAQ ──────────────────────────────────────────────────────────────
export const pricingFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the cost of 2BHK interiors in Hyderabad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Houznext 2BHK interior packages start from ₹4.5 lakhs (Essential) and go up to ₹18 lakhs (Luxury) — all fixed price, including materials, labour, and project management.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does a 2BHK interior take to complete?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most 2BHK interior projects are completed within 42–48 working days. Houznext guarantees the delivery timeline with live tracking through BuildLive.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Houznext charge anything extra after the quote?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Houznext guarantees fixed pricing — the quote you receive before the project starts is exactly what you pay at completion. No hidden charges, no escalations.',
      },
    },
    {
      '@type': 'Question',
      name: 'What areas does Houznext serve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Houznext currently serves Hyderabad, Warangal, Karimnagar, Nizamabad, Khammam and 7 more cities across Telangana. Expansion to Andhra Pradesh is planned for 2025.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is BuildLive?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "BuildLive is Houznext's proprietary project tracking system. It gives homeowners daily room-by-room photo updates, design approval workflows, milestone-based payment releases, and snag management — all accessible from a mobile phone.",
      },
    },
  ],
}

// ─── Real Estate Agent ────────────────────────────────────────────────────────
export const realEstateAgentSchema = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'Houznext Real Estate',
  url: 'https://houznext.com/real-estate',
  telephone: '+918498823043',
  description:
    'RERA-verified plots, flats and villas in Hyderabad, Warangal, Karimnagar and across Telangana. Free legal due diligence and bank loan assistance.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Hyderabad',
    addressRegion: 'Telangana',
    addressCountry: 'IN',
  },
  areaServed: {
    '@type': 'State',
    name: 'Telangana',
  },
}

// Keep old name as alias for backward compat
export { realEstateAgentSchema as realEstateSchema }

// ─── BuildLive ────────────────────────────────────────────────────────────────
export const buildliveSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'BuildLive by Houznext',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, iOS, Android',
  description:
    'Real-time interior project tracking. Daily room updates, design approvals, milestone payments, and snag management for homeowners.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
    description: 'Included with all Houznext interior packages',
  },
  provider: {
    '@type': 'Organization',
    name: 'Houznext',
    url: 'https://houznext.com',
  },
}

// ─── Article (factory function) ───────────────────────────────────────────────
export const articleSchema = (post: {
  title: string
  description: string
  slug: string
  datePublished: string
  dateModified?: string
  imageUrl?: string
  /** Canonical path without leading slash, e.g. `blogs/42` for CMS posts */
  urlPath?: string
}) => {
  const path = post.urlPath ?? `blog/${post.slug}`
  const base = `https://houznext.com/${path}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    url: base,
    image: post.imageUrl ?? 'https://houznext.com/og-default.jpg',
    datePublished: post.datePublished,
    dateModified: post.dateModified ?? post.datePublished,
    author: {
      '@type': 'Organization',
      name: 'Houznext',
      url: 'https://houznext.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Houznext',
      logo: {
        '@type': 'ImageObject',
        url: 'https://houznext.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': base,
    },
  }
}
