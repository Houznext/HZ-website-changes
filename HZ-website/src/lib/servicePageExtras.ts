import type { ServiceContent } from '@/utils/servicesApi'

export const SERVICE_PAGE_SLUGS = [
  'full-home-interiors',
  'modular-kitchen',
  '2bhk-3bhk-packages',
  'commercial-interiors',
] as const

export type ServicePageSlug = (typeof SERVICE_PAGE_SLUGS)[number]

export interface ServicePageExtras {
  includes: string[]
  why: string[]
  faqs: { q: string; a: string }[]
  sidebarTitle: string
  sidebarSubtitle: string
}

/** Used when CMS/API is unreachable at build time */
export const SERVICE_CONTENT_FALLBACK: Record<ServicePageSlug, ServiceContent> = {
  'full-home-interiors': {
    id: 1,
    slug: 'full-home-interiors',
    cardTitle: 'Full Home Interiors',
    cardDescription:
      'Complete turnkey interior solutions — from design to handover. Every room, every detail, managed by us.',
    cardImageUrl: '',
    cardBadge: 'Most Popular',
    heroHeadline: 'Complete home interiors, designed and executed the right way',
    heroSubheading:
      "Designing a home is not just about how it looks — it's about how it works for your everyday life. At Houznext, we handle everything from design to execution across India.",
    heroImageUrl: '',
    heroEyebrow: 'Full Home Interiors',
    heroCta: 'Get Free Design & Estimate',
    sortOrder: 0,
    active: true,
  },
  'modular-kitchen': {
    id: 2,
    slug: 'modular-kitchen',
    cardTitle: 'Modular Kitchen & Wardrobes',
    cardDescription:
      'Smart, space-efficient kitchens and storage solutions designed for everyday living and lasting quality.',
    cardImageUrl: '',
    cardBadge: 'Storage Solutions',
    heroHeadline: 'Smart kitchens and storage designed for everyday living',
    heroSubheading:
      'A well-designed kitchen and wardrobe can completely change how your home feels and functions. We offer modular solutions that are practical, space-efficient, and built for daily use.',
    heroImageUrl: '',
    heroEyebrow: 'Modular Kitchen & Wardrobes',
    heroCta: 'Talk to our design team',
    sortOrder: 1,
    active: true,
  },
  '2bhk-3bhk-packages': {
    id: 3,
    slug: '2bhk-3bhk-packages',
    cardTitle: '2BHK / 3BHK Interior Packages',
    cardDescription:
      'Clear, fixed-price packages for your home. Know exactly what you get and what you pay — before work begins.',
    cardImageUrl: '',
    cardBadge: 'Budget Friendly',
    heroHeadline: 'Interior packages that fit your home and budget',
    heroSubheading:
      'Planning interiors can feel confusing — especially pricing and scope. At Houznext we simplify this with clear packages, so you know exactly what to expect for your 2BHK or 3BHK.',
    heroImageUrl: '',
    heroEyebrow: '2BHK / 3BHK Packages',
    heroCta: 'Check your home interior cost',
    sortOrder: 2,
    active: true,
  },
  'commercial-interiors': {
    id: 4,
    slug: 'commercial-interiors',
    cardTitle: 'Commercial Interiors',
    cardDescription:
      'Functional, modern office and retail spaces designed to match your business goals and team culture.',
    cardImageUrl: '',
    cardBadge: 'Commercial',
    heroHeadline: 'Interiors designed to work for your business',
    heroSubheading:
      'Commercial spaces need to be functional, efficient, and aligned with your business goals. Houznext provides commercial interior design services that are practical, modern, and comfortable.',
    heroImageUrl: '',
    heroEyebrow: 'Commercial Interiors',
    heroCta: 'Plan your commercial space',
    sortOrder: 3,
    active: true,
  },
}

const EXTRAS: Record<ServicePageSlug, ServicePageExtras> = {
  'full-home-interiors': {
    sidebarTitle: 'Ready to design your home?',
    sidebarSubtitle: 'Free consultation, no commitment.',
    includes: [
      'Living room design & TV unit',
      'Modular kitchen & appliances planning',
      'Wardrobes for all bedrooms',
      'False ceiling, lighting layouts & mood boards',
      '3D visuals before execution',
      'End-to-end project management with LiveBuild updates',
    ],
    why: [
      'Fixed pricing — quote matches final invoice scope',
      '45-day average delivery commitment on packages',
      'Dedicated designer + execution lead',
      'Transparency at every milestone',
    ],
    faqs: [
      {
        q: 'Do you handle civil work and turnkey delivery?',
        a: 'Yes. Full home interiors include coordination across civil, modular, finishes, and handover.',
      },
      {
        q: 'Can I start with design only?',
        a: 'We can begin with consultation and detailed design; execution can follow once you approve scope and pricing.',
      },
      {
        q: 'Which cities do you serve?',
        a: 'We actively deliver across Hyderabad, Warangal, Karimnagar and expand selectively — confirm your pincode with our team.',
      },
    ],
  },
  'modular-kitchen': {
    sidebarTitle: 'Design your dream kitchen?',
    sidebarSubtitle: 'Free consultation with our modular experts.',
    includes: [
      'L-shaped, U-shaped & parallel layouts',
      'Cabinet internals, organisers & loft storage',
      'Countertop, backsplash & hardware selection',
      'Wardrobe internals for bedrooms where needed',
      'Site measurement & modular installation support',
      'Moisture-resistant materials for Indian kitchens',
    ],
    why: [
      'Space-maximising layouts tailored to workflow',
      'Durable finishes for daily cooking & cleaning',
      'Clear upgrade paths for gadgets & storage add-ons',
      'Install timelines aligned with your overall interior plan',
    ],
    faqs: [
      {
        q: 'Do you only do kitchens?',
        a: 'We specialise in kitchens and wardrobes; these often pair with a broader home interior scope.',
      },
      {
        q: 'Are appliances included?',
        a: 'Appliance packages vary by quotation; we integrate hob, chimney, microwave niches etc. based on what you choose.',
      },
      {
        q: 'How long does installation take?',
        a: 'Typical modular kitchen installs are phased with your civil timeline — your PM shares exact schedules in LiveBuild.',
      },
    ],
  },
  '2bhk-3bhk-packages': {
    sidebarTitle: 'Know your interior cost',
    sidebarSubtitle: 'Get an instant estimate for your 2BHK or 3BHK.',
    includes: [
      'Modular kitchen',
      'Wardrobes for all bedrooms',
      'TV unit',
      'Storage units',
      'Basic lighting & false ceiling (per package tier)',
      'LiveBuild milestone tracking where applicable',
    ],
    why: [
      'Package boundaries are documented before work begins',
      'Transparent upgrades — you choose adds before site start',
      'Ideal for homeowners who want speed and pricing clarity',
    ],
    faqs: [
      {
        q: 'Are packages fixed price?',
        a: 'Each package outlines inclusions clearly; bespoke changes are quoted separately before execution.',
      },
      {
        q: 'Difference between Essential, Premium, Luxury?',
        a: 'Finishes, storage depth, feature walls, automation & warranty tiers scale by package — compare on our pricing section.',
      },
      {
        q: 'Do packages include appliances?',
        a: 'Select appliances may be bundles; verify with your designer on the quotation.',
      },
    ],
  },
  'commercial-interiors': {
    sidebarTitle: 'Plan your workspace',
    sidebarSubtitle: 'Tell us footprint, city & timeline — we’ll respond within one business day.',
    includes: [
      'Concept layouts for office / retail footprints',
      'Workstations, breakout zones & meeting rooms',
      'Branding-aligned palette, graphics & signage coordination',
      'Lighting & acoustics-aware planning',
      'Loose furniture & workstation procurement support',
      'Phased rollout to minimise downtime',
    ],
    why: [
      'Operational-first planning — workflows before aesthetics',
      'Scalable layouts for hiring & team churn',
      'Vendor coordination suited to commercial timelines',
    ],
    faqs: [
      {
        q: 'Do you take small office projects?',
        a: 'We evaluate by city and timeline; enquire with floor area and commencement date.',
      },
      {
        q: 'Is compliance (fire, ADA-like access) handled?',
        a: 'We coordinate with certified consultants where statutory inputs are needed.',
      },
      {
        q: 'Retail vs corporate — difference?',
        a: 'Retail focuses on traffic flow & display; offices focus on collaboration & ergonomics — we tune deliverables accordingly.',
      },
    ],
  },
}

export function isServicePageSlug(s: string): s is ServicePageSlug {
  return (SERVICE_PAGE_SLUGS as readonly string[]).includes(s)
}

export function getServicePageExtras(slug: ServicePageSlug): ServicePageExtras {
  return EXTRAS[slug]
}
