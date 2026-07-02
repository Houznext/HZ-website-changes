import type { GetStaticProps, GetStaticPropsResult } from 'next'
import type { CityLandingContent } from '@/lib/cityLandingCms'
import { getCityCmsKey, mergeCityLandingCms } from '@/lib/cityLandingCms'
import type { CitySlug } from '@/lib/cityLandingRegistry'
import type { InteriorProject } from '@/types/interior-project'
import { fetchWithTimeout, getPublicApiBase } from '@/lib/fetchWithTimeout'

export type CityLandingPageProps = {
  content: CityLandingContent
  citySlug: CitySlug
  landingProjects: InteriorProject[]
}

async function fetchLandingProjects(slug: CitySlug): Promise<InteriorProject[]> {
  const base = getPublicApiBase()
  if (!base) return []
  try {
    const res = await fetchWithTimeout(
      `${base}/interior-projects/public/landing/${slug}?limit=4`,
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
    const base = getPublicApiBase()
    let cms: unknown = {}
    if (base) {
      try {
        const res = await fetchWithTimeout(`${base}/site-cms/${getCityCmsKey(slug)}`)
        if (res.ok) {
          const json = (await res.json()) as { data?: unknown }
          cms = json.data ?? {}
        }
      } catch {
        cms = {}
      }
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
