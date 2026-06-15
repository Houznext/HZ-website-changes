import type { GetStaticProps, GetStaticPropsResult } from 'next'
import type { CityLandingContent } from '@/lib/cityLandingCms'
import { getCityCmsKey, mergeCityLandingCms } from '@/lib/cityLandingCms'
import type { CitySlug } from '@/lib/cityLandingRegistry'
import type { InteriorProject } from '@/types/interior-project'

export type CityLandingPageProps = {
  content: CityLandingContent
  citySlug: CitySlug
  landingProjects: InteriorProject[]
}

function apiBase(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://localhost:4000'
  ).replace(/\/$/, '')
}

async function fetchLandingProjects(slug: CitySlug): Promise<InteriorProject[]> {
  try {
    const res = await fetch(
      `${apiBase()}/interior-projects/public/landing/${slug}?limit=4`,
      { headers: { Accept: 'application/json' } },
    )
    if (!res.ok) return []
    const json: unknown = await res.json()
    return Array.isArray(json) ? (json as InteriorProject[]) : []
  } catch {
    return []
  }
}

export function createCityLandingStaticProps(
  slug: CitySlug,
): GetStaticProps<CityLandingPageProps> {
  return async (): Promise<GetStaticPropsResult<CityLandingPageProps>> => {
    let cms: unknown = {}
    try {
      const res = await fetch(`${apiBase()}/site-cms/${getCityCmsKey(slug)}`)
      if (res.ok) {
        const json = (await res.json()) as { data?: unknown }
        cms = json.data ?? {}
      }
    } catch {
      cms = {}
    }

    const landingProjects = await fetchLandingProjects(slug)

    return {
      props: {
        content: mergeCityLandingCms(slug, cms),
        citySlug: slug,
        landingProjects,
      },
      revalidate: 30,
    }
  }
}
