/**
 * CREAR PROYECTO - FORMULARIO UNIFICADO
 * Reemplaza la lógica de pasos fraccionados.
 */

let editor; // Instancia global de Editor.js
let uploadedGalleryFiles = []; // Archivos NUEVOS seleccionados para galería
let existingGalleryImages = []; // Imágenes ya guardadas en DB
let categoryRequirements = []; // Lista de requisitos activos
let uploadedRequirementFiles = {}; // Archivos NUEVOS de requisitos { reqId: file }

document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    const USER_ID = 101; // ID temporal hardcoded

    // Referencias UI
    const form = document.getElementById("projectForm");
    const categorySelect = document.getElementById("categoria");
    const requirementsSection = document.getElementById("requirementsSection");
    const requirementsList = document.getElementById("requirementsList");

    // Inputs Fechas
    const fechaInicioInput = document.getElementById("fecha_inicio");
    const duracionInput = document.getElementById("duracion");
    const fechaFinTexto = document.getElementById("fechaFinTexto");

    // Multimedia
    const coverInput = document.getElementById("coverInput");
    const coverPreview = document.getElementById("coverPreview");
    const coverImgTag = document.getElementById("coverImgTag");
    const removeCoverBtn = document.getElementById("removeCoverBtn");

    const galleryInput = document.getElementById("galleryInput");
    const galleryGrid = document.getElementById("galleryGrid");

    // Inicializar
    setupDateCalculations();
    await loadCategories();

    let initialEditorData = {};

    if (projectId) {
        document.querySelector(".page-title").textContent = "Editar Proyecto";
        initialEditorData = await loadProjectData(projectId);
    } else {
        // Valores por defecto
        fechaInicioInput.value = new Date().toISOString().split('T')[0];
        calculateEndDate();
    }

    initEditor(initialEditorData);

    // --- LOGICA DE CATEGORIAS Y REQUISITOS ---

    async function loadCategories() {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            if (data.success) {
                categorySelect.innerHTML = '<option value="" disabled selected>Selecciona una categoría</option>';
                data.data.forEach(cat => {
                    const opt = document.createElement("option");
                    opt.value = cat.id;
                    opt.textContent = cat.name;
                    categorySelect.appendChild(opt);
                });
            }
        } catch (e) {
            console.error("Error cargando categorías:", e);
        }
    }

    categorySelect.addEventListener("change", async () => {
        const catId = categorySelect.value;
        if (catId) await loadRequirements(catId);
    });

    async function loadRequirements(catId, existingAnswers = []) {
        try {
            const res = await fetch(`/api/categories/${catId}/requirements`);
            const data = await res.json();

            requirementsList.innerHTML = "";
            // Fix: Acceder a data.data.requirements
            categoryRequirements = (data.data && data.data.requirements) ? data.data.requirements : [];

            if (categoryRequirements.length === 0) {
                requirementsList.innerHTML = "<p>No se requieren documentos adicionales para esta categoría.</p>";
                return;
            }

            categoryRequirements.forEach(req => {
                // Verificar si ya hay respuesta subida
                const existing = existingAnswers.find(a => a.requirement_id === req.id);
                const isUploaded = !!existing;

                const div = document.createElement("div");
                div.className = "form-group";
                div.innerHTML = `
                    <label class="form-label">${req.title} ${req.is_required ? '*' : ''}</label>
                    <p class="form-hint">${req.description || "Sube el documento solicitado"}</p>
                    
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <input type="file" class="form-input req-file-input" data-req-id="${req.id}" accept=".pdf,.doc,.docx,.jpg,.png" />
                        ${isUploaded ? `<span class="text-success">✅ Archivo actual: <a href="/${existing.file_path}" target="_blank">${existing.original_filename}</a></span>` : ''}
                    </div>
                `;
                requirementsList.appendChild(div);
            });

            // Listeners para inputs de requisitos
            document.querySelectorAll(".req-file-input").forEach(input => {
                input.addEventListener("change", (e) => {
                    const file = e.target.files[0];
                    const reqId = e.target.getAttribute("data-req-id");
                    if (file) {
                        uploadedRequirementFiles[reqId] = file;
                    } else {
                        delete uploadedRequirementFiles[reqId];
                    }
                });
            });

        } catch (e) {
            console.error(e);
        }
    }

    // --- LOGICA DEL EDITOR ---

    function initEditor(data) {
        editor = new EditorJS({
            holder: "editorjs",
            placeholder: "Escribe aquí la historia de tu proyecto...",
            data: data,
            tools: {
                header: { class: window.Header, inlineToolbar: true },
                list: { class: window.EditorjsList, inlineToolbar: true },
                checklist: { class: window.Checklist, inlineToolbar: true },
                image: {
                    class: window.ImageTool,
                    config: {
                        endpoints: { byFile: '/api/upload/story-image' },
                        uploader: {
                            uploadByFile(file) {
                                const formData = new FormData();
                                formData.append('image', file);
                                return fetch('/api/upload/story-image', { method: 'POST', body: formData })
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

    // --- LOGICA DE FECHAS ---

    function setupDateCalculations() {
        fechaInicioInput.addEventListener("change", calculateEndDate);
        duracionInput.addEventListener("input", calculateEndDate);
    }

    function calculateEndDate() {
        const start = new Date(fechaInicioInput.value || new Date());
        const days = parseInt(duracionInput.value) || 30;
        const end = new Date(start);
        end.setDate(end.getDate() + days);
        fechaFinTexto.textContent = `Finaliza el: ${end.toLocaleDateString("es-ES")}`;
    }

    // --- LOGICA DE MULTIMEDIA ---

    // Portada
    document.getElementById("coverUploadArea").addEventListener("click", () => coverInput.click());

    coverInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            coverImgTag.src = url;
            coverPreview.style.display = "block";
            document.getElementById("coverUploadArea").style.display = "none";
        }
    });

    removeCoverBtn.addEventListener("click", () => {
        coverInput.value = "";
        coverPreview.style.display = "none";
        document.getElementById("coverUploadArea").style.display = "block";
        // Nota: Si es edición, esto NO borra la portada del servidor hasta guardar, 
        // pero visualmente indicamos que se quitará.
        // TODO: Manejar borrado explícito en backend si se desea.
    });

    // Galería
    document.getElementById("galleryUploadArea").addEventListener("click", () => galleryInput.click());

    galleryInput.addEventListener("change", (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            uploadedGalleryFiles.push(file);
        });
        renderGallery();
        // Limpiamos input para permitir seleccionar mismos archivos de nuevo (acumulativo)
        galleryInput.value = "";
    });

    function renderGallery() {
        galleryGrid.innerHTML = "";

        // 1. Imágenes existentes (DB)
        existingGalleryImages.forEach(img => {
            const path = img.image_path.startsWith('/') ? img.image_path : '/' + img.image_path;
            const div = document.createElement("div");
            div.className = "image-preview-item";
            // Si es portada existente y no se ha subido una nueva, la mostramos marcada
            const isCover = img.is_cover;

            div.innerHTML = `
                <img src="${path}" alt="${img.original_filename}" />
                ${isCover ? '<span class="cover-badge">Portada Actual</span>' : ''}
                <button type="button" class="remove-btn" title="Eliminar">×</button>
            `;

            // Botón eliminar (acción inmediata contra API)
            div.querySelector(".remove-btn").addEventListener("click", () => deleteServerImage(img.id));

            galleryGrid.appendChild(div);
        });

        // 2. Imágenes nuevas (Local Blob)
        uploadedGalleryFiles.forEach((file, idx) => {
            const url = URL.createObjectURL(file);
            const div = document.createElement("div");
            div.className = "image-preview-item";
            div.innerHTML = `
                <img src="${url}" alt="Nueva" />
                <span class="cover-badge" style="background:#4caf50;">Nueva</span>
                <button type="button" class="remove-btn">×</button>
            `;

            div.querySelector(".remove-btn").addEventListener("click", () => {
                uploadedGalleryFiles.splice(idx, 1);
                renderGallery();
            });

            galleryGrid.appendChild(div);
        });
    }

    async function deleteServerImage(imageId) {
        if (!confirm("¿Eliminar esta imagen permanentemente?")) return;
        try {
            const res = await fetch(`/api/projects/${projectId}/images/${imageId}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                // Eliminar del array local
                existingGalleryImages = existingGalleryImages.filter(i => i.id !== imageId);
                renderGallery();
            } else {
                alert("Error eliminando imagen");
            }
        } catch (e) {
            console.error(e);
        }
    }


    // --- CARGA DE DATOS (EDICIÓN) ---

    async function loadProjectData(id) {
        try {
            const res = await fetch(`/api/projects/${id}?userId=${USER_ID}`);
            const json = await res.json();
            if (!json.success) throw new Error("Proyecto no encontrado");

            const p = json.data;

            // Llenar campos
            document.getElementById("titulo").value = p.title || "";
            document.getElementById("descripcion").value = p.short_description || "";
            document.getElementById("meta").value = p.goal_amount || "";
            document.getElementById("duracion").value = p.duration_days || 30;

            if (p.started_at) {
                document.getElementById("fecha_inicio").value = new Date(p.started_at).toISOString().split('T')[0];
            }
            calculateEndDate(); // Recalcular texto fin

            // Categoría y Requisitos
            if (p.category_id) {
                categorySelect.value = p.category_id;
                // Cargar requisitos con respuestas prellenadas
                await loadRequirements(p.category_id, p.requirements_answers || []);
            }

            // Imágenes
            if (p.images) {
                // Separar portada y galería
                const cover = p.images.find(i => i.is_cover);

                if (cover) {
                    const path = cover.image_path.startsWith('/') ? cover.image_path : '/' + cover.image_path;
                    coverImgTag.src = path;
                    coverPreview.style.display = "block";
                    document.getElementById("coverUploadArea").style.display = "none";
                }

                // Filtrar galería (todas excepto cover, OJO: si queremos ver todas, dejar todas)
                // El usuario pidió diferenciar. Vamos a mostrar en galería las que NO son cover actual.
                existingGalleryImages = p.images.filter(i => !i.is_cover);
                renderGallery();
            }

            return typeof p.story_json === 'string' ? JSON.parse(p.story_json) : p.story_json;

        } catch (e) {
            console.error(e);
            mostrarModal({ title: "Error", message: "No se pudo cargar el proyecto.", type: "error" });
            return {};
        }
    }


    // --- ENVÍO DEL FORMULARIO ---

    form.addEventListener("submit", (e) => handleFormSubmit(e, 'publicado'));
    document.getElementById("btnGuardar").addEventListener("click", (e) => handleFormSubmit(e, 'borrador'));

    async function handleFormSubmit(e, status) {
        e.preventDefault();

        try {
            const formData = new FormData();

            // Campos Texto
            formData.append("title", document.getElementById("titulo").value);
            formData.append("short_description", document.getElementById("descripcion").value);
            formData.append("category_id", categorySelect.value);
            formData.append("goal_amount", document.getElementById("meta").value);
            formData.append("duration_days", document.getElementById("duracion").value);
            formData.append("started_at", document.getElementById("fecha_inicio").value);
            formData.append("approval_status", status); // 'borrador' o 'publicado'

            // Fechas calculadas
            const start = new Date(document.getElementById("fecha_inicio").value);
            start.setDate(start.getDate() + parseInt(document.getElementById("duracion").value));
            formData.append("deadline_at", start.toISOString());

            // ID (Edición)
            if (projectId) formData.append("id", projectId);

            // Historia Editor.js
            const storyData = await editor.save();
            formData.append("story_json", JSON.stringify(storyData));

            // Archivos: Portada (Solo si hay nueva)
            if (coverInput.files[0]) {
                formData.append("cover_image", coverInput.files[0]);
            }

            // Archivos: Galería (Nuevos)
            uploadedGalleryFiles.forEach((file) => {
                formData.append("gallery_images", file);
            });

            // Archivos: Requisitos
            Object.entries(uploadedRequirementFiles).forEach(([reqId, file]) => {
                formData.append(`req_${reqId}`, file);
            });

            // Enviar
            mostrarModal({ title: "Guardando...", message: "Por favor espera.", type: "info" });

            const res = await fetch('/api/projects/save', {
                method: 'POST',
                body: formData // No poner Content-Type, browser lo pone
            });

            const result = await res.json();

            if (result.success) {
                mostrarModal({
                    title: "Éxito",
                    message: "Proyecto guardado correctamente.",
                    type: "success",
                    onConfirm: () => window.location.href = "../dashboard.html"
                });
            } else {
                throw new Error(result.message);
            }

        } catch (error) {
            console.error(error);
            mostrarModal({ title: "Error", message: "Error guardando: " + error.message, type: "error" });
        }
    }

});
