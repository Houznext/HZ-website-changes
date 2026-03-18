export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Houznext',
  url: 'https://houznext.com',
  logo: 'https://houznext.com/logo.png',
  description:
    'Fixed-price home interiors, real estate, and live construction tracking for semi-urban India.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '',
    addressLocality: 'Hyderabad',
    addressRegion: 'Telangana',
    postalCode: '500001',
    addressCountry: 'IN',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 17.385, longitude: 78.4867 },
  telephone: '+91-XXXXXXXXXX',
  priceRange: '₹₹',
  openingHours: 'Mo-Sa 09:00-19:00',
  sameAs: ['https://instagram.com/houznext'],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '680',
    bestRating: '5',
  },
}

export const interiorServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Home Interior Design',
  serviceType: 'Interior Design & Execution',
  areaServed: { '@type': 'State', name: 'Telangana' },
  provider: { '@type': 'LocalBusiness', name: 'Houznext' },
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'INR',
    lowPrice: '450000',
    highPrice: '4000000',
    offerCount: '3',
  },
}

export const realEstateAgentSchema = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'Houznext Real Estate',
  url: 'https://houznext.com/real-estate',
  areaServed: { '@type': 'State', name: 'Telangana' },
  description:
    'RERA-verified plots, flats and villas in Hyderabad, Warangal, Karimnagar.',
}

export const pricingFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the cost of 2BHK interiors in Hyderabad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Houznext 2BHK interior packages start from ₹4.5 lakhs (Essential) and go up to ₹18 lakhs (Luxury) — fixed price, all-inclusive.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does a 2BHK interior take to complete?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most 2BHK interior projects are completed within 42–48 working days with Houznext\'s BuildLive daily tracking.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Houznext charge anything extra after the quote?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Houznext guarantees fixed pricing — what is quoted before project start is exactly what you pay at the end.',
      },
    },
  ],
}

export const articleSchema = (post: {
  title: string
  datePublished: string
  dateModified: string
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.title,
  datePublished: post.datePublished,
  dateModified: post.dateModified,
  author: { '@type': 'Organization', name: 'Houznext' },
  publisher: {
    '@type': 'Organization',
    name: 'Houznext',
    logo: { '@type': 'ImageObject', url: 'https://houznext.com/logo.png' },
  },
})
