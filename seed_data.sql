-- Script para poblar la base de datos con datos de prueba
-- Ejecutar este script después de tener al menos un usuario activo

-- NOTA: Asegúrate de tener al menos 2 usuarios en la tabla users antes de ejecutar esto
-- Si no tienes usuarios, primero regístralos desde la aplicación

-- ============================================
-- 1. INSERTAR CATEGORÍAS (si no existen)
-- ============================================
INSERT INTO categories (name, description) VALUES
('Tecnología', 'Innovación, gadgets, software y hardware'),
('Arte', 'Pintura, escultura, ilustración, fotografía y exposiciones'),
('Música', 'Álbumes, conciertos, instrumentos y producción musical'),
('Educación', 'Cursos, talleres, libros educativos y material didáctico'),
('Ecología', 'Proyectos ambientales, sostenibilidad y conservación'),
('Cine', 'Cortometrajes, documentales, películas y producción audiovisual')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. INSERTAR PROYECTOS DE PRUEBA
-- ============================================
-- IMPORTANTE: Reemplaza owner_id con IDs de usuarios reales de tu base de datos
-- Puedes verificar los IDs ejecutando: SELECT id, email FROM users;

-- Proyectos de Tecnología (category_id = 1)
INSERT INTO projects (owner_id, category_id, title, summary, description_json, goal_amount, deadline, approval_status, campaign_state, published_at)
VALUES 
(1, (SELECT id FROM categories WHERE name = 'Tecnología'), 
 'SmartWatch Revolucionario', 
 'Un smartwatch con tecnología innovadora que monitorea tu salud 24/7',
 '{"blocks": [{"type": "paragraph", "data": {"text": "Descripción completa del proyecto..."}}]}',
 50000.00, 
 CURRENT_DATE + INTERVAL '101 days', 
 'publicado', 
 'en_progreso',
 NOW()),

(1, (SELECT id FROM categories WHERE name = 'Tecnología'), 
 'App de Realidad Aumentada', 
 'Aplicación móvil que transforma la experiencia de compra con AR',
 '{"blocks": [{"type": "paragraph", "data": {"text": "Descripción completa del proyecto..."}}]}',
 35000.00, 
 CURRENT_DATE + INTERVAL '85 days', 
 'publicado', 
 'en_progreso',
 NOW());

-- Proyectos de Arte (category_id = 2)
INSERT INTO projects (owner_id, category_id, title, summary, description_json, goal_amount, deadline, approval_status, campaign_state, published_at)
VALUES 
(1, (SELECT id FROM categories WHERE name = 'Arte'), 
 'Instalación de Arte Interactivo', 
 'Una experiencia artística inmersiva que responde a las emociones del espectador',
 '{"blocks": [{"type": "paragraph", "data": {"text": "Descripción completa del proyecto..."}}]}',
 25000.00, 
 CURRENT_DATE + INTERVAL '24 days', 
 'publicado', 
 'en_progreso',
 NOW()),

(1, (SELECT id FROM categories WHERE name = 'Arte'), 
 'Galería de Arte Digital', 
 'Espacio virtual para artistas emergentes',
 '{"blocks": [{"type": "paragraph", "data": {"text": "Descripción completa del proyecto..."}}]}',
 18000.00, 
 CURRENT_DATE + INTERVAL '60 days', 
 'publicado', 
 'en_progreso',
 NOW());

-- Proyectos de Música (category_id = 3)
INSERT INTO projects (owner_id, category_id, title, summary, description_json, goal_amount, deadline, approval_status, campaign_state, published_at)
VALUES 
(1, (SELECT id FROM categories WHERE name = 'Música'), 
 'Álbum "Sonidos del Futuro"', 
 'Un álbum conceptual que fusiona música electrónica con sonidos naturales',
 '{"blocks": [{"type": "paragraph", "data": {"text": "Descripción completa del proyecto..."}}]}',
 15000.00, 
 CURRENT_DATE + INTERVAL '70 days', 
 'publicado', 
 'en_progreso',
 NOW()),

(1, (SELECT id FROM categories WHERE name = 'Música'), 
 'Festival de Jazz Local', 
 'Evento musical para promover el jazz en la comunidad',
 '{"blocks": [{"type": "paragraph", "data": {"text": "Descripción completa del proyecto..."}}]}',
 22000.00, 
 CURRENT_DATE + INTERVAL '45 days', 
 'publicado', 
 'en_progreso',
 NOW());

-- Proyectos de Educación (category_id = 4)
INSERT INTO projects (owner_id, category_id, title, summary, description_json, goal_amount, deadline, approval_status, campaign_state, published_at)
VALUES 
(1, (SELECT id FROM categories WHERE name = 'Educación'), 
 'Curso Online de Programación', 
 'Plataforma educativa para aprender desarrollo web desde cero',
 '{"blocks": [{"type": "paragraph", "data": {"text": "Descripción completa del proyecto..."}}]}',
 12000.00, 
 CURRENT_DATE + INTERVAL '90 days', 
 'publicado', 
 'en_progreso',
 NOW()),

(1, (SELECT id FROM categories WHERE name = 'Educación'), 
 'Biblioteca Comunitaria', 
 'Espacio de lectura y aprendizaje para niños',
 '{"blocks": [{"type": "paragraph", "data": {"text": "Descripción completa del proyecto..."}}]}',
 28000.00, 
 CURRENT_DATE + INTERVAL '120 days', 
 'publicado', 
 'en_progreso',
 NOW());

-- Proyectos de Ecología (category_id = 5)
INSERT INTO projects (owner_id, category_id, title, summary, description_json, goal_amount, deadline, approval_status, campaign_state, published_at)
VALUES 
(1, (SELECT id FROM categories WHERE name = 'Ecología'), 
 'Reforestación Urbana', 
 'Proyecto para plantar 1000 árboles en la ciudad',
 '{"blocks": [{"type": "paragraph", "data": {"text": "Descripción completa del proyecto..."}}]}',
 16000.00, 
 CURRENT_DATE + INTERVAL '75 days', 
 'publicado', 
 'en_progreso',
 NOW()),

(1, (SELECT id FROM categories WHERE name = 'Ecología'), 
 'Huerto Comunitario Sostenible', 
 'Espacio verde para cultivar alimentos orgánicos',
 '{"blocks": [{"type": "paragraph", "data": {"text": "Descripción completa del proyecto..."}}]}',
 14000.00, 
 CURRENT_DATE + INTERVAL '65 days', 
 'publicado', 
 'en_progreso',
 NOW());

-- Proyectos de Cine (category_id = 6)
INSERT INTO projects (owner_id, category_id, title, summary, description_json, goal_amount, deadline, approval_status, campaign_state, published_at)
VALUES 
(1, (SELECT id FROM categories WHERE name = 'Cine'), 
 'Documental sobre Cultura Local', 
 'Película documental que explora tradiciones bolivianas',
 '{"blocks": [{"type": "paragraph", "data": {"text": "Descripción completa del proyecto..."}}]}',
 32000.00, 
 CURRENT_DATE + INTERVAL '95 days', 
 'publicado', 
 'en_progreso',
 NOW()),

(1, (SELECT id FROM categories WHERE name = 'Cine'), 
 'Cortometraje de Ficción', 
 'Historia original sobre la vida en la ciudad',
 '{"blocks": [{"type": "paragraph", "data": {"text": "Descripción completa del proyecto..."}}]}',
 19000.00, 
 CURRENT_DATE + INTERVAL '55 days', 
 'publicado', 
 'en_progreso',
 NOW());

-- ============================================
-- 3. INSERTAR DONACIONES DE PRUEBA
-- ============================================
-- IMPORTANTE: Reemplaza user_id con IDs de usuarios reales
-- Estas donaciones crearán proyectos financiados y parcialmente financiados

-- Donaciones para SmartWatch Revolucionario (100% financiado)
INSERT INTO donations (user_id, project_id, amount, status, payment_method, confirmed_at)
SELECT 
    1,  -- Reemplaza con un user_id real
    p.id,
    37500.00,
    'confirmado',
    'qr',
    NOW()
FROM projects p
WHERE p.title = 'SmartWatch Revolucionario';

-- Donaciones para Álbum "Sonidos del Futuro" (58% financiado)
INSERT INTO donations (user_id, project_id, amount, status, payment_method, confirmed_at)
SELECT 
    1,  -- Reemplaza con un user_id real
    p.id,
    8750.00,
    'confirmado',
    'qr',
    NOW()
FROM projects p
WHERE p.title = 'Álbum "Sonidos del Futuro"';

-- Donaciones para Instalación de Arte Interactivo (49% financiado)
INSERT INTO donations (user_id, project_id, amount, status, payment_method, confirmed_at)
SELECT 
    1,  -- Reemplaza con un user_id real
    p.id,
    12300.00,
    'confirmado',
    'qr',
    NOW()
FROM projects p
WHERE p.title = 'Instalación de Arte Interactivo';

-- Donaciones adicionales para otros proyectos
INSERT INTO donations (user_id, project_id, amount, status, payment_method, confirmed_at)
SELECT 
    1,  -- Reemplaza con un user_id real
    p.id,
    5000.00,
    'confirmado',
    'qr',
    NOW()
FROM projects p
WHERE p.title IN ('App de Realidad Aumentada', 'Festival de Jazz Local', 'Documental sobre Cultura Local');

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecuta estas queries para verificar que todo se insertó correctamente:

-- Ver conteo de proyectos por categoría
SELECT 
    c.name,
    COUNT(p.id) as total_proyectos
FROM categories c
LEFT JOIN projects p ON c.id = p.category_id AND p.approval_status = 'publicado' AND p.deleted_at IS NULL
GROUP BY c.name
ORDER BY c.name;

-- Ver KPIs
SELECT 
    (SELECT COUNT(*) FROM (
        SELECT p.id
        FROM projects p
        LEFT JOIN donations d ON p.id = d.project_id AND d.status = 'confirmado'
        WHERE p.approval_status = 'publicado' AND p.deleted_at IS NULL
        GROUP BY p.id
        HAVING COALESCE(SUM(d.amount), 0) >= p.goal_amount
    ) funded) as proyectos_financiados,
    
    (SELECT COUNT(DISTINCT owner_id) 
     FROM projects 
     WHERE approval_status = 'publicado' AND deleted_at IS NULL
    ) as creadores_apoyados,
    
    (SELECT COALESCE(SUM(amount), 0)
     FROM donations
     WHERE status = 'confirmado'
    ) as total_recaudado;
