/**
 * Capa de Vista: ProjectFormUI
 * Maneja el renderizado del formulario de creación/edición de proyectos.
 * Implementa el patrón Singleton/Namespace.
 */
const ProjectFormUI = {

    // --- Renderizado de Listas ---

    renderCategories(categories, selectElement) {
        selectElement.innerHTML = '<option value="" disabled selected>Selecciona una categoría</option>';
        categories.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat.id;
            opt.textContent = cat.name;
            selectElement.appendChild(opt);
        });
    },

    renderRequirements(requirements, listElement, existingAnswers = [], onFileSelect) {
        listElement.innerHTML = "";

        if (requirements.length === 0) {
            listElement.innerHTML = "<p>No se requieren documentos adicionales para esta categoría.</p>";
            return;
        }

        requirements.forEach(req => {
            const existing = existingAnswers.find(a => a.requirement_id === req.id);
            const isUploaded = !!existing;

            const div = document.createElement("div");
            div.className = "form-group";

            const fileLink = isUploaded
                ? `<span class="text-success">✅ Archivo actual: <a href="/uploads/files/${existing.file_path}" target="_blank">${existing.original_filename}</a></span>`
                : '';

            div.innerHTML = `
              <label class="form-label">${req.title} ${req.is_required ? '*' : ''}</label>
              <p class="form-hint">${req.description || "Sube el documento solicitado"}</p>
              
              <div style="display: flex; align-items: center; gap: 1rem;">
                  <input type="file" class="form-input req-file-input" data-req-id="${req.id}" accept=".pdf,.doc,.docx,.jpg,.png" />
                  ${fileLink}
              </div>
          `;
            listElement.appendChild(div);
        });

        // Bind events
        listElement.querySelectorAll(".req-file-input").forEach(input => {
            input.addEventListener("change", (e) => onFileSelect(e.target.getAttribute("data-req-id"), e.target.files[0]));
        });
    },

    // --- Renderizado de Multimedia ---

    showCoverPreview(url, previewElement, uploadAreaElement, imageTag) {
        imageTag.src = url;
        previewElement.style.display = "block";
        uploadAreaElement.style.display = "none";
    },

    hideCoverPreview(previewElement, uploadAreaElement, inputElement) {
        inputElement.value = "";
        previewElement.style.display = "none";
        uploadAreaElement.style.display = "block";
    },

    renderGallery(existingImages, newFiles, gridElement, onDeleteServerImage, onDeleteLocalFile) {
        gridElement.innerHTML = "";

        // 1. Imágenes existentes (DB)
        existingImages.forEach(img => {
            const rawPath = img.image_path;
            const path = rawPath.startsWith('uploads') || rawPath.startsWith('/') ? rawPath : `/uploads/img/${rawPath}`;

            const div = document.createElement("div");
            div.className = "image-preview-item";
            const isCover = img.is_cover;

            div.innerHTML = `
              <img src="${path}" alt="${img.original_filename}" />
              ${isCover ? '<span class="cover-badge">Portada Actual</span>' : ''}
              <button type="button" class="remove-btn" title="Eliminar">×</button>
          `;

            div.querySelector(".remove-btn").addEventListener("click", () => onDeleteServerImage(img.id));
            gridElement.appendChild(div);
        });

        // 2. Imágenes nuevas (Local Blob)
        newFiles.forEach((file, idx) => {
            const url = URL.createObjectURL(file);
            const div = document.createElement("div");
            div.className = "image-preview-item";
            div.innerHTML = `
              <img src="${url}" alt="Nueva" />
              <span class="cover-badge" style="background:#4caf50;">Nueva</span>
              <button type="button" class="remove-btn">×</button>
          `;

            div.querySelector(".remove-btn").addEventListener("click", () => onDeleteLocalFile(idx));
            gridElement.appendChild(div);
        });
    },

    // --- Lógica del Editor ---
    // (Wraps Editor.js initialization to keep controller clean)
    initEditor(holderId, data, imageUploadUrl) {
        // Asumiendo que EditorJS ya está cargado globalmente desde el CDN
        if (typeof EditorJS === 'undefined') {
            console.error("EditorJS no está cargado");
            return null;
        }

        return new EditorJS({
            holder: holderId,
            placeholder: "Escribe aquí la historia de tu proyecto...",
            data: data,
            tools: {
                header: { class: window.Header, inlineToolbar: true },
                list: { class: window.EditorjsList, inlineToolbar: true },
                checklist: { class: window.Checklist, inlineToolbar: true },
                image: {
                    class: window.ImageTool,
                    config: {
                        endpoints: { byFile: imageUploadUrl },
                        uploader: {
                            uploadByFile(file) {
                                const formData = new FormData();
                                formData.append('image', file);
                                return fetch(imageUploadUrl, { method: 'POST', body: formData })
                                    .then(r => r.json()).then(d => {
                                        if (d.success === 1) return d;
                                        throw new Error('Error subida');
                                    });
                            }
                        }
                    }
                },
                embed: { class: window.Embed, inlineToolbar: true, config: { services: { youtube: true } } }
            }
        });
    }
};
