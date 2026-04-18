import SeoHead from '@/components/SeoHead'
import ServicePageTemplate from '@/components/ServicePageTemplate'
import {
  fetchServiceBySlug,
  ServiceContent,
} from '@/utils/servicesApi'

const FALLBACK: ServiceContent = {
  id: 4,
  slug: 'commercial-interiors',
  cardTitle: 'Commercial Interiors',
  cardDescription: '',
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
}

export async function getServerSideProps() {
  const service = await fetchServiceBySlug('commercial-interiors')
  return { props: { service: service || FALLBACK } }
}

export default function CommercialInteriorsPage({
  service,
}: {
  service: ServiceContent
}) {
  return (
    <>
      <SeoHead
        title="Commercial Interior Design in India | Office & Retail Interiors – Houznext"
        description="Professional commercial interior design services across India. Functional layouts, modern designs, and reliable execution."
        canonical="/services/commercial-interiors"
      />
      <ServicePageTemplate
        service={service}
        includes={[
          'Office interiors & workstations',
          'Retail store design',
          'Clinics & commercial spaces',
          'Reception & lobby areas',
          'Conference & meeting rooms',
          'Pantry & common areas',
        ]}
        why={[
          'Functional layout planning',
          'Clean and modern design',
          'Efficient execution',
          'On-time delivery with milestone updates',
        ]}
        faqs={[
          {
            q: 'What types of commercial spaces do you design?',
            a: 'Offices, retail stores, clinics, co-working spaces, showrooms, and other small to mid-size commercial spaces.',
          },
          {
            q: 'Do you handle turnkey commercial projects?',
            a: 'Yes — we manage everything from layout planning and design to execution and handover.',
          },
          {
            q: 'How is commercial pricing calculated?',
            a: 'Typically per square foot based on scope, materials, and finishes. Contact us for a detailed quote.',
          },
          {
            q: 'Can you work around our business hours?',
            a: 'Yes. We plan execution schedules to minimise disruption and can work during off-hours or weekends.',
          },
          {
            q: 'Do commercial projects get LiveBuild tracking?',
            a: 'Yes. All Houznext commercial projects get real-time LiveBuild tracking from day one.',
          },
        ]}
      />
    </>
  )
}
