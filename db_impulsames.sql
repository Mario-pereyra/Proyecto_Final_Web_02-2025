-- ─────────────────────────────────────────────────────────────────────────────
-- Extensiones útiles
-- ─────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;    -- emails case-insensitive

-- ─────────────────────────────────────────────────────────────────────────────
-- Tipos ENUM
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum') THEN
        CREATE TYPE role_enum AS ENUM ('usuario','admin');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status_enum') THEN
        CREATE TYPE user_status_enum AS ENUM ('inactivo','activo','bloqueado');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_approval_status_enum') THEN
        CREATE TYPE project_approval_status_enum AS ENUM ('borrador','en_revision','observado','publicado','rechazado');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_state_enum') THEN
        CREATE TYPE campaign_state_enum AS ENUM ('no_iniciada','en_progreso','en_pausa','finalizada');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'donation_status_enum') THEN
        CREATE TYPE donation_status_enum AS ENUM ('pendiente','confirmado','fallido');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'token_purpose_enum') THEN
        CREATE TYPE token_purpose_enum AS ENUM ('verificacion_email','reset_password');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'requirement_type_enum') THEN
        CREATE TYPE requirement_type_enum AS ENUM ('texto','largo','numero','archivo','url','booleano','opcion','video');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action_enum') THEN
        CREATE TYPE audit_action_enum AS ENUM (
            'proyecto_en_revision',
            'proyecto_observado',
            'proyecto_publicado',
            'proyecto_rechazado',
            'usuario_bloqueado',
            'usuario_desbloqueado'
        );
    END IF;
END$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Usuarios
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id               BIGSERIAL PRIMARY KEY,
    full_name        VARCHAR(120)       NOT NULL,
    email            CITEXT             NOT NULL,
    password_plain   TEXT               NOT NULL, -- ⚠️ recomienda usar password_hash en producción
    role             role_enum          NOT NULL DEFAULT 'usuario',
    status           user_status_enum   NOT NULL DEFAULT 'inactivo',
    UNIQUE (email)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Tokens de verificación / reset (código 5 dígitos)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_tokens (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purpose     token_purpose_enum NOT NULL,
    code        CHAR(5) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at  TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
    used_at     TIMESTAMP NULL,
    CONSTRAINT chk_code_digits CHECK (code ~ '^[0-9]{5}$')
);
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_purpose ON user_tokens(user_id, purpose);
CREATE INDEX IF NOT EXISTS idx_user_tokens_active ON user_tokens(user_id) WHERE used_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- Categorías
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(80)  NOT NULL UNIQUE,
    description TEXT         NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Requisitos por categoría (definición de campos dinámicos)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS category_requirements (
    id               SERIAL PRIMARY KEY,
    category_id      INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    code             VARCHAR(50)  NOT NULL,  -- ej. "ruc", "doc_legal"
    label            VARCHAR(120) NOT NULL,
    type             requirement_type_enum NOT NULL,
    required         BOOLEAN NOT NULL DEFAULT TRUE,
    position         SMALLINT NOT NULL DEFAULT 1,
    options_json     JSONB NULL,     -- ej. opciones de un select
    validations_json JSONB NULL,     -- ej. regex, min/max, etc.
    -- Flags de retiro / ciclo de vida
    is_active        BOOLEAN   NOT NULL DEFAULT TRUE,
    retired_at       TIMESTAMP NULL,
    retire_reason    TEXT      NULL
);
-- Unicidad solo para requisitos ACTIVOS por categoría+code
CREATE UNIQUE INDEX IF NOT EXISTS ux_catreq_active_code
  ON category_requirements(category_id, code)
  WHERE is_active = TRUE;

-- ─────────────────────────────────────────────────────────────────────────────
-- Proyectos (incluye campaña y deadline)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
    id                  BIGSERIAL PRIMARY KEY,
    owner_id            BIGINT  NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    category_id         INT     NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title               VARCHAR(140) NOT NULL,
    summary             VARCHAR(300) NULL,
    description_json    JSONB   NOT NULL DEFAULT '{}'::jsonb, -- payload de editor.js
    goal_amount         DECIMAL(12,2) NOT NULL CHECK (goal_amount >= 0.01),
    deadline            DATE    NOT NULL,
    approval_status     project_approval_status_enum NOT NULL DEFAULT 'borrador',
    campaign_state      campaign_state_enum          NOT NULL DEFAULT 'no_iniciada',
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    published_at        TIMESTAMP NULL,
    deleted_at          TIMESTAMP NULL              -- soft delete para KPIs
);
CREATE INDEX IF NOT EXISTS idx_projects_owner       ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_category    ON projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_status      ON projects(approval_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_deadline    ON projects(deadline)        WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_created_at  ON projects(created_at)      WHERE deleted_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- Respuestas/adjuntos de requisitos por proyecto
--  * FK a requirement: ON DELETE RESTRICT (NO borrar respuestas al borrar requisito)
--  * FK a project:     ON DELETE CASCADE (al borrar proyecto, se van sus respuestas)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_requirement_answers (
    id              BIGSERIAL PRIMARY KEY,
    project_id      BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    requirement_id  INT    NOT NULL REFERENCES category_requirements(id) ON DELETE RESTRICT,
    value_text      TEXT   NULL,
    value_json      JSONB  NULL,
    file_url        TEXT   NULL,
    UNIQUE (project_id, requirement_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Observaciones de admins (historial)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_observations (
    id               BIGSERIAL PRIMARY KEY,
    project_id       BIGINT  NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    admin_id         BIGINT  NOT NULL REFERENCES users(id)    ON DELETE RESTRICT,
    title            VARCHAR(140) NOT NULL,
    description_json JSONB NOT NULL,  -- contenido rico (editor.js)
    created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_proj_obs_project ON project_observations(project_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Imágenes de proyecto (máximo 10 por proyecto; portada única)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_images (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    url         TEXT   NOT NULL,
    position    SMALLINT NOT NULL CHECK (position BETWEEN 1 AND 10),
    is_cover    BOOLEAN NOT NULL DEFAULT FALSE,
    alt_text    VARCHAR(140) NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (project_id, position)
);
-- Una sola portada por proyecto
CREATE UNIQUE INDEX IF NOT EXISTS ux_proj_images_cover
    ON project_images(project_id)
    WHERE is_cover = TRUE;

-- ─────────────────────────────────────────────────────────────────────────────
-- Donaciones (aportes)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donations (
    id                 BIGSERIAL PRIMARY KEY,
    user_id            BIGINT  NOT NULL REFERENCES users(id)    ON DELETE RESTRICT,
    project_id         BIGINT  NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    amount             DECIMAL(12,2) NOT NULL CHECK (amount >= 0.01),
    status             donation_status_enum NOT NULL,
    payment_method     VARCHAR(30) NOT NULL DEFAULT 'qr',
    payment_reference  VARCHAR(100) NULL,
    gateway_response   JSONB NULL,
    created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    confirmed_at       TIMESTAMP NULL
);
CREATE INDEX IF NOT EXISTS idx_donations_project_status ON donations(project_id, status);
CREATE INDEX IF NOT EXISTS idx_donations_user           ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_created        ON donations(created_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- Favoritos (guardados)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
    user_id     BIGINT NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    project_id  BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, project_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Auditoría mínima (quién observó/publicó/rechazó/bloqueó)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    actor_user_id   BIGINT NOT NULL REFERENCES users(id)    ON DELETE RESTRICT, -- admin o dueño que actúa
    action          audit_action_enum NOT NULL,
    project_id      BIGINT NULL REFERENCES projects(id)     ON DELETE CASCADE,
    target_user_id  BIGINT NULL REFERENCES users(id)        ON DELETE RESTRICT,
    details_json    JSONB  NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action, created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- Vista de métricas / listados
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW project_stats AS
SELECT
    p.id AS project_id,
    p.title,
    p.category_id,
    p.owner_id,
    p.goal_amount,
    p.deadline,
    p.approval_status,
    p.campaign_state,
    p.created_at,
    COALESCE(SUM(CASE WHEN d.status = 'confirmado' THEN d.amount ELSE 0 END), 0) AS total_confirmed_amount,
    COUNT(DISTINCT CASE WHEN d.status = 'confirmado' THEN d.user_id END)      AS supporters_count,
    CASE
        WHEN p.goal_amount > 0 THEN ROUND( (COALESCE(SUM(CASE WHEN d.status = 'confirmado' THEN d.amount ELSE 0 END),0) / p.goal_amount) * 100, 2)
        ELSE 0
    END AS progress_percent,
    CASE
        WHEN p.goal_amount > 0 AND COALESCE(SUM(CASE WHEN d.status='confirmado' THEN d.amount END),0) >= p.goal_amount
            THEN 'completamente_financiado'
        WHEN p.goal_amount > 0 AND (COALESCE(SUM(CASE WHEN d.status='confirmado' THEN d.amount END),0) / p.goal_amount) < 0.25
            THEN 'menor_25'
        WHEN p.goal_amount > 0 AND (COALESCE(SUM(CASE WHEN d.status='confirmado' THEN d.amount END),0) / p.goal_amount) BETWEEN 0.25 AND 0.75
            THEN 'entre_25_y_75'
        WHEN p.goal_amount > 0 AND (COALESCE(SUM(CASE WHEN d.status='confirmado' THEN d.amount END),0) / p.goal_amount) > 0.75
            THEN 'mayor_75'
        ELSE 'sin_meta'
    END AS progress_bucket
FROM projects p
LEFT JOIN donations d ON d.project_id = p.id
WHERE p.deleted_at IS NULL
GROUP BY p.id;
