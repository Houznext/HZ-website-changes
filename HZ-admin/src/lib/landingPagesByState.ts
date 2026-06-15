import { ADMIN_CITY_LANDING_PAGES } from "./cityLandingRegistry";

export type LandingPageCity = {
  slug: string;
  label: string;
};

export type LandingPagesStateGroup = {
  state: string;
  cities: LandingPageCity[];
};

/** City landing pages grouped by state for Projects CMS checkboxes. */
export const LANDING_PAGES_BY_STATE: LandingPagesStateGroup[] = [
  {
    state: "Telangana",
    cities: ADMIN_CITY_LANDING_PAGES.map((city) => ({
      slug: city.slug,
      label: city.label,
    })),
  },
];
