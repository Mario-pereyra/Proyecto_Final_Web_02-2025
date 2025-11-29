-- ============================================================================
-- Migración: Agregar metadata de archivos a project_images y 
-- project_requirement_answers
-- Fecha: 2025-11-28
-- Descripción: Agrega campos para almacenar nombre original del archivo,
--              tamaño y tipo MIME para mejor trazabilidad administrativa
-- ============================================================================

BEGIN;

-- ============================================================================
-- Tabla: project_images
-- ============================================================================
ALTER TABLE project_images 
ADD COLUMN IF NOT EXISTS original_filename VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS file_size INTEGER NULL,
ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100) NULL;

-- Comentarios para documentación
COMMENT ON COLUMN project_images.original_filename IS 'Nombre original del archivo subido por el usuario (ej: "mi-proyecto-portada.jpg")';
COMMENT ON COLUMN project_images.file_size IS 'Tamaño del archivo en bytes';
COMMENT ON COLUMN project_images.mime_type IS 'Tipo MIME del archivo (ej: "image/jpeg", "image/png")';

-- ============================================================================
-- Tabla: project_requirement_answers
-- ============================================================================
ALTER TABLE project_requirement_answers 
ADD COLUMN IF NOT EXISTS original_filename VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS file_size INTEGER NULL,
ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100) NULL;

-- Comentarios para documentación
COMMENT ON COLUMN project_requirement_answers.original_filename IS 'Nombre original del archivo subido (ej: "presupuesto-detallado.pdf")';
COMMENT ON COLUMN project_requirement_answers.file_size IS 'Tamaño del archivo en bytes';
COMMENT ON COLUMN project_requirement_answers.mime_type IS 'Tipo MIME del archivo (ej: "application/pdf")';

COMMIT;

-- ============================================================================
-- Queries de verificación (comentados, descomentar para testing)
-- ============================================================================

-- Verificar estructura de project_images
-- SELECT column_name, data_type, character_maximum_length, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'project_images'
-- ORDER BY ordinal_position;

-- Verificar estructura de project_requirement_answers
-- SELECT column_name, data_type, character_maximum_length, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'project_requirement_answers'
-- ORDER BY ordinal_position;
