-- Rename material BOQ status: not_started → started
UPDATE livebuild_materials
SET status = 'started'
WHERE status IN ('not_started', 'pending');

ALTER TABLE livebuild_materials
  ALTER COLUMN status SET DEFAULT 'started';
