### **RF-PROY-01: Creación y Edición de Proyectos (Gestión de Borradores)**

**Descripción:**
El sistema debe permitir a los usuarios autenticados crear nuevos proyectos de recaudación o editar proyectos existentes que se encuentren en estado de "Borrador" u "Observado". Esta funcionalidad debe gestionar un formulario dinámico que soporte datos de texto, estructuras JSON complejas para la descripción detallada (Rich Text) y la carga asíncrona de múltiples tipos de archivos (imágenes de portada y documentos de requisitos).

**Flujo de Eventos:**

1.  **Inicialización del Formulario:**

    - **Modo Crear:** El formulario se presenta vacío.
    - **Modo Editar:** El sistema consulta la base de datos y precarga la información existente en los inputs correspondientes. Para la descripción detallada (`story_json`), se inicializa el editor de texto (Editor.js) con el contenido JSONB recuperado.

2.  **Selección de Categoría y Requisitos Dinámicos:**

    - Al seleccionar o cambiar la **Categoría** (`category_id`), el sistema debe consultar asíncronamente los requisitos definidos en la tabla `category_requirements` para dicha categoría.
    - Se deben generar dinámicamente los inputs de carga de archivo (`input type="file"`) correspondientes a cada requisito, mostrando título, descripción y si es obligatorio.

3.  **Gestión de Descripción Detallada (Historia):**

    - Se debe implementar un editor de bloques (Editor.js) que genere una salida en formato JSON.
    - **Restricción Multimedia:** Para videos, solo se permite la incrustación mediante URLs de YouTube (Embed).
    - **Imágenes en Historia:** Las imágenes arrastradas al editor se suben inmediatamente al servidor (`/uploads/img`) y se referencian por URL dentro del JSON.

4.  **Carga y Persistencia de Archivos:**
    - El envío del formulario debe realizarse mediante `FormData` para soportar datos binarios y texto simultáneamente.
    - **Portada:** Se admite un solo archivo de imagen. Al subir una nueva portada, el sistema debe eliminar físicamente la anterior asociada al proyecto (si existe) y actualizar el registro en `project_images` con `is_cover = TRUE`.
    - **Archivos de Requisitos:** Cada archivo subido se asocia a un ID de requisito específico. El sistema debe detectar si ya existe una respuesta para ese requisito en `project_requirements_answers`; de ser así, elimina el archivo físico anterior y sobrescribe el registro en la base de datos con el nuevo archivo y su `mime_type`.

**Entradas de Datos (Mapeo a Base de Datos):**

- **Título** (`projects.title`): Texto simple.
- **Descripción Corta** (`projects.short_description`): Texto simple.
- **Categoría** (`projects.category_id`): Selección única.
- **Meta Financiera** (`projects.goal_amount`): Numérico.
- **Duración** (`projects.duration_days`): Entero (1-90 días).
- **Historia** (`projects.story_json`): Objeto JSONB conteniendo la estructura de párrafos, imágenes incrustadas y embeds de YouTube.
- **Portada:** Archivo de imagen (JPG, PNG, WEBP) -> Tabla `project_images`.
- **Requisitos:** Múltiples archivos (PDF, DOCX) -> Tabla `project_requirements_answers`.

**Reglas de Negocio:**

1.  **Estado Inicial:** Todo proyecto creado pero no enviado o modificado pero no enviado mediante esta función se guardará por defecto con el estado `approval_status = 'borrador'`, permitiendo guardar información parcial (sin validación estricta de campos obligatorios en esta etapa, salvo el título) una vez se termine de editar el proyecto se envia el proyecto y se cambia el estado a `approval_status = 'en_revision'` un proyecto en revision es un proyecto que se esta revisando por parte del administrador y no puede ser editado solo si el estatus es `approval_status = 'borrador'` o `approval_status = 'observado '` .
2.  **Política de Limpieza (Garbage Collection):** Para optimizar el almacenamiento del servidor, es obligatorio que el backend elimine del disco duro (`fs.unlink`) cualquier archivo de portada o documento de requisito que sea reemplazado por una nueva versión en el mismo formulario.
3.  **Integridad de Archivos:** Todos los archivos subidos deben ser renombrados utilizando un UUID para evitar colisiones, manteniendo su extensión original. La base de datos almacenará únicamente la ruta relativa de acceso.

**Criterios de Aceptación:**

- El usuario puede guardar un borrador con solo el título y volver a editarlo después viendo todos los campos que llenó previamente.
- Si el usuario cambia la categoría del proyecto, los inputs de requisitos deben actualizarse automáticamente en la interfaz sin recargar la página.
- Al subir una nueva portada en un proyecto existente, la carpeta `uploads/img` no debe contener la imagen de la portada anterior (debe haber sido borrada).
- El JSON generado por el editor de texto se guarda correctamente en la columna `JSONB` de PostgreSQL y se renderiza igual al recargar la página.

Este es un flujo complejo que requiere sincronizar varios tipos de datos (texto, JSON enriquecido, archivos únicos y archivos múltiples). Dado que no usas frameworks, la estrategia debe ser muy ordenada en el Frontend (Vanilla JS) y robusta en el Backend (Node.js).

Aquí tienes la arquitectura de la solución, respondiendo a tus dudas sobre **Editor.js** y **Gestión de Archivos**.

---

### 1\. Estrategia y Recomendaciones Técnicas

#### A. ¿Qué hacemos con las imágenes de Editor.js (`story_json`)?

**Tu duda:** _"¿Cuando actualicen el proyecto, se actualiza la imagen? ¿Borro el JSON antiguo?"_
**Respuesta:**

1.  **El JSON:** Sí, cada vez que el usuario guarde, haces un `UPDATE projects SET story_json = ...`. Reemplazas todo el bloque JSON antiguo con el nuevo.
2.  **Las Imágenes dentro del texto:** **No intentes borrar las imágenes antiguas automáticamente** al guardar el JSON.
    - _Por qué:_ Editor.js sube la imagen al momento (apenas la arrastras al editor). Si el usuario borra la imagen del texto y guarda, el JSON ya no tendrá la URL, pero el archivo sigue en la carpeta.
    - _Recomendación MVP:_ Deja los archivos "huérfanos" ahí. Crear un algoritmo que compare "Imágenes en carpeta" vs "Imágenes en JSON" para borrar las sobras es complejo y propenso a errores (podrías borrar imágenes de otros proyectos). Céntrate en que la subida funcione.
    - **Configuración:** Editor.js necesita un endpoint específico (`POST /api/upload/story-image`) solo para subir imágenes y devolver la URL.

#### B. Flujo de Archivos (Portada vs. Requisitos)

Usaremos `FormData` en el frontend. Esto permite enviar **todo de una vez** (texto + JSON + portada + archivos de requisitos) o por partes.

- **Portada:** Se sobrescribe siempre. (1 Proyecto = 1 Portada).
- **Requisitos:** Se identifican por el `requirement_id`. (Si subo un archivo para el requisito \#5, borro el archivo anterior del requisito \#5 y pongo el nuevo).

---

### 2\. Backend: Controlador y Rutas (Node.js)

Necesitamos un endpoint capaz de recibir múltiples tipos de archivos. Usaremos `multer.any()` para tener flexibilidad total.

#### `src/controllers/project.form.controller.js`

```javascript
const { pool } = require("../config/db");
const { deleteFile } = require("../utils/fileHelper"); // El helper que creamos antes
const { v4: uuidv4 } = require("uuid");

// Endpoint para subir imágenes DRAG & DROP de Editor.js
const uploadStoryImage = (req, res) => {
  // Multer ya guardó la imagen en uploads/img/
  if (!req.file) return res.json({ success: 0 });

  // Editor.js espera este formato exacto de respuesta
  res.json({
    success: 1,
    file: {
      url: `/uploads/img/${req.file.filename}`, // URL pública
    },
  });
};

// Crear o Editar Proyecto (Lógica unificada o separada según prefieras)
const saveProject = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN"); // Iniciar Transacción

    const {
      id,
      title,
      short_description,
      category_id,
      goal_amount,
      duration_days,
      story_json,
    } = req.body;
    const userId = req.user.id; // Asumiendo que tienes middleware de auth

    let projectId = id;
    let isNew = !id;

    // 1. INSERTAR O ACTUALIZAR TABLA PROJECTS
    if (isNew) {
      const resProj = await client.query(
        `
                INSERT INTO projects (owner_id, category_id, title, short_description, story_json, goal_amount, duration_days, approval_status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'borrador') RETURNING id
            `,
        [
          userId,
          category_id,
          title,
          short_description,
          story_json,
          goal_amount,
          duration_days,
        ]
      );
      projectId = resProj.rows[0].id;
    } else {
      await client.query(
        `
                UPDATE projects SET category_id=$1, title=$2, short_description=$3, story_json=$4, goal_amount=$5, duration_days=$6, updated_at=NOW()
                WHERE id=$7 AND owner_id=$8
            `,
        [
          category_id,
          title,
          short_description,
          story_json,
          goal_amount,
          duration_days,
          projectId,
          userId,
        ]
      );
    }

    // 2. PROCESAR ARCHIVOS (req.files viene de multer.any())
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // A. CASO: PORTADA (El input se llama 'cover_image')
        if (file.fieldname === "cover_image") {
          // Buscar anterior para borrar
          const oldCover = await client.query(
            "SELECT image_path FROM project_images WHERE project_id=$1 AND is_cover=TRUE",
            [projectId]
          );
          if (oldCover.rows.length > 0) deleteFile(oldCover.rows[0].image_path);

          // Upsert Portada
          await client.query(
            "DELETE FROM project_images WHERE project_id=$1 AND is_cover=TRUE",
            [projectId]
          );
          await client.query(
            `
                        INSERT INTO project_images (project_id, image_path, original_filename, is_cover)
                        VALUES ($1, $2, $3, TRUE)
                    `,
            [projectId, file.path, file.originalname]
          );
        }

        // B. CASO: REQUISITOS (Los inputs se llaman 'req_15', 'req_20', donde el numero es el ID del requisito)
        if (file.fieldname.startsWith("req_")) {
          const requirementId = file.fieldname.split("_")[1]; // Sacar el ID (ej: 15)

          // Buscar archivo anterior para este requisito específico y borrarlo
          const oldReq = await client.query(
            "SELECT file_path FROM project_requirements_answers WHERE project_id=$1 AND requirement_id=$2",
            [projectId, requirementId]
          );
          if (oldReq.rows.length > 0) deleteFile(oldReq.rows[0].file_path);

          // Insertar nuevo registro (Borrar previo para evitar duplicados lógicos o usar UPDATE)
          await client.query(
            "DELETE FROM project_requirements_answers WHERE project_id=$1 AND requirement_id=$2",
            [projectId, requirementId]
          );

          await client.query(
            `
                        INSERT INTO project_requirements_answers (project_id, requirement_id, file_path, original_filename, mime_type)
                        VALUES ($1, $2, $3, $4, $5)
                    `,
            [
              projectId,
              requirementId,
              file.path,
              file.originalname,
              file.mimetype,
            ]
          );
        }
      }
    }

    await client.query("COMMIT");
    res.json({ success: true, message: "Proyecto guardado", projectId });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Error guardando el proyecto" });
  } finally {
    client.release();
  }
};

module.exports = { uploadStoryImage, saveProject };
```

---

### 3\. Frontend: Vanilla JS + Editor.js

Este es el código que necesitas en tu archivo `.js` vinculado al HTML de creación.

#### A. HTML (Estructura base)

```html
<form id="projectForm">
  <input type="text" name="title" id="title" placeholder="Título" required />
  <select id="categorySelect" name="category_id"></select>
  <div id="editorjs" style="border: 1px solid #ccc; padding: 10px;"></div>

  <label>Portada:</label>
  <input type="file" name="cover_image" id="coverInput" accept="image/*" />
  <img id="coverPreview" src="" style="display:none; width: 200px;" />

  <div id="requirementsContainer">
    <h3>Requisitos de la Categoría</h3>
    <p>Selecciona una categoría para ver los requisitos.</p>
  </div>

  <button type="submit" id="btnSave">Guardar Borrador</button>
</form>
```

#### B. Javascript (Lógica de Negocio)

```javascript
// Inicializar Editor.js
const editor = new EditorJS({
  holder: "editorjs",
  tools: {
    image: {
      class: ImageTool,
      config: {
        endpoints: {
          byFile: "/api/upload/story-image", // Tu endpoint de imágenes sueltas
        },
      },
    },
    embed: Embed, // Para Youtube
  },
  // Si estamos EDITANDO, cargar datos aquí:
  data: existingProjectData ? JSON.parse(existingProjectData.story_json) : {},
});

// 1. Manejo Dinámico de Categorías y Requisitos
const categorySelect = document.getElementById("categorySelect");
const requirementsContainer = document.getElementById("requirementsContainer");

categorySelect.addEventListener("change", async (e) => {
  const categoryId = e.target.value;
  // Petición para traer requisitos de esa categoría
  const response = await fetch(`/api/categories/${categoryId}/requirements`);
  const requirements = await response.json();

  requirementsContainer.innerHTML = ""; // Limpiar anteriores

  requirements.forEach((req) => {
    // Crear input file con nombre clave: req_{id}
    // Ejemplo: name="req_5"
    const div = document.createElement("div");
    div.innerHTML = `
            <label>${req.title} ${req.is_required ? "*" : ""}</label>
            <p><small>${req.description}</small></p>
            <input type="file" name="req_${req.id}" accept=".pdf,.doc,.docx">
        `;
    requirementsContainer.appendChild(div);
  });
});

// 2. Previsualización de Portada (UX)
document.getElementById("coverInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.getElementById("coverPreview");
      img.src = e.target.result;
      img.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

// 3. Envío del Formulario (Guardado)
document.getElementById("btnSave").addEventListener("click", async (e) => {
  e.preventDefault();

  // A. Extraer datos del Editor.js
  const savedData = await editor.save();

  // B. Construir FormData
  const formData = new FormData();
  formData.append("title", document.getElementById("title").value);
  formData.append("category_id", categorySelect.value);
  formData.append("story_json", JSON.stringify(savedData)); // JSON a String

  // Si estamos editando, mandar ID
  if (projectId) formData.append("id", projectId);

  // Adjuntar Portada solo si el usuario seleccionó una nueva
  const coverFile = document.getElementById("coverInput").files[0];
  if (coverFile) {
    formData.append("cover_image", coverFile);
  }

  // Adjuntar Archivos de Requisitos Dinámicos
  // Buscamos todos los inputs que empiecen por "req_"
  const reqInputs = document.querySelectorAll('input[name^="req_"]');
  reqInputs.forEach((input) => {
    if (input.files[0]) {
      formData.append(input.name, input.files[0]); // ej: req_5
    }
  });

  // C. Enviar al Backend
  try {
    const response = await fetch("/api/projects/save", {
      method: "POST",
      body: formData, // No poner Content-Type, fetch lo pone solo con boundary
    });
    const result = await response.json();
    if (result.success) {
      alert("Proyecto guardado correctamente");
      window.location.href = `/dashboard/projects/${result.projectId}`;
    }
  } catch (error) {
    console.error("Error:", error);
  }
});
```

### Resumen del Flujo para el Usuario

1.  **Carga:** El usuario ve el formulario. Si es "Editar", el JS pre-carga el título y hace un `editor.render(json)` con la data de la DB.
2.  **Imágenes del Editor:** Si arrastra una imagen al texto, se sube _inmediatamente_ a `/uploads/img` y Editor.js muestra la imagen en el texto.
3.  **Portada:** El usuario selecciona un archivo. JS muestra la previsualización local (base64) sin subirla todavía.
4.  **Requisitos:** Al elegir categoría "Tecnología", aparecen inputs para "Video Demo" y "Ficha Técnica". El usuario sube los archivos.
5.  **Guardar:** Al dar click, se empaqueta todo.
    - El backend detecta `req_XX`, borra el archivo viejo del requisito XX (si existe) y guarda el nuevo.
    - Detecta `cover_image`, borra la portada vieja, guarda la nueva.
    - Actualiza el JSON del texto.
