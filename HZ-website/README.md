#TODO List:

## Refactoring
- [ ] Make furniture, home decors, electronics use the same dynamic route for the store rather than individual routes.

## Critical fixes
- [ ] Fix auth. Currently session is accepting the entire user object but session should only have id, name, email, roles.

## Design issues
- [ ] Items in home decors page is taking Filter's div height and leaving some space between rows.
- [ ] Add breadcrumb component for home decors page.
- [ ] Integrate maps and capture latitude and longitude from property location details page

## Closed tasks
- [X] Add icons in user property view page. (Sharath)
- [X] Update interior calculator design. (Sharath)

## Sitemap generation
- Canonical sitemap generation uses `scripts/generate-sitemaps.mjs`.
- Run:
  - `npm run sitemap:generate`
  - `npm run sitemap:verify`
- Build pipeline runs both automatically via `postbuild`.
- Legacy URLs are blocked in generation and verification:
  - `/careers/apply`
  - `/interiors/privacy-policy` (case-insensitive)