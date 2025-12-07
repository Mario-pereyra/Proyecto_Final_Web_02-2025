// ============================================
// CREAR PROYECTO - PASO 5: Requisitos Dinámicos
// ============================================

document.addEventListener("DOMContentLoaded", async function () {
  // Referencias a elementos
  const form = document.getElementById("paso5Form");
  const requirementsContainer = document.getElementById("requirementsContainer");
  const btnAnterior = document.getElementById("btnAnterior");
  const btnGuardarBorrador = document.getElementById("btnGuardarBorrador");

  // Constantes
  const TOTAL_STEPS = 5;
  const CURRENT_STEP = 5;

  // Estado
  let requirements = [];
  let answers = {};

  // Actualizar progreso
  updateProgress(CURRENT_STEP, TOTAL_STEPS);

  // Cargar categoría del Paso 1
  const step1Data = sessionStorage.getItem("projectStep1");
  if (!step1Data) {
    mostrarModal({
      title: 'Paso 1 incompleto',
      message: 'Debes completar el Paso 1 primero',
      type: 'error',
      onConfirm: () => {
        window.location.href = "./crear-proyecto-paso1.html";
      }
    });
    return;
  }

  const { categoria } = JSON.parse(step1Data);

  // Cargar requisitos de la categoría
  await loadRequirements(categoria);

  // Función para cargar requisitos
  async function loadRequirements(categoryCode) {
    try {
      // TODO: Reemplazar con llamada real a la API
      // const response = await fetch(`/api/categories/${categoryCode}/requirements`);
      // requirements = await response.json();

      // Por ahora, usar requisitos de ejemplo según categoría
      requirements = getMockRequirements(categoryCode);

      renderRequirements();
    } catch (error) {
      console.error("Error al cargar requisitos:", error);
      requirementsContainer.innerHTML = `
        <div class="alert-box" style="background: var(--color-error-bg); border-color: var(--color-error);">
          <iconify-icon icon="ic:round-error" class="alert-icon" style="color: var(--color-error);"></iconify-icon>
          <p class="alert-text">Error al cargar los requisitos. Por favor, intenta nuevamente.</p>
        </div>
      `;
    }
  }

  // Requisitos de ejemplo (mock)
  function getMockRequirements(categoryCode) {
    const mockData = {
      tecnologia: [
        {
          id: 1,
          code: "ruc",
          label: "Número de RUC",
          type: "texto",
          required: true,
          validations_json: {
            pattern: "^[0-9]{11}$",
            message: "RUC debe tener 11 dígitos",
          },
        },
        {
          id: 2,
          code: "licencia_software",
          label: "Licencia de Software (si aplica)",
          type: "archivo",
          required: false,
        },
        {
          id: 3,
          code: "descripcion_tecnica",
          label: "Descripción Técnica del Proyecto",
          type: "largo",
          required: true,
        },
      ],
      salud: [
        {
          id: 4,
          code: "licencia_sanitaria",
          label: "Licencia Sanitaria",
          type: "archivo",
          required: true,
        },
        {
          id: 5,
          code: "certificado_profesional",
          label: "Certificado Profesional",
          type: "archivo",
          required: true,
        },
      ],
      educacion: [
        {
          id: 6,
          code: "plan_educativo",
          label: "Plan Educativo",
          type: "archivo",
          required: true,
        },
        {
          id: 7,
          code: "experiencia_docente",
          label: "Años de Experiencia Docente",
          type: "numero",
          required: false,
        },
      ],
      "medio-ambiente": [
        {
          id: 8,
          code: "estudio_impacto",
          label: "Estudio de Impacto Ambiental",
          type: "archivo",
          required: true,
        },
      ],
      social: [
        {
          id: 9,
          code: "beneficiarios",
          label: "Número de Beneficiarios Estimados",
          type: "numero",
          required: true,
        },
        {
          id: 10,
          code: "alianzas",
          label: "Alianzas o Convenios",
          type: "largo",
          required: false,
        },
      ],
      "arte-cultura": [
        {
          id: 11,
          code: "portafolio",
          label: "Portafolio de Trabajos Anteriores (URL)",
          type: "url",
          required: false,
        },
      ],
    };

    return mockData[categoryCode] || [];
  }

  // Renderizar requisitos
  function renderRequirements() {
    if (requirements.length === 0) {
      requirementsContainer.innerHTML = `
        <div class="alert-box">
          <iconify-icon icon="ic:round-check-circle" class="alert-icon" style="color: var(--color-success);"></iconify-icon>
          <p class="alert-text">No hay requisitos adicionales para esta categoría. Puedes continuar a la vista previa.</p>
        </div>
      `;
      return;
    }

    requirementsContainer.innerHTML = "";

    requirements.forEach((req) => {
      const fieldHTML = renderField(req);
      requirementsContainer.insertAdjacentHTML("beforeend", fieldHTML);
    });

    // Agregar event listeners
    attachEventListeners();
  }

  // Renderizar campo según tipo
  function renderField(req) {
    const requiredMark = req.required ? "*" : "";
    const fieldId = `req_${req.code}`;
    const errorId = `${fieldId}-error`;

    switch (req.type) {
      case "texto":
        return `
          <div class="form-group requirement-field">
            <label class="form-label" for="${fieldId}">
              <iconify-icon icon="ic:round-text-fields" width="20" height="20"></iconify-icon>
              ${req.label} ${requiredMark}
            </label>
            <div class="container-input">
              <input 
                type="text" 
                class="form-input" 
                id="${fieldId}" 
                name="${req.code}"
                ${req.required ? "required" : ""}
                data-requirement-id="${req.id}"
              />
              <p class="error-message" id="${errorId}"></p>
            </div>
          </div>
        `;

      case "largo":
        return `
          <div class="form-group requirement-field">
            <label class="form-label" for="${fieldId}">
              <iconify-icon icon="ic:round-notes" width="20" height="20"></iconify-icon>
              ${req.label} ${requiredMark}
            </label>
            <div class="container-input">
              <textarea 
                class="form-textarea" 
                id="${fieldId}" 
                name="${req.code}"
                rows="4"
                ${req.required ? "required" : ""}
                data-requirement-id="${req.id}"
              ></textarea>
              <p class="error-message" id="${errorId}"></p>
            </div>
          </div>
        `;

      case "numero":
        return `
          <div class="form-group requirement-field">
            <label class="form-label" for="${fieldId}">
              <iconify-icon icon="ic:round-numbers" width="20" height="20"></iconify-icon>
              ${req.label} ${requiredMark}
            </label>
            <div class="container-input">
              <input 
                type="number" 
                class="form-input" 
                id="${fieldId}" 
                name="${req.code}"
                ${req.required ? "required" : ""}
                data-requirement-id="${req.id}"
              />
              <p class="error-message" id="${errorId}"></p>
            </div>
          </div>
        `;

      case "url":
        return `
          <div class="form-group requirement-field">
            <label class="form-label" for="${fieldId}">
              <iconify-icon icon="ic:round-link" width="20" height="20"></iconify-icon>
              ${req.label} ${requiredMark}
            </label>
            <div class="container-input">
              <input 
                type="url" 
                class="form-input" 
                id="${fieldId}" 
                name="${req.code}"
                placeholder="https://..."
                ${req.required ? "required" : ""}
                data-requirement-id="${req.id}"
              />
              <p class="error-message" id="${errorId}"></p>
            </div>
          </div>
        `;

      case "archivo":
        return `
          <div class="form-group requirement-field">
            <label class="form-label" for="${fieldId}">
              <iconify-icon icon="ic:round-upload-file" width="20" height="20"></iconify-icon>
              ${req.label} ${requiredMark}
            </label>
            <div class="container-input">
              <div class="file-upload-wrapper">
                <label for="${fieldId}" class="file-upload-btn">
                  <iconify-icon icon="ic:round-attach-file" width="20"></iconify-icon>
                  <span>Seleccionar archivo</span>
                </label>
                <input 
                  type="file" 
                  id="${fieldId}" 
                  name="${req.code}"
                  accept=".pdf,.doc,.docx"
                  ${req.required ? "required" : ""}
                  data-requirement-id="${req.id}"
                  hidden
                />
                <div class="file-name" id="${fieldId}-name"></div>
              </div>
              <p class="error-message" id="${errorId}"></p>
            </div>
            <span class="form-hint">Formatos permitidos: PDF, DOC, DOCX (máx. 10MB)</span>
          </div>
        `;

      default:
        return "";
    }
  }

  // Agregar event listeners
  function attachEventListeners() {
    // File inputs
    document.querySelectorAll('input[type="file"]').forEach((input) => {
      input.addEventListener("change", function () {
        const fileName = this.files[0]?.name || "Ningún archivo seleccionado";
        const nameDisplay = document.getElementById(`${this.id}-name`);
        if (nameDisplay) {
          nameDisplay.textContent = fileName;
        }
      });
    });
  }

  // Validar formulario
  function validateForm() {
    let isValid = true;

    requirements.forEach((req) => {
      if (!req.required) return;

      const fieldId = `req_${req.code}`;
      const field = document.getElementById(fieldId);
      const errorElement = document.getElementById(`${fieldId}-error`);

      // Limpiar error
      errorElement.innerHTML = "";
      errorElement.classList.remove("show");

      // Validar campo
      if (!field.value || field.value.trim() === "") {
        isValid = false;
        errorElement.innerHTML = `${req.label} es obligatorio`;
        errorElement.classList.add("show");
      }

      // Validaciones específicas
      if (req.validations_json && field.value) {
        const { pattern, message } = req.validations_json;
        if (pattern && !new RegExp(pattern).test(field.value)) {
          isValid = false;
          errorElement.innerHTML = message || "Formato inválido";
          errorElement.classList.add("show");
        }
      }
    });

    return isValid;
  }

  // Recopilar respuestas
  function collectAnswers() {
    const answers = {};

    requirements.forEach((req) => {
      const fieldId = `req_${req.code}`;
      const field = document.getElementById(fieldId);

      if (field.type === "file") {
        // Para archivos, guardar el nombre (en producción, subirías el archivo)
        answers[req.code] = {
          requirement_id: req.id,
          value_text: field.files[0]?.name || null,
          file_url: null, // TODO: Implementar upload
        };
      } else {
        answers[req.code] = {
          requirement_id: req.id,
          value_text: field.value,
        };
      }
    });

    return answers;
  }

  // Botón Anterior
  btnAnterior.addEventListener("click", () => {
    window.location.href = "./crear-proyecto-paso4.html";
  });

  // Guardar borrador
  btnGuardarBorrador.addEventListener("click", () => {
    const projectData = {
      requirements: collectAnswers(),
      status: "draft",
      step: CURRENT_STEP,
      savedAt: new Date().toISOString(),
    };

    const existingDraft = localStorage.getItem("projectDraft");
    const draft = existingDraft ? JSON.parse(existingDraft) : {};
    Object.assign(draft, projectData);
    localStorage.setItem("projectDraft", JSON.stringify(draft));

    mostrarModal({
      title: 'Borrador guardado',
      message: 'Borrador guardado correctamente',
      type: 'success'
    });
  });

  // Formulario submit (Vista Previa)
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validateForm()) {
      mostrarModal({
        title: 'Campos incompletos',
        message: 'Por favor, completa todos los campos obligatorios',
        type: 'warning'
      });
      return;
    }

    // Guardar datos del paso actual
    const projectData = {
      requirements: collectAnswers(),
      step: CURRENT_STEP,
    };

    sessionStorage.setItem("projectStep5", JSON.stringify(projectData));

    // Navegar a vista previa
    window.location.href = "./vista-previa.html";
  });

  // Cargar datos guardados
  function loadStepData() {
    const stepData = sessionStorage.getItem("projectStep5");
    if (stepData) {
      const data = JSON.parse(stepData);
      if (data.requirements) {
        Object.keys(data.requirements).forEach((code) => {
          const field = document.getElementById(`req_${code}`);
          if (field && data.requirements[code].value_text) {
            field.value = data.requirements[code].value_text;
          }
        });
      }
    }
  }

  // Inicialización
  loadStepData();
});
