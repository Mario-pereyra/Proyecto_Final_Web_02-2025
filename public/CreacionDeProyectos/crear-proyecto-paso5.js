/**
 * Crear Proyecto - Paso 5: Requisitos, Documentos y Vista Previa
 * Paso final para revisión y envío del proyecto
 */

document.addEventListener("DOMContentLoaded", function () {
  // Validar que todos los pasos anteriores estén completos
  const step1Data = sessionStorage.getItem("projectStep1");
  const step2Data = sessionStorage.getItem("projectStep2");
  const step3Data = sessionStorage.getItem("projectStep3");
  const step4Data = sessionStorage.getItem("projectStep4");

  if (!step1Data) {
    alert("Debes completar el paso 1 primero");
    window.location.href = "crear-proyecto.html";
    return;
  }

  if (!step2Data) {
    alert("Debes completar el paso 2 primero");
    window.location.href = "crear-proyecto-paso2.html";
    return;
  }

  if (!step3Data) {
    alert("Debes completar el paso 3 primero");
    window.location.href = "crear-proyecto-paso3.html";
    return;
  }

  if (!step4Data) {
    alert("Debes completar el paso 4 primero");
    window.location.href = "crear-proyecto-paso4.html";
    return;
  }

  // Referencias a elementos
  const requisitosTextarea = document.getElementById("requisitos");
  const charCountReq = document.querySelector(".char-count-req");
  const btnAgregarDocumento = document.getElementById("btnAgregarDocumento");
  const btnLimpiarDocumentos = document.getElementById("btnLimpiarDocumentos");
  const documentInput = document.getElementById("documentInput");
  const documentsList = document.getElementById("documentsList");
  const btnAnterior = document.getElementById("btnAnterior");
  const btnGuardarBorrador = document.getElementById("btnGuardarBorrador");
  const btnVistaPrevia = document.getElementById("btnVistaPrevia");
  const btnEnviarAprobacion = document.getElementById("btnEnviarAprobacion");
  const progressFill = document.querySelector(".progress-fill");

  // Constantes
  const TOTAL_STEPS = 5;
  const CURRENT_STEP = 5;
  const MAX_REQUISITOS_LENGTH = 500;
  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
  const ALLOWED_DOC_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];

  // Estado
  let documents = [];

  // Actualizar progreso
  function updateProgress() {
    const progressPercentage = (CURRENT_STEP / TOTAL_STEPS) * 100;
    progressFill.style.width = progressPercentage + "%";
  }

  // Contador de caracteres para requisitos
  requisitosTextarea.addEventListener("input", function () {
    const currentLength = this.value.length;
    charCountReq.textContent = currentLength;

    if (currentLength > MAX_REQUISITOS_LENGTH) {
      this.value = this.value.substring(0, MAX_REQUISITOS_LENGTH);
      charCountReq.textContent = MAX_REQUISITOS_LENGTH;
    }

    if (currentLength >= MAX_REQUISITOS_LENGTH * 0.9) {
      charCountReq.style.color = "#d4183d";
    } else {
      charCountReq.style.color = "";
    }
  });

  // Agregar documento
  btnAgregarDocumento.addEventListener("click", function () {
    documentInput.click();
  });

  // Manejar selección de documentos
  documentInput.addEventListener("change", function () {
    const files = Array.from(this.files);

    files.forEach((file) => {
      // Validar tipo
      if (!ALLOWED_DOC_TYPES.includes(file.type)) {
        showNotification(
          `Formato no válido para ${file.name}. Usa PDF, Word, Excel o PowerPoint.`,
          "error"
        );
        return;
      }

      // Validar tamaño
      if (file.size > MAX_FILE_SIZE) {
        showNotification(
          `${file.name} excede el tamaño máximo de 25MB.`,
          "error"
        );
        return;
      }

      // Verificar si ya existe
      if (documents.some((doc) => doc.name === file.name)) {
        showNotification(`${file.name} ya ha sido agregado.`, "error");
        return;
      }

      // Agregar documento
      documents.push({
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
      });
    });

    renderDocuments();
    this.value = "";
  });

  // Renderizar lista de documentos
  function renderDocuments() {
    documentsList.innerHTML = "";

    documents.forEach((doc, index) => {
      const item = document.createElement("div");
      item.className = "document-item";
      item.innerHTML = `
                <div class="document-info">
                    <svg class="document-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M14 2V8H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <div>
                        <div class="document-name">${doc.name}</div>
                        <div class="document-size">${formatFileSize(
                          doc.size
                        )}</div>
                    </div>
                </div>
                <button type="button" class="btn-remove-doc" data-index="${index}">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                </button>
            `;
      documentsList.appendChild(item);
    });

    // Agregar event listeners para eliminar
    documentsList.querySelectorAll(".btn-remove-doc").forEach((btn) => {
      btn.addEventListener("click", function () {
        const index = parseInt(this.dataset.index);
        documents.splice(index, 1);
        renderDocuments();
        showNotification("Documento eliminado", "success");
      });
    });
  }

  // Limpiar documentos
  btnLimpiarDocumentos.addEventListener("click", function () {
    if (documents.length === 0) {
      showNotification("No hay documentos para eliminar", "error");
      return;
    }

    documents = [];
    renderDocuments();
    showNotification("Todos los documentos han sido eliminados", "success");
  });

  // Formatear tamaño de archivo
  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Cargar datos de pasos anteriores para la vista previa
  function loadPreviewData() {
    // Paso 1: Información básica
    const step1Data = sessionStorage.getItem("projectStep1");
    if (step1Data) {
      const data = JSON.parse(step1Data);
      if (data.title) previewTitle.textContent = data.title;
      if (data.description) previewShortDesc.textContent = data.description;
      if (data.category) {
        const categories = {
          tecnologia: "Tecnología",
          salud: "Salud",
          educacion: "Educación",
          "medio-ambiente": "Medio Ambiente",
          social: "Social",
          "arte-cultura": "Arte y Cultura",
        };
        previewCategory.textContent =
          categories[data.category] || data.category;
      }
    }

    // Paso 2: Descripción detallada (Editor.js)
    const step2Data = sessionStorage.getItem("projectStep2");
    if (step2Data) {
      const data = JSON.parse(step2Data);
      if (data.blocks && data.blocks.length > 0) {
        // Convertir bloques de Editor.js a HTML simple
        let html = "";
        data.blocks.forEach((block) => {
          switch (block.type) {
            case "paragraph":
              html += `<p>${block.data.text}</p>`;
              break;
            case "header":
              html += `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
              break;
            case "list":
              const listType = block.data.style === "ordered" ? "ol" : "ul";
              const items = block.data.items
                .map((item) => `<li>${item}</li>`)
                .join("");
              html += `<${listType}>${items}</${listType}>`;
              break;
            default:
              if (block.data && block.data.text) {
                html += `<p>${block.data.text}</p>`;
              }
          }
        });
        previewDetailedDesc.innerHTML =
          html || "<p>Descripcion detallada....</p>";
      }
    }

    // Paso 3: Meta y fecha
    const step3Data = sessionStorage.getItem("projectStep3");
    if (step3Data) {
      const data = JSON.parse(step3Data);
      if (data.goal) {
        previewGoal.textContent = `Meta: €${formatNumber(data.goal)}`;
      }
      if (data.end_date) {
        const date = new Date(data.end_date);
        previewEndDate.textContent = `Hasta: ${formatDate(date)}`;
      }
    }

    // Paso 4: Imagen
    const step4Data = sessionStorage.getItem("projectStep4");
    if (step4Data) {
      const data = JSON.parse(step4Data);
      if (data.imageData) {
        previewImage.src = data.imageData;
      }
    }
  }

  // Formatear número
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // Formatear fecha
  function formatDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Validar formulario
  function validateForm() {
    const requisitos = requisitosTextarea.value.trim();

    if (!requisitos) {
      return {
        valid: false,
        message: "Debes especificar los requisitos del proyecto",
      };
    }

    if (requisitos.length < 50) {
      return {
        valid: false,
        message: "Los requisitos deben tener al menos 50 caracteres",
      };
    }

    // Validar que todos los pasos anteriores estén completos
    const step1 = sessionStorage.getItem("projectStep1");
    const step2 = sessionStorage.getItem("projectStep2");
    const step3 = sessionStorage.getItem("projectStep3");
    const step4 = sessionStorage.getItem("projectStep4");

    if (!step1) {
      return {
        valid: false,
        message: "Falta completar el Paso 1: Información básica",
      };
    }

    if (!step2) {
      return {
        valid: false,
        message: "Falta completar el Paso 2: Descripción detallada",
      };
    }

    if (!step3) {
      return {
        valid: false,
        message: "Falta completar el Paso 3: Meta de financiación",
      };
    }

    if (!step4) {
      return {
        valid: false,
        message: "Falta completar el Paso 4: Imagen principal",
      };
    }

    return { valid: true };
  }

  // Guardar borrador - INTEGRADO CON BACKEND
  btnGuardarBorrador.addEventListener("click", function (e) {
    e.preventDefault();
    saveDraftToServer();
  });

  // Botón anterior
  btnAnterior.addEventListener("click", function (e) {
    e.preventDefault();

    sessionStorage.setItem(
      "projectStep5",
      JSON.stringify({
        requisitos: requisitosTextarea.value.trim(),
        documentsCount: documents.length,
      })
    );

    // Navegar al paso anterior
    window.location.href = "crear-proyecto-paso4.html";
  });

  // Botón Vista Previa
  btnVistaPrevia.addEventListener("click", function (e) {
    e.preventDefault();

    // Guardar datos actuales antes de ir a vista previa
    sessionStorage.setItem(
      "projectStep5",
      JSON.stringify({
        requisitos: requisitosTextarea.value.trim(),
        documentsCount: documents.length,
      })
    );

    // Guardar en borrador también los nombres de documentos
    const step1Data = sessionStorage.getItem("projectStep1");
    const step2Data = sessionStorage.getItem("projectStep2");
    const step3Data = sessionStorage.getItem("projectStep3");
    const step4Data = sessionStorage.getItem("projectStep4");

    const draftData = {
      step1: step1Data ? JSON.parse(step1Data) : null,
      step2: step2Data ? JSON.parse(step2Data) : null,
      step3: step3Data ? JSON.parse(step3Data) : null,
      step4: step4Data ? JSON.parse(step4Data) : null,
      step5: {
        requisitos: requisitosTextarea.value.trim(),
        documentsCount: documents.length,
        documentNames: documents.map((d) => d.name),
      },
      currentStep: CURRENT_STEP,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem("projectDraft", JSON.stringify(draftData));

    // Navegar a vista previa
    window.location.href = "vista-previa.html";
  });

  // Enviar para aprobación - INTEGRADO CON BACKEND
  btnEnviarAprobacion.addEventListener("click", function (e) {
    e.preventDefault();
    submitProjectForReview();
  });

  // Modal de confirmación
  function showConfirmModal() {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay active";
    overlay.innerHTML = `
            <div class="modal">
                <h3 class="modal-title">¿Enviar proyecto para aprobación?</h3>
                <p class="modal-content">
                    Una vez enviado, tu proyecto será revisado por nuestro equipo. 
                    Este proceso puede tomar entre 24-48 horas. 
                    Recibirás una notificación cuando el proyecto sea aprobado o si necesita modificaciones.
                </p>
                <div class="modal-actions">
                    <button type="button" class="btn btn-outline" id="btnCancelModal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="btnConfirmSubmit">Enviar Proyecto</button>
                </div>
            </div>
        `;

    document.body.appendChild(overlay);

    // Event listeners
    document.getElementById("btnCancelModal").addEventListener("click", () => {
      overlay.remove();
    });

    document
      .getElementById("btnConfirmSubmit")
      .addEventListener("click", () => {
        overlay.remove();
        submitProject();
      });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  }

  // Enviar proyecto
  function submitProject() {
    // Recopilar todos los datos
    const projectData = {
      step1: JSON.parse(sessionStorage.getItem("projectStep1") || "{}"),
      step2: JSON.parse(sessionStorage.getItem("projectStep2") || "{}"),
      step3: JSON.parse(sessionStorage.getItem("projectStep3") || "{}"),
      step4: JSON.parse(sessionStorage.getItem("projectStep4") || "{}"),
      step5: {
        requisitos: requisitosTextarea.value.trim(),
        documents: documents.map((d) => ({
          name: d.name,
          size: d.size,
          type: d.type,
        })),
      },
      submittedAt: new Date().toISOString(),
      status: "pending_approval",
    };

    console.log("Proyecto enviado:", projectData);

    // Limpiar storage
    sessionStorage.removeItem("projectStep1");
    sessionStorage.removeItem("projectStep2");
    sessionStorage.removeItem("projectStep3");
    sessionStorage.removeItem("projectStep4");
    sessionStorage.removeItem("projectStep5");
    localStorage.removeItem("projectDraft");

    showNotification(
      "¡Proyecto enviado! Te notificaremos cuando sea aprobado.",
      "success"
    );

    // Redirigir al dashboard después de un momento
    setTimeout(() => {
      // window.location.href = 'dashboard.html';
      console.log("Redirigiendo al dashboard...");
    }, 2000);
  }

  // Cargar borrador si existe
  function loadDraft() {
    const step5Session = sessionStorage.getItem("projectStep5");
    if (step5Session) {
      const data = JSON.parse(step5Session);
      if (data.requisitos) {
        requisitosTextarea.value = data.requisitos;
        charCountReq.textContent = data.requisitos.length;
      }
      return;
    }

    const draft = localStorage.getItem("projectDraft");
    if (draft) {
      const draftData = JSON.parse(draft);
      if (draftData.step5) {
        if (draftData.step5.requisitos) {
          requisitosTextarea.value = draftData.step5.requisitos;
          charCountReq.textContent = draftData.step5.requisitos.length;
        }
      }
    }
  }

  // Función para mostrar notificaciones
  function showNotification(message, type) {
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

    const closeBtn = notification.querySelector(".notification-close");
    closeBtn.addEventListener("click", () => notification.remove());

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 4000);
  }

  // ========================================================================
  // FUNCIONES DE INTEGRACIÓN CON BACKEND
  // ========================================================================

  /**
   * Convertir base64 Data URL a File object
   */
  function dataURLtoFile(dataurl, filename) {
    if (!dataurl) return null;

    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  /**
   * Guardar proyecto como borrador en el servidor
   */
  async function saveDraftToServer() {
    try {
      // Mostrar modal de carga usando el sistema de modales existente
      if (typeof mostrarModal !== 'undefined') {
        mostrarModal({
          title: 'Guardando proyecto',
          message: 'Por favor espera mientras subimos tus archivos al servidor...',
          type: 'info'
        });

        // Ocultar botones durante la carga
        const modalBotones = document.getElementById('modal-botones');
        if (modalBotones) {
          modalBotones.style.display = 'none';
        }
      }

      // Recopilar datos de todos los pasos
      const step1 = JSON.parse(sessionStorage.getItem('projectStep1') || '{}');
      const step2 = JSON.parse(sessionStorage.getItem('projectStep2') || '{}');
      const step3 = JSON.parse(sessionStorage.getItem('projectStep3') || '{}');
      const step4 = JSON.parse(sessionStorage.getItem('projectStep4') || '{}');

      // Validar datos mínimos
      if (!step1.title || !step3.goal || !step3.end_date) {
        throw new Error('Faltan datos obligatorios del proyecto');
      }

      // Preparar FormData
      const formData = new FormData();

      // Datos del proyecto
      formData.append('title', step1.title);
      formData.append('summary', step1.description || '');
      formData.append('category_id', step1.category || '1');
      formData.append('description_json', JSON.stringify(step2));
      formData.append('goal_amount', step3.goal);
      formData.append('start_date', step3.start_date || new Date().toISOString().split('T')[0]);
      formData.append('end_date', step3.end_date);
      formData.append('requirements_text', requisitosTextarea.value.trim());
      formData.append('approval_status', 'borrador');

      // Imagen principal (convertir base64 a File)
      if (step4.imageData) {
        const imageFile = dataURLtoFile(step4.imageData, step4.fileName || 'project-image.jpg');
        if (imageFile) {
          formData.append('mainImage', imageFile);
        }
      }

      // Documentos
      if (documents && documents.length > 0) {
        documents.forEach((doc) => {
          formData.append('documents', doc.file);
        });
      }

      // Enviar al servidor
      const response = await fetch('/api/projects', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        // Limpiar sessionStorage
        sessionStorage.removeItem('projectStep1');
        sessionStorage.removeItem('projectStep2');
        sessionStorage.removeItem('projectStep3');
        sessionStorage.removeItem('projectStep4');
        sessionStorage.removeItem('projectStep5');
        localStorage.removeItem('projectDraft');

        // Mostrar modal de éxito
        if (typeof mostrarModal !== 'undefined') {
          mostrarModal({
            title: '¡Proyecto guardado!',
            message: 'Tu proyecto ha sido guardado como borrador correctamente.',
            type: 'success',
            confirmText: 'Ir al Dashboard',
            onConfirm: () => {
              window.location.href = '/user/dashboard.html';
            }
          });
        } else {
          showNotification('Proyecto guardado como borrador', 'success');
          setTimeout(() => {
            window.location.href = '/user/dashboard.html';
          }, 2000);
        }
      } else {
        throw new Error(result.message || 'Error al guardar proyecto');
      }

    } catch (error) {
      console.error('Error al guardar proyecto:', error);

      // Mostrar error
      if (typeof mostrarModal !== 'undefined') {
        mostrarModal({
          title: 'Error',
          message: error.message || 'Hubo un problema al guardar tu proyecto. Por favor intenta nuevamente.',
          type: 'error',
          confirmText: 'Cerrar'
        });
      } else {
        showNotification(error.message || 'Error al guardar proyecto', 'error');
      }
    }
  }

  /**
   * Enviar proyecto para revisión
   */
  async function submitProjectForReview() {
    // Validar formulario
    const validation = validateForm();
    if (!validation.valid) {
      if (typeof mostrarModal !== 'undefined') {
        mostrarModal({
          title: 'Formulario incompleto',
          message: validation.message,
          type: 'warning',
          confirmText: 'Cerrar'
        });
      } else {
        showNotification(validation.message, 'error');
      }
      return;
    }

    // Mostrar confirmación
    if (typeof mostrarModal !== 'undefined') {
      mostrarModal({
        title: '¿Enviar proyecto para revisión?',
        message: 'Una vez enviado, tu proyecto será revisado por nuestro equipo. Este proceso puede tomar entre 24-48 horas.',
        type: 'confirm',
        confirmText: 'Enviar Proyecto',
        cancelText: 'Cancelar',
        onConfirm: () => {
          submitWithStatus('en_revision');
        }
      });
    } else {
      // Fallback si modal.js no está cargado
      if (confirm('¿Enviar proyecto para revisión? Este proceso puede tomar entre 24-48 horas.')) {
        submitWithStatus('en_revision');
      }
    }
  }

  /**
   * Enviar proyecto con status específico
   */
  async function submitWithStatus(status) {
    try {
      // Modal de carga
      if (typeof mostrarModal !== 'undefined') {
        mostrarModal({
          title: 'Enviando proyecto',
          message: 'Por favor espera mientras procesamos tu solicitud...',
          type: 'info'
        });

        const modalBotones = document.getElementById('modal-botones');
        if (modalBotones) {
          modalBotones.style.display = 'none';
        }
      }

      // Recopilar datos
      const step1 = JSON.parse(sessionStorage.getItem('projectStep1') || '{}');
      const step2 = JSON.parse(sessionStorage.getItem('projectStep2') || '{}');
      const step3 = JSON.parse(sessionStorage.getItem('projectStep3') || '{}');
      const step4 = JSON.parse(sessionStorage.getItem('projectStep4') || '{}');

      const formData = new FormData();

      formData.append('title', step1.title);
      formData.append('summary', step1.description || '');
      formData.append('category_id', step1.category || '1');
      formData.append('description_json', JSON.stringify(step2));
      formData.append('goal_amount', step3.goal);
      formData.append('start_date', step3.start_date || new Date().toISOString().split('T')[0]);
      formData.append('end_date', step3.end_date);
      formData.append('requirements_text', requisitosTextarea.value.trim());
      formData.append('approval_status', status);

      // Imagen
      if (step4.imageData) {
        const imageFile = dataURLtoFile(step4.imageData, step4.fileName || 'project-image.jpg');
        if (imageFile) {
          formData.append('mainImage', imageFile);
        }
      }

      // Documentos
      if (documents && documents.length > 0) {
        documents.forEach((doc) => {
          formData.append('documents', doc.file);
        });
      }

      // Enviar
      const response = await fetch('/api/projects', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        // Limpiar storage
        sessionStorage.removeItem('projectStep1');
        sessionStorage.removeItem('projectStep2');
        sessionStorage.removeItem('projectStep3');
        sessionStorage.removeItem('projectStep4');
        sessionStorage.removeItem('projectStep5');
        localStorage.removeItem('projectDraft');

        // Modal de éxito
        if (typeof mostrarModal !== 'undefined') {
          mostrarModal({
            title: '¡Proyecto enviado!',
            message: status === 'en_revision'
              ? 'Tu proyecto ha sido enviado para revisión. Te notificaremos del resultado.'
              : 'Tu proyecto ha sido guardado correctamente.',
            type: 'success',
            confirmText: 'Ir al Dashboard',
            onConfirm: () => {
              window.location.href = '/user/dashboard.html';
            }
          });
        } else {
          showNotification('Proyecto enviado correctamente', 'success');
          setTimeout(() => {
            window.location.href = '/user/dashboard.html';
          }, 2000);
        }
      } else {
        throw new Error(result.message || 'Error al enviar proyecto');
      }

    } catch (error) {
      console.error('Error:', error);

      if (typeof mostrarModal !== 'undefined') {
        mostrarModal({
          title: 'Error',
          message: error.message || 'Hubo un problema al enviar tu proyecto.',
          type: 'error',
          confirmText: 'Cerrar'
        });
      } else {
        showNotification(error.message || 'Error al enviar proyecto', 'error');
      }
    }
  }

  // Inicialización
  updateProgress();
  loadDraft();
});
