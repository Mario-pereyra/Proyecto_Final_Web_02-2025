-- Migration: Drop and recreate project_images with BIGSERIAL id
-- Date: 2025-11-28
-- This migration drops the existing table (after backing up) and recreates it with id BIGSERIAL.

BEGIN;

-- Backup
DROP TABLE IF EXISTS project_images_backup_pre_drop;
CREATE TABLE project_images_backup_pre_drop AS TABLE project_images;

-- Create new table
DROP TABLE IF EXISTS project_images_new;
CREATE TABLE project_images_new (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position SMALLINT NOT NULL CHECK (position BETWEEN 1 AND 10),
  is_cover BOOLEAN NOT NULL DEFAULT FALSE,
  alt_text VARCHAR(140),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, position)
);
CREATE UNIQUE INDEX ux_proj_images_cover_new ON project_images_new(project_id) WHERE is_cover = TRUE;

-- Copy data preserving numeric ids
INSERT INTO project_images_new (id, project_id, url, position, is_cover, alt_text, created_at)
SELECT id, project_id, url, position, is_cover, alt_text, created_at FROM project_images;

-- Swap tables
DROP TABLE IF EXISTS project_images CASCADE;
ALTER TABLE project_images_new RENAME TO project_images;
ALTER INDEX IF EXISTS ux_proj_images_cover_new RENAME TO ux_proj_images_cover;

-- Fix sequence name and ownership
ALTER SEQUENCE IF EXISTS project_images_new_id_seq RENAME TO project_images_id_seq;
ALTER SEQUENCE project_images_id_seq OWNED BY project_images.id;
SELECT setval('project_images_id_seq', COALESCE((SELECT MAX(id) FROM project_images), 1), true);

-- Rename constraints for cleanliness
ALTER TABLE project_images RENAME CONSTRAINT project_images_new_pkey TO project_images_pkey;
ALTER TABLE project_images RENAME CONSTRAINT project_images_new_position_check TO project_images_position_check;
ALTER TABLE project_images RENAME CONSTRAINT project_images_new_project_id_position_key TO project_images_project_id_position_key;
ALTER TABLE project_images RENAME CONSTRAINT project_images_new_project_id_fkey TO project_images_project_id_fkey;

COMMIT;

-- Note: update app code to use numeric IDs if needed, and test uploads/listing.
