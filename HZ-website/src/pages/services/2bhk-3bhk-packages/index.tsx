import SeoHead from '@/components/SeoHead'
import ServicePageTemplate from '@/components/ServicePageTemplate'
import {
  fetchServiceBySlug,
  ServiceContent,
} from '@/utils/servicesApi'

const FALLBACK: ServiceContent = {
  id: 3,
  slug: '2bhk-3bhk-packages',
  cardTitle: '2BHK / 3BHK Interior Packages',
  cardDescription: '',
  cardImageUrl: '',
  cardBadge: 'Budget Friendly',
  heroHeadline: 'Interior packages that fit your home and budget',
  heroSubheading:
    'Planning interiors can feel confusing — especially pricing and scope. At Houznext we simplify this with clear packages, so you know exactly what to expect.',
  heroImageUrl: '',
  heroEyebrow: '2BHK / 3BHK Packages',
  heroCta: 'Check your home interior cost',
  sortOrder: 2,
  active: true,
}

export async function getServerSideProps() {
  const service = await fetchServiceBySlug('2bhk-3bhk-packages')
  return { props: { service: service || FALLBACK } }
}

export default function PackagesPage({ service }: { service: ServiceContent }) {
  return (
    <>
      <SeoHead
        title="2BHK & 3BHK Interior Packages in India | Cost & Design – Houznext"
        description="Affordable 2BHK and 3BHK interior packages across India. Get free design, transparent pricing, and turnkey execution."
        canonical="/services/2bhk-3bhk-packages"
      />
      <ServicePageTemplate
        service={service}
        includes={[
          'Modular kitchen',
          'Wardrobes for all bedrooms',
          'TV unit',
          'Storage units',
          'Basic lighting & false ceiling',
          'Electrical finishing',
        ]}
        why={[
          '2BHK packages starting from ₹3 Lakhs',
          '3BHK packages starting from ₹5 Lakhs',
          'No hidden costs',
          'Faster execution timeline',
          'Ideal for new homeowners',
        ]}
        faqs={[
          {
            q: 'What is in the 2BHK interior package?',
            a: 'It includes modular kitchen, wardrobes for both bedrooms, TV unit, false ceiling, lighting, and all electrical finishing.',
          },
          {
            q: 'What is the starting price for a 3BHK interior?',
            a: '3BHK packages at Houznext start from ₹5 Lakhs depending on the package — Essential, Premium, or Luxury.',
          },
          {
            q: 'Can I customise the package?',
            a: 'Yes. While packages are standardised, you can add or remove items and we adjust the price accordingly.',
          },
          {
            q: 'How long does a 2BHK interior take?',
            a: 'A standard 2BHK takes 40–50 days from design approval to handover.',
          },
          {
            q: 'Is pricing the same for all cities?',
            a: 'Pricing may vary slightly by location. Contact us for a city-specific estimate.',
          },
        ]}
      />
    </>
  )
}
