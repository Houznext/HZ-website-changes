# Legacy Houznext website URLs removed

Canonical host: `https://houznext.com`

These paths were removed from the repo (pages, redirects, or internal links). They should return **404** after deploy unless noted.

## Removed redirect-only paths (were in `next.config.js`)

| Path |
|------|
| `/solar`, `/solar/*` |
| `/services/solar` |
| `/legalservices`, `/legalservices/*` |
| `/earthmovers`, `/earthmoors/*`, `/services/earthmovers` |
| `/plumbing`, `/plumbing/*`, `/services/plumbing` |
| `/packersandmovers`, `/packersandmovers/*` |
| `/loans`, `/loans/*`, `/services/loans` |
| `/services/homedecor`, `/services/homedecor/*` |
| `/services/electronics`, `/services/electronics/*` |
| `/services/vastu-consultation` |
| `/services/construction-for-business`, `/services/construction-for-business/*` |
| `/services/invest-in-land`, `/services/invest-in-land/*` |
| `/propshome`, `/propshome/*` |
| `/recentproperties`, `/recentproperties/*` |
| `/emicalculator` |
| `/ga4dashboard`, `/ga4dashboard/*` |
| `/view-analytics` |
| `/post-property`, `/post-property/*` |
| `/company/*` |
| `/blogs`, `/blogs/` (listing; articles use `/blog/{slug}`) |
| `/referandearn` (use `/houznext-rewards`) |
| `/user/axis-control` (use `/user/dashboard`) |
| `/user/referralprogress`, `/user/referralprogress/*` |

## Removed page routes (files deleted)

| Path | Notes |
|------|--------|
| `/blogs/{id}` | Replaced by `/blog/{slug-or-id}` |
| `/careers/apply` | Apply via email on `/careers` or modal |
| `/interiors/Privacy-policy` | Use `/privacy-policy` |

## Removed from houznext.com sitemap

| URL |
|-----|
| `https://infra.houznext.com/` (belongs on Infra site only) |

## Internal links updated (no longer point at legacy paths)

| Old target | New target |
|------------|------------|
| `/blogs/{id}` | `/blog/{slug-or-id}` |
| `/recentproperties` | `https://infra.houznext.com/buy` |
| `/post-property`, `/post-property/details` | `/contact-us` |
| `/solar` (navbar) | `/contact-us` |
| `/careers/apply?id=` | Email apply in careers modal |
| `/company/{slug}?id=` | `/contact-us` |

## Still allowed (not legacy)

- `/blog`, `/blog/{slug}` — CMS blog
- `/livebuild/*` — customer portal
- `/services/{slug}` — interior service landings
- `/interiors`, `/interiors/cost-calculator`
- Auth aliases kept: `/signup`, `/verify-otp`, `/forgot-password` → `/login`; `/packages` → `/pricing`
- LiveBuild migration: `/custom-builder/user/*`, `/user/livebuild/*` → `/livebuild/*`
- `/services` → `/interiors`; `/interiors/kitchen` → `/services/modular-kitchen`; `/commercial-interiors` → `/services/commercial-interiors`

## robots.txt

Legacy marketing disallows (`/painting`, `/gallery`, `/real-estate`, `/properties`, etc.) removed; paths no longer exist as routes.
