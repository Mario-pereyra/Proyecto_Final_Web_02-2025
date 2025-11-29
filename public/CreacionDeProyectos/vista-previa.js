/**
 * Vista Previa del Proyecto
 * Página separada para mostrar la vista previa completa del proyecto
 */

document.addEventListener("DOMContentLoaded", function () {
  // Validar que existan datos del proyecto
  const step1Data = sessionStorage.getItem("projectStep1");
  const step2Data = sessionStorage.getItem("projectStep2");
  const step3Data = sessionStorage.getItem("projectStep3");
  const step4Data = sessionStorage.getItem("projectStep4");

  if (!step1Data || !step2Data || !step3Data || !step4Data) {
    alert(
      "No hay datos del proyecto para mostrar. Completa todos los pasos primero."
    );
    window.location.href = "crear-proyecto.html";
    return;
  }

  // Referencias a elementos
  const previewImg = document.getElementById("previewImg");
  const previewCategory = document.getElementById("previewCategory");
  const previewTitle = document.getElementById("previewTitle");
  const previewShortDesc = document.getElementById("previewShortDesc");
  const previewAmount = document.getElementById("previewAmount");
  const previewGoalText = document.getElementById("previewGoalText");
  const progressFill = document.getElementById("progressFill");
  const previewBackers = document.getElementById("previewBackers");
  const previewDays = document.getElementById("previewDays");
  const previewGoal = document.getElementById("previewGoal");
  const previewEndDate = document.getElementById("previewEndDate");
  const previewDetailedDesc = document.getElementById("previewDetailedDesc");
  const previewRequisitos = document.getElementById("previewRequisitos");
  const previewDocuments = document.getElementById("previewDocuments");
  const btnVolverFormulario = document.getElementById("btnVolverFormulario");
  const btnEnviarDesdePrevia = document.getElementById("btnEnviarDesdePrevia");

  // Categorías
  const categories = {
    tecnologia: "Tecnología",
    salud: "Salud",
    educacion: "Educación",
    "medio-ambiente": "Medio Ambiente",
    social: "Social",
    "arte-cultura": "Arte y Cultura",
  };

  // Cargar datos del proyecto
  function loadProjectData() {
    // Paso 1: Información básica
    if (step1Data) {
      const data = JSON.parse(step1Data);
      if (data.title) previewTitle.textContent = data.title;
      if (data.description) previewShortDesc.textContent = data.description;
      if (data.category) {
        previewCategory.textContent =
          categories[data.category] || data.category;
      }
    }

    // Paso 2: Descripción detallada (Editor.js)
    if (step2Data) {
      const data = JSON.parse(step2Data);
      if (data.blocks && data.blocks.length > 0) {
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
            case "quote":
              html += `<blockquote><p>${block.data.text}</p>${
                block.data.caption ? `<cite>${block.data.caption}</cite>` : ""
              }</blockquote>`;
              break;
            case "image":
              html += `<figure><img src="${block.data.file.url}" alt="${
                block.data.caption || ""
              }" style="max-width:100%;height:auto;border-radius:8px;">${
                block.data.caption
                  ? `<figcaption>${block.data.caption}</figcaption>`
                  : ""
              }</figure>`;
              break;
            case "delimiter":
              html += "<hr>";
              break;
            default:
              if (block.data && block.data.text) {
                html += `<p>${block.data.text}</p>`;
              }
          }
        });
        previewDetailedDesc.innerHTML =
          html || "<p>Sin descripción detallada.</p>";
      }
    }

    // Paso 3: Meta y fecha
    if (step3Data) {
      const data = JSON.parse(step3Data);
      if (data.goal) {
        const goalFormatted = formatNumber(data.goal);
        previewGoal.textContent = `€${goalFormatted}`;
        previewGoalText.textContent = `€${goalFormatted}`;
        previewAmount.textContent = "€0"; // Simulación: proyecto nuevo
        progressFill.style.width = "0%"; // Simulación: 0% financiado
      }
      if (data.end_date) {
        const date = new Date(data.end_date);
        previewEndDate.textContent = formatDate(date);

        // Calcular días restantes
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        const diffTime = date - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        previewDays.textContent = diffDays > 0 ? diffDays : 0;
      }

      // Simulación de patrocinadores
      previewBackers.textContent = "0";
    }

    // Paso 4: Imagen
    if (step4Data) {
      const data = JSON.parse(step4Data);
      if (data.imageData) {
        previewImg.src = data.imageData;
      }
    }

    // Paso 5: Requisitos y documentos (si existen)
    const step5Data = sessionStorage.getItem("projectStep5");
    if (step5Data) {
      const data = JSON.parse(step5Data);
      if (data.requisitos) {
        previewRequisitos.innerHTML = `<p>${data.requisitos.replace(
          /\n/g,
          "</p><p>"
        )}</p>`;
      }
    }

    // Cargar documentos desde localStorage (borrador)
    const draft = localStorage.getItem("projectDraft");
    if (draft) {
      const draftData = JSON.parse(draft);
      if (
        draftData.step5 &&
        draftData.step5.documentNames &&
        draftData.step5.documentNames.length > 0
      ) {
        let docsHtml = "";
        draftData.step5.documentNames.forEach((name) => {
          docsHtml += `
            <li class="document-item">
              <iconify-icon icon="material-symbols:description-rounded" class="document-icon" aria-hidden="true"></iconify-icon>
              <div class="document-info">
                <span class="document-name">${name}</span>
              </div>
            </li>
          `;
        });
        previewDocuments.innerHTML = docsHtml;
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

  // Volver al formulario
  btnVolverFormulario.addEventListener("click", function (e) {
    e.preventDefault();
    window.location.href = "crear-proyecto-paso5.html";
  });

  // Enviar para aprobación
  btnEnviarDesdePrevia.addEventListener("click", function (e) {
    e.preventDefault();
    showConfirmModal();
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
    const projectData = {
      step1: JSON.parse(sessionStorage.getItem("projectStep1") || "{}"),
      step2: JSON.parse(sessionStorage.getItem("projectStep2") || "{}"),
      step3: JSON.parse(sessionStorage.getItem("projectStep3") || "{}"),
      step4: JSON.parse(sessionStorage.getItem("projectStep4") || "{}"),
      step5: JSON.parse(sessionStorage.getItem("projectStep5") || "{}"),
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

    setTimeout(() => {
      // window.location.href = 'dashboard.html';
      console.log("Redirigiendo al dashboard...");
    }, 2000);
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

  // Inicialización
  loadProjectData();
});
