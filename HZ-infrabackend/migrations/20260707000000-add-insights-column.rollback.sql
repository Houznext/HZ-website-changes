DROP INDEX IF EXISTS idx_infra_property_insights_shown;

ALTER TABLE infra_property
DROP COLUMN IF EXISTS insights;
