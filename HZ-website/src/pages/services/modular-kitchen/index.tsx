import SeoHead from '@/components/SeoHead'
import ServicePageTemplate from '@/components/ServicePageTemplate'
import {
  fetchServiceBySlug,
  ServiceContent,
} from '@/utils/servicesApi'

const FALLBACK: ServiceContent = {
  id: 2,
  slug: 'modular-kitchen',
  cardTitle: 'Modular Kitchen & Wardrobes',
  cardDescription: '',
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
}

export async function getServerSideProps() {
  const service = await fetchServiceBySlug('modular-kitchen')
  return { props: { service: service || FALLBACK } }
}

export default function ModularKitchenPage({
  service,
}: {
  service: ServiceContent
}) {
  return (
    <>
      <SeoHead
        title="Modular Kitchen & Wardrobe Design in India | Houznext Interiors"
        description="Get modern modular kitchens and wardrobes across India with Houznext. Functional designs, quality materials, and expert execution."
        canonical="/services/modular-kitchen"
      />
      <ServicePageTemplate
        service={service}
        includes={[
          'L-shaped, U-shaped, parallel kitchen layouts',
          'Smart storage solutions',
          'Durable finishes and hardware',
          'Sliding wardrobes',
          'Hinged wardrobes',
          'Custom storage designs',
        ]}
        why={[
          'Space-optimized layouts',
          'High-quality materials',
          'Clean installation process',
          'Designs based on your lifestyle',
        ]}
        faqs={[
          {
            q: 'What kitchen layouts do you offer?',
            a: 'We offer L-shaped, U-shaped, parallel, and straight layouts based on your kitchen dimensions and workflow.',
          },
          {
            q: 'What materials are used?',
            a: 'We use high-quality MDF, BWR-grade plywood, and premium laminates with soft-close hardware from trusted brands.',
          },
          {
            q: 'How long does kitchen installation take?',
            a: 'A standard modular kitchen takes 10–15 working days from design approval to installation.',
          },
          {
            q: 'Can I get a custom wardrobe?',
            a: 'Yes. All wardrobes are custom-designed to fit your exact wall dimensions and storage requirements.',
          },
          {
            q: 'Is there a warranty?',
            a: 'Yes — all modular kitchens and wardrobes come with a 1-year warranty on workmanship and hardware.',
          },
        ]}
      />
    </>
  )
}
