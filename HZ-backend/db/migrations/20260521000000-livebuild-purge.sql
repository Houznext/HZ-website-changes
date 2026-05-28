-- Purge ALL LiveBuild data and legacy Custom Builder tables.
-- MANUAL ONLY: set LIVEBUILD_PURGE_ON_START=true once, then restart the API. Not run on normal startup.
-- Safe to re-run: uses IF EXISTS.

DROP TRIGGER IF EXISTS trg_room_pct_change ON livebuild_rooms;
DROP FUNCTION IF EXISTS update_project_pct();

DROP TABLE IF EXISTS livebuild_dpr_photos CASCADE;
DROP TABLE IF EXISTS livebuild_dpr CASCADE;
DROP TABLE IF EXISTS livebuild_room_work_types CASCADE;
DROP TABLE IF EXISTS livebuild_rooms CASCADE;
DROP TABLE IF EXISTS livebuild_materials CASCADE;
DROP TABLE IF EXISTS livebuild_documents CASCADE;
DROP TABLE IF EXISTS livebuild_queries CASCADE;
DROP TABLE IF EXISTS livebuild_payments CASCADE;
DROP TABLE IF EXISTS livebuild_property_info CASCADE;
DROP TABLE IF EXISTS livebuild_otps CASCADE;
DROP TABLE IF EXISTS livebuild_work_types CASCADE;
DROP TABLE IF EXISTS livebuild_projects CASCADE;
DROP TABLE IF EXISTS livebuild_customers CASCADE;
DROP SEQUENCE IF EXISTS livebuild_project_code_seq;

-- Legacy TypeORM entities (custom-builder module)
DROP TABLE IF EXISTS daily_progress_photos CASCADE;
DROP TABLE IF EXISTS daily_progress CASCADE;
DROP TABLE IF EXISTS cb_query CASCADE;
DROP TABLE IF EXISTS payment_tracking CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS phase CASCADE;
DROP TABLE IF EXISTS cb_document CASCADE;
DROP TABLE IF EXISTS package CASCADE;
DROP TABLE IF EXISTS cb_service CASCADE;
DROP TABLE IF EXISTS interior_info CASCADE;
DROP TABLE IF EXISTS house_construction CASCADE;
DROP TABLE IF EXISTS commercial_construction CASCADE;
DROP TABLE IF EXISTS cb_property CASCADE;
DROP TABLE IF EXISTS flooring CASCADE;
DROP TABLE IF EXISTS painting CASCADE;
DROP TABLE IF EXISTS plumbing CASCADE;
DROP TABLE IF EXISTS electricity CASCADE;
DROP TABLE IF EXISTS fall_ceiling CASCADE;
DROP TABLE IF EXISTS brick_masonry CASCADE;
DROP TABLE IF EXISTS centring CASCADE;
DROP TABLE IF EXISTS document_drafting CASCADE;
DROP TABLE IF EXISTS borewell CASCADE;
DROP TABLE IF EXISTS interior CASCADE;
DROP TABLE IF EXISTS floor CASCADE;
DROP TABLE IF EXISTS custom_builder CASCADE;
