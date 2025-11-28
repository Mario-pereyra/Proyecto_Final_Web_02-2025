/**
 * Crear Proyecto - Paso 4: Imagen Principal del Proyecto
 * Implementación del formulario para subir la imagen principal
 */

document.addEventListener("DOMContentLoaded", function () {
  // Validar que los pasos anteriores estén completos
  const step1Data = sessionStorage.getItem("projectStep1");
  const step2Data = sessionStorage.getItem("projectStep2");
  const step3Data = sessionStorage.getItem("projectStep3");

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

  // Referencias a elementos
  const uploadZone = document.getElementById("uploadZone");
  const fileInput = document.getElementById("fileInput");
  const btnSelectFile = document.getElementById("btnSelectFile");
  const imagePreview = document.getElementById("imagePreview");
  const previewImg = document.getElementById("previewImg");
  const btnRemoveImage = document.getElementById("btnRemoveImage");
  const btnAnterior = document.getElementById("btnAnterior");
  const btnGuardarBorrador = document.getElementById("btnGuardarBorrador");
  const btnSiguiente = document.getElementById("btnSiguiente");
  const progressFill = document.querySelector(".progress-fill");

  // Constantes
  const TOTAL_STEPS = 5;
  const CURRENT_STEP = 4;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MIN_WIDTH = 1200;
  const MIN_HEIGHT = 675;
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  // Estado
  let selectedFile = null;
  let imageData = null;

  // Actualizar progreso
  function updateProgress() {
    const progressPercentage = (CURRENT_STEP / TOTAL_STEPS) * 100;
    progressFill.style.width = progressPercentage + "%";
  }

  // Click en zona de upload
  uploadZone.addEventListener("click", function (e) {
    if (e.target !== btnSelectFile && !btnSelectFile.contains(e.target)) {
      fileInput.click();
    }
  });

  // Click en botón seleccionar archivo
  btnSelectFile.addEventListener("click", function (e) {
    e.stopPropagation();
    fileInput.click();
  });

  // Drag and drop events
  uploadZone.addEventListener("dragover", function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.add("dragging");
  });

  uploadZone.addEventListener("dragleave", function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove("dragging");
  });

  uploadZone.addEventListener("drop", function (e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove("dragging");

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });

  // Manejar selección de archivo
  fileInput.addEventListener("change", function () {
    if (this.files.length > 0) {
      handleFile(this.files[0]);
    }
  });

  // Procesar archivo
  function handleFile(file) {
    // Validar tipo de archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      showNotification("Formato no válido. Usa JPG, PNG, WEBP o GIF.", "error");
      return;
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      showNotification("La imagen no puede superar los 10MB.", "error");
      return;
    }

    // Validar dimensiones
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        if (img.width < MIN_WIDTH || img.height < MIN_HEIGHT) {
          showNotification(
            `La imagen debe ser de al menos ${MIN_WIDTH}x${MIN_HEIGHT}px. Tu imagen es ${img.width}x${img.height}px.`,
            "error"
          );
          return;
        }

        // Imagen válida
        selectedFile = file;
        imageData = e.target.result;

        // Mostrar preview
        showPreview(e.target.result);
        showNotification("Imagen cargada correctamente", "success");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Mostrar preview de imagen
  function showPreview(src) {
    previewImg.src = src;
    uploadZone.style.display = "none";
    imagePreview.style.display = "block";
  }

  // Ocultar preview
  function hidePreview() {
    previewImg.src = "";
    uploadZone.style.display = "flex";
    imagePreview.style.display = "none";
    selectedFile = null;
    imageData = null;
    fileInput.value = "";
  }

  // Eliminar imagen
  btnRemoveImage.addEventListener("click", function () {
    hidePreview();
    showNotification("Imagen eliminada", "success");
  });

  // Validar formulario
  function validateForm() {
    if (!selectedFile && !imageData) {
      return {
        valid: false,
        message: "Debes subir una imagen para tu proyecto",
      };
    }
    return { valid: true };
  }

  // Guardar borrador
  btnGuardarBorrador.addEventListener("click", function () {
    // Recuperar datos de pasos anteriores
    const step1Data = sessionStorage.getItem("projectStep1");
    const step2Data = sessionStorage.getItem("projectStep2");
    const step3Data = sessionStorage.getItem("projectStep3");

    const draftData = {
      step1: step1Data ? JSON.parse(step1Data) : null,
      step2: step2Data ? JSON.parse(step2Data) : null,
      step3: step3Data ? JSON.parse(step3Data) : null,
      step4: {
        hasImage: !!selectedFile,
        imageData: imageData, // En producción, esto sería una URL del servidor
        fileName: selectedFile ? selectedFile.name : null,
        fileSize: selectedFile ? selectedFile.size : null,
      },
      currentStep: CURRENT_STEP,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem("projectDraft", JSON.stringify(draftData));
    showNotification("Borrador guardado correctamente", "success");
  });

  // Botón anterior
  btnAnterior.addEventListener("click", function (e) {
    e.preventDefault();

    // Guardar estado actual antes de ir atrás
    if (selectedFile) {
      sessionStorage.setItem(
        "projectStep4",
        JSON.stringify({
          hasImage: true,
          imageData: imageData,
          fileName: selectedFile.name,
        })
      );
    }

    // Navegar al paso anterior
    window.location.href = "crear-proyecto-paso3.html";
  });

  // Botón siguiente
  btnSiguiente.addEventListener("click", function (e) {
    e.preventDefault();

    const validation = validateForm();

    if (!validation.valid) {
      showNotification(validation.message, "error");
      return;
    }

    // Guardar datos del paso actual
    const step4Data = {
      hasImage: true,
      imageData: imageData,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type,
    };

    sessionStorage.setItem("projectStep4", JSON.stringify(step4Data));

    // Navegar al siguiente paso (paso final de revisión)
    window.location.href = "crear-proyecto-paso5.html";
  });

  // Cargar borrador si existe
  function loadDraft() {
    // Primero intentar cargar desde sessionStorage
    const step4Session = sessionStorage.getItem("projectStep4");
    if (step4Session) {
      const data = JSON.parse(step4Session);
      if (data.imageData) {
        imageData = data.imageData;
        showPreview(data.imageData);
        // Crear un file falso para la validación
        selectedFile = {
          name: data.fileName || "imagen.jpg",
          size: 0,
          type: "image/jpeg",
        };
      }
      return;
    }

    // Si no hay en session, intentar desde localStorage
    const draft = localStorage.getItem("projectDraft");
    if (draft) {
      const draftData = JSON.parse(draft);
      if (draftData.step4 && draftData.step4.imageData) {
        imageData = draftData.step4.imageData;
        showPreview(draftData.step4.imageData);
        selectedFile = {
          name: draftData.step4.fileName || "imagen.jpg",
          size: draftData.step4.fileSize || 0,
          type: "image/jpeg",
        };
      }
    }
  }

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

    // Cerrar notificación
    const closeBtn = notification.querySelector(".notification-close");
    closeBtn.addEventListener("click", () => notification.remove());

    document.body.appendChild(notification);

    // Auto-cerrar después de 4 segundos
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 4000);
  }

  // Inicialización
  updateProgress();
  loadDraft();
});

/**
 * Funciones adicionales para integración con backend
 */

// Función para subir imagen al servidor
async function uploadImageToServer(file, projectId, token) {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("projectId", projectId);

  try {
    const response = await fetch("/api/projects/upload-image", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Error al subir la imagen");
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// Función para comprimir imagen antes de subir
function compressImage(file, maxWidth = 1920, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Redimensionar si es necesario
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(
              new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              })
            );
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Función para obtener dimensiones de imagen
function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
