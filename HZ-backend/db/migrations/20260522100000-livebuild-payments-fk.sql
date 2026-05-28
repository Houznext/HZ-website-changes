-- Ensure livebuild_payments.project_id references livebuild_projects (TypeORM sync can leave a stale FK)
ALTER TABLE livebuild_payments DROP CONSTRAINT IF EXISTS "FK_747723aab052177df9e84c97a7b";
ALTER TABLE livebuild_payments DROP CONSTRAINT IF EXISTS livebuild_payments_project_id_fkey;

ALTER TABLE livebuild_payments
  ADD CONSTRAINT livebuild_payments_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES livebuild_projects(id) ON DELETE CASCADE;
