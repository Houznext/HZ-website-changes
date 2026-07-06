-- Add insights JSONB column to infra_property (idempotent for dev re-runs)
ALTER TABLE infra_property
ADD COLUMN IF NOT EXISTS insights JSONB NULL;

CREATE INDEX IF NOT EXISTS idx_infra_property_insights_shown
  ON infra_property ((insights->>'show_insights'))
  WHERE insights IS NOT NULL;
