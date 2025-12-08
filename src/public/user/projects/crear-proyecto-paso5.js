// ============================================
// CREAR PROYECTO - PASO 5: Requisitos Dinámicos
// ============================================

document.addEventListener("DOMContentLoaded", async function () {
  // Constantes y Estado
  const TOTAL_STEPS = 5;
  const CURRENT_STEP = 5;
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  // Referencias
  const form = document.getElementById("paso5Form");
  const requirementsContainer = document.getElementById("requirementsContainer");
  const btnAnterior = document.getElementById("btnAnterior");
  const btnGuardarBorrador = document.getElementById("btnGuardarBorrador");

  // Progreso
  updateProgress(CURRENT_STEP, TOTAL_STEPS);

  // Validar navegación
  if (!projectId) {
    mostrarModal({
      title: 'Error de navegación',
      message: 'No se ha seleccionado ningún proyecto. Redirigiendo al inicio.',
      type: 'error',
      onConfirm: () => window.location.href = "./crear-proyecto-paso1.html"
    });
    return;
  }

  // Variables de estado
  let currentProject = null;
  let requirements = [];
  let existingAnswers = []; // Respuestas ya subidas

  // Inicialización
  await loadData();

  // --- FUNCIONES ---

  async function loadData() {
    try {
      // 1. Cargar datos del proyecto y respuestas existentes
      const projectResponse = await fetch(`/api/projects/${projectId}?userId=101`); // TODO: Auth real
      const projectResult = await projectResponse.json();

      if (!projectResult.success || !projectResult.data) {
        throw new Error("No se pudo cargar el proyecto");
      }

      currentProject = projectResult.data;
      existingAnswers = currentProject.requirements_answers || [];

      // 2. Cargar requisitos de la categoría
      if (currentProject.category_id) {
        const reqResponse = await fetch(`/api/categories/${currentProject.category_id}/requirements`);
        const reqResult = await reqResponse.json();

        if (reqResult.success && reqResult.data) {
          requirements = reqResult.data;
          renderRequirements();
        } else {
          requirementsContainer.innerHTML = '<p class="text-center">No hay requisitos específicos para esta categoría.</p>';
        }
      }

    } catch (error) {
      console.error("Error inicializando paso 5:", error);
      mostrarModal({ title: 'Error', message: 'Hubo un problema cargando los datos del proyecto', type: 'error' });
    }
  }

  function renderRequirements() {
    requirementsContainer.innerHTML = "";

    if (requirements.length === 0) {
      requirementsContainer.innerHTML = '<div class="alert-box success"><p>No hay requisitos adicionales.</p></div>';
      return;
    }

    requirements.forEach(req => {
      // Buscar si ya existe respuesta para este requisito
      const answer = existingAnswers.find(a => a.requirement_id === req.id);
      const fieldHTML = renderField(req, answer);
      requirementsContainer.insertAdjacentHTML("beforeend", fieldHTML);
    });

    attachFileListeners();
  }

  function renderField(req, answer) {
    const fieldId = `req_${req.id}`;
    const uploadedFile = answer ? answer.original_filename : null;
    const markRequired = req.is_required ? "*" : "";

    return `
      <div class="form-group requirement-field" data-req-id="${req.id}">
             <label class="form-label" for="${fieldId}">
               <iconify-icon icon="ic:round-upload-file" width="20" height="20"></iconify-icon>
               ${req.title} ${markRequired}
             </label>
             <p class="form-hint">${req.description || "Sube el documento solicitado"}</p>
             
             <div class="container-input">
               <div class="file-upload-wrapper">
                 <label for="${fieldId}" class="file-upload-btn">
                   <iconify-icon icon="ic:round-attach-file" width="20"></iconify-icon>
                   <span>${uploadedFile ? 'Cambiar archivo' : 'Seleccionar archivo'}</span>
                 </label>
                 <input 
                   type="file" 
                   id="${fieldId}" 
                   name="req_${req.id}"
                   accept=".pdf,.doc,.docx,.jpg,.png"
                   ${req.is_required && !uploadedFile ? "required" : ""}
                   data-requirement-id="${req.id}"
                   hidden
                 />
                 <div class="file-name" id="${fieldId}-name">
                    ${uploadedFile
        ? `<span style="color: var(--color-success)">✅ ${uploadedFile}</span>`
        : 'Ningún archivo seleccionado'}
                 </div>
               </div>
               <p class="error-message" id="${fieldId}-error"></p>
             </div>
      </div>
    `;
  }

  function attachFileListeners() {
    inputs = document.querySelectorAll('input[type="file"]');
    inputs.forEach(input => {
      input.addEventListener('change', async function () {
        if (this.files && this.files[0]) {
          const file = this.files[0];
          const reqId = this.dataset.requirementId;

          // Mostrar nombre provisional
          document.getElementById(`${this.id}-name`).innerHTML = `⏳ Subiendo ${file.name}...`;

          // Subir inmediatamente
          const success = await uploadRequirementFile(reqId, file);

          if (success) {
            document.getElementById(`${this.id}-name`).innerHTML = `<span style="color: var(--color-success)">✅ ${file.name}</span>`;
            // Quitar required ya que se subió
            this.removeAttribute('required');
            // Actualizar estado local
            updateLocalAnswer(reqId, file.name);
          } else {
            document.getElementById(`${this.id}-name`).textContent = "❌ Error al subir archivo";
            this.value = ""; // Limpiar input
          }
        }
      });
    });
  }

  function updateLocalAnswer(reqId, filename) {
    const existingIndex = existingAnswers.findIndex(a => a.requirement_id == reqId);
    if (existingIndex >= 0) {
      existingAnswers[existingIndex].original_filename = filename;
    } else {
      existingAnswers.push({ requirement_id: parseInt(reqId), original_filename: filename });
    }
  }

  async function uploadRequirementFile(reqId, file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/projects/${projectId}/requirements/${reqId}/file`, {
        method: 'PATCH',
        body: formData
      });
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Error subiendo archivo:", error);
      return false;
    }
  }

  // Validaciones antes de enviar
  function validateAllRequired() {
    let valid = true;
    // Iterar sobre requisitos requeridos
    requirements.forEach(req => {
      if (req.is_required) {
        const hasAnswer = existingAnswers.some(a => a.requirement_id === req.id && a.original_filename);
        if (!hasAnswer) {
          valid = false;
          // Mostrar error visual
          const errorEl = document.getElementById(`req_${req.id}-error`);
          if (errorEl) {
            errorEl.textContent = "Este documento es obligatorio.";
            errorEl.classList.add('show');
          }
        }
      }
    });
    return valid;
  }

  // --- BOTIONES ---

  btnAnterior.addEventListener("click", () => {
    window.location.href = `./crear-proyecto-paso4.html?id=${projectId}`;
  });

  btnGuardarBorrador.addEventListener("click", () => {
    // En este paso, los archivos se suben al vuelo.
    // Solo guardamos el estado del paso "draft"
    fetch('/api/projects/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: projectId, step: CURRENT_STEP })
    }).then(() => {
      mostrarModal({ title: 'Guardado', message: 'Borrador y archivos guardados.', type: 'success' });
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateAllRequired()) {
      mostrarModal({ title: 'Faltan documentos', message: 'Por favor sube todos los documentos obligatorios.', type: 'warning' });
      return;
    }

    // Guardar paso y marcar posiblemente como completado (o solo avanzar a preview)
    // Aquí podríamos cambiar 'status' a 'review_ready' o similar si quisiéramos, 
    // pero el plan dice que hay una vista previa.

    // Guardar paso actual
    await fetch('/api/projects/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: projectId, step: CURRENT_STEP })
    });

    // Navegar a vista previa
    window.location.href = `./vista-previa.html?id=${projectId}`;
  });

});
