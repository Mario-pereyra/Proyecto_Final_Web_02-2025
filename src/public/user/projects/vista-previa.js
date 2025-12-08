// ============================================
// VISTA PREVIA DEL PROYECTO
// ============================================

document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  // Referencias UI
  const previewTitle = document.getElementById("previewTitle");
  const previewCategory = document.getElementById("previewCategory");
  const previewGoal = document.getElementById("previewGoal");
  const previewDates = document.getElementById("previewDates");
  const previewSummary = document.getElementById("previewSummary");
  const previewImages = document.getElementById("previewImages");
  const previewContent = document.getElementById("previewContent");
  const previewRequirements = document.getElementById("previewRequirements");
  const previewRequirementsSection = document.getElementById("previewRequirementsSection");

  const btnEditar = document.getElementById("btnEditar");
  const btnGuardarBorrador = document.getElementById("btnGuardarBorrador");
  const btnPublicar = document.getElementById("btnPublicar");

  if (!projectId) {
    mostrarModal({
      title: 'Error',
      message: 'No se encontró el proyecto.',
      type: 'error',
      onConfirm: () => window.location.href = "./crear-proyecto-paso1.html"
    });
    return;
  }

  // Cargar datos
  await loadPreviewData();

  async function loadPreviewData() {
    try {
      const res = await fetch(`/api/projects/${projectId}?userId=101`); // Auth temp
      const result = await res.json();

      if (!result.success || !result.data) {
        throw new Error("No se pudo cargar el proyecto");
      }

      const p = result.data;

      // Paso 1
      previewTitle.textContent = p.title || "Sin título";
      previewSummary.textContent = p.short_description || "";
      previewCategory.textContent = p.category_name || "Sin categoría";

      // Paso 2 (Editor.js)
      let storyData = p.story_json;
      if (typeof storyData === 'string') storyData = JSON.parse(storyData);

      if (storyData && storyData.blocks) {
        renderEditorContent(storyData.blocks);
      }

      // Paso 3
      if (p.goal_amount) {
        previewGoal.textContent = `Meta: ${formatNumber(p.goal_amount)} Bs`;
      }
      if (p.started_at && p.deadline_at) {
        const inicio = new Date(p.started_at).toLocaleDateString("es-ES");
        const fin = new Date(p.deadline_at).toLocaleDateString("es-ES");
        previewDates.textContent = `${inicio} - ${fin}`;
      }

      // Paso 4 (Galería)
      if (p.images && p.images.length > 0) {
        renderImagesProject(p.images);
      }

      // Paso 5 (Requisitos)
      if (p.requirements_answers && p.requirements_answers.length > 0) {
        renderRequirementsProject(p.requirements_answers);
        previewRequirementsSection.style.display = "block";
      }

    } catch (e) {
      console.error("Error cargando vista previa:", e);
      mostrarModal({ title: 'Error', message: 'Error cargando datos del proyecto.', type: 'error' });
    }
  }

  // --- RENDERIZADO ---

  function resolvePath(path) {
    if (path && !path.startsWith('/') && !path.startsWith('http')) {
      return '/' + path;
    }
    return path;
  }

  function renderImagesProject(images) {
    previewImages.innerHTML = "";
    images.forEach(img => {
      const div = document.createElement("div");
      div.className = `preview-image ${img.is_cover ? "is-cover" : ""}`;
      div.innerHTML = `<img src="${resolvePath(img.image_path)}" alt="${img.original_filename}" />`;
      previewImages.appendChild(div);
    });
  }

  function renderRequirementsProject(answers) {
    let html = "<ul style='list-style: none; padding: 0;'>";
    answers.forEach(ans => {
      html += `
          <li style="display: flex; gap: 8px; margin-bottom: 12px;">
             <iconify-icon icon="ic:round-check-circle" style="color: var(--color-success); flex-shrink: 0;" width="20"></iconify-icon>
             <div>
                <strong>Documento subido:</strong>
                <a href="${resolvePath(ans.file_path)}" target="_blank">${ans.original_filename}</a>
             </div>
          </li>
        `;
    });
    html += "</ul>";
    previewRequirements.innerHTML = html;
  }

  function renderEditorContent(blocks) {
    let html = "";
    blocks.forEach((block) => {
      switch (block.type) {
        case "paragraph": html += `<p>${block.data.text}</p>`; break;
        case "header": html += `<h${block.data.level}>${block.data.text}</h${block.data.level}>`; break;
        case "list":
          const listType = block.data.style === "ordered" ? "ol" : "ul";
          html += `<${listType}>${block.data.items.map(i => `<li>${i}</li>`).join("")}</${listType}>`;
          break;
        case "checklist":
          html += `<div>${block.data.items.map(i => `<div style="display:flex;gap:8px;"><input type="checkbox" ${i.checked ? "checked" : ""} disabled/><span>${i.text}</span></div>`).join("")}</div>`;
          break;
        case "image":
          html += `<figure><img src="${resolvePath(block.data.file.url)}" alt="${block.data.caption || ""}" style="max-width:100%;"/><figcaption>${block.data.caption || ""}</figcaption></figure>`;
          break;
        default: if (block.data?.text) html += `<p>${block.data.text}</p>`;
      }
    });
    previewContent.innerHTML = html || "<p>Sin contenido detallado.</p>";
  }

  function formatNumber(num) {
    return Number(num).toLocaleString("es-BO");
  }

  // --- BOTONES ---

  btnEditar.addEventListener("click", () => {
    window.location.href = `./crear-proyecto-paso1.html?id=${projectId}`;
  });

  btnGuardarBorrador.addEventListener("click", () => {
    mostrarModal({ title: 'Borrador', message: 'Tu proyecto ya está guardado como borrador.', type: 'info' });
  });

  btnPublicar.addEventListener("click", () => {
    mostrarModal({
      title: 'Confirmar Publicación',
      message: '¿Estás seguro? El proyecto pasará a revisión.',
      type: 'confirm',
      confirmText: 'Sí, Publicar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/projects/${projectId}/submit`, {
            method: 'POST'
          });
          const result = await res.json();

          if (result.success) {
            mostrarModal({
              title: '¡Enviado!',
              message: 'Tu proyecto está en revisión.',
              type: 'success',
              onConfirm: () => window.location.href = "../dashboard.html"
            });
          } else {
            throw new Error(result.message);
          }
        } catch (e) {
          mostrarModal({ title: 'Error', message: 'No se pudo publicar: ' + e.message, type: 'error' });
        }
      }
    });
  });

});
