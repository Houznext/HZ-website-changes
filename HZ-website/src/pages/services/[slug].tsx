import type { GetStaticPaths, GetStaticProps } from 'next'
import SeoHead from '@/components/SeoHead'
import ServicePageTemplate from '@/components/ServicePageTemplate'
import { fetchServiceBySlug, type ServiceContent } from '@/utils/servicesApi'
import {
  getServicePageExtras,
  isServicePageSlug,
  SERVICE_CONTENT_FALLBACK,
  SERVICE_PAGE_SLUGS,
  type ServicePageExtras,
  type ServicePageSlug,
} from '@/lib/servicePageExtras'

type PageProps = {
  service: ServiceContent
  includes: ServicePageExtras['includes']
  why: ServicePageExtras['why']
  faqs: ServicePageExtras['faqs']
  sidebarTitle: string
  sidebarSubtitle: string
}

export default function InteriorServiceLandingPage(props: PageProps) {
  const { service } = props
  const canonical = `/services/${service.slug}`
  const desc =
    (service.heroSubheading && service.heroSubheading.trim()) ||
    service.cardDescription ||
    ''

  return (
    <>
      <SeoHead
        title={service.heroHeadline}
        description={desc}
        canonical={canonical}
      />
      <ServicePageTemplate
        service={service}
        includes={props.includes}
        why={props.why}
        faqs={props.faqs}
        sidebarTitle={props.sidebarTitle}
        sidebarSubtitle={props.sidebarSubtitle}
      />
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: SERVICE_PAGE_SLUGS.map((slug) => ({ params: { slug } })),
  fallback: false,
})

export const getStaticProps: GetStaticProps<PageProps> = async (ctx) => {
  const raw = ctx.params?.slug
  const slugParam = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : ''
  if (!isServicePageSlug(slugParam)) return { notFound: true }

  const slug = slugParam as ServicePageSlug
  const extras = getServicePageExtras(slug)

  let service = await fetchServiceBySlug(slug)
  if (!service) service = SERVICE_CONTENT_FALLBACK[slug]

  const merged: ServiceContent = {
    ...SERVICE_CONTENT_FALLBACK[slug],
    ...service,
    slug: service.slug || slug,
  }

  return {
    props: {
      service: merged,
      includes: extras.includes,
      why: extras.why,
      faqs: extras.faqs,
      sidebarTitle: extras.sidebarTitle,
      sidebarSubtitle: extras.sidebarSubtitle,
    },
    revalidate: 120,
  }
}
