export const ADMIN_CITY_LANDING_PAGES = [
  { slug: "vikarabad", label: "Vikarabad", cmsKey: "landing_vikarabad", path: "/interior-designers-in-vikarabad" },
  { slug: "mahabubnagar", label: "Mahabubnagar", cmsKey: "landing_mahabubnagar", path: "/interior-designers-in-mahabubnagar" },
  { slug: "sangareddy", label: "Sangareddy", cmsKey: "landing_sangareddy", path: "/interior-designers-in-sangareddy" },
  { slug: "siddipet", label: "Siddipet", cmsKey: "landing_siddipet", path: "/interior-designers-in-siddipet" },
  { slug: "adilabad", label: "Adilabad", cmsKey: "landing_adilabad", path: "/interior-designers-in-adilabad" },
  { slug: "suryapet", label: "Suryapet", cmsKey: "landing_suryapet", path: "/interior-designers-in-suryapet" },
] as const

export type AdminCitySlug = (typeof ADMIN_CITY_LANDING_PAGES)[number]["slug"]

export function getAdminCityConfig(slug: string) {
  return ADMIN_CITY_LANDING_PAGES.find((c) => c.slug === slug)
}
