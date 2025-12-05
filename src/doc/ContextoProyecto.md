





#### 1. Definición del Proyecto
El objetivo es desarrollar una aplicación web de **Financiación Colectiva** (similar a Kickstarter) donde usuarios publican proyectos para recibir donaciones de la comunidad.

#### 2. Restricciones Técnicas (ESTRICTO)
* **Arquitectura:** Cliente-Servidor desacoplado (REST API).
* **Frontend:**
    * HTML5, CSS3, Javascript (Vanilla/Puro).
    * **PROHIBIDO:** Frameworks JS (React, Vue, Angular, etc.) y Frameworks CSS (Bootstrap, Tailwind, etc.).
    * **Diseño:** Responsive Design (Móvil, Tablet, Desktop).
    * **Validaciones:** Todo formulario debe validarse en JS antes de enviar al backend. Los errores deben aparecer bajo el `input` correspondiente. **PROHIBIDO** usar `alert()` o validaciones nativas de HTML (`required`).
* **Backend:**
    * Lenguaje/Framework: Libre (que exponga API REST).
    * Comunicación: JSON mediante llamadas asíncronas.
    * **PROHIBIDO:** Server Side Rendering (SSR) o Backend-as-a-Service (Firebase, Supabase, etc.).
* **Base de Datos:**
    * Tipo: Relacional (SQL).
    * Hosting: Local/Propio. **PROHIBIDO** SQLite.

#### 3. Actores y Permisos
1.  **Visitante (No autenticado):**
    * Explorar/Buscar proyectos aprobados.
    * Ver detalles de proyectos.
    * Registrarse (Requiere activación por email).
2.  **Usuario Autenticado:**
    * Gestionar perfil y proyectos propios.
    * Donar/Financiar proyectos.
    * Agregar proyectos a favoritos.
3.  **Administrador:**
    * Aprobar/Rechazar/Observar proyectos.
    * Gestionar usuarios administradores.

#### 4. Máquinas de Estados (Lógica de Negocio Crítica)

**A. Estado del Proyecto (Ciclo de Aprobación):**
1.  **Borrador:** Estado inicial. Editable por el usuario. Datos incompletos permitidos.
2.  **En Revisión:** Enviado al Admin. **Solo lectura** (no editable).
3.  **Observado:** Admin solicita cambios. Editable por el usuario para corregir y reenviar a "En Revisión".
4.  **Rechazado:** Estado final negativo (inviable/ilícito).
5.  **Publicado:** Aprobado por Admin. Visible públicamente. Habilita el inicio de campaña.

**B. Estado de la Campaña de Recaudación (Ciclo de Financiación):**
*Solo aplicable si Proyecto = Publicado.*
1.  **No Iniciada:** Estado inicial post-aprobación.
2.  **En Progreso:** Recibiendo donaciones activamente (Control manual del usuario).
3.  **En Pausa:** Detenida temporalmente (No recibe donaciones).
4.  **Finalizada:** Estado final irrevocable. Ocurre si:
    * Se cumple la fecha límite.
    * Se alcanza la meta financiera.

#### 5. Requerimientos Funcionales y Estructura de Datos

**Módulo de Autenticación:**
* **Registro:** Nombre, Email (único), Password (min 6 chars). El usuario se crea inactivo hasta validar vía enlace enviado al email.
* **Login:** Email/Password. Solo usuarios activos.

**Módulo de Proyectos (Entidad Principal):**
* *Datos:* Título, Imagen portada, Descripción (Rich text/HTML), Meta ($), Fecha Límite, Categoría.
* *Requisitos:* Varían según la categoría (configurables).

**Vistas Públicas:**
* **Landing Page:** Presentación, destacados, categorías.
* **Explorador:** Buscador y filtros por categoría. Card del proyecto (Título, Imagen, Meta, % Progreso, Fecha límite, Dueño).
* **Detalle de Proyecto:** Info completa, % progreso, recaudado actual, Top donadores, botón "Donar" (redirige a login si es visitante), botón "Favorito".

**Panel de Usuario (Dashboard):**
* **Mis Proyectos:** Listado con estado. Acciones: Editar (si es Borrador/Observado), Eliminar, Ver Recaudaciones, Controlar Campaña (Iniciar/Pausar).
* **Crear/Editar:** Guardado parcial (Borrador) vs Enviar a Revisión (Validación estricta). Debe mostrar historial de observaciones del Admin.
* **Mis Aportes:** Historial de donaciones realizadas.
* **Favoritos:** Lista de proyectos guardados.

**Panel de Administrador:**
* **Gestión de Admins:** CRUD de otros administradores.
* **Revisión de Proyectos:** Listado filtrable (Revisión, Observado, etc.). Acciones:
    * *Aprobar* -> Pasa a Publicado.
    * *Observar* -> Requiere texto de feedback. Pasa a Observado.
    * *Rechazar* -> Requiere justificación. Pasa a Rechazado.

***

