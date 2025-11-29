// Crear Proyecto - JavaScript
document.addEventListener("DOMContentLoaded", function () {
  // Referencias a elementos
  const titleInput = document.querySelector(".form-input");
  const descTextarea = document.querySelector(".form-textarea");
  const charCount = document.querySelector(".char-count");
  const charCountDesc = document.querySelector(".char-count-desc");
  const categorySelect = document.querySelector(".form-select");
  const saveDraftBtn = document.querySelector(".btn-secondary");
  const nextBtn = document.querySelector(".btn-primary");
  const progressFill = document.querySelector(".progress-fill");

  // Constantes
  const MAX_TITLE_LENGTH = 100;
  const MAX_DESC_LENGTH = 200;
  const TOTAL_STEPS = 5;
  const CURRENT_STEP = 1;

  // Actualizar progreso
  function updateProgress() {
    const progressPercentage = (CURRENT_STEP / TOTAL_STEPS) * 100;
    progressFill.style.width = progressPercentage + "%";
  }

  // Contador de caracteres para el título
  titleInput.addEventListener("input", function () {
    const currentLength = this.value.length;
    charCount.textContent = currentLength;

    // Limitar a 100 caracteres
    if (currentLength > MAX_TITLE_LENGTH) {
      this.value = this.value.substring(0, MAX_TITLE_LENGTH);
      charCount.textContent = MAX_TITLE_LENGTH;
    }

    // Cambiar color si está cerca del límite
    if (currentLength >= MAX_TITLE_LENGTH * 0.9) {
      charCount.style.color = "#d4183d";
    } else {
      charCount.style.color = "";
    }
  });

  // Contador de caracteres para la descripción
  descTextarea.addEventListener("input", function () {
    const currentLength = this.value.length;
    charCountDesc.textContent = currentLength;

    // Limitar a 200 caracteres
    if (currentLength > MAX_DESC_LENGTH) {
      this.value = this.value.substring(0, MAX_DESC_LENGTH);
      charCountDesc.textContent = MAX_DESC_LENGTH;
    }

    // Cambiar color si está cerca del límite
    if (currentLength >= MAX_DESC_LENGTH * 0.9) {
      charCountDesc.style.color = "#d4183d";
    } else {
      charCountDesc.style.color = "";
    }
  });

  // Cambiar color del select cuando se selecciona una opción
  categorySelect.addEventListener("change", function () {
    if (this.value) {
      this.style.color = "#0a0a0a";
    } else {
      this.style.color = "#717182";
    }
  });

  // Validar formulario
  function validateForm() {
    const title = titleInput.value.trim();
    const description = descTextarea.value.trim();
    const category = categorySelect.value;

    const errors = [];

    if (!title) {
      errors.push("El título del proyecto es obligatorio");
    } else if (title.length < 10) {
      errors.push("El título debe tener al menos 10 caracteres");
    }

    if (!description) {
      errors.push("La descripción corta es obligatoria");
    } else if (description.length < 20) {
      errors.push("La descripción debe tener al menos 20 caracteres");
    }

    if (!category) {
      errors.push("Debes seleccionar una categoría");
    }

    return errors;
  }

  // Guardar borrador
  saveDraftBtn.addEventListener("click", function () {
    const projectData = {
      title: titleInput.value.trim(),
      description: descTextarea.value.trim(),
      category: categorySelect.value,
      status: "draft",
      step: CURRENT_STEP,
      savedAt: new Date().toISOString(),
    };

    // Guardar en localStorage
    localStorage.setItem("projectDraft", JSON.stringify(projectData));

    // Mostrar feedback
    showNotification("Borrador guardado correctamente", "success");
  });

  // Formulario submit
  const form = document.getElementById("paso1Form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const errors = validateForm();

    if (errors.length > 0) {
      showNotification(errors[0], "error");
      return;
    }

    // Guardar datos del paso actual
    const projectData = {
      title: titleInput.value.trim(),
      description: descTextarea.value.trim(),
      category: categorySelect.value,
      step: CURRENT_STEP,
    };

    // Guardar en sessionStorage para el siguiente paso
    sessionStorage.setItem("projectStep1", JSON.stringify(projectData));

    // Mostrar feedback y navegar
    showNotification("Paso 1 completado. Redirigiendo al paso 2...", "success");
Vie
    // Navegar al siguiente paso
    setTimeout(() => {
      window.location.href = "crear-proyecto-paso2.html";
    }, 500);
  });

  // Función para mostrar notificaciones
  function showNotification(message, type) {
    // Remover notificación existente si hay
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    // Crear notificación
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

    // Agregar estilos dinámicamente
    notification.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            padding: 16px 24px;
            border-radius: 8px;
            background: ${type === "success" ? "#030213" : "#d4183d"};
            color: white;
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

    // Agregar animación
    const style = document.createElement("style");
    style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
    document.head.appendChild(style);

    // Cerrar notificación
    const closeBtn = notification.querySelector(".notification-close");
    closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        `;
    closeBtn.addEventListener("click", () => notification.remove());

    document.body.appendChild(notification);

    // Auto-cerrar después de 4 segundos
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 4000);
  }

  // Cargar borrador si existe
  function loadDraft() {
    const draft = localStorage.getItem("projectDraft");
    if (draft) {
      const projectData = JSON.parse(draft);

      if (projectData.title) {
        titleInput.value = projectData.title;
        charCount.textContent = projectData.title.length;
      }

      if (projectData.description) {
        descTextarea.value = projectData.description;
        charCountDesc.textContent = projectData.description.length;
      }

      if (projectData.category) {
        categorySelect.value = projectData.category;
        categorySelect.style.color = "#0a0a0a";
      }
    }
  }

  // Inicialización
  updateProgress();
  loadDraft();
});
