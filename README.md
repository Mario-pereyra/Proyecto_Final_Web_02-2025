¡hecho! aquí tienes **todo** el README consolidado con tus cambios en los puntos **10) Seguridad** y **11) Rendimiento y escalabilidad**, más el **`seeds.sql` completo**.

---

# IMPULSA.ME — Plataforma de Crowdfunding — README

## 1) Resumen ejecutivo

Plataforma web de crowdfunding enfocada en campañas de recaudación en **bolivianos (Bs)**. Los **creadores** publican proyectos que pasan por un **flujo de aprobación**; los **usuarios** autenticados pueden **apoyar** mediante donaciones simuladas con **QR**. El contenido del proyecto usa **editor.js** y una galería de **imágenes** (máx. 10, con portada). El sistema registra **observaciones** (por admins), **favoritos**, **métricas** y **auditoría** mínima.

**BD:** PostgreSQL (DDL incluido)
**IDs clave:** `projects` autoincremental; `project_images.id` con `UUID`.
**Estados:**

* Proyecto (aprobación): `borrador | en_revision | observado | publicado | rechazado`
* Campaña (en `projects`): `no_iniciada | en_progreso | en_pausa | finalizada`
* Donación: `pendiente | confirmado | fallido`

---

## 2) Objetivos

* Habilitar la **creación, revisión y publicación** de proyectos con contenido enriquecido.
* Gestionar **campañas** (una por proyecto) con fecha límite y estados operativos.
* Permitir **donaciones** autenticadas (simuladas vía QR) y mostrar progreso.
* Mantener **historial de observaciones** y **auditoría mínima** de acciones críticas.
* Ofrecer **búsquedas, filtros y KPIs** para catálogo y paneles.

---

## 3) Alcance (MVP)

* Autenticación con **verificación por email** (token de 5 dígitos; reenvío cada 1 min si no se usó).
* Gestión de **usuarios** (roles: `usuario`, `admin`; estados: `inactivo`, `activo`, `bloqueado`).
* **Proyectos** con descripción `JSONB` (editor.js), imágenes (máx. 10, una portada), categoría y meta.
* **Flujo de aprobación** con observaciones (título + descripción `JSONB`).
* **Campaña única por proyecto**, con `deadline` en el propio proyecto.
* **Donaciones** autenticadas, estados `pendiente|confirmado|fallido` (sin reembolsos).
* **Favoritos** (único por usuario+proyecto).
* **KPIs** y listados soportados por `VIEW project_stats`.

---

## 4) Roles y permisos

**Usuario**

* Registrarse, verificar email, iniciar sesión.
* Crear/editar proyectos (en `borrador` u `observado`) y enviar a revisión.
* Cambiar estado de **campaña** (normalmente el dueño), subir imágenes (máx. 10).
* Donar y marcar favoritos.

**Admin**

* Revisar proyectos, **observar** (título + detalle), **publicar** o **rechazar**.
* **Bloquear/desbloquear** usuarios.
* Retirar requisitos por categoría (**sin borrar respuestas**).
* Visualizar métricas.

---

## 5) Reglas de negocio clave

* **Una campaña por proyecto**. `deadline` vive en `projects`.
* **Borrado lógico** de proyectos (`deleted_at`) para preservar KPIs.
* **Requisitos por categoría**:

  * Si ya no aplica, usar `required = FALSE` o **retirar** (`is_active = FALSE`, `retired_at`, `retire_reason`).
  * **Prohibido borrar requisitos con respuestas** → FK `ON DELETE RESTRICT` + flags `is_active/retired_at/retire_reason`.
* **Observaciones**: un proyecto puede ciclar entre `en_revision` ↔ `observado` varias veces.
* **Rechazado** no vuelve a `borrador`; se crea un proyecto nuevo.

---

## 6) Flujos principales

### 6.1 Registro y verificación (token 5 dígitos)

```mermaid
sequenceDiagram
  participant U as Usuario
  participant A as App Backend
  participant M as Email (SMTP)
  U->>A: POST /auth/register (full_name, email, password)
  A->>A: crea user (status=inactivo)
  A->>A: genera token 5 dígitos (purpose=verificacion_email)
  A->>M: envía email con token
  U->>A: POST /auth/verify (email, code)
  A->>A: valida code (vigente, no usado)
  A-->>U: 200 OK (status=activo)
  U->>A: POST /auth/login
  A-->>U: JWT/Session
```

**Política de reenvío:** 1 por minuto si el anterior no se usó.

### 6.2 Flujo de aprobación de proyecto

```mermaid
stateDiagram-v2
  [*] --> borrador
  borrador --> en_revision : enviar a revisión
  en_revision --> publicado : aprobado por admin
  en_revision --> observado : observado (con título+detalle)
  observado --> en_revision : reenviar tras correcciones
  en_revision --> rechazado : rechazo final
  publicado --> [*]
  rechazado --> [*]
```

### 6.3 Donación con QR (simulada)

```mermaid
flowchart LR
  U[Usuario Autenticado] -->|elige proyecto| P[Proyecto Publicado]
  P --> |monto| A[Crear Donación pendiente]
  A --> |solicita QR| G[Pasarela sim.]
  G --> |pago ok/fracaso| A2[Callback/Confirmación]
  A2 --> |ok| D[Donación confirmado]
  A2 --> |fallo| F[Donación fallido]
```

---

## 7) Funcionalidades (desglose)

### 7.1 Usuarios

* Registro, verificación por email (token 5 dígitos), login/logout.
* Perfil básico (nombre completo, email).
* **Estado**: inactivo/activo/bloqueado (admin).
* Reenvío de token cada 1 min si no se usó.

### 7.2 Proyectos

* Crear/editar con **editor.js** (se guarda `description_json` completo).
* Subir **imágenes** (UUID, máx. 10, una `is_cover=TRUE`).
* Asignar **categoría**, **meta** (DECIMAL(12,2) Bs), **deadline** (DATE).
* Enviar a **revisión**; recibir **observaciones** (historial).
* **Publicación** o **rechazo** por admin.
* **Campaña** (en `projects`): `no_iniciada | en_progreso | en_pausa | finalizada`.

### 7.3 Categorías y requisitos

* Catálogo de **categorías** (id, name, description).
* **Requisitos por categoría** con tipos (`texto`, `largo`, `numero`, `archivo`, `url`, `booleano`, `opcion`, `video`), `required`, **`is_active`**, `retired_at`, `retire_reason`.
* Respuestas por proyecto (`value_text`, `value_json`, `file_url`).
* **No se borran** requisitos con respuestas (`ON DELETE RESTRICT`).

### 7.4 Donaciones

* Crear donación `pendiente`, recibir **QR** de pasarela simulada.
* Confirmación vía callback → `confirmado` o `fallido` (guardar `gateway_response`).
* **Métricas** y progreso derivados de donaciones **confirmadas**.

### 7.5 Favoritos

* Toggle de favoritos (único por `user_id+project_id`).
* Listado personal de guardados.

### 7.6 Búsquedas y filtros

* Por **nombre** (título), **categoría**.
* Orden: **más recientes**, **más populares** (apoyos confirmados), **próximos a finalizar**, **meta mayor/menor**.
* **Progreso**: `<25%`, `25–75%`, `>75%`, **completamente financiado** (desde `project_stats`).

### 7.7 Auditoría mínima

* Acciones: `proyecto_en_revision`, `proyecto_observado`, `proyecto_publicado`, `proyecto_rechazado`, `usuario_bloqueado`, `usuario_desbloqueado`.
* `details_json` para contexto adicional.

---

## 8) Modelo de datos (resumen)

* **users**: `id, full_name, email(citext unique), password_plain, role, status`
* **user_tokens**: `user_id, purpose, code(5 dígitos), created_at, expires_at, used_at`.
* **categories**: catálogo simple.
* **category_requirements**: `required`, `is_active`, `retired_at`, `retire_reason`; **unique** `(category_id, code)` solo con `is_active=TRUE`.
* **projects**: `id(bigserial), owner_id, category_id, title, summary, description_json(JSONB), goal_amount, deadline, approval_status, campaign_state, published_at, deleted_at`.
* **project_images**: `id(UUID), project_id, url, position(1..10), is_cover`.
* **project_observations**: `project_id, admin_id, title, description_json`.
* **project_requirement_answers**: `project_id, requirement_id (ON DELETE RESTRICT), value_text/json, file_url`.
* **donations**: `user_id, project_id, amount, status, payment_method, payment_reference, gateway_response, confirmed_at`.
* **favorites**: PK `(user_id, project_id)`.
* **audit_logs**: `actor_user_id, action, project_id?, target_user_id?, details_json, created_at`.
* **project_stats (VIEW)**: totales confirmados, supporters, `progress_percent`, `progress_bucket`.

---

## 9) KPIs y reportes (SQL de ejemplo)

**Más recientes**

```sql
SELECT * FROM project_stats ORDER BY created_at DESC LIMIT 20;
```

**Más populares (apoyos confirmados)**

```sql
SELECT * FROM project_stats
ORDER BY supporters_count DESC, total_confirmed_amount DESC
LIMIT 20;
```

**Próximos a finalizar**

```sql
SELECT * FROM project_stats
WHERE approval_status = 'publicado'
ORDER BY deadline ASC
LIMIT 20;
```

**Meta mayor / menor**

```sql
SELECT id, title, goal_amount FROM projects WHERE deleted_at IS NULL ORDER BY goal_amount DESC; -- o ASC
```

**Buckets de progreso**

```sql
SELECT * FROM project_stats WHERE progress_bucket = 'entre_25_y_75';
```

**Top categorías por monto confirmado**

```sql
SELECT c.name, SUM(ps.total_confirmed_amount) total
FROM project_stats ps
JOIN categories c ON c.id = ps.category_id
GROUP BY c.name
ORDER BY total DESC;
```

**Dashboard del creador (por usuario)**

```sql
WITH mine AS (
  SELECT * FROM project_stats WHERE owner_id = :user_id
)
SELECT
  (SELECT COUNT(*) FROM projects p WHERE p.owner_id = :user_id AND p.deleted_at IS NULL)                AS proyectos_totales,
  (SELECT COUNT(*) FROM projects p WHERE p.owner_id = :user_id AND p.campaign_state='en_progreso')     AS campañas_activas,
  (SELECT COALESCE(SUM(total_confirmed_amount),0) FROM mine)                                           AS total_recaudado,
  (SELECT COALESCE(SUM(d.amount),0) FROM donations d WHERE d.user_id = :user_id AND d.status='confirmado') AS total_donado;
```

---

## 10) Seguridad

* **Tokens:** permitir reenvío **a clic del usuario** cada **1 minuto** si el anterior **no se usó**.
* **Logs:** conservar `audit_logs` y los callbacks de la pasarela (éxito/fallo) en `donations.gateway_response`.

---

## 11) Rendimiento y escalabilidad

* **Índices** por estado, fechas, relaciones y agregados de donaciones.
* `project_stats` como **vista**; si escala, usar **vista materializada** con refresh programado.
* **Subida de media asíncrona** para imágenes y videos.

---

## 12) Configuración y puesta en marcha

### 12.1 Variables de entorno (`.env`)

```env
# Base de datos(desglosar en varias si es mas eficiente la batabase_url)
DATABASE_URL=postgres://postgres:master123@localhost:5432/db_impulsame

```

### 12.2 Migraciones

1. Crear BD y extensiones requeridas.
2. Ejecutar el **DDL** (`db_impulsame.sql`).
3. Cargar **seeds** (`seeds.sql`).

---

## 13) Integraciones de media (editor.js)

* El bloque de **video** sube al backend → backend guarda y devuelve URL → editor.js la embebe y se persiste el **JSON completo** en `projects.description_json`.
* **Imágenes** en `project_images` con `position` y `is_cover` (única).

---

## 14) API (alto nivel — endpoints sugeridos)

* **Auth**: `POST /auth/register`, `POST /auth/verify`, `POST /auth/login`, `POST /auth/resend-code`
* **Usuarios**: `GET /me`, `PATCH /admin/users/:id/block`, `PATCH /admin/users/:id/unblock`
* **Categorías/Reqs**: `GET /categories`, `GET /categories/:id/requirements`, `POST /admin/categories`, `POST /admin/categories/:id/requirements`, `PATCH /admin/requirements/:id`
* **Proyectos**: `POST /projects`, `GET /projects`, `GET /projects/:id`, `PATCH /projects/:id`, `POST /projects/:id/submit`, `POST /projects/:id/images`, `DELETE /projects/:id/images/:imageId`
* **Revisión**: `POST /admin/projects/:id/observe`, `POST /admin/projects/:id/publish`, `POST /admin/projects/:id/reject`
* **Campaña**: `PATCH /projects/:id/campaign-state`
* **Donaciones**: `POST /projects/:id/donations`, `POST /payments/callback`, `GET /me/donations`
* **Favoritos**: `POST /projects/:id/favorite`, `DELETE /projects/:id/favorite`, `GET /me/favorites`

---

## 15) Consultas SQL útiles (catálogo y filtros)

**Búsqueda por nombre/categoría**

```sql
SELECT * FROM project_stats
WHERE title ILIKE '%' || :q || '%'
  AND (:category_id IS NULL OR category_id = :category_id)
ORDER BY created_at DESC
LIMIT :limit OFFSET :offset;
```

**Próximos a finalizar y publicados**

```sql
SELECT * FROM project_stats
WHERE approval_status='publicado'
ORDER BY deadline ASC
LIMIT :limit OFFSET :offset;
```

**Progreso por bucket**

```sql
SELECT * FROM project_stats
WHERE progress_bucket IN ('menor_25','entre_25_y_75','mayor_75','completamente_financiado');
```

---