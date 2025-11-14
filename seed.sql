-- Limpieza básica (opcional en dev)
TRUNCATE audit_logs, favorites, donations, project_images, project_observations,
         project_requirement_answers, category_requirements, categories,
         user_tokens, projects, users RESTART IDENTITY CASCADE;

-- =========================
-- 1) USUARIOS
-- =========================
INSERT INTO users (full_name, email, password_plain, role, status) VALUES
  ('Administrador', 'admin@impulsa.me', 'admin123', 'admin', 'activo'),
  ('Creador Demo',  'creador@impulsa.me', 'user123',  'usuario', 'activo'),
  ('Apoyador Demo', 'apoyador@impulsa.me', 'user123', 'usuario', 'activo');

-- Token de verificación usado (ejemplo histórico)
INSERT INTO user_tokens (user_id, purpose, code, created_at, expires_at, used_at)
SELECT id, 'verificacion_email', '12345', NOW() - INTERVAL '20 min', NOW() - INTERVAL '5 min', NOW() - INTERVAL '10 min'
FROM users WHERE email='creador@impulsa.me';

-- =========================
-- 2) CATEGORÍAS
-- =========================
INSERT INTO categories (name, description) VALUES
  ('Tecnología', 'Proyectos tecnológicos e innovación'),
  ('Arte y Cultura', 'Artes visuales, música, literatura, cine'),
  ('Impacto Social', 'Emprendimientos de impacto comunitario'),
  ('Educación', 'Formación, contenidos educativos y herramientas'),
  ('Salud', 'Proyectos de salud pública y bienestar'),
  ('Medio Ambiente', 'Sostenibilidad, reciclaje, energía verde')
ON CONFLICT DO NOTHING;

-- =========================
-- 3) REQUISITOS POR CATEGORÍA (activos)
-- Tipos: texto, largo, numero, archivo, url, booleano, opcion, video
-- Validaciones en JSON: mimes, max_mb, pattern, min/max, options, etc.
-- =========================

-- TECNOLOGÍA
WITH cat AS (SELECT id FROM categories WHERE name='Tecnología')
INSERT INTO category_requirements (category_id, code, label, type, required, position, options_json, validations_json)
SELECT id, 'ruc',          'RUC o NIT del proyecto',              'texto',  TRUE,  1, NULL, '{"pattern":"^[0-9\\-]{7,15}$"}'  FROM cat UNION ALL
SELECT id, 'doc_legal',    'Documento legal (PDF)',               'archivo',TRUE,  2, NULL, '{"mimes":["application/pdf"],"max_mb":5}' FROM cat UNION ALL
SELECT id, 'video_pitch',  'Video pitch (MP4)',                   'video',  FALSE, 3, NULL, '{"mimes":["video/mp4"],"max_mb":50}' FROM cat UNION ALL
SELECT id, 'repo_url',     'Repositorio / Sitio del proyecto',    'url',    FALSE, 4, NULL, NULL FROM cat UNION ALL
SELECT id, 'equipo_min',   'Tamaño mínimo de equipo',             'numero', FALSE, 5, NULL, '{"min":1,"max":50}' FROM cat UNION ALL
SELECT id, 'acepta_terms', 'Acepta términos y condiciones',       'booleano',TRUE, 6, NULL, NULL FROM cat;

-- ARTE Y CULTURA
WITH cat AS (SELECT id FROM categories WHERE name='Arte y Cultura')
INSERT INTO category_requirements (category_id, code, label, type, required, position, options_json, validations_json)
SELECT id, 'portafolio',   'URL de portafolio',                   'url',    TRUE,  1, NULL, NULL FROM cat UNION ALL
SELECT id, 'registro_aut', 'Registro de autor (PDF)',             'archivo',TRUE,  2, NULL, '{"mimes":["application/pdf"],"max_mb":5}' FROM cat UNION ALL
SELECT id, 'desc_larga',   'Descripción artística',               'largo',  TRUE,  3, NULL, '{"min_chars":80}' FROM cat UNION ALL
SELECT id, 'ubicacion',    'Ubicación principal',                 'texto',  FALSE, 4, NULL, NULL FROM cat;

-- IMPACTO SOCIAL
WITH cat AS (SELECT id FROM categories WHERE name='Impacto Social')
INSERT INTO category_requirements (category_id, code, label, type, required, position, options_json, validations_json)
SELECT id, 'carta_resp',   'Carta de respaldo (PDF)',             'archivo',TRUE,  1, NULL, '{"mimes":["application/pdf"],"max_mb":10}' FROM cat UNION ALL
SELECT id, 'area_inf',     'Área de influencia',                  'opcion', TRUE,  2, '{"options":["rural","urbana","ambas"]}', NULL FROM cat UNION ALL
SELECT id, 'benef_est',    'Beneficiarios estimados',             'numero', TRUE,  3, NULL, '{"min":1,"max":1000000}' FROM cat UNION ALL
SELECT id, 'web',          'Sitio web / página',                  'url',    FALSE, 4, NULL, NULL FROM cat;

-- EDUCACIÓN
WITH cat AS (SELECT id FROM categories WHERE name='Educación')
INSERT INTO category_requirements (category_id, code, label, type, required, position, options_json, validations_json)
SELECT id, 'res_min',      'Resolución ministerial (PDF)',        'archivo',TRUE,  1, NULL, '{"mimes":["application/pdf"],"max_mb":10}' FROM cat UNION ALL
SELECT id, 'plan_curr',    'Plan curricular (PDF)',               'archivo',TRUE,  2, NULL, '{"mimes":["application/pdf"],"max_mb":10}' FROM cat UNION ALL
SELECT id, 'video_demo',   'Video demostrativo (MP4)',            'video',  FALSE, 3, NULL, '{"mimes":["video/mp4"],"max_mb":80}' FROM cat;

-- SALUD
WITH cat AS (SELECT id FROM categories WHERE name='Salud')
INSERT INTO category_requirements (category_id, code, label, type, required, position, options_json, validations_json)
SELECT id, 'lic_san',      'Licencia sanitaria (PDF)',            'archivo',TRUE,  1, NULL, '{"mimes":["application/pdf"],"max_mb":10}' FROM cat UNION ALL
SELECT id, 'prot_etico',   'Protocolo ético (PDF)',               'archivo',TRUE,  2, NULL, '{"mimes":["application/pdf"],"max_mb":10}' FROM cat UNION ALL
SELECT id, 'tipo_interv',  'Tipo de intervención',                'opcion', TRUE,  3, '{"options":["preventiva","curativa","mixta"]}', NULL FROM cat;

-- MEDIO AMBIENTE
WITH cat AS (SELECT id FROM categories WHERE name='Medio Ambiente')
INSERT INTO category_requirements (category_id, code, label, type, required, position, options_json, validations_json)
SELECT id, 'est_impacto',  'Estudio de impacto (PDF)',            'archivo',TRUE,  1, NULL, '{"mimes":["application/pdf"],"max_mb":15}' FROM cat UNION ALL
SELECT id, 'ubic_geo',     'Ubicación geográfica',                'texto',  TRUE,  2, NULL, NULL FROM cat UNION ALL
SELECT id, 'dur_meses',    'Duración estimada (meses)',           'numero', FALSE, 3, NULL, '{"min":1,"max":120}' FROM cat UNION ALL
SELECT id, 'cat_verde',    'Categoría verde',                     'opcion', FALSE, 4, '{"options":["reforestacion","reciclaje","energia"]}', NULL FROM cat;

-- =========================
-- 4) PROYECTO DEMO (TECNOLOGÍA)
-- =========================
WITH owner AS (SELECT id AS owner_id FROM users WHERE email='creador@impulsa.me'),
     cat   AS (SELECT id AS category_id FROM categories WHERE name='Tecnología')
INSERT INTO projects (owner_id, category_id, title, summary, description_json, goal_amount, deadline, approval_status, campaign_state, created_at, published_at)
SELECT
  owner.owner_id,
  cat.category_id,
  'IA para Diagnóstico Temprano',
  'Modelo de IA que detecta señales tempranas de enfermedad a partir de imágenes clínicas.',
  '{
     "time": 1717171717,
     "blocks": [
       {"type":"header","data":{"text":"IA para Diagnóstico Temprano","level":2}},
       {"type":"paragraph","data":{"text":"Este proyecto entrenará un modelo de deep learning con imágenes anonimizadas para apoyar diagnósticos tempranos."}},
       {"type":"list","data":{"style":"unordered","items":["Recolección de datos","Entrenamiento","Validación clínica"]}},
       {"type":"embed","data":{"service":"video","source":"mp4","embed":"https://cdn.impulsa.me/videos/pitch_demo.mp4","width":640,"height":360,"caption":"Video pitch"}}
     ],
     "version":"2.28.2"
   }'::jsonb,
  50000.00,
  CURRENT_DATE + INTERVAL '60 days',
  'publicado',
  'en_progreso',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '1 days';

-- =========================
-- 5) IMÁGENES DEL PROYECTO
-- =========================
INSERT INTO project_images (project_id, url, position, is_cover, alt_text)
SELECT p.id, 'https://cdn.impulsa.me/img/proyectos/ia-portada.jpg', 1, TRUE,  'Portada IA'
FROM projects p WHERE p.title='IA para Diagnóstico Temprano';
INSERT INTO project_images (project_id, url, position, is_cover, alt_text)
SELECT p.id, 'https://cdn.impulsa.me/img/proyectos/ia-setup.jpg',   2, FALSE, 'Equipo de trabajo'
FROM projects p WHERE p.title='IA para Diagnóstico Temprano';

-- =========================
-- 6) RESPUESTAS A REQUISITOS (TECNOLOGÍA)
-- =========================
-- ruc (texto)
INSERT INTO project_requirement_answers (project_id, requirement_id, value_text)
SELECT p.id,
       (SELECT cr.id FROM category_requirements cr
         WHERE cr.category_id = p.category_id AND cr.code='ruc' AND cr.is_active=TRUE),
       '1234567-8'
FROM projects p WHERE p.title='IA para Diagnóstico Temprano';

-- doc_legal (archivo)
INSERT INTO project_requirement_answers (project_id, requirement_id, file_url)
SELECT p.id,
       (SELECT cr.id FROM category_requirements cr
         WHERE cr.category_id = p.category_id AND cr.code='doc_legal' AND cr.is_active=TRUE),
       'https://cdn.impulsa.me/docs/ia-doc-legal.pdf'
FROM projects p WHERE p.title='IA para Diagnóstico Temprano';

-- video_pitch (video) (opcional)
INSERT INTO project_requirement_answers (project_id, requirement_id, file_url)
SELECT p.id,
       (SELECT cr.id FROM category_requirements cr
         WHERE cr.category_id = p.category_id AND cr.code='video_pitch' AND cr.is_active=TRUE),
       'https://cdn.impulsa.me/videos/pitch_demo.mp4'
FROM projects p WHERE p.title='IA para Diagnóstico Temprano';

-- repo_url (url)
INSERT INTO project_requirement_answers (project_id, requirement_id, value_text)
SELECT p.id,
       (SELECT cr.id FROM category_requirements cr
         WHERE cr.category_id = p.category_id AND cr.code='repo_url' AND cr.is_active=TRUE),
       'https://github.com/impulsa-me/ia-diagnostico'
FROM projects p WHERE p.title='IA para Diagnóstico Temprano';

-- equipo_min (numero) (almacenado en value_json para ejemplo)
INSERT INTO project_requirement_answers (project_id, requirement_id, value_json)
SELECT p.id,
       (SELECT cr.id FROM category_requirements cr
         WHERE cr.category_id = p.category_id AND cr.code='equipo_min' AND cr.is_active=TRUE),
       '{"value": 5}'::jsonb
FROM projects p WHERE p.title='IA para Diagnóstico Temprano';

-- acepta_terms (booleano)
INSERT INTO project_requirement_answers (project_id, requirement_id, value_json)
SELECT p.id,
       (SELECT cr.id FROM category_requirements cr
         WHERE cr.category_id = p.category_id AND cr.code='acepta_terms' AND cr.is_active=TRUE),
       '{"value": true}'::jsonb
FROM projects p WHERE p.title='IA para Diagnóstico Temprano';

-- =========================
-- 7) OBSERVACIONES (historial de revisión)
-- =========================
INSERT INTO project_observations (project_id, admin_id, title, description_json, created_at)
SELECT p.id,
       u.id,
       'Ajustar resumen y añadir evidencia clínica',
       '{
          "blocks":[
            {"type":"paragraph","data":{"text":"El resumen debe indicar dataset y periodo de recolección."}},
            {"type":"list","data":{"style":"unordered","items":["Agregar fuente de datos","Incluir calendario de validación"]}}
          ]
        }'::jsonb,
       NOW() - INTERVAL '36 hours'
FROM projects p CROSS JOIN users u
WHERE p.title='IA para Diagnóstico Temprano' AND u.email='admin@impulsa.me';

-- =========================
-- 8) DONACIONES
-- =========================
INSERT INTO donations (user_id, project_id, amount, status, payment_method, payment_reference, gateway_response, created_at, confirmed_at)
SELECT u.id, p.id, 1500.00, 'confirmado', 'qr', 'TX-OK-0001', '{"status":"ok","provider":"sim"}'::jsonb, NOW() - INTERVAL '20 hours', NOW() - INTERVAL '19 hours'
FROM users u, projects p
WHERE u.email='apoyador@impulsa.me' AND p.title='IA para Diagnóstico Temprano';

INSERT INTO donations (user_id, project_id, amount, status, payment_method, payment_reference, gateway_response, created_at)
SELECT u.id, p.id, 200.00, 'fallido', 'qr', 'TX-FAIL-0002', '{"status":"fail","provider":"sim"}'::jsonb, NOW() - INTERVAL '5 hours'
FROM users u, projects p
WHERE u.email='apoyador@impulsa.me' AND p.title='IA para Diagnóstico Temprano';

INSERT INTO donations (user_id, project_id, amount, status, payment_method, payment_reference, gateway_response, created_at, confirmed_at)
SELECT u.id, p.id, 2500.00, 'confirmado', 'qr', 'TX-OK-0003', '{"status":"ok","provider":"sim"}'::jsonb, NOW() - INTERVAL '10 hours', NOW() - INTERVAL '9 hours'
FROM users u, projects p
WHERE u.email='admin@impulsa.me' AND p.title='IA para Diagnóstico Temprano';

-- =========================
-- 9) FAVORITOS
-- =========================
INSERT INTO favorites (user_id, project_id, created_at)
SELECT u.id, p.id, NOW() - INTERVAL '3 hours'
FROM users u, projects p
WHERE u.email='apoyador@impulsa.me' AND p.title='IA para Diagnóstico Temprano';

-- =========================
-- 10) AUDITORÍA
-- =========================
INSERT INTO audit_logs (actor_user_id, action, project_id, details_json, created_at)
SELECT (SELECT id FROM users WHERE email='creador@impulsa.me'),
       'proyecto_en_revision',
       p.id,
       '{"note":"Primer envío"}'::jsonb,
       NOW() - INTERVAL '40 hours'
FROM projects p WHERE p.title='IA para Diagnóstico Temprano';

INSERT INTO audit_logs (actor_user_id, action, project_id, details_json, created_at)
SELECT (SELECT id FROM users WHERE email='admin@impulsa.me'),
       'proyecto_observado',
       p.id,
       '{"obs":"Faltan evidencias"}'::jsonb,
       NOW() - INTERVAL '36 hours'
FROM projects p WHERE p.title='IA para Diagnóstico Temprano';

INSERT INTO audit_logs (actor_user_id, action, project_id, details_json, created_at)
SELECT (SELECT id FROM users WHERE email='admin@impulsa.me'),
       'proyecto_publicado',
       p.id,
       '{"note":"Aprobado y publicado"}'::jsonb,
       NOW() - INTERVAL '24 hours'
FROM projects p WHERE p.title='IA para Diagnóstico Temprano';
