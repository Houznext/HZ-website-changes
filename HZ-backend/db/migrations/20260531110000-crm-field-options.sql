CREATE TABLE IF NOT EXISTS crm_field_option (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "fieldType" VARCHAR(40) NOT NULL,
  value VARCHAR(120) NOT NULL,
  label VARCHAR(200) NOT NULL DEFAULT '',
  "sortOrder" INT NOT NULL DEFAULT 0,
  "isBuiltin" BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT uq_crm_field_option_type_value UNIQUE ("fieldType", value)
);

CREATE INDEX IF NOT EXISTS idx_crm_field_option_type_sort
  ON crm_field_option ("fieldType", "sortOrder", value);
