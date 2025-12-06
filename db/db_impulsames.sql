-- ====================================================================================
-- PLATAFORMA IMPULSAME - DDL COMPLETO + DATOS SEMILLA (V8.0 - FINAL)
-- Fecha: 2025-11-29
-- Estado: CORREGIDO (Compatible con Docker/PostgreSQL 14+)
-- ====================================================================================

-- 1. LIMPIEZA INICIAL
-- ====================================================================================
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
SET search_path TO public;

-- 2. ENUMS (Tipos de Datos Personalizados)
-- ====================================================================================
CREATE TYPE role_enum AS ENUM ('usuario', 'admin');
CREATE TYPE user_status_enum AS ENUM ('inactivo', 'activo', 'bloqueado');
CREATE TYPE token_purpose_enum AS ENUM ('verificacion_email', 'recuperacion_password');
CREATE TYPE approval_status_enum AS ENUM ('borrador', 'en_revision', 'observado', 'publicado', 'rechazado');
CREATE TYPE campaign_status_enum AS ENUM ('no_iniciada', 'en_progreso', 'en_pausa', 'finalizada');
CREATE TYPE donation_status_enum AS ENUM ('pendiente', 'pagado');

-- 3. TABLAS DE ESTRUCTURA (DDL)
-- ====================================================================================

-- TABLA: USUARIOS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role role_enum NOT NULL DEFAULT 'usuario',
    status user_status_enum NOT NULL DEFAULT 'inactivo',
    created_at TIMESTAMP DEFAULT NOW()
);

-- TABLA: TOKENS DE SEGURIDAD
CREATE TABLE user_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purpose token_purpose_enum NOT NULL,
    code CHAR(5) NOT NULL CHECK (code ~ '^[0-9]{5}$'),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '5 minutes') NOT NULL,
    used_at TIMESTAMP
);
CREATE INDEX idx_user_tokens_active ON user_tokens(user_id) WHERE used_at IS NULL;

-- TABLA: CATEGORÍAS
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- TABLA: PROYECTOS (CORE)
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title VARCHAR(150) NOT NULL, 
    
    -- Campos borrables
    short_description VARCHAR(255),
    story_json JSONB DEFAULT '{}', 
    
    -- Financiación
    goal_amount NUMERIC(12, 2) CHECK (goal_amount IS NULL OR goal_amount > 0),
    duration_days INTEGER CHECK (duration_days IS NULL OR (duration_days BETWEEN 1 AND 90)),
    
    -- Fechas
    started_at TIMESTAMP,
    deadline_at TIMESTAMP, 
    
    -- Estados
    approval_status approval_status_enum NOT NULL DEFAULT 'borrador',
    campaign_status campaign_status_enum NOT NULL DEFAULT 'no_iniciada',
    
    -- Extras
    visit_count INTEGER NOT NULL DEFAULT 0,
    rejection_reason TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- TABLA: IMÁGENES
CREATE TABLE project_images (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    image_path VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    is_cover BOOLEAN NOT NULL DEFAULT FALSE, 
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE UNIQUE INDEX ux_project_cover ON project_images(project_id) WHERE is_cover = TRUE;

-- TABLA: DEFINICIÓN DE REQUISITOS (Admin)
CREATE TABLE category_requirements (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL, 
    description TEXT,             
    is_required BOOLEAN DEFAULT TRUE
);

-- TABLA: RESPUESTAS DE REQUISITOS (Archivos del Usuario)
CREATE TABLE project_requirements_answers (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    requirement_id INTEGER NOT NULL REFERENCES category_requirements(id) ON DELETE RESTRICT,
    file_path VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),                 
    submitted_at TIMESTAMP DEFAULT NOW()
);

-- TABLA: DONACIONES
CREATE TABLE donations (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_proof_url TEXT, 
    status donation_status_enum NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT NOW()
);

-- TABLA: FAVORITOS
CREATE TABLE saved_projects (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, project_id)
);

-- TABLA: OBSERVACIONES (Feedback Admin)
CREATE TABLE project_observations (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    admin_id INTEGER NOT NULL REFERENCES users(id),
    observation_json JSONB NOT NULL DEFAULT '{}', 
    created_at TIMESTAMP DEFAULT NOW()
);


-- 4. VISTAS INTELIGENTES
-- ====================================================================================
CREATE OR REPLACE VIEW project_details_view AS
SELECT 
    p.id, p.title, p.short_description, p.category_id, c.name as category_name,
    p.owner_id, u.full_name as owner_name, p.goal_amount, p.duration_days,
    p.started_at, p.deadline_at, p.approval_status, p.campaign_status, p.created_at,
    p.visit_count,
    
    -- Portada
    COALESCE(
        (SELECT image_path FROM project_images WHERE project_id = p.id AND is_cover = TRUE LIMIT 1),
        (SELECT image_path FROM project_images WHERE project_id = p.id LIMIT 1)
    ) as cover_image,
    
    -- Dinero Recaudado (Suma SOLO si status = 'pagado')
    COALESCE(SUM(d.amount) FILTER (WHERE d.status = 'pagado'), 0) as total_collected,
    
    -- Mecenas (Cuenta SOLO si status = 'pagado')
    COUNT(DISTINCT d.user_id) FILTER (WHERE d.status = 'pagado') as backers_count,
    
    -- Progreso %
    CASE 
        WHEN p.goal_amount > 0 THEN 
            ROUND((COALESCE(SUM(d.amount) FILTER (WHERE d.status = 'pagado'), 0) / p.goal_amount) * 100, 2) 
        ELSE 0 
    END as progress_percentage,
    
    -- Días Restantes
    CASE 
        WHEN p.deadline_at IS NULL THEN p.duration_days
        WHEN NOW() > p.deadline_at THEN 0               
        ELSE EXTRACT(DAY FROM (p.deadline_at - NOW()))::INTEGER 
    END as days_remaining

FROM projects p
JOIN users u ON p.owner_id = u.id
JOIN categories c ON p.category_id = c.id
LEFT JOIN donations d ON p.id = d.project_id
WHERE p.deleted_at IS NULL
GROUP BY p.id, u.full_name, c.name;
    
    -- Dinero Recaudado
INSERT INTO public.users (id, full_name, email, password, role, status, created_at) 
VALUES
(101, 'Sofía Ramírez', 'sofia.ramirez@impulsa.me', 'AdminPass2025!', 'admin', 'activo', NOW()),
(102, 'Mateo Tórrez', 'mateo.dev@gmail.com', 'startup_rockstar', 'usuario', 'activo', NOW()),
(106, 'Diego Rojas', 'diego.films@outlook.com', 'cinema_paradiso', 'usuario', 'activo', NOW()),
(107, 'Valentina Paz', 'vale.verde@gmail.com', 'recicla_todo', 'usuario', 'activo', NOW()),
(108, 'Juan Perez', 'juanseeding@example.com', '123456', 'usuario', 'activo', NOW()),
(109, 'Maria Gomez', 'mariaseeding@example.com', '123456', 'usuario', 'activo', NOW()),
(110, 'Admin Master', 'adminseeding@example.com', '123456', 'admin', 'activo', NOW());

-- Ajuste secuencia usuarios
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- CATEGORÍAS
INSERT INTO categories (name, description) VALUES 
('Tecnología', 'Innovación en hardware y software.'),
('Arte', 'Pintura, escultura y fotografía.'),
('Música', 'Producción musical y bandas.'),
('Educación', 'Cursos y libros.'),
('Ecología', 'Proyectos verdes.'),
('Cine', 'Películas y cortos.');

-- REQUISITOS
INSERT INTO category_requirements (category_id, title, description, is_required) VALUES 
((SELECT id FROM categories WHERE name = 'Tecnología'), 'Video Demo', 'Enlace mostrando el prototipo.', TRUE),
((SELECT id FROM categories WHERE name = 'Tecnología'), 'Ficha Técnica', 'PDF con detalles técnicos.', TRUE),
((SELECT id FROM categories WHERE name = 'Ecología'), 'Informe Impacto', 'PDF de impacto ambiental.', TRUE),
((SELECT id FROM categories WHERE name = 'Ecología'), 'Permisos', 'Permisos de alcaldía.', TRUE),
((SELECT id FROM categories WHERE name = 'Cine'), 'Guion Literario', 'PDF del guion.', TRUE);

-- PROYECTOS (IDs manuales, sin OVERRIDING SYSTEM VALUE)
-- Proyecto 1: Tecnología
INSERT INTO projects (id, owner_id, category_id, title, short_description, story_json, goal_amount, duration_days, started_at, deadline_at, approval_status, campaign_status)
VALUES 
(501, 102, (SELECT id FROM categories WHERE name = 'Tecnología'), 
 'EcoBin: El Basurero Inteligente', 
 'Separa residuos con IA.',
 '{"time": 1701234567890, "blocks": [{"type": "paragraph", "data": {"text": "Historia del EcoBin"}}]}',
 50000.00, 45, NOW(), NOW() + INTERVAL '45 days', 'publicado', 'en_progreso');

INSERT INTO project_images (project_id, image_path, original_filename, is_cover) VALUES 
(501, 'uploads/img/tech-cover.jpg', 'ecobin_render.jpg', TRUE);

-- Proyecto 2: Cine
INSERT INTO projects (id, owner_id, category_id, title, short_description, story_json, goal_amount, duration_days, started_at, deadline_at, approval_status, campaign_status)
VALUES 
(502, 106, (SELECT id FROM categories WHERE name = 'Cine'), 
 'Voces del Altiplano', 
 'Documental sobre los Uru-Chipaya.',
 '{"time": 1701234999999, "blocks": [{"type": "paragraph", "data": {"text": "Sinopsis del documental"}}]}',
 15000.00, 60, NULL, NULL, 'en_revision', 'no_iniciada');

INSERT INTO project_images (project_id, image_path, original_filename, is_cover) VALUES 
(502, 'uploads/img/cine-cover.jpg', 'poster.jpg', TRUE);

-- Proyecto 3: Ecología
INSERT INTO projects (id, owner_id, category_id, title, short_description, story_json, goal_amount, duration_days, started_at, deadline_at, approval_status, campaign_status)
VALUES 
(503, 107, (SELECT id FROM categories WHERE name = 'Ecología'), 
 'Reforestación Urbana', 
 '500 árboles para la ciudad.',
 '{"time": 1709876543210, "blocks": [{"type": "paragraph", "data": {"text": "Plan de reforestación"}}]}',
 8500.00, 30, NULL, NULL, 'observado', 'no_iniciada');

(503, 'uploads/img/eco-cover.jpg', 'arboles.jpg', TRUE);

-- Proyecto 4: Tecnología (Nuevo)
INSERT INTO projects (id, owner_id, category_id, title, short_description, story_json, goal_amount, duration_days, started_at, deadline_at, approval_status, campaign_status, visit_count)
VALUES 
(504, 108, 1, 'Gadget Revolution', 'Un dispositivo futurista que cambiará tu vida.', '{}', 50000.00, 45, NOW(), NOW() + INTERVAL '45 days', 'publicado', 'en_progreso', 120);

INSERT INTO project_images (project_id, image_path, original_filename, is_cover) VALUES 
(504, 'uploads/img/tech_cover.png', 'tech_cover.png', TRUE);

-- Proyecto 5: Ecología (Nuevo)
INSERT INTO projects (id, owner_id, category_id, title, short_description, story_json, goal_amount, duration_days, started_at, deadline_at, approval_status, campaign_status, visit_count)
VALUES 
(505, 109, 5, 'Reforest Amazonas', 'Plantando árboles para salvar el pulmón del mundo.', '{}', 10000.00, 60, NOW(), NOW() + INTERVAL '60 days', 'publicado', 'en_progreso', 85);

INSERT INTO project_images (project_id, image_path, original_filename, is_cover) VALUES 
(505, 'uploads/img/eco_cover.png', 'eco_cover.png', TRUE);

-- Feedback Admin
INSERT INTO project_observations (project_id, admin_id, observation_json) VALUES 
(503, 101, '{"blocks": [{"type": "paragraph", "data": {"text": "Faltan permisos municipales."}}]}');


-- 6. AJUSTE FINAL DE SECUENCIAS (Crucial después de insertar IDs manuales)
-- =============================================================================
SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('category_requirements_id_seq', (SELECT MAX(id) FROM category_requirements));

-- =============================================================================
-- 7. SIMULACIÓN DE DONACIONES
-- =============================================================================

-- Donación 1: Diego (User 106) apoya el proyecto EcoBin (Project 501)
-- ESTADO: 'pagado' -> Esto DEBE sumar a la meta.
INSERT INTO donations (project_id, user_id, amount, payment_proof_url, status, created_at)
VALUES 
(501, 106, 150.00, 'https://stripe.com/receipt/ch_12345ABC', 'pagado', NOW()); ---Donacion de ejemplo la url no representara la url que usaremos en el backend

-- Donación 2: Valentina (User 107) intenta apoyar el proyecto EcoBin (Project 501)
-- ESTADO: 'pendiente' -> Esto NO DEBE sumar a la meta todavía (fallo de tarjeta, etc).
INSERT INTO donations (project_id, user_id, amount, payment_proof_url, status, created_at)
VALUES 
(501, 107, 500.00, NULL, 'pendiente', NOW());

-- Donación 3: Juan Perez (User 108) a Reforest Amazonas (Project 505)
INSERT INTO donations (project_id, user_id, amount, payment_proof_url, status, created_at)
VALUES 
(505, 108, 1500.00, NULL, 'pagado', NOW());


INSERT INTO saved_projects (user_id, project_id) VALUES (102, 501);
INSERT INTO saved_projects (user_id, project_id) VALUES (109, 504);