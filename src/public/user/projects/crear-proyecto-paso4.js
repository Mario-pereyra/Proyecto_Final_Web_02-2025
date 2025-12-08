// ============================================
// CREAR PROYECTO - PASO 4: Multimedia
// ============================================

document.addEventListener("DOMContentLoaded", async function () {
  const TOTAL_STEPS = 5;
  const CURRENT_STEP = 4;
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  // Validar navegación
  if (!projectId) {
    mostrarModal({
      title: 'Error',
      message: 'Falta ID de proyecto. Redirigiendo.',
      type: 'error',
      onConfirm: () => window.location.href = "./crear-proyecto-paso1.html"
    });
    return;
  }

  // Referencias UI
  const form = document.getElementById("paso4Form");
  const uploadArea = document.getElementById("uploadArea");
  const imageInput = document.getElementById("imageInput");
  const imagePreviewGrid = document.getElementById("imagePreviewGrid");
  const btnAnterior = document.getElementById("btnAnterior");
  const btnGuardarBorrador = document.getElementById("btnGuardarBorrador");
  const errorImagen = document.getElementById("imagen_principal-error");

  // Estado
  let images = []; // { url, name, isCover, tempId }
  const MAX_IMAGES = 10;
  const MAX_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

  updateProgress(CURRENT_STEP, TOTAL_STEPS);

  // Inicializar
  await loadData();

  // --- FUNCIONES LÓGICAS ---

  async function loadData() {
    try {
      const resp = await fetch(`/api/projects/${projectId}?userId=101`);
      const r = await resp.json();
      if (r.success && r.data) {
        // Cargar imágenes existentes
        if (r.data.images && Array.isArray(r.data.images)) {
          images = r.data.images.map(img => ({
            url: resolvePath(img.image_path),
            name: img.original_filename,
            isCover: img.is_cover
          }));
          renderImages();
        }
      }
    } catch (e) {
      console.error("Error cargando paso 4:", e);
    }
  }

  function resolvePath(path) {
    if (path && !path.startsWith('/') && !path.startsWith('http')) {
      return '/' + path;
    }
    return path;
  }

  async function uploadFile(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload/story-image', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();

      if (result.success === 1 && result.file && result.file.url) {
        return result.file.url;
      }
      throw new Error("Respuesta inválida del servidor");
    } catch (e) {
      console.error("Error subiendo imagen:", e);
      return null;
    }
  }

  // Manejar Archivos (Selección o Drop)
  async function handleFiles(files) {
    errorImagen.innerHTML = "";
    errorImagen.classList.remove("show");

    for (const file of files) {
      // Validaciones
      if (!ALLOWED_TYPES.includes(file.type)) {
        showError(`${file.name}: Formato inválido.`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        showError(`${file.name}: Muy pesado (Max 5MB).`);
        continue;
      }
      if (images.length >= MAX_IMAGES) {
        showError(`Máximo ${MAX_IMAGES} imágenes.`);
        break;
      }

      const tempId = Date.now() + Math.random();

      // SUBIR
      const url = await uploadFile(file);
      if (url) {
        const isFirst = images.length === 0;
        images.push({
          url: resolvePath(url),
          name: file.name,
          isCover: isFirst,
          tempId: tempId
        });
        renderImages();
      } else {
        showError(`Error al subir ${file.name}`);
      }
    }
  }

  function renderImages() {
    imagePreviewGrid.innerHTML = "";

    images.forEach((img, index) => {
      const div = document.createElement("div");
      div.className = `image-preview-item ${img.isCover ? "is-cover" : ""}`;
      div.innerHTML = `
           <img src="${img.url}" alt="${img.name}" class="image-preview-img" />
           <div class="image-preview-actions">
              ${!img.isCover ? `
                 <button type="button" class="image-action-btn" data-action="cover" data-index="${index}" title="Portada">
                   <iconify-icon icon="ic:round-star" width="20"></iconify-icon>
                 </button>
              ` : ''}
              <button type="button" class="image-action-btn" data-action="delete" data-index="${index}" title="Eliminar">
                <iconify-icon icon="ic:round-delete" width="20"></iconify-icon>
              </button>
           </div>
           ${img.isCover ? '<span class="cover-badge">Portada</span>' : ""}
        `;
      imagePreviewGrid.appendChild(div);
    });

    // Listeners dinámicos
    document.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const idx = parseInt(btn.dataset.index);

        if (action === 'delete') {
          deleteImage(idx);
        } else if (action === 'cover') {
          setCover(idx);
        }
      });
    });
  }

  async function deleteImage(index) {
    const img = images[index];
    images.splice(index, 1);

    if (img.isCover && images.length > 0) {
      images[0].isCover = true;
    }
    renderImages();
  }

  function setCover(index) {
    images.forEach(i => i.isCover = false);
    images[index].isCover = true;
    renderImages();
  }

  async function saveDraft() {
    const draftData = {
      id: projectId,
      step: CURRENT_STEP,
      images: images // Enviamos array completo
    };

    try {
      const res = await fetch('/api/projects/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftData)
      });
      return (await res.json()).success;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  function showError(msg) {
    errorImagen.textContent = msg;
    errorImagen.classList.add("show");
  }

  // --- EVENTOS UI ---

  uploadArea.addEventListener("click", () => imageInput.click());

  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("dragover");
  });
  uploadArea.addEventListener("dragleave", () => uploadArea.classList.remove("dragover"));
  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("dragover");
    handleFiles(Array.from(e.dataTransfer.files));
  });

  imageInput.addEventListener("change", (e) => {
    handleFiles(Array.from(e.target.files));
    e.target.value = "";
  });

  btnAnterior.addEventListener("click", () => {
    window.location.href = `./crear-proyecto-paso3.html?id=${projectId}`;
  });

  btnGuardarBorrador.addEventListener("click", async () => {
    if (await saveDraft()) shownSavedModal();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      showError("Sube al menos una imagen.");
      return;
    }
    if (await saveDraft()) {
      window.location.href = `./crear-proyecto-paso5.html?id=${projectId}`;
    }
  });

  function shownSavedModal() {
    mostrarModal({ title: 'Guardado', message: 'Multimedia guardada.', type: 'success' });
  }

});
