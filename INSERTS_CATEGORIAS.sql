-- =============================================================================
-- 1. LIMPIEZA PREVIA (Opcional: Si ya tenías datos basura, esto limpia IDs)
-- =============================================================================
TRUNCATE TABLE category_requirements RESTART IDENTITY CASCADE;
TRUNCATE TABLE categories RESTART IDENTITY CASCADE;

-- =============================================================================
-- 2. INSERTAR LAS 6 CATEGORÍAS
-- =============================================================================
INSERT INTO categories (name, description) VALUES 
('Tecnología', 'Innovación en hardware, software, gadgets y aplicaciones.'),
('Arte', 'Pintura, escultura, ilustración, fotografía y exposiciones.'),
('Música', 'Producción de álbumes, videoclips, giras y equipamiento musical.'),
('Educación', 'Cursos, libros, talleres y proyectos de investigación académica.'),
('Ecología', 'Proyectos verdes, reciclaje, energías renovables y conservación.'),
('Cine', 'Cortometrajes, documentales, películas y series web.');

-- =============================================================================
-- 3. DEFINIR REQUISITOS (Pensados para guiar al usuario)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- A. TECNOLOGÍA (Enfoque: Viabilidad Técnica)
-- -----------------------------------------------------------------------------
INSERT INTO category_requirements (category_id, code, label, type, required, position, validations_json)
VALUES 
((SELECT id FROM categories WHERE name = 'Tecnología'), 'tech_demo', 'Video del Prototipo Funcional (Demo)', 'url', TRUE, 1, 
 '{"provider": ["youtube", "vimeo"], "description": "Un video sin cortes mostrando que tu tecnología realmente funciona."}'),

((SELECT id FROM categories WHERE name = 'Tecnología'), 'tech_specs', 'Ficha Técnica y Componentes', 'archivo', TRUE, 2, 
 '{"extensions": [".pdf"], "maxSizeMb": 5, "description": "Documento técnico detallando hardware, stack de software y materiales."}'),

((SELECT id FROM categories WHERE name = 'Tecnología'), 'tech_timeline', 'Cronograma de Fabricación y Entrega', 'archivo', TRUE, 3, 
 '{"extensions": [".pdf", ".jpg", ".png"], "description": "Línea de tiempo realista desde la recaudación hasta el envío al usuario."}');

-- -----------------------------------------------------------------------------
-- B. ARTE (Enfoque: Estilo y Calidad Visual)
-- -----------------------------------------------------------------------------
INSERT INTO category_requirements (category_id, code, label, type, required, position, validations_json)
VALUES 
((SELECT id FROM categories WHERE name = 'Arte'), 'art_portfolio', 'Portafolio Anterior (Link)', 'url', TRUE, 1, 
 '{"description": "Enlace a Behance, Instagram o Web personal para ver tu estilo artístico."}'),

((SELECT id FROM categories WHERE name = 'Arte'), 'art_sketches', 'Bocetos o Concept Art del Proyecto', 'archivo', TRUE, 2, 
 '{"extensions": [".jpg", ".png", ".pdf"], "maxSizeMb": 10, "description": "Muestra visualmente qué planeas crear con los fondos."}'),

((SELECT id FROM categories WHERE name = 'Arte'), 'art_materials', 'Descripción Técnica (Materiales y Dimensiones)', 'texto', TRUE, 3, 
 '{"minLength": 50, "maxLength": 500, "description": "Ej: Óleo sobre lienzo de 2x2 metros, Escultura en bronce, etc."}');

-- -----------------------------------------------------------------------------
-- C. MÚSICA (Enfoque: Propiedad Intelectual y Sonido)
-- -----------------------------------------------------------------------------
INSERT INTO category_requirements (category_id, code, label, type, required, position, validations_json)
VALUES 
((SELECT id FROM categories WHERE name = 'Música'), 'music_demo', 'Maqueta o Demo de Audio', 'url', TRUE, 1, 
 '{"provider": ["soundcloud", "spotify", "youtube"], "description": "Enlace para escuchar la calidad de tu sonido o demos de las canciones."}'),

((SELECT id FROM categories WHERE name = 'Música'), 'music_budget', 'Desglose de Presupuesto de Estudio', 'archivo', TRUE, 2, 
 '{"extensions": [".pdf", ".xls", ".xlsx"], "description": "Detalla costos de grabación, mezcla, masterización y distribución."}'),

((SELECT id FROM categories WHERE name = 'Música'), 'music_rights', 'Poseo los derechos de autor de las composiciones', 'booleano', TRUE, 3, 
 '{"description": "Confirma que no estás infringiendo copyright de terceros."}');

-- -----------------------------------------------------------------------------
-- D. EDUCACIÓN (Enfoque: Credibilidad y Contenido)
-- -----------------------------------------------------------------------------
INSERT INTO category_requirements (category_id, code, label, type, required, position, validations_json)
VALUES 
((SELECT id FROM categories WHERE name = 'Educación'), 'edu_syllabus', 'Plan de Estudios o Índice del Contenido', 'archivo', TRUE, 1, 
 '{"extensions": [".pdf"], "description": "Syllabus completo de lo que aprenderán los estudiantes."}'),

((SELECT id FROM categories WHERE name = 'Educación'), 'edu_cv', 'Hoja de Vida del Instructor/Autor', 'archivo', TRUE, 2, 
 '{"extensions": [".pdf"], "description": "Documento que acredite tu experiencia en el tema a enseñar."}'),

((SELECT id FROM categories WHERE name = 'Educación'), 'edu_target', 'Público Objetivo y Requisitos Previos', 'texto', TRUE, 3, 
 '{"minLength": 20, "description": "¿A quién va dirigido? (Ej: Principiantes, Niños, Expertos en Java)."}');

-- -----------------------------------------------------------------------------
-- E. ECOLOGÍA (Enfoque: Impacto y Permisos)
-- -----------------------------------------------------------------------------
INSERT INTO category_requirements (category_id, code, label, type, required, position, validations_json)
VALUES 
((SELECT id FROM categories WHERE name = 'Ecología'), 'eco_impact', 'Informe de Impacto Ambiental', 'archivo', TRUE, 1, 
 '{"extensions": [".pdf"], "description": "Análisis de cómo tu proyecto beneficia al entorno y métricas esperadas."}'),

((SELECT id FROM categories WHERE name = 'Ecología'), 'eco_location', 'Permisos de Uso de Suelo / Ubicación', 'archivo', TRUE, 2, 
 '{"extensions": [".pdf", ".jpg"], "description": "Documento legal que autoriza realizar la actividad en la zona elegida."}'),

((SELECT id FROM categories WHERE name = 'Ecología'), 'eco_sustain', 'Plan de Sostenibilidad a Largo Plazo', 'largo', TRUE, 3, 
 '{"minLength": 100, "description": "¿Cómo se mantendrá el proyecto vivo cuando se acaben los fondos iniciales?"}');

-- -----------------------------------------------------------------------------
-- F. CINE (Enfoque: Narrativa y Equipo)
-- -----------------------------------------------------------------------------
INSERT INTO category_requirements (category_id, code, label, type, required, position, validations_json)
VALUES 
((SELECT id FROM categories WHERE name = 'Cine'), 'cine_script', 'Guion Literario (Draft o Final)', 'archivo', TRUE, 1, 
 '{"extensions": [".pdf"], "description": "El guion es obligatorio para evaluar la historia. Formato estándar de la industria."}'),

((SELECT id FROM categories WHERE name = 'Cine'), 'cine_moodboard', 'Lookbook / Propuesta Visual', 'archivo', FALSE, 2, 
 '{"extensions": [".pdf", ".jpg"], "description": "Referencias visuales, paleta de colores y atmósfera de la película."}'),

((SELECT id FROM categories WHERE name = 'Cine'), 'cine_crew', 'Lista del Equipo Técnico Principal', 'texto', TRUE, 3, 
 '{"description": "Menciona quién es el Director, Productor y Director de Fotografía."}');