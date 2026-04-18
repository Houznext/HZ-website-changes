import SeoHead from '@/components/SeoHead'
import ServicePageTemplate from '@/components/ServicePageTemplate'
import {
  fetchServiceBySlug,
  ServiceContent,
} from '@/utils/servicesApi'

const FALLBACK: ServiceContent = {
  id: 1,
  slug: 'full-home-interiors',
  cardTitle: 'Full Home Interiors',
  cardDescription: '',
  cardImageUrl: '',
  cardBadge: 'Most Popular',
  heroHeadline:
    'Complete home interiors, designed and executed the right way',
  heroSubheading:
    "Designing a home is not just about how it looks — it's about how it works for your everyday life. At Houznext, we handle everything from design to execution across India.",
  heroImageUrl: '',
  heroEyebrow: 'Full Home Interiors',
  heroCta: 'Get Free Design & Estimate',
  sortOrder: 0,
  active: true,
}

export async function getServerSideProps() {
  const service = await fetchServiceBySlug('full-home-interiors')
  return { props: { service: service || FALLBACK } }
}

export default function FullHomeInteriorsPage({
  service,
}: {
  service: ServiceContent
}) {
  return (
    <>
      <SeoHead
        title="Full Home Interiors in India | Turnkey Interior Design – Houznext"
        description="Looking for full home interiors in India? Houznext offers turnkey interior design with transparent pricing, real-time updates, and quality execution."
        canonical="/services/full-home-interiors"
      />
      <ServicePageTemplate
        service={service}
        includes={[
          'Living room design & TV unit',
          'Bedroom interiors & wardrobes',
          'Modular kitchen',
          'Storage solutions',
          'False ceiling & lighting',
          'Electrical & finishing work',
        ]}
        why={[
          'Turnkey execution — design to handover',
          'Real-time updates with LiveBuild',
          'Transparent pricing',
          'Quality checks at every stage',
          'On-time delivery',
        ]}
        faqs={[
          {
            q: 'What does full home interior include?',
            a: 'It covers living room, kitchen, all bedrooms, wardrobes, false ceiling, lighting, electrical work, and finishing — managed end-to-end by us.',
          },
          {
            q: 'How long does a full home interior take?',
            a: 'Typically 45–60 days for a 2BHK or 3BHK depending on the scope and package selected.',
          },
          {
            q: 'Is the pricing fixed or can it change?',
            a: 'All our packages are fixed price. The amount quoted at the start is exactly what you pay at the end — guaranteed.',
          },
          {
            q: 'Do you work outside Hyderabad?',
            a: 'Yes. We offer full home interiors across major cities in Telangana and are expanding across India.',
          },
          {
            q: 'What is LiveBuild tracking?',
            a: 'LiveBuild is our proprietary system where you can see daily photo updates, approve designs, and track milestone payments from your phone.',
          },
        ]}
      />
    </>
  )
}
