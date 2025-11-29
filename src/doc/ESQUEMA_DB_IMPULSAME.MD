-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION pg_database_owner;

COMMENT ON SCHEMA public IS 'standard public schema';

-- DROP TYPE public.audit_action_enum;

CREATE TYPE public.audit_action_enum AS ENUM (
	'proyecto_en_revision',
	'proyecto_observado',
	'proyecto_publicado',
	'proyecto_rechazado',
	'usuario_bloqueado',
	'usuario_desbloqueado');

-- DROP TYPE public.campaign_state_enum;

CREATE TYPE public.campaign_state_enum AS ENUM (
	'no_iniciada',
	'en_progreso',
	'en_pausa',
	'finalizada');

-- DROP TYPE public.citext;

CREATE TYPE public.citext (
	INPUT = citextin,
	OUTPUT = citextout,
	RECEIVE = citextrecv,
	SEND = citextsend,
	ALIGNMENT = 4,
	STORAGE = any,
	CATEGORY = S,
	DELIMITER = ',',
	COLLATABLE = true);

-- DROP TYPE public.donation_status_enum;

CREATE TYPE public.donation_status_enum AS ENUM (
	'pendiente',
	'confirmado',
	'fallido');

-- DROP TYPE public.project_approval_status_enum;

CREATE TYPE public.project_approval_status_enum AS ENUM (
	'borrador',
	'en_revision',
	'observado',
	'publicado',
	'rechazado');

-- DROP TYPE public.requirement_type_enum;

CREATE TYPE public.requirement_type_enum AS ENUM (
	'texto',
	'largo',
	'numero',
	'archivo',
	'url',
	'booleano',
	'opcion',
	'video');

-- DROP TYPE public.role_enum;

CREATE TYPE public.role_enum AS ENUM (
	'usuario',
	'admin');

-- DROP TYPE public.token_purpose_enum;

CREATE TYPE public.token_purpose_enum AS ENUM (
	'verificacion_email',
	'reset_password');

-- DROP TYPE public.user_status_enum;

CREATE TYPE public.user_status_enum AS ENUM (
	'inactivo',
	'activo',
	'bloqueado');

-- DROP SEQUENCE public.audit_logs_id_seq;

CREATE SEQUENCE public.audit_logs_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.audit_logs_id_seq TO postgres;

-- DROP SEQUENCE public.categories_id_seq;

CREATE SEQUENCE public.categories_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.categories_id_seq TO postgres;

-- DROP SEQUENCE public.category_requirements_id_seq;

CREATE SEQUENCE public.category_requirements_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.category_requirements_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.category_requirements_id_seq TO postgres;

-- DROP SEQUENCE public.donations_id_seq;

CREATE SEQUENCE public.donations_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.donations_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.donations_id_seq TO postgres;

-- DROP SEQUENCE public.project_images_id_seq;

CREATE SEQUENCE public.project_images_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.project_images_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.project_images_id_seq TO postgres;

-- DROP SEQUENCE public.project_observations_id_seq;

CREATE SEQUENCE public.project_observations_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.project_observations_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.project_observations_id_seq TO postgres;

-- DROP SEQUENCE public.project_requirement_answers_id_seq;

CREATE SEQUENCE public.project_requirement_answers_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.project_requirement_answers_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.project_requirement_answers_id_seq TO postgres;

-- DROP SEQUENCE public.projects_id_seq;

CREATE SEQUENCE public.projects_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.projects_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.projects_id_seq TO postgres;

-- DROP SEQUENCE public.user_tokens_id_seq;

CREATE SEQUENCE public.user_tokens_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.user_tokens_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.user_tokens_id_seq TO postgres;

-- DROP SEQUENCE public.users_id_seq;

CREATE SEQUENCE public.users_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

-- Permissions

ALTER SEQUENCE public.users_id_seq OWNER TO postgres;
GRANT ALL ON SEQUENCE public.users_id_seq TO postgres;
-- public.categories definition

-- Drop table

-- DROP TABLE public.categories;

CREATE TABLE public.categories ( id serial4 NOT NULL, "name" varchar(80) NOT NULL, description text NULL, CONSTRAINT categories_name_key UNIQUE (name), CONSTRAINT categories_pkey PRIMARY KEY (id));

-- Permissions

ALTER TABLE public.categories OWNER TO postgres;
GRANT ALL ON TABLE public.categories TO postgres;


-- public.project_images_backup_before_bigserial definition

-- Drop table

-- DROP TABLE public.project_images_backup_before_bigserial;

CREATE TABLE public.project_images_backup_before_bigserial ( id uuid NULL, project_id int8 NULL, url text NULL, "position" int2 NULL, is_cover bool NULL, alt_text varchar(140) NULL, created_at timestamp NULL);

-- Permissions

ALTER TABLE public.project_images_backup_before_bigserial OWNER TO postgres;
GRANT ALL ON TABLE public.project_images_backup_before_bigserial TO postgres;


-- public.project_images_backup_pre_drop definition

-- Drop table

-- DROP TABLE public.project_images_backup_pre_drop;

CREATE TABLE public.project_images_backup_pre_drop ( id_uuid uuid NULL, project_id int8 NULL, url text NULL, "position" int2 NULL, is_cover bool NULL, alt_text varchar(140) NULL, created_at timestamp NULL, id int8 NULL);

-- Permissions

ALTER TABLE public.project_images_backup_pre_drop OWNER TO postgres;
GRANT ALL ON TABLE public.project_images_backup_pre_drop TO postgres;


-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users ( id bigserial NOT NULL, full_name varchar(120) NOT NULL, email public.citext NOT NULL, "password" text NOT NULL, "role" public.role_enum DEFAULT 'usuario'::role_enum NOT NULL, status public.user_status_enum DEFAULT 'inactivo'::user_status_enum NOT NULL, CONSTRAINT users_email_key UNIQUE (email), CONSTRAINT users_pkey PRIMARY KEY (id));

-- Permissions

ALTER TABLE public.users OWNER TO postgres;
GRANT ALL ON TABLE public.users TO postgres;


-- public.category_requirements definition

-- Drop table

-- DROP TABLE public.category_requirements;

CREATE TABLE public.category_requirements ( id serial4 NOT NULL, category_id int4 NOT NULL, code varchar(50) NOT NULL, "label" varchar(120) NOT NULL, "type" public.requirement_type_enum NOT NULL, required bool DEFAULT true NOT NULL, "position" int2 DEFAULT 1 NOT NULL, options_json jsonb NULL, validations_json jsonb NULL, is_active bool DEFAULT true NOT NULL, retired_at timestamp NULL, retire_reason text NULL, CONSTRAINT category_requirements_pkey PRIMARY KEY (id), CONSTRAINT category_requirements_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE);
CREATE UNIQUE INDEX ux_catreq_active_code ON public.category_requirements USING btree (category_id, code) WHERE (is_active = true);

-- Permissions

ALTER TABLE public.category_requirements OWNER TO postgres;
GRANT ALL ON TABLE public.category_requirements TO postgres;


-- public.projects definition

-- Drop table

-- DROP TABLE public.projects;

CREATE TABLE public.projects ( id bigserial NOT NULL, owner_id int8 NOT NULL, category_id int4 NOT NULL, title varchar(140) NOT NULL, summary varchar(300) NULL, description_json jsonb DEFAULT '{}'::jsonb NOT NULL, goal_amount numeric(12, 2) NOT NULL, end_date date NOT NULL, approval_status public.project_approval_status_enum DEFAULT 'borrador'::project_approval_status_enum NOT NULL, campaign_state public.campaign_state_enum DEFAULT 'no_iniciada'::campaign_state_enum NOT NULL, created_at timestamp DEFAULT now() NOT NULL, published_at timestamp NULL, deleted_at timestamp NULL, start_date date NOT NULL, CONSTRAINT projects_goal_amount_check CHECK ((goal_amount >= 0.01)), CONSTRAINT projects_pkey PRIMARY KEY (id), CONSTRAINT projects_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT, CONSTRAINT projects_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE RESTRICT);
CREATE INDEX idx_projects_category ON public.projects USING btree (category_id);
CREATE INDEX idx_projects_created_at ON public.projects USING btree (created_at) WHERE (deleted_at IS NULL);
CREATE INDEX idx_projects_deadline ON public.projects USING btree (end_date) WHERE (deleted_at IS NULL);
CREATE INDEX idx_projects_owner ON public.projects USING btree (owner_id);
CREATE INDEX idx_projects_status ON public.projects USING btree (approval_status) WHERE (deleted_at IS NULL);

-- Permissions

ALTER TABLE public.projects OWNER TO postgres;
GRANT ALL ON TABLE public.projects TO postgres;


-- public.user_tokens definition

-- Drop table

-- DROP TABLE public.user_tokens;

CREATE TABLE public.user_tokens ( id bigserial NOT NULL, user_id int8 NOT NULL, purpose public.token_purpose_enum NOT NULL, code bpchar(5) NOT NULL, created_at timestamp DEFAULT now() NOT NULL, expires_at timestamp DEFAULT (now() + '00:15:00'::interval) NOT NULL, used_at timestamp NULL, CONSTRAINT chk_code_digits CHECK ((code ~ '^[0-9]{5}$'::text)), CONSTRAINT user_tokens_pkey PRIMARY KEY (id), CONSTRAINT user_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE);
CREATE INDEX idx_user_tokens_active ON public.user_tokens USING btree (user_id) WHERE (used_at IS NULL);
CREATE INDEX idx_user_tokens_user_purpose ON public.user_tokens USING btree (user_id, purpose);

-- Permissions

ALTER TABLE public.user_tokens OWNER TO postgres;
GRANT ALL ON TABLE public.user_tokens TO postgres;


-- public.audit_logs definition

-- Drop table

-- DROP TABLE public.audit_logs;

CREATE TABLE public.audit_logs ( id bigserial NOT NULL, actor_user_id int8 NOT NULL, "action" public.audit_action_enum NOT NULL, project_id int8 NULL, target_user_id int8 NULL, details_json jsonb NULL, created_at timestamp DEFAULT now() NOT NULL, CONSTRAINT audit_logs_pkey PRIMARY KEY (id), CONSTRAINT audit_logs_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES public.users(id) ON DELETE RESTRICT, CONSTRAINT audit_logs_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE, CONSTRAINT audit_logs_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES public.users(id) ON DELETE RESTRICT);
CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action, created_at DESC);

-- Permissions

ALTER TABLE public.audit_logs OWNER TO postgres;
GRANT ALL ON TABLE public.audit_logs TO postgres;


-- public.donations definition

-- Drop table

-- DROP TABLE public.donations;

CREATE TABLE public.donations ( id bigserial NOT NULL, user_id int8 NOT NULL, project_id int8 NOT NULL, amount numeric(12, 2) NOT NULL, status public.donation_status_enum NOT NULL, payment_method varchar(30) DEFAULT 'qr'::character varying NOT NULL, payment_reference varchar(100) NULL, gateway_response jsonb NULL, created_at timestamp DEFAULT now() NOT NULL, confirmed_at timestamp NULL, CONSTRAINT donations_amount_check CHECK ((amount >= 0.01)), CONSTRAINT donations_pkey PRIMARY KEY (id), CONSTRAINT donations_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE RESTRICT, CONSTRAINT donations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT);
CREATE INDEX idx_donations_created ON public.donations USING btree (created_at);
CREATE INDEX idx_donations_project_status ON public.donations USING btree (project_id, status);
CREATE INDEX idx_donations_user ON public.donations USING btree (user_id);

-- Permissions

ALTER TABLE public.donations OWNER TO postgres;
GRANT ALL ON TABLE public.donations TO postgres;


-- public.favorites definition

-- Drop table

-- DROP TABLE public.favorites;

CREATE TABLE public.favorites ( user_id int8 NOT NULL, project_id int8 NOT NULL, created_at timestamp DEFAULT now() NOT NULL, CONSTRAINT favorites_pkey PRIMARY KEY (user_id, project_id), CONSTRAINT favorites_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE, CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE);

-- Permissions

ALTER TABLE public.favorites OWNER TO postgres;
GRANT ALL ON TABLE public.favorites TO postgres;


-- public.project_images definition

-- Drop table

-- DROP TABLE public.project_images;

CREATE TABLE public.project_images ( id bigserial NOT NULL, project_id int8 NOT NULL, url text NOT NULL, "position" int2 NOT NULL, is_cover bool DEFAULT false NOT NULL, alt_text varchar(140) NULL, created_at timestamp DEFAULT now() NOT NULL, original_filename varchar(255) NULL, file_size int4 NULL, mime_type varchar(100) NULL, CONSTRAINT project_images_pkey PRIMARY KEY (id), CONSTRAINT project_images_position_check CHECK ((("position" >= 1) AND ("position" <= 10))), CONSTRAINT project_images_project_id_position_key UNIQUE (project_id, "position"), CONSTRAINT project_images_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE);
CREATE UNIQUE INDEX ux_proj_images_cover ON public.project_images USING btree (project_id) WHERE (is_cover = true);

-- Permissions

ALTER TABLE public.project_images OWNER TO postgres;
GRANT ALL ON TABLE public.project_images TO postgres;


-- public.project_observations definition

-- Drop table

-- DROP TABLE public.project_observations;

CREATE TABLE public.project_observations ( id bigserial NOT NULL, project_id int8 NOT NULL, admin_id int8 NOT NULL, title varchar(140) NOT NULL, description_json jsonb NOT NULL, created_at timestamp DEFAULT now() NOT NULL, CONSTRAINT project_observations_pkey PRIMARY KEY (id), CONSTRAINT project_observations_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id) ON DELETE RESTRICT, CONSTRAINT project_observations_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE);
CREATE INDEX idx_proj_obs_project ON public.project_observations USING btree (project_id);

-- Permissions

ALTER TABLE public.project_observations OWNER TO postgres;
GRANT ALL ON TABLE public.project_observations TO postgres;


-- public.project_requirement_answers definition

-- Drop table

-- DROP TABLE public.project_requirement_answers;

CREATE TABLE public.project_requirement_answers ( id bigserial NOT NULL, project_id int8 NOT NULL, requirement_id int4 NOT NULL, value_text text NULL, value_json jsonb NULL, file_url text NULL, original_filename varchar(255) NULL, file_size int4 NULL, mime_type varchar(100) NULL, CONSTRAINT project_requirement_answers_pkey PRIMARY KEY (id), CONSTRAINT project_requirement_answers_project_id_requirement_id_key UNIQUE (project_id, requirement_id), CONSTRAINT project_requirement_answers_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE, CONSTRAINT project_requirement_answers_requirement_id_fkey FOREIGN KEY (requirement_id) REFERENCES public.category_requirements(id) ON DELETE RESTRICT);

-- Permissions

ALTER TABLE public.project_requirement_answers OWNER TO postgres;
GRANT ALL ON TABLE public.project_requirement_answers TO postgres;


-- public.project_stats source

CREATE OR REPLACE VIEW public.project_stats
AS SELECT p.id AS project_id,
    p.title,
    p.category_id,
    p.owner_id,
    p.goal_amount,
    p.end_date,
    p.approval_status,
    p.campaign_state,
    p.created_at,
    COALESCE(sum(
        CASE
            WHEN d.status = 'confirmado'::donation_status_enum THEN d.amount
            ELSE 0::numeric
        END), 0::numeric) AS total_confirmed_amount,
    count(DISTINCT
        CASE
            WHEN d.status = 'confirmado'::donation_status_enum THEN d.user_id
            ELSE NULL::bigint
        END) AS supporters_count,
        CASE
            WHEN p.goal_amount > 0::numeric THEN round(COALESCE(sum(
            CASE
                WHEN d.status = 'confirmado'::donation_status_enum THEN d.amount
                ELSE 0::numeric
            END), 0::numeric) / p.goal_amount * 100::numeric, 2)
            ELSE 0::numeric
        END AS progress_percent,
        CASE
            WHEN p.goal_amount > 0::numeric AND COALESCE(sum(
            CASE
                WHEN d.status = 'confirmado'::donation_status_enum THEN d.amount
                ELSE NULL::numeric
            END), 0::numeric) >= p.goal_amount THEN 'completamente_financiado'::text
            WHEN p.goal_amount > 0::numeric AND (COALESCE(sum(
            CASE
                WHEN d.status = 'confirmado'::donation_status_enum THEN d.amount
                ELSE NULL::numeric
            END), 0::numeric) / p.goal_amount) < 0.25 THEN 'menor_25'::text
            WHEN p.goal_amount > 0::numeric AND (COALESCE(sum(
            CASE
                WHEN d.status = 'confirmado'::donation_status_enum THEN d.amount
                ELSE NULL::numeric
            END), 0::numeric) / p.goal_amount) >= 0.25 AND (COALESCE(sum(
            CASE
                WHEN d.status = 'confirmado'::donation_status_enum THEN d.amount
                ELSE NULL::numeric
            END), 0::numeric) / p.goal_amount) <= 0.75 THEN 'entre_25_y_75'::text
            WHEN p.goal_amount > 0::numeric AND (COALESCE(sum(
            CASE
                WHEN d.status = 'confirmado'::donation_status_enum THEN d.amount
                ELSE NULL::numeric
            END), 0::numeric) / p.goal_amount) > 0.75 THEN 'mayor_75'::text
            ELSE 'sin_meta'::text
        END AS progress_bucket
   FROM projects p
     LEFT JOIN donations d ON d.project_id = p.id
  WHERE p.deleted_at IS NULL
  GROUP BY p.id;

-- Permissions

ALTER TABLE public.project_stats OWNER TO postgres;
GRANT ALL ON TABLE public.project_stats TO postgres;



-- DROP FUNCTION public.armor(bytea, _text, _text);

CREATE OR REPLACE FUNCTION public.armor(bytea, text[], text[])
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_armor$function$
;

-- Permissions

ALTER FUNCTION public.armor(bytea, _text, _text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.armor(bytea, _text, _text) TO postgres;

-- DROP FUNCTION public.armor(bytea);

CREATE OR REPLACE FUNCTION public.armor(bytea)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_armor$function$
;

-- Permissions

ALTER FUNCTION public.armor(bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.armor(bytea) TO postgres;

-- DROP FUNCTION public.citext(bpchar);

CREATE OR REPLACE FUNCTION public.citext(character)
 RETURNS citext
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$rtrim1$function$
;

-- Permissions

ALTER FUNCTION public.citext(bpchar) OWNER TO postgres;
GRANT ALL ON FUNCTION public.citext(bpchar) TO postgres;

-- DROP FUNCTION public.citext(bool);

CREATE OR REPLACE FUNCTION public.citext(boolean)
 RETURNS citext
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$booltext$function$
;

-- Permissions

ALTER FUNCTION public.citext(bool) OWNER TO postgres;
GRANT ALL ON FUNCTION public.citext(bool) TO postgres;

-- DROP FUNCTION public.citext(inet);

CREATE OR REPLACE FUNCTION public.citext(inet)
 RETURNS citext
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$network_show$function$
;

-- Permissions

ALTER FUNCTION public.citext(inet) OWNER TO postgres;
GRANT ALL ON FUNCTION public.citext(inet) TO postgres;

-- DROP FUNCTION public.citext_cmp(citext, citext);

CREATE OR REPLACE FUNCTION public.citext_cmp(citext, citext)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/citext', $function$citext_cmp$function$
;

-- Permissions

ALTER FUNCTION public.citext_cmp(citext, citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.citext_cmp(citext, citext) TO postgres;

-- DROP FUNCTION public.citext_eq(citext, citext);

CREATE OR REPLACE FUNCTION public.citext_eq(citext, citext)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/citext', $function$citext_eq$function$
;

-- Permissions

ALTER FUNCTION public.citext_eq(citext, citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.citext_eq(citext, citext) TO postgres;

-- DROP FUNCTION public.citext_ge(citext, citext);

CREATE OR REPLACE FUNCTION public.citext_ge(citext, citext)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/citext', $function$citext_ge$function$
;

-- Permissions

ALTER FUNCTION public.citext_ge(citext, citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.citext_ge(citext, citext) TO postgres;

-- DROP FUNCTION public.citext_gt(citext, citext);

CREATE OR REPLACE FUNCTION public.citext_gt(citext, citext)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/citext', $function$citext_gt$function$
;

-- Permissions

ALTER FUNCTION public.citext_gt(citext, citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.citext_gt(citext, citext) TO postgres;

-- DROP FUNCTION public.citext_hash(citext);

CREATE OR REPLACE FUNCTION public.citext_hash(citext)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/citext', $function$citext_hash$function$
;

-- Permissions

ALTER FUNCTION public.citext_hash(citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.citext_hash(citext) TO postgres;

-- DROP FUNCTION public.citext_hash_extended(citext, int8);

CREATE OR REPLACE FUNCTION public.citext_hash_extended(citext, bigint)
 RETURNS bigint
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/citext', $function$citext_hash_extended$function$
;

-- Permissions

ALTER FUNCTION public.citext_hash_extended(citext, int8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.citext_hash_extended(citext, int8) TO postgres;

-- DROP FUNCTION public.citext_larger(citext, citext);

CREATE OR REPLACE FUNCTION public.citext_larger(citext, citext)
 RETURNS citext
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/citext', $function$citext_larger$function$
;

-- Permissions

ALTER FUNCTION public.citext_larger(citext, citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.citext_larger(citext, citext) TO postgres;

-- DROP FUNCTION public.citext_le(citext, citext);

CREATE OR REPLACE FUNCTION public.citext_le(citext, citext)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/citext', $function$citext_le$function$
;

-- Permissions

ALTER FUNCTION public.citext_le(citext, citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.citext_le(citext, citext) TO postgres;

-- DROP FUNCTION public.citext_lt(citext, citext);

CREATE OR REPLACE FUNCTION public.citext_lt(citext, citext)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/citext', $function$citext_lt$function$
;

-- Permissions

ALTER FUNCTION public.citext_lt(citext, citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.citext_lt(citext, citext) TO postgres;

-- DROP FUNCTION public.citext_ne(citext, citext);

CREATE OR REPLACE FUNCTION public.citext_ne(citext, citext)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/citext', $function$citext_ne$function$
;

-- Permissions

ALTER FUNCTION public.citext_ne(citext, citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.citext_ne(citext, citext) TO postgres;

-- DROP FUNCTION public.citext_pattern_cmp(citext, citext);

CREATE OR REPLACE FUNCTION public.citext_pattern_cmp(citext, citext)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/citext', $function$citext_pattern_cmp$function$
;

-- Permissions

ALTER FUNCTION public.citext_pattern_cmp(citext, citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.citext_pattern_cmp(citext, citext) TO postgres;

-- DROP FUNCTION public.citext_pattern_ge(citext, citext);

CREATE OR REPLACE FUNCTION public.citext_pattern_ge(citext, citext)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/citext', $function$citext_pattern_ge$function$
;

-- Permissions

ALTER FUNCTION public.citext_pattern_ge(citext, citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.citext_pattern_ge(citext, citext) TO postgres;

-- DROP FUNCTION public.citext_pattern_gt(citext, citext);

CREATE OR REPLACE FUNCTION public.citext_pattern_gt(citext, citext)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/citext', $function$citext_pattern_gt$function$
;

-- Permissions

ALTER FUNCTION public.citext_pattern_gt(citext, citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.citext_pattern_gt(citext, citext) TO postgres;

-- DROP FUNCTION public.citext_pattern_le(citext, citext);

CREATE OR REPLACE FUNCTION public.citext_pattern_le(citext, citext)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/citext', $function$citext_pattern_le$function$
;

-- Permissions

ALTER FUNCTION public.citext_pattern_le(citext, citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.citext_pattern_le(citext, citext) TO postgres;

-- DROP FUNCTION public.citext_pattern_lt(citext, citext);

CREATE OR REPLACE FUNCTION public.citext_pattern_lt(citext, citext)
 RETURNS boolean
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/citext', $function$citext_pattern_lt$function$
;

-- Permissions

ALTER FUNCTION public.citext_pattern_lt(citext, citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.citext_pattern_lt(citext, citext) TO postgres;

-- DROP FUNCTION public.citext_smaller(citext, citext);

CREATE OR REPLACE FUNCTION public.citext_smaller(citext, citext)
 RETURNS citext
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/citext', $function$citext_smaller$function$
;

-- Permissions

ALTER FUNCTION public.citext_smaller(citext, citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.citext_smaller(citext, citext) TO postgres;

-- DROP FUNCTION public.citextin(cstring);

CREATE OR REPLACE FUNCTION public.citextin(cstring)
 RETURNS citext
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$textin$function$
;

-- Permissions

ALTER FUNCTION public.citextin(cstring) OWNER TO postgres;
GRANT ALL ON FUNCTION public.citextin(cstring) TO postgres;

-- DROP FUNCTION public.citextout(citext);

CREATE OR REPLACE FUNCTION public.citextout(citext)
 RETURNS cstring
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$textout$function$
;

-- Permissions

ALTER FUNCTION public.citextout(citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.citextout(citext) TO postgres;

-- DROP FUNCTION public.citextrecv(internal);

CREATE OR REPLACE FUNCTION public.citextrecv(internal)
 RETURNS citext
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$textrecv$function$
;

-- Permissions

ALTER FUNCTION public.citextrecv(internal) OWNER TO postgres;
GRANT ALL ON FUNCTION public.citextrecv(internal) TO postgres;

-- DROP FUNCTION public.citextsend(citext);

CREATE OR REPLACE FUNCTION public.citextsend(citext)
 RETURNS bytea
 LANGUAGE internal
 STABLE PARALLEL SAFE STRICT
AS $function$textsend$function$
;

-- Permissions

ALTER FUNCTION public.citextsend(citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.citextsend(citext) TO postgres;

-- DROP FUNCTION public.crypt(text, text);

CREATE OR REPLACE FUNCTION public.crypt(text, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_crypt$function$
;

-- Permissions

ALTER FUNCTION public.crypt(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.crypt(text, text) TO postgres;

-- DROP FUNCTION public.dearmor(text);

CREATE OR REPLACE FUNCTION public.dearmor(text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_dearmor$function$
;

-- Permissions

ALTER FUNCTION public.dearmor(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.dearmor(text) TO postgres;

-- DROP FUNCTION public.decrypt(bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.decrypt(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_decrypt$function$
;

-- Permissions

ALTER FUNCTION public.decrypt(bytea, bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.decrypt(bytea, bytea, text) TO postgres;

-- DROP FUNCTION public.decrypt_iv(bytea, bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.decrypt_iv(bytea, bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_decrypt_iv$function$
;

-- Permissions

ALTER FUNCTION public.decrypt_iv(bytea, bytea, bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.decrypt_iv(bytea, bytea, bytea, text) TO postgres;

-- DROP FUNCTION public.digest(text, text);

CREATE OR REPLACE FUNCTION public.digest(text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_digest$function$
;

-- Permissions

ALTER FUNCTION public.digest(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.digest(text, text) TO postgres;

-- DROP FUNCTION public.digest(bytea, text);

CREATE OR REPLACE FUNCTION public.digest(bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_digest$function$
;

-- Permissions

ALTER FUNCTION public.digest(bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.digest(bytea, text) TO postgres;

-- DROP FUNCTION public.encrypt(bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.encrypt(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_encrypt$function$
;

-- Permissions

ALTER FUNCTION public.encrypt(bytea, bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.encrypt(bytea, bytea, text) TO postgres;

-- DROP FUNCTION public.encrypt_iv(bytea, bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.encrypt_iv(bytea, bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_encrypt_iv$function$
;

-- Permissions

ALTER FUNCTION public.encrypt_iv(bytea, bytea, bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.encrypt_iv(bytea, bytea, bytea, text) TO postgres;

-- DROP FUNCTION public.gen_random_bytes(int4);

CREATE OR REPLACE FUNCTION public.gen_random_bytes(integer)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_random_bytes$function$
;

-- Permissions

ALTER FUNCTION public.gen_random_bytes(int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gen_random_bytes(int4) TO postgres;

-- DROP FUNCTION public.gen_random_uuid();

CREATE OR REPLACE FUNCTION public.gen_random_uuid()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/pgcrypto', $function$pg_random_uuid$function$
;

-- Permissions

ALTER FUNCTION public.gen_random_uuid() OWNER TO postgres;
GRANT ALL ON FUNCTION public.gen_random_uuid() TO postgres;

-- DROP FUNCTION public.gen_salt(text);

CREATE OR REPLACE FUNCTION public.gen_salt(text)
 RETURNS text
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_gen_salt$function$
;

-- Permissions

ALTER FUNCTION public.gen_salt(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gen_salt(text) TO postgres;

-- DROP FUNCTION public.gen_salt(text, int4);

CREATE OR REPLACE FUNCTION public.gen_salt(text, integer)
 RETURNS text
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_gen_salt_rounds$function$
;

-- Permissions

ALTER FUNCTION public.gen_salt(text, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.gen_salt(text, int4) TO postgres;

-- DROP FUNCTION public.hmac(text, text, text);

CREATE OR REPLACE FUNCTION public.hmac(text, text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_hmac$function$
;

-- Permissions

ALTER FUNCTION public.hmac(text, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.hmac(text, text, text) TO postgres;

-- DROP FUNCTION public.hmac(bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.hmac(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pg_hmac$function$
;

-- Permissions

ALTER FUNCTION public.hmac(bytea, bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.hmac(bytea, bytea, text) TO postgres;

-- DROP AGGREGATE public.max(citext);

CREATE OR REPLACE AGGREGATE public.max(public.citext) (
	SFUNC = citext_larger,
	STYPE = citext,
	SORTOP = >
);

-- Permissions

ALTER AGGREGATE public.max(citext) OWNER TO postgres;
GRANT ALL ON AGGREGATE public.max(citext) TO postgres;

-- DROP AGGREGATE public.min(citext);

CREATE OR REPLACE AGGREGATE public.min(public.citext) (
	SFUNC = citext_smaller,
	STYPE = citext,
	SORTOP = <
);

-- Permissions

ALTER AGGREGATE public.min(citext) OWNER TO postgres;
GRANT ALL ON AGGREGATE public.min(citext) TO postgres;

-- DROP FUNCTION public.pgp_armor_headers(in text, out text, out text);

CREATE OR REPLACE FUNCTION public.pgp_armor_headers(text, OUT key text, OUT value text)
 RETURNS SETOF record
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_armor_headers$function$
;

-- Permissions

ALTER FUNCTION public.pgp_armor_headers(in text, out text, out text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_armor_headers(in text, out text, out text) TO postgres;

-- DROP FUNCTION public.pgp_key_id(bytea);

CREATE OR REPLACE FUNCTION public.pgp_key_id(bytea)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_key_id_w$function$
;

-- Permissions

ALTER FUNCTION public.pgp_key_id(bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_key_id(bytea) TO postgres;

-- DROP FUNCTION public.pgp_pub_decrypt(bytea, bytea);

CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt(bytea, bytea)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_text$function$
;

-- Permissions

ALTER FUNCTION public.pgp_pub_decrypt(bytea, bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea) TO postgres;

-- DROP FUNCTION public.pgp_pub_decrypt(bytea, bytea, text, text);

CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt(bytea, bytea, text, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_text$function$
;

-- Permissions

ALTER FUNCTION public.pgp_pub_decrypt(bytea, bytea, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres;

-- DROP FUNCTION public.pgp_pub_decrypt(bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt(bytea, bytea, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_text$function$
;

-- Permissions

ALTER FUNCTION public.pgp_pub_decrypt(bytea, bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea, text) TO postgres;

-- DROP FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text, text);

CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_bytea$function$
;

-- Permissions

ALTER FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres;

-- DROP FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_bytea$function$
;

-- Permissions

ALTER FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres;

-- DROP FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea);

CREATE OR REPLACE FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_decrypt_bytea$function$
;

-- Permissions

ALTER FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres;

-- DROP FUNCTION public.pgp_pub_encrypt(text, bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_pub_encrypt(text, bytea, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_text$function$
;

-- Permissions

ALTER FUNCTION public.pgp_pub_encrypt(text, bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_pub_encrypt(text, bytea, text) TO postgres;

-- DROP FUNCTION public.pgp_pub_encrypt(text, bytea);

CREATE OR REPLACE FUNCTION public.pgp_pub_encrypt(text, bytea)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_text$function$
;

-- Permissions

ALTER FUNCTION public.pgp_pub_encrypt(text, bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_pub_encrypt(text, bytea) TO postgres;

-- DROP FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea);

CREATE OR REPLACE FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_bytea$function$
;

-- Permissions

ALTER FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres;

-- DROP FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_pub_encrypt_bytea$function$
;

-- Permissions

ALTER FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres;

-- DROP FUNCTION public.pgp_sym_decrypt(bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_decrypt(bytea, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_text$function$
;

-- Permissions

ALTER FUNCTION public.pgp_sym_decrypt(bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_sym_decrypt(bytea, text) TO postgres;

-- DROP FUNCTION public.pgp_sym_decrypt(bytea, text, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_decrypt(bytea, text, text)
 RETURNS text
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_text$function$
;

-- Permissions

ALTER FUNCTION public.pgp_sym_decrypt(bytea, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_sym_decrypt(bytea, text, text) TO postgres;

-- DROP FUNCTION public.pgp_sym_decrypt_bytea(bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_decrypt_bytea(bytea, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_bytea$function$
;

-- Permissions

ALTER FUNCTION public.pgp_sym_decrypt_bytea(bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_sym_decrypt_bytea(bytea, text) TO postgres;

-- DROP FUNCTION public.pgp_sym_decrypt_bytea(bytea, text, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_decrypt_bytea(bytea, text, text)
 RETURNS bytea
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_decrypt_bytea$function$
;

-- Permissions

ALTER FUNCTION public.pgp_sym_decrypt_bytea(bytea, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres;

-- DROP FUNCTION public.pgp_sym_encrypt(text, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_encrypt(text, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_text$function$
;

-- Permissions

ALTER FUNCTION public.pgp_sym_encrypt(text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_sym_encrypt(text, text) TO postgres;

-- DROP FUNCTION public.pgp_sym_encrypt(text, text, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_encrypt(text, text, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_text$function$
;

-- Permissions

ALTER FUNCTION public.pgp_sym_encrypt(text, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_sym_encrypt(text, text, text) TO postgres;

-- DROP FUNCTION public.pgp_sym_encrypt_bytea(bytea, text, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_encrypt_bytea(bytea, text, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_bytea$function$
;

-- Permissions

ALTER FUNCTION public.pgp_sym_encrypt_bytea(bytea, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres;

-- DROP FUNCTION public.pgp_sym_encrypt_bytea(bytea, text);

CREATE OR REPLACE FUNCTION public.pgp_sym_encrypt_bytea(bytea, text)
 RETURNS bytea
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pgcrypto', $function$pgp_sym_encrypt_bytea$function$
;

-- Permissions

ALTER FUNCTION public.pgp_sym_encrypt_bytea(bytea, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.pgp_sym_encrypt_bytea(bytea, text) TO postgres;

-- DROP FUNCTION public.regexp_match(citext, citext);

CREATE OR REPLACE FUNCTION public.regexp_match(citext, citext)
 RETURNS text[]
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
    SELECT pg_catalog.regexp_match( $1::pg_catalog.text, $2::pg_catalog.text, 'i' );
$function$
;

-- Permissions

ALTER FUNCTION public.regexp_match(citext, citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.regexp_match(citext, citext) TO postgres;

-- DROP FUNCTION public.regexp_match(citext, citext, text);

CREATE OR REPLACE FUNCTION public.regexp_match(citext, citext, text)
 RETURNS text[]
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
    SELECT pg_catalog.regexp_match( $1::pg_catalog.text, $2::pg_catalog.text, CASE WHEN pg_catalog.strpos($3, 'c') = 0 THEN  $3 || 'i' ELSE $3 END );
$function$
;

-- Permissions

ALTER FUNCTION public.regexp_match(citext, citext, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.regexp_match(citext, citext, text) TO postgres;

-- DROP FUNCTION public.regexp_matches(citext, citext);

CREATE OR REPLACE FUNCTION public.regexp_matches(citext, citext)
 RETURNS SETOF text[]
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT ROWS 1
AS $function$
    SELECT pg_catalog.regexp_matches( $1::pg_catalog.text, $2::pg_catalog.text, 'i' );
$function$
;

-- Permissions

ALTER FUNCTION public.regexp_matches(citext, citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.regexp_matches(citext, citext) TO postgres;

-- DROP FUNCTION public.regexp_matches(citext, citext, text);

CREATE OR REPLACE FUNCTION public.regexp_matches(citext, citext, text)
 RETURNS SETOF text[]
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT ROWS 10
AS $function$
    SELECT pg_catalog.regexp_matches( $1::pg_catalog.text, $2::pg_catalog.text, CASE WHEN pg_catalog.strpos($3, 'c') = 0 THEN  $3 || 'i' ELSE $3 END );
$function$
;

-- Permissions

ALTER FUNCTION public.regexp_matches(citext, citext, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.regexp_matches(citext, citext, text) TO postgres;

-- DROP FUNCTION public.regexp_replace(citext, citext, text);

CREATE OR REPLACE FUNCTION public.regexp_replace(citext, citext, text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
    SELECT pg_catalog.regexp_replace( $1::pg_catalog.text, $2::pg_catalog.text, $3, 'i');
$function$
;

-- Permissions

ALTER FUNCTION public.regexp_replace(citext, citext, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.regexp_replace(citext, citext, text) TO postgres;

-- DROP FUNCTION public.regexp_replace(citext, citext, text, text);

CREATE OR REPLACE FUNCTION public.regexp_replace(citext, citext, text, text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
    SELECT pg_catalog.regexp_replace( $1::pg_catalog.text, $2::pg_catalog.text, $3, CASE WHEN pg_catalog.strpos($4, 'c') = 0 THEN  $4 || 'i' ELSE $4 END);
$function$
;

-- Permissions

ALTER FUNCTION public.regexp_replace(citext, citext, text, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.regexp_replace(citext, citext, text, text) TO postgres;

-- DROP FUNCTION public.regexp_split_to_array(citext, citext, text);

CREATE OR REPLACE FUNCTION public.regexp_split_to_array(citext, citext, text)
 RETURNS text[]
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
    SELECT pg_catalog.regexp_split_to_array( $1::pg_catalog.text, $2::pg_catalog.text, CASE WHEN pg_catalog.strpos($3, 'c') = 0 THEN  $3 || 'i' ELSE $3 END );
$function$
;

-- Permissions

ALTER FUNCTION public.regexp_split_to_array(citext, citext, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.regexp_split_to_array(citext, citext, text) TO postgres;

-- DROP FUNCTION public.regexp_split_to_array(citext, citext);

CREATE OR REPLACE FUNCTION public.regexp_split_to_array(citext, citext)
 RETURNS text[]
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
    SELECT pg_catalog.regexp_split_to_array( $1::pg_catalog.text, $2::pg_catalog.text, 'i' );
$function$
;

-- Permissions

ALTER FUNCTION public.regexp_split_to_array(citext, citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.regexp_split_to_array(citext, citext) TO postgres;

-- DROP FUNCTION public.regexp_split_to_table(citext, citext);

CREATE OR REPLACE FUNCTION public.regexp_split_to_table(citext, citext)
 RETURNS SETOF text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
    SELECT pg_catalog.regexp_split_to_table( $1::pg_catalog.text, $2::pg_catalog.text, 'i' );
$function$
;

-- Permissions

ALTER FUNCTION public.regexp_split_to_table(citext, citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.regexp_split_to_table(citext, citext) TO postgres;

-- DROP FUNCTION public.regexp_split_to_table(citext, citext, text);

CREATE OR REPLACE FUNCTION public.regexp_split_to_table(citext, citext, text)
 RETURNS SETOF text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
    SELECT pg_catalog.regexp_split_to_table( $1::pg_catalog.text, $2::pg_catalog.text, CASE WHEN pg_catalog.strpos($3, 'c') = 0 THEN  $3 || 'i' ELSE $3 END );
$function$
;

-- Permissions

ALTER FUNCTION public.regexp_split_to_table(citext, citext, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.regexp_split_to_table(citext, citext, text) TO postgres;

-- DROP FUNCTION public."replace"(citext, citext, citext);

CREATE OR REPLACE FUNCTION public.replace(citext, citext, citext)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
    SELECT pg_catalog.regexp_replace( $1::pg_catalog.text, pg_catalog.regexp_replace($2::pg_catalog.text, '([^a-zA-Z_0-9])', E'\\\\\\1', 'g'), $3::pg_catalog.text, 'gi' );
$function$
;

-- Permissions

ALTER FUNCTION public."replace"(citext, citext, citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public."replace"(citext, citext, citext) TO postgres;

-- DROP FUNCTION public.split_part(citext, citext, int4);

CREATE OR REPLACE FUNCTION public.split_part(citext, citext, integer)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
    SELECT (pg_catalog.regexp_split_to_array( $1::pg_catalog.text, pg_catalog.regexp_replace($2::pg_catalog.text, '([^a-zA-Z_0-9])', E'\\\\\\1', 'g'), 'i'))[$3];
$function$
;

-- Permissions

ALTER FUNCTION public.split_part(citext, citext, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.split_part(citext, citext, int4) TO postgres;

-- DROP FUNCTION public.strpos(citext, citext);

CREATE OR REPLACE FUNCTION public.strpos(citext, citext)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
    SELECT pg_catalog.strpos( pg_catalog.lower( $1::pg_catalog.text ), pg_catalog.lower( $2::pg_catalog.text ) );
$function$
;

-- Permissions

ALTER FUNCTION public.strpos(citext, citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.strpos(citext, citext) TO postgres;

-- DROP FUNCTION public.texticlike(citext, text);

CREATE OR REPLACE FUNCTION public.texticlike(citext, text)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$texticlike$function$
;

-- Permissions

ALTER FUNCTION public.texticlike(citext, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.texticlike(citext, text) TO postgres;

-- DROP FUNCTION public.texticlike(citext, citext);

CREATE OR REPLACE FUNCTION public.texticlike(citext, citext)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$texticlike$function$
;

-- Permissions

ALTER FUNCTION public.texticlike(citext, citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.texticlike(citext, citext) TO postgres;

-- DROP FUNCTION public.texticnlike(citext, citext);

CREATE OR REPLACE FUNCTION public.texticnlike(citext, citext)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$texticnlike$function$
;

-- Permissions

ALTER FUNCTION public.texticnlike(citext, citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.texticnlike(citext, citext) TO postgres;

-- DROP FUNCTION public.texticnlike(citext, text);

CREATE OR REPLACE FUNCTION public.texticnlike(citext, text)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$texticnlike$function$
;

-- Permissions

ALTER FUNCTION public.texticnlike(citext, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.texticnlike(citext, text) TO postgres;

-- DROP FUNCTION public.texticregexeq(citext, text);

CREATE OR REPLACE FUNCTION public.texticregexeq(citext, text)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$texticregexeq$function$
;

-- Permissions

ALTER FUNCTION public.texticregexeq(citext, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.texticregexeq(citext, text) TO postgres;

-- DROP FUNCTION public.texticregexeq(citext, citext);

CREATE OR REPLACE FUNCTION public.texticregexeq(citext, citext)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$texticregexeq$function$
;

-- Permissions

ALTER FUNCTION public.texticregexeq(citext, citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.texticregexeq(citext, citext) TO postgres;

-- DROP FUNCTION public.texticregexne(citext, text);

CREATE OR REPLACE FUNCTION public.texticregexne(citext, text)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$texticregexne$function$
;

-- Permissions

ALTER FUNCTION public.texticregexne(citext, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.texticregexne(citext, text) TO postgres;

-- DROP FUNCTION public.texticregexne(citext, citext);

CREATE OR REPLACE FUNCTION public.texticregexne(citext, citext)
 RETURNS boolean
 LANGUAGE internal
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$texticregexne$function$
;

-- Permissions

ALTER FUNCTION public.texticregexne(citext, citext) OWNER TO postgres;
GRANT ALL ON FUNCTION public.texticregexne(citext, citext) TO postgres;

-- DROP FUNCTION public."translate"(citext, citext, text);

CREATE OR REPLACE FUNCTION public.translate(citext, citext, text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
    SELECT pg_catalog.translate( pg_catalog.translate( $1::pg_catalog.text, pg_catalog.lower($2::pg_catalog.text), $3), pg_catalog.upper($2::pg_catalog.text), $3);
$function$
;

-- Permissions

ALTER FUNCTION public."translate"(citext, citext, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public."translate"(citext, citext, text) TO postgres;


-- Permissions

GRANT ALL ON SCHEMA public TO pg_database_owner;
GRANT USAGE ON SCHEMA public TO public;