-- Optional display override for Projects CMS "Total projects" stat
CREATE TABLE IF NOT EXISTS interior_projects_settings (
  id                      INT PRIMARY KEY DEFAULT 1,
  display_total_projects  INT,
  updated_at              TIMESTAMP DEFAULT NOW()
);

INSERT INTO interior_projects_settings (id, display_total_projects)
VALUES (1, NULL)
ON CONFLICT (id) DO NOTHING;
