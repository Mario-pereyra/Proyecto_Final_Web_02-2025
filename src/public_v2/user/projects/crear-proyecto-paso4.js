// ============================================
// CREAR PROYECTO - PASO 4: Multimedia
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  // Referencias a elementos
  const form = document.getElementById("paso4Form");
  const uploadArea = document.getElementById("uploadArea");
  const imageInput = document.getElementById("imageInput");
  const imagePreviewGrid = document.getElementById("imagePreviewGrid");
  const btnAnterior = document.getElementById("btnAnterior");
  const btnGuardarBorrador = document.getElementById("btnGuardarBorrador");
  const errorImagen = document.getElementById("imagen_principal-error");

  // Constantes
  const TOTAL_STEPS = 5;
  const CURRENT_STEP = 4;
  const MAX_IMAGES = 10;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

  // Estado
  let images = [];

  // Actualizar progreso
  updateProgress(CURRENT_STEP, TOTAL_STEPS);

  // Click en área de upload
  uploadArea.addEventListener("click", () => imageInput.click());

  // Drag & Drop
  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("dragover");
  });

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("dragover");
  });

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("dragover");
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  });

  // Selección de archivos
  imageInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    e.target.value = "";
  });

  // Manejar archivos
  function handleFiles(files) {
    // Limpiar error
    errorImagen.innerHTML = "";
    errorImagen.classList.remove("show");

    files.forEach((file) => {
      // Validar tipo
      if (!ALLOWED_TYPES.includes(file.type)) {
        showError(`${file.name}: Formato no válido. Usa JPG, PNG o WebP.`);
        return;
      }

      // Validar tamaño
      if (file.size > MAX_FILE_SIZE) {
        showError(`${file.name}: Excede el tamaño máximo de 5MB.`);
        return;
      }

      // Validar cantidad
      if (images.length >= MAX_IMAGES) {
        showError(`Máximo ${MAX_IMAGES} imágenes permitidas.`);
        return;
      }

      // Leer archivo
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = {
          id: Date.now() + Math.random(),
          url: e.target.result,
          name: file.name,
          size: file.size,
          isCover: images.length === 0, // Primera imagen es portada
        };
        images.push(imageData);
        renderImages();
      };
      reader.readAsDataURL(file);
    });
  }

  // Renderizar imágenes
  function renderImages() {
    imagePreviewGrid.innerHTML = "";

    images.forEach((image, index) => {
      const item = document.createElement("div");
      item.className = `image-preview-item ${image.isCover ? "is-cover" : ""}`;
      item.innerHTML = `
        <img src="${image.url}" alt="${image.name}" class="image-preview-img" />
        <div class="image-preview-actions">
          ${
            !image.isCover
              ? `<button type="button" class="image-action-btn" data-action="cover" data-index="${index}" title="Establecer como portada">
              <iconify-icon icon="ic:round-star" width="20"></iconify-icon>
            </button>`
              : ""
          }
          <button type="button" class="image-action-btn" data-action="delete" data-index="${index}" title="Eliminar">
            <iconify-icon icon="ic:round-delete" width="20"></iconify-icon>
          </button>
        </div>
        ${image.isCover ? '<span class="cover-badge">Portada</span>' : ""}
      `;
      imagePreviewGrid.appendChild(item);
    });

    // Event listeners para acciones
    document.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const index = parseInt(btn.dataset.index);

        if (action === "delete") {
          images.splice(index, 1);
          // Si eliminamos la portada, hacer portada la primera imagen
          if (images.length > 0 && !images.some((img) => img.isCover)) {
            images[0].isCover = true;
          }
          renderImages();
        } else if (action === "cover") {
          images.forEach((img) => (img.isCover = false));
          images[index].isCover = true;
          renderImages();
        }
      });
    });
  }

  // Mostrar error
  function showError(message) {
    errorImagen.innerHTML = message;
    errorImagen.classList.add("show");
  }

  // Botón Anterior
  btnAnterior.addEventListener("click", () => {
    window.location.href = "./crear-proyecto-paso3.html";
  });

  // Guardar borrador
  btnGuardarBorrador.addEventListener("click", () => {
    const projectData = {
      images: images.map((img) => ({
        url: img.url,
        name: img.name,
        isCover: img.isCover,
      })),
      status: "draft",
      step: CURRENT_STEP,
      savedAt: new Date().toISOString(),
    };

    const existingDraft = localStorage.getItem("projectDraft");
    const draft = existingDraft ? JSON.parse(existingDraft) : {};
    Object.assign(draft, projectData);
    localStorage.setItem("projectDraft", JSON.stringify(draft));

    alert("✅ Borrador guardado correctamente");
  });

  // Formulario submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Limpiar error
    errorImagen.innerHTML = "";
    errorImagen.classList.remove("show");

    // Validar que haya al menos una imagen
    if (images.length === 0) {
      showError("Debes subir al menos una imagen");
      return;
    }

    // Guardar datos del paso actual
    const projectData = {
      images: images.map((img) => ({
        url: img.url,
        name: img.name,
        isCover: img.isCover,
      })),
      step: CURRENT_STEP,
    };

    sessionStorage.setItem("projectStep4", JSON.stringify(projectData));

    // Navegar al siguiente paso
    window.location.href = "./crear-proyecto-paso5.html";
  });

  // Cargar datos guardados
  function loadStepData() {
    // Intentar cargar desde sessionStorage
    const stepData = sessionStorage.getItem("projectStep4");
    if (stepData) {
      const data = JSON.parse(stepData);
      if (data.images && data.images.length > 0) {
        images = data.images.map((img) => ({
          ...img,
          id: Date.now() + Math.random(),
        }));
        renderImages();
      }
      return;
    }

    // Intentar cargar desde localStorage (borrador)
    const draft = localStorage.getItem("projectDraft");
    if (draft) {
      const data = JSON.parse(draft);
      if (data.images && data.images.length > 0) {
        images = data.images.map((img) => ({
          ...img,
          id: Date.now() + Math.random(),
        }));
        renderImages();
      }
    }
  }

  // Inicialización
  loadStepData();
});
