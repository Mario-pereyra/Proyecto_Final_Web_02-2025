// ============================================
// CREAR PROYECTO - PASO 1: Información Básica
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  // Referencias a elementos
  const form = document.getElementById("paso1Form");
  const tituloInput = document.getElementById("titulo");
  const descripcionTextarea = document.getElementById("descripcion");
  const categoriaSelect = document.getElementById("categoria");
  const btnGuardarBorrador = document.getElementById("btnGuardarBorrador");

  // Constantes
  const TOTAL_STEPS = 5;
  const CURRENT_STEP = 1;

  // Configurar contadores de caracteres
  setupCharCounter("titulo", "titulo-count", 100);
  setupCharCounter("descripcion", "descripcion-count", 200);

  // Actualizar progreso inicial
  updateProgress(CURRENT_STEP, TOTAL_STEPS);

  // Cambiar color del select cuando se selecciona una opción
  categoriaSelect.addEventListener("change", function () {
    if (this.value) {
      this.style.color = "var(--text-primary)";
    } else {
      this.style.color = "var(--text-secondary)";
    }
  });

  // Guardar borrador
  btnGuardarBorrador.addEventListener("click", function () {
    const projectData = {
      titulo: tituloInput.value.trim(),
      descripcion: descripcionTextarea.value.trim(),
      categoria: categoriaSelect.value,
      status: "draft",
      step: CURRENT_STEP,
      savedAt: new Date().toISOString(),
    };

    // Guardar en localStorage
    localStorage.setItem("projectDraft", JSON.stringify(projectData));

    // Mostrar feedback
    // Mostrar feedback
    mostrarModal({
      title: 'Borrador guardado',
      message: 'Borrador guardado correctamente',
      type: 'success'
    });
  });

  // Formulario submit
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const datos = {
      titulo: tituloInput.value.trim(),
      descripcion: descripcionTextarea.value.trim(),
      categoria: categoriaSelect.value,
    };

    // Validar usando la función del archivo validar-crear-proyecto.js
    const formValido = validarPaso1(datos);

    if (formValido) {
      // Guardar datos del paso actual
      const projectData = {
        titulo: datos.titulo,
        descripcion: datos.descripcion,
        categoria: datos.categoria,
        step: CURRENT_STEP,
      };

      // Guardar en sessionStorage para el siguiente paso
      sessionStorage.setItem("projectStep1", JSON.stringify(projectData));

      // Navegar al siguiente paso
      window.location.href = "./crear-proyecto-paso2.html";
    }
  });

  // Cargar borrador si existe
  function loadDraft() {
    const draft = localStorage.getItem("projectDraft");
    if (draft) {
      const projectData = JSON.parse(draft);

      if (projectData.titulo) {
        tituloInput.value = projectData.titulo;
        document.getElementById("titulo-count").textContent =
          projectData.titulo.length;
      }

      if (projectData.descripcion) {
        descripcionTextarea.value = projectData.descripcion;
        document.getElementById("descripcion-count").textContent =
          projectData.descripcion.length;
      }

      if (projectData.categoria) {
        categoriaSelect.value = projectData.categoria;
        categoriaSelect.style.color = "var(--text-primary)";
      }
    }
  }

  // Cargar datos del paso anterior si existen (para navegación hacia atrás)
  function loadStepData() {
    const stepData = sessionStorage.getItem("projectStep1");
    if (stepData) {
      const projectData = JSON.parse(stepData);

      if (projectData.titulo) {
        tituloInput.value = projectData.titulo;
        document.getElementById("titulo-count").textContent =
          projectData.titulo.length;
      }

      if (projectData.descripcion) {
        descripcionTextarea.value = projectData.descripcion;
        document.getElementById("descripcion-count").textContent =
          projectData.descripcion.length;
      }

      if (projectData.categoria) {
        categoriaSelect.value = projectData.categoria;
        categoriaSelect.style.color = "var(--text-primary)";
      }
    }
  }

  // Inicialización
  loadDraft();
  loadStepData();
});
