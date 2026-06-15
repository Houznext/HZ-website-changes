-- Landing page visibility for interior projects (city landing pages)
ALTER TABLE interior_projects
  ADD COLUMN IF NOT EXISTS show_on_landing_page BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE interior_projects
  ADD COLUMN IF NOT EXISTS landing_page_cities TEXT;
