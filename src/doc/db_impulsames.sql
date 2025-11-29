-- ====================================================================================
-- PLATAFORMA IMPULSAME - DDL FINAL COMENTADO
-- Descripción: Esquema optimizado para Borradores, Archivos UUID y Editor.js
-- ====================================================================================

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
SET search_path TO public;

-- 1. ENUMS (ESTADOS Y TIPOS)
-- ====================================================================================
-- Definen las reglas de negocio estrictas para evitar datos inválidos.

-- Roles: Quién entra al sistema.
CREATE TYPE role_enum AS ENUM ('usuario', 'admin');

-- Status Usuario: Para manejar el bloqueo o la falta de activación por correo.
CREATE TYPE user_status_enum AS ENUM ('inactivo', 'activo', 'bloqueado');

-- Propósito del Token: Para saber si el código es para activar cuenta o recuperar pass.
CREATE TYPE token_purpose_enum AS ENUM ('verificacion_email', 'recuperacion_password');

-- Flujo del Proyecto: Controla la máquina de estados principal.
CREATE TYPE approval_status_enum AS ENUM ('borrador', 'en_revision', 'observado', 'publicado', 'rechazado');

-- Estado Campaña: Controla si se puede donar o no.
CREATE TYPE campaign_status_enum AS ENUM ('no_iniciada', 'en_progreso', 'en_pausa', 'finalizada');

-- Estado Donación: Para diferenciar intentos fallidos de pagos reales.
CREATE TYPE donation_status_enum AS ENUM ('pendiente', 'pagado');


-- 2. USUARIOS Y SEGURIDAD
-- ====================================================================================

-- Tabla: USERS
-- Almacena la información credencial. 
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    
    -- Se recomienda guardar el email en minúsculas desde el backend.
    email VARCHAR(150) NOT NULL UNIQUE,
    
    -- NOTA: Se define como TEXT. Puedes guardar la contraseña plana o hasheada.
    password TEXT NOT NULL,
    
    role role_enum NOT NULL DEFAULT 'usuario',
    status user_status_enum NOT NULL DEFAULT 'inactivo', -- Nace inactivo hasta verificar email
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: USER_TOKENS
-- Almacena los códigos temporales de 5 dígitos.
CREATE TABLE user_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purpose token_purpose_enum NOT NULL,
    
    -- El código de 5 dígitos (Ej: 12345)
    code CHAR(5) NOT NULL CHECK (code ~ '^[0-9]{5}$'), 
    
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    
    -- CAMBIO SOLICITADO: Expiración de 5 minutos por seguridad.
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '5 minutes') NOT NULL,
    
    used_at TIMESTAMP -- Si no es NULL, el token ya fue gastado.
);
CREATE INDEX idx_user_tokens_active ON user_tokens(user_id) WHERE used_at IS NULL;


-- 3. GESTIÓN DE PROYECTOS (CORE)
-- ====================================================================================

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- Ej: Tecnología, Salud, Arte
    description TEXT
);

-- Tabla: PROJECTS
-- Diseñada para soportar "Guardar Borrador". Muchos campos permiten NULL.
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    -- PASO 1: Datos mínimos para existir
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title VARCHAR(150) NOT NULL, 
    
    -- PASO 2: Historia y Descripción
    -- 'short_description': Resumen para las tarjetas (Cards).
    short_description VARCHAR(255),
    
    -- 'story_json': Aquí se guarda el objeto JSON crudo de Editor.js.
    -- Al ser JSONB, la DB no se rompe si guardas estructuras complejas.
    story_json JSONB DEFAULT '{}', 
    
    -- PASO 3: Financiación
    -- 'goal_amount': Meta en dinero. Puede ser NULL mientras sea borrador.
    goal_amount NUMERIC(12, 2) CHECK (goal_amount IS NULL OR goal_amount > 0),
    
    -- 'duration_days': Cuántos días durará (Ej: 30). El usuario lo elige al crear.
    duration_days INTEGER CHECK (duration_days IS NULL OR (duration_days BETWEEN 1 AND 90)),
    
    -- FECHAS REALES:
    -- Estas fechas NO se llenan al crear el proyecto. 
    -- Se llenan automáticamnete cuando el usuario da click en "Iniciar Campaña".
    started_at TIMESTAMP,
    deadline_at TIMESTAMP, 

    -- ESTADOS:
    approval_status approval_status_enum NOT NULL DEFAULT 'borrador',
    campaign_status campaign_status_enum NOT NULL DEFAULT 'no_iniciada',
    
    rejection_reason TEXT, -- Resumen rápido de rechazo (opcional)
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP -- Soft Delete (Papelera)
);

-- Tabla: PROJECT_IMAGES
-- Almacena portada y galería. Usa UUID para el disco y nombre original para referencia.
CREATE TABLE project_images (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    image_path VARCHAR(255) NOT NULL,      -- Ej: "uploads/img/550e8400.jpg"
    original_filename VARCHAR(255),        -- Ej: "mifoto_vacaciones.jpg"
    
    is_cover BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE = Es la portada
    created_at TIMESTAMP DEFAULT NOW()
);
-- Regla: Solo una portada activa por proyecto.
CREATE UNIQUE INDEX ux_project_cover ON project_images(project_id) WHERE is_cover = TRUE;


-- 4. REQUISITOS Y ARCHIVOS
-- ====================================================================================

-- Configuración: Qué pide cada categoría (Definido por Admin)
CREATE TABLE category_requirements (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL, -- Ej: "Plan de Negocios"
    description TEXT,            -- Instrucciones
    is_required BOOLEAN DEFAULT TRUE
);

-- Respuestas: Los archivos que sube el usuario
CREATE TABLE project_requirements_answers (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    requirement_id INTEGER NOT NULL REFERENCES category_requirements(id) ON DELETE RESTRICT,
    
    -- Trazabilidad del archivo
    file_path VARCHAR(255) NOT NULL,         -- UUID en servidor
    original_filename VARCHAR(255) NOT NULL, -- Nombre real para el Admin
    mime_type VARCHAR(100),                  -- Para iconos (pdf, doc, etc.)
    
    submitted_at TIMESTAMP DEFAULT NOW()
);


-- 5. INTERACCIÓN Y FEEDBACK
-- ====================================================================================

-- Donaciones
CREATE TABLE donations (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_proof_url TEXT, -- Comprobante
    status donation_status_enum NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Favoritos
CREATE TABLE saved_projects (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, project_id)
);

-- Observaciones (Feedback del Admin usando Editor.js)
CREATE TABLE project_observations (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    admin_id INTEGER NOT NULL REFERENCES users(id),
    
    -- CAMBIO: Usamos JSONB para guardar el feedback rico (negritas, listas) de Editor.js
    observation_json JSONB NOT NULL DEFAULT '{}', 
    
    created_at TIMESTAMP DEFAULT NOW()
);


-- 6. VISTA INTELIGENTE (FRONTEND HELPER)
-- ====================================================================================
-- Esta vista hace todos los cálculos matemáticos por ti.
-- Úsala en el Home y Explorar Proyectos.

CREATE OR REPLACE VIEW project_details_view AS
SELECT 
    p.id,
    p.title,
    p.short_description,
    p.category_id,
    c.name as category_name,
    p.owner_id,
    u.full_name as owner_name,
    p.goal_amount,
    p.duration_days,
    p.started_at,
    p.deadline_at,
    p.approval_status,
    p.campaign_status,
    p.created_at,
    
    -- Portada: Busca la marcada como cover, si no hay, toma la primera.
    COALESCE(
        (SELECT image_path FROM project_images WHERE project_id = p.id AND is_cover = TRUE LIMIT 1),
        (SELECT image_path FROM project_images WHERE project_id = p.id LIMIT 1)
    ) as cover_image,

    -- Dinero Recaudado (Solo confirmados)
    COALESCE(SUM(d.amount) FILTER (WHERE d.status = 'pagado'), 0) as total_collected,
    
    -- Cantidad de Donantes
    COUNT(DISTINCT d.user_id) FILTER (WHERE d.status = 'pagado') as backers_count,

    -- Porcentaje de Progreso (Evita división por cero)
    CASE 
        WHEN p.goal_amount IS NOT NULL AND p.goal_amount > 0 THEN
            ROUND((COALESCE(SUM(d.amount) FILTER (WHERE d.status = 'pagado'), 0) / p.goal_amount) * 100, 2)
        ELSE 0
    END as progress_percentage,

    -- Días Restantes (Lógica de cuenta regresiva)
    CASE 
        WHEN p.deadline_at IS NULL THEN p.duration_days -- No iniciada
        WHEN NOW() > p.deadline_at THEN 0               -- Finalizada
        ELSE EXTRACT(DAY FROM (p.deadline_at - NOW()))::INTEGER -- En curso
    END as days_remaining

FROM projects p
JOIN users u ON p.owner_id = u.id
JOIN categories c ON p.category_id = c.id
LEFT JOIN donations d ON p.id = d.project_id
WHERE p.deleted_at IS NULL
GROUP BY p.id, u.full_name, c.name;