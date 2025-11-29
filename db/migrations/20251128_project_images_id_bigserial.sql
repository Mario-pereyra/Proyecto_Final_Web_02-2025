-- Migration: Change project_images.id from UUID to BIGSERIAL
-- Date: 2025-11-28
-- This migration assumes no other tables reference project_images.id.
-- It creates a backup, adds a new numeric id column, and replaces the primary key.

BEGIN;

-- Create a backup table with current data
DROP TABLE IF EXISTS project_images_backup_before_bigserial;
CREATE TABLE project_images_backup_before_bigserial AS TABLE project_images;

-- Create a new sequence and add a numeric column to hold new ids
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relkind = 'S' AND relname = 'project_images_id_seq') THEN
    CREATE SEQUENCE project_images_id_seq START 1;
  END IF;
END $$;

-- Add the new column (bigint) and set default to use sequence
ALTER TABLE project_images ADD COLUMN IF NOT EXISTS id_new bigint;
ALTER TABLE project_images ALTER COLUMN id_new SET DEFAULT nextval('project_images_id_seq');

-- Populate the column for existing rows
UPDATE project_images SET id_new = nextval('project_images_id_seq') WHERE id_new IS NULL;

-- Make column not null and set as primary key
ALTER TABLE project_images ALTER COLUMN id_new SET NOT NULL;
ALTER TABLE project_images DROP CONSTRAINT IF EXISTS project_images_pkey;
ALTER TABLE project_images ADD CONSTRAINT project_images_pkey PRIMARY KEY (id_new);

-- Rename old uuid id to id_uuid and new numeric id into id
ALTER TABLE project_images RENAME COLUMN id TO id_uuid;
ALTER TABLE project_images RENAME COLUMN id_new TO id;

-- Set sequence ownership and set sequence to max(id)
ALTER SEQUENCE project_images_id_seq OWNED BY project_images.id;
SELECT setval('project_images_id_seq', COALESCE((SELECT MAX(id) FROM project_images), 1), true);

COMMIT;

-- NOTE: After applying, update DDL and application code to use numeric id.
