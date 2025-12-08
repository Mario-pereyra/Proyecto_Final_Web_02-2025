// ============================================
// CREAR PROYECTO - PASO 1: Información Básica
// ============================================

document.addEventListener("DOMContentLoaded", async function () {
  // Referencias a elementos
  const form = document.getElementById("paso1Form");
  const tituloInput = document.getElementById("titulo");
  const descripcionTextarea = document.getElementById("descripcion");
  const categoriaSelect = document.getElementById("categoria");
  const btnGuardarBorrador = document.getElementById("btnGuardarBorrador");

  // Constantes y Estado
  const TOTAL_STEPS = 5;
  const CURRENT_STEP = 1;
  const urlParams = new URLSearchParams(window.location.search);
  let projectId = urlParams.get('id');

  // Configurar contadores de caracteres
  setupCharCounter("titulo", "titulo-count", 100);
  setupCharCounter("descripcion", "descripcion-count", 200);

  // Actualizar progreso inicial
  updateProgress(CURRENT_STEP, TOTAL_STEPS);

  // Cargar Categorías desde API
  await loadCategories();

  // Si hay ID en la URL, cargar datos del proyecto (Modo Edición)
  if (projectId) {
    await loadProjectData(projectId);
  } else {
    // Intentar recuperar de localStorage por compatibilidad
    loadDraftFromLocal();
  }

  // --- FUNCIONES ---

  async function loadCategories() {
    try {
      const response = await fetch('/api/categories');
      const result = await response.json();

      if (result.success && result.data) {
        // Limpiar opciones excepto la primera
        categoriaSelect.innerHTML = '<option value="" disabled selected>Selecciona una categoría</option>';

        result.data.forEach(cat => {
          const option = document.createElement('option');
          option.value = cat.id;
          option.textContent = cat.name;
          categoriaSelect.appendChild(option);
        });
      }
    } catch (error) {
      console.error("Error cargando categorías:", error);
      mostrarModal({ title: 'Error', message: 'No se pudieron cargar las categorías', type: 'error' });
    }
  }

  async function loadProjectData(id) {
    try {
      const response = await fetch(`/api/projects/${id}`);
      const result = await response.json();

      if (result.success && result.data) {
        const project = result.data;

        // Rellenar campos
        if (project.title) {
          tituloInput.value = project.title;
          const count = document.getElementById("titulo-count");
          if (count) count.textContent = project.title.length;
        }
        if (project.short_description) {
          descripcionTextarea.value = project.short_description;
          const count = document.getElementById("descripcion-count");
          if (count) count.textContent = project.short_description.length;
        }
        if (project.category_id) {
          categoriaSelect.value = project.category_id;
          if (categoriaSelect.value) {
            categoriaSelect.style.color = "var(--text-primary)";
          }
        }
      }
    } catch (error) {
      console.error("Error cargando proyecto:", error);
      mostrarModal({ title: 'Error', message: 'No se pudo cargar el proyecto', type: 'error' });
    }
  }

  function loadDraftFromLocal() {
    // Si no hay ID en URL, miramos si hay uno guardado en sessionStorage de una sesión reciente
    const sessionPid = sessionStorage.getItem("projectId");
    if (sessionPid) {
      // Si existe, redirigimos a la URL con ID para mantener consistencia
      // window.location.search = `?id=${sessionPid}`;
      // O simplemente cargamos
      projectId = sessionPid;
      loadProjectData(projectId);
      return;
    }

    const draft = localStorage.getItem("projectDraft");
    if (draft) {
      const projectData = JSON.parse(draft);
      if (projectData.titulo) tituloInput.value = projectData.titulo;
      if (projectData.descripcion) descripcionTextarea.value = projectData.descripcion;
      // Nota: Categorías hardcoded de localstorage podrían fallar ahora que usamos IDs
      // Se recomienda limpiar localStorage
    }
  }

  async function saveProjectDraft() {
    const projectData = {
      id: projectId || undefined, // Si es undefined, el back crea uno nuevo
      step: CURRENT_STEP,
      title: tituloInput.value.trim(),
      short_description: descripcionTextarea.value.trim(),
      category_id: categoriaSelect.value
    };

    try {
      const response = await fetch('/api/projects/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      const result = await response.json();

      if (result.success) {
        projectId = result.data.project_id;

        // Actualizar URL sin recargar si es nuevo
        if (!urlParams.get('id')) {
          const newUrl = new URL(window.location);
          newUrl.searchParams.set('id', projectId);
          window.history.pushState({}, '', newUrl);
        }

        return projectId;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error guardando borrador:", error);
      mostrarModal({ title: 'Error', message: 'No se pudo guardar el borrador', type: 'error' });
      return null;
    }
  }

  // --- EVENT LISTENERS ---

  categoriaSelect.addEventListener("change", function () {
    if (this.value) {
      this.style.color = "var(--text-primary)";
    } else {
      this.style.color = "var(--text-secondary)";
    }
  });

  // Botón Guardar Borrador
  btnGuardarBorrador.addEventListener("click", async function () {
    const savedId = await saveProjectDraft();
    if (savedId) {
      mostrarModal({
        title: 'Borrador guardado',
        message: 'Tu proyecto se ha guardado correctamente en la nube.',
        type: 'success'
      });
    }
  });

  // Botón Siguiente (Submit)
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const datos = {
      titulo: tituloInput.value.trim(),
      descripcion: descripcionTextarea.value.trim(),
      categoria: categoriaSelect.value,
    };

    // Validar frontend
    const formValido = validarPaso1(datos);

    if (formValido) {
      // Guardar en Backend antes de avanzar
      const savedId = await saveProjectDraft();

      if (savedId) {
        // Redundancia útil
        sessionStorage.setItem("projectId", savedId);

        // Navegar al siguiente paso con ID en URL
        window.location.href = `./crear-proyecto-paso2.html?id=${savedId}`;
      }
    }
  });
});
