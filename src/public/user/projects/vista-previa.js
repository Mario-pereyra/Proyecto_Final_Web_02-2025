// ============================================
// VISTA PREVIA DEL PROYECTO
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  // Referencias a elementos
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

  // Cargar todos los datos
  loadPreviewData();

  function loadPreviewData() {
    // Paso 1: Información Básica
    const step1 = JSON.parse(sessionStorage.getItem("projectStep1") || "{}");
    if (step1.titulo) previewTitle.textContent = step1.titulo;
    if (step1.descripcion) previewSummary.textContent = step1.descripcion;
    if (step1.categoria) {
      const categories = {
        tecnologia: "Tecnología",
        salud: "Salud",
        educacion: "Educación",
        "medio-ambiente": "Medio Ambiente",
        social: "Social",
        "arte-cultura": "Arte y Cultura",
      };
      previewCategory.textContent = categories[step1.categoria] || step1.categoria;
    }

    // Paso 2: Descripción Detallada (EditorJS)
    const step2 = JSON.parse(sessionStorage.getItem("projectStep2") || "{}");
    if (step2.descripcionDetallada && step2.descripcionDetallada.blocks) {
      renderEditorContent(step2.descripcionDetallada.blocks);
    }

    // Paso 3: Financiación
    const step3 = JSON.parse(sessionStorage.getItem("projectStep3") || "{}");
    if (step3.metaFinanciera) {
      previewGoal.textContent = `Meta: ${formatNumber(step3.metaFinanciera)} Bs`;
    }
    if (step3.fechaInicio && step3.fechaFin) {
      const inicio = new Date(step3.fechaInicio).toLocaleDateString("es-ES");
      const fin = new Date(step3.fechaFin).toLocaleDateString("es-ES");
      previewDates.textContent = `${inicio} - ${fin}`;
    }

    // Paso 4: Multimedia
    const step4 = JSON.parse(sessionStorage.getItem("projectStep4") || "{}");
    if (step4.images && step4.images.length > 0) {
      renderImages(step4.images);
    }

    // Paso 5: Requisitos
    const step5 = JSON.parse(sessionStorage.getItem("projectStep5") || "{}");
    if (step5.requirements && Object.keys(step5.requirements).length > 0) {
      renderRequirements(step5.requirements);
      previewRequirementsSection.style.display = "block";
    }
  }

  // Renderizar contenido de EditorJS
  function renderEditorContent(blocks) {
    let html = "";

    blocks.forEach((block) => {
      switch (block.type) {
        case "paragraph":
          html += `<p>${block.data.text}</p>`;
          break;
        case "header":
          html += `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
          break;
        case "list":
          const listType = block.data.style === "ordered" ? "ol" : "ul";
          const items = block.data.items.map((item) => `<li>${item}</li>`).join("");
          html += `<${listType}>${items}</${listType}>`;
          break;
        case "checklist":
          const checkItems = block.data.items
            .map((item) => `
              <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                <input type="checkbox" ${item.checked ? "checked" : ""} disabled />
                <span>${item.text}</span>
              </div>
            `)
            .join("");
          html += `<div>${checkItems}</div>`;
          break;
        case "table":
          const rows = block.data.content
            .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
            .join("");
          html += `<table style="width: 100%; border-collapse: collapse; margin: 16px 0;"><tbody>${rows}</tbody></table>`;
          break;
        case "warning":
          html += `
            <div style="background: var(--color-warning-bg); border-left: 4px solid var(--color-warning); padding: 16px; margin: 16px 0; border-radius: 4px;">
              <strong>${block.data.title}</strong>
              <p>${block.data.message}</p>
            </div>
          `;
          break;
        case "quote":
          html += `
            <blockquote style="border-left: 4px solid var(--color-primary); padding-left: 16px; margin: 16px 0; font-style: italic;">
              ${block.data.text}
              ${block.data.caption ? `<footer>— ${block.data.caption}</footer>` : ""}
            </blockquote>
          `;
          break;
        case "code":
          html += `<pre style="background: var(--bg-tertiary); padding: 16px; border-radius: 8px; overflow-x: auto;"><code>${block.data.code}</code></pre>`;
          break;
        case "delimiter":
          html += `<hr style="margin: 24px 0; border: none; border-top: 2px solid var(--border-color);" />`;
          break;
        case "image":
          html += `<figure style="margin: 24px 0;"><img src="${block.data.file.url}" alt="${block.data.caption || ""}" style="max-width: 100%; border-radius: 8px;" />${block.data.caption ? `<figcaption style="text-align: center; margin-top: 8px; color: var(--text-secondary);">${block.data.caption}</figcaption>` : ""}</figure>`;
          break;
        case "embed":
          if (block.data.service === "youtube") {
            html += `<div style="position: relative; padding-bottom: 56.25%; height: 0; margin: 24px 0;"><iframe src="${block.data.embed}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 8px;" frameborder="0" allowfullscreen></iframe></div>`;
          }
          break;
        default:
          if (block.data && block.data.text) {
            html += `<p>${block.data.text}</p>`;
          }
      }
    });

    previewContent.innerHTML = html || "<p>Sin contenido</p>";
  }

  // Renderizar imágenes
  function renderImages(images) {
    previewImages.innerHTML = "";
    images.forEach((image) => {
      const div = document.createElement("div");
      div.className = `preview-image ${image.isCover ? "is-cover" : ""}`;
      div.innerHTML = `<img src="${image.url}" alt="${image.name}" />`;
      previewImages.appendChild(div);
    });
  }

  // Renderizar requisitos
  function renderRequirements(requirements) {
    let html = "<ul style='list-style: none; padding: 0;'>";
    Object.keys(requirements).forEach((code) => {
      const req = requirements[code];
      if (req.value_text) {
        html += `
          <li style="display: flex; gap: 8px; margin-bottom: 12px;">
            <iconify-icon icon="ic:round-check-circle" style="color: var(--color-success); flex-shrink: 0;" width="20"></iconify-icon>
            <div>
              <strong>${code.replace(/_/g, " ").toUpperCase()}:</strong>
              <span>${req.value_text}</span>
            </div>
          </li>
        `;
      }
    });
    html += "</ul>";
    previewRequirements.innerHTML = html;
  }

  // Formatear número
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Botón Editar
  btnEditar.addEventListener("click", () => {
    window.location.href = "./crear-proyecto-paso1.html";
  });

  // Guardar Borrador
  btnGuardarBorrador.addEventListener("click", () => {
    const projectData = {
      step1: JSON.parse(sessionStorage.getItem("projectStep1") || "{}"),
      step2: JSON.parse(sessionStorage.getItem("projectStep2") || "{}"),
      step3: JSON.parse(sessionStorage.getItem("projectStep3") || "{}"),
      step4: JSON.parse(sessionStorage.getItem("projectStep4") || "{}"),
      step5: JSON.parse(sessionStorage.getItem("projectStep5") || "{}"),
      status: "draft",
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem("projectDraft", JSON.stringify(projectData));
    mostrarModal({
      title: 'Borrador guardado',
      message: 'Borrador guardado correctamente',
      type: 'success'
    });
  });

  // Publicar Proyecto
  btnPublicar.addEventListener("click", () => {
    mostrarModal({
      title: 'Confirmar Publicación',
      message: '¿Estás seguro de que deseas publicar este proyecto? Será enviado para revisión.',
      type: 'confirm',
      confirmText: 'Sí, Publicar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        const projectData = {
          step1: JSON.parse(sessionStorage.getItem("projectStep1") || "{}"),
          step2: JSON.parse(sessionStorage.getItem("projectStep2") || "{}"),
          step3: JSON.parse(sessionStorage.getItem("projectStep3") || "{}"),
          step4: JSON.parse(sessionStorage.getItem("projectStep4") || "{}"),
          step5: JSON.parse(sessionStorage.getItem("projectStep5") || "{}"),
          status: "pending_approval",
          submittedAt: new Date().toISOString(),
        };

        console.log("Proyecto a publicar:", projectData);

        // Limpiar storage
        sessionStorage.removeItem("projectStep1");
        sessionStorage.removeItem("projectStep2");
        sessionStorage.removeItem("projectStep3");
        sessionStorage.removeItem("projectStep4");
        sessionStorage.removeItem("projectStep5");
        localStorage.removeItem("projectDraft");

        mostrarModal({
          title: '¡Proyecto Publicado!',
          message: 'Tu proyecto ha sido enviado y será revisado por nuestro equipo.',
          type: 'success',
          onConfirm: () => {
            window.location.href = "../dashboard.html";
          }
        });
      }
    });
  });
});
