export const CITY_LINKS = [
  { slug: 'vikarabad', label: 'Vikarabad', href: '/interior-designers-in-vikarabad' },
  { slug: 'mahabubnagar', label: 'Mahabubnagar', href: '/interior-designers-in-mahabubnagar' },
  { slug: 'sangareddy', label: 'Sangareddy', href: '/interior-designers-in-sangareddy' },
  { slug: 'siddipet', label: 'Siddipet', href: '/interior-designers-in-siddipet' },
  { slug: 'adilabad', label: 'Adilabad', href: '/interior-designers-in-adilabad' },
  { slug: 'suryapet', label: 'Suryapet', href: '/interior-designers-in-suryapet' },
] as const

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Design Ideas', href: '/design-ideas' },
  { label: 'LiveBuild', href: '/buildlive' },
  { label: 'About', href: '/about-us' },
]

export const MOB_NAV_LINKS = [...NAV_LINKS, { label: 'Contact', href: '/contact-us' }]

export const HERO_TRUST = [
  '45-day delivery',
  'Fixed-price quote',
  '10-year warranty',
  '4.8★ rating',
]

export const STATS = [
  { n: '15+', l: 'Homes Delivered', s: 'Across Telangana' },
  { n: '4.8★', l: 'Average Rating', s: '680+ verified reviews' },
  { n: '45d', l: 'Avg. Delivery', s: 'Fastest in market' },
  { n: '100%', l: 'Fixed-Price', s: 'Zero surprises' },
]

export const PROPERTY_TYPES = ['2BHK', '3BHK', 'Villa / 4BHK+', 'Independent home']

export const SERVICE_ICON_META = [
  { iconBg: '#e8f1fd', iconColor: '#2f80ed', icon: 'home' },
  { iconBg: '#fef3c7', iconColor: '#d97706', icon: 'grid' },
  { iconBg: '#dcfce7', iconColor: '#16a34a', icon: 'wardrobe' },
  { iconBg: '#f3e8ff', iconColor: '#7c3aed', icon: 'ceiling' },
  { iconBg: '#fce7f3', iconColor: '#be185d', icon: 'tv' },
  { iconBg: '#ccfbf1', iconColor: '#0d9488', icon: 'paint' },
]

export const WHY_US_ICONS = [
  { icon: 'info' },
  { icon: 'check' },
  { icon: 'clock' },
  { icon: 'card' },
  { icon: 'chat' },
  { icon: 'shield' },
]
