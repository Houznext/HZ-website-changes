ALTER TABLE crm_field_option
  ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE crm_lead_status_definition
  ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN NOT NULL DEFAULT FALSE;

-- One default per field type (first by sort order if none marked)
UPDATE crm_field_option fo
SET "isDefault" = TRUE
WHERE fo.id IN (
  SELECT DISTINCT ON ("fieldType") id
  FROM crm_field_option
  ORDER BY "fieldType", "sortOrder", value
)
AND NOT EXISTS (
  SELECT 1 FROM crm_field_option fo2
  WHERE fo2."fieldType" = fo."fieldType" AND fo2."isDefault" = TRUE
);

UPDATE crm_lead_status_definition
SET "isDefault" = TRUE
WHERE value = 'New'
  AND NOT EXISTS (
    SELECT 1 FROM crm_lead_status_definition WHERE "isDefault" = TRUE
  );

UPDATE crm_lead_status_definition
SET "isDefault" = TRUE
WHERE id = (
  SELECT id FROM crm_lead_status_definition
  ORDER BY "sortOrder", value
  LIMIT 1
)
AND NOT EXISTS (
  SELECT 1 FROM crm_lead_status_definition WHERE "isDefault" = TRUE
);
