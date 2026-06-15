-- Add default_rooms JSONB to work types (entity field existed without migration).
ALTER TABLE livebuild_work_types
  ADD COLUMN IF NOT EXISTS default_rooms JSONB;
