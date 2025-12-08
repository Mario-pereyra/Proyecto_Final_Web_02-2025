/**
 * Controlador: Orquestador del Wizard de Creación de Proyectos
 * Usa ProjectAPI y ProjectFormUI
 */
let editor; // Instancia global de Editor.js
let uploadedGalleryFiles = []; // Archivos NUEVOS seleccionados para galería
let existingGalleryImages = []; // Imágenes ya guardadas en DB
let uploadedRequirementFiles = {}; // Archivos NUEVOS de requisitos { reqId: file }
let projectId = null;
let USER_ID = null;

document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    projectId = urlParams.get('id');

    // Obtener usuario
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    USER_ID = userData.id || 101;

    // Referencias DOM principales
    const form = document.getElementById("projectForm");
    const categorySelect = document.getElementById("categoria");
    const requirementsList = document.getElementById("requirementsList");
    const galleryGrid = document.getElementById("galleryGrid");

    // Inicializar UI General
    setupDateCalculations();
    setupMultimediaEvents();

    // Cargar Categorías
    const catResult = await ProjectAPI.getCategories();
    if (catResult.success) {
        ProjectFormUI.renderCategories(catResult.data, categorySelect);
    }

    // Cargar Datos si es Edición
    let initialEditorData = {};
    if (projectId) {
        document.querySelector(".page-title").textContent = "Editar Proyecto";
        initialEditorData = await loadProjectData(projectId);
    } else {
        // Defaults
        document.getElementById("fecha_inicio").value = new Date().toISOString().split('T')[0];
        calculateEndDate();
    }

    // Inicializar Editor
    editor = ProjectFormUI.initEditor("editorjs", initialEditorData, '/api/upload/story-image');


    // --- EVENTOS DEL CONTROLADOR ---

    // Cambio de categoría -> Cargar requisitos
    categorySelect.addEventListener("change", async () => {
        const catId = categorySelect.value;
        if (catId) await loadRequirements(catId);
    });

    // Guardado
    form.addEventListener("submit", (e) => handleFormSubmit(e, 'publicado'));
    document.getElementById("btnGuardar").addEventListener("click", (e) => handleFormSubmit(e, 'borrador'));


    // --- FUNCIONES LÓGICAS ---

    async function loadRequirements(catId, existingAnswers = []) {
        const res = await ProjectAPI.getRequirements(catId);
        if (res.success && res.data) {
            const reqs = res.data.requirements || [];
            ProjectFormUI.renderRequirements(reqs, requirementsList, existingAnswers, (reqId, file) => {
                if (file) uploadedRequirementFiles[reqId] = file;
                else delete uploadedRequirementFiles[reqId];
            });
        }
    }

    async function loadProjectData(id) {
        const res = await ProjectAPI.getById(id); // Nota: getById no filtra por usuario, pero el backend debería validar
        if (!res.success) {
            if (window.mostrarModal) window.mostrarModal({ title: "Error", message: "Proyecto no encontrado", type: "error" });
            return {};
        }

        const p = res.data; // Ajuste según estructura de respuesta de getById

        // Rellenar campos básicos
        document.getElementById("titulo").value = p.title || "";
        document.getElementById("descripcion").value = p.short_description || "";
        document.getElementById("meta").value = p.goal_amount || "";
        document.getElementById("duracion").value = p.duration_days || 30;

        if (p.started_at) {
            document.getElementById("fecha_inicio").value = new Date(p.started_at).toISOString().split('T')[0];
        }
        calculateEndDate();

        // Categoría y Requisitos
        if (p.category_id) {
            categorySelect.value = p.category_id;
            // Esperar a que se rendericen los requisitos
            await loadRequirements(p.category_id, p.requirements_answers || []);
        }

        // Imágenes
        if (p.images) {
            const cover = p.images.find(i => i.is_cover);
            if (cover) {
                const rawPath = cover.image_path;
                const path = rawPath.startsWith('uploads') || rawPath.startsWith('/') ? rawPath : `/uploads/img/${rawPath}`;
                ProjectFormUI.showCoverPreview(path, document.getElementById("coverPreview"), document.getElementById("coverUploadArea"), document.getElementById("coverImgTag"));
            }
            existingGalleryImages = p.images.filter(i => !i.is_cover);
            updateGalleryUI();
        }

        return typeof p.story_json === 'string' ? JSON.parse(p.story_json) : p.story_json;
    }

    function setupDateCalculations() {
        const fechaInicioInput = document.getElementById("fecha_inicio");
        const duracionInput = document.getElementById("duracion");

        fechaInicioInput.addEventListener("change", calculateEndDate);
        duracionInput.addEventListener("input", calculateEndDate);
    }

    function calculateEndDate() {
        const start = new Date(document.getElementById("fecha_inicio").value || new Date());
        const days = parseInt(document.getElementById("duracion").value) || 30;
        const end = new Date(start);
        end.setDate(end.getDate() + days);
        document.getElementById("fechaFinTexto").textContent = `Finaliza el: ${end.toLocaleDateString("es-ES")}`;
    }

    function setupMultimediaEvents() {
        // Cover
        const coverInput = document.getElementById("coverInput");
        const coverPreview = document.getElementById("coverPreview");
        const coverUploadArea = document.getElementById("coverUploadArea");
        const coverImgTag = document.getElementById("coverImgTag");

        coverUploadArea.addEventListener("click", () => coverInput.click());
        coverInput.addEventListener("change", (e) => {
            if (e.target.files[0]) {
                const url = URL.createObjectURL(e.target.files[0]);
                ProjectFormUI.showCoverPreview(url, coverPreview, coverUploadArea, coverImgTag);
            }
        });
        document.getElementById("removeCoverBtn").addEventListener("click", () => {
            ProjectFormUI.hideCoverPreview(coverPreview, coverUploadArea, coverInput);
        });

        // Gallery
        const galleryInput = document.getElementById("galleryInput");
        document.getElementById("galleryUploadArea").addEventListener("click", () => galleryInput.click());

        galleryInput.addEventListener("change", (e) => {
            Array.from(e.target.files).forEach(file => uploadedGalleryFiles.push(file));
            galleryInput.value = "";
            updateGalleryUI();
        });
    }

    function updateGalleryUI() {
        ProjectFormUI.renderGallery(existingGalleryImages, uploadedGalleryFiles, galleryGrid,
            // On Delete Server Image
            async (imgId) => {
                if (!confirm("¿Eliminar imagen permanentemente?")) return;
                const res = await ProjectAPI.deleteImage(projectId, imgId);
                if (res.success) {
                    existingGalleryImages = existingGalleryImages.filter(i => i.id !== imgId);
                    updateGalleryUI();
                } else {
                    alert("Error eliminando imagen");
                }
            },
            // On Delete Local File
            (idx) => {
                uploadedGalleryFiles.splice(idx, 1);
                updateGalleryUI();
            }
        );
    }

    async function handleFormSubmit(e, status) {
        e.preventDefault();

        // Validación básica manual (HTML5 ya hace parte)
        if (!document.getElementById("titulo").value || !document.getElementById("meta").value) {
            alert("Completa los campos obligatorios");
            return;
        }

        try {
            if (window.mostrarModal) window.mostrarModal({ title: "Guardando...", message: "Procesando cambios.", type: "info" });

            const formData = new FormData();
            // Append inputs basic
            formData.append("title", document.getElementById("titulo").value);
            formData.append("short_description", document.getElementById("descripcion").value);
            formData.append("category_id", categorySelect.value);
            formData.append("goal_amount", document.getElementById("meta").value);
            formData.append("duration_days", document.getElementById("duracion").value);
            formData.append("started_at", document.getElementById("fecha_inicio").value);
            formData.append("approval_status", status);
            formData.append("userId", USER_ID);

            // Calc deadline
            const start = new Date(document.getElementById("fecha_inicio").value);
            start.setDate(start.getDate() + parseInt(document.getElementById("duracion").value));
            formData.append("deadline_at", start.toISOString());

            if (projectId) formData.append("id", projectId);

            // Editor Content
            const storyData = await editor.save();
            formData.append("story_json", JSON.stringify(storyData));

            // Files
            const coverFile = document.getElementById("coverInput").files[0];
            if (coverFile) formData.append("cover_image", coverFile);

            uploadedGalleryFiles.forEach(f => formData.append("gallery_images", f));

            Object.entries(uploadedRequirementFiles).forEach(([reqId, file]) => {
                formData.append(`req_${reqId}`, file);
            });

            // SEND
            const result = await ProjectAPI.save(formData);

            if (result.success) {
                if (window.mostrarModal) {
                    window.mostrarModal({
                        title: "Éxito",
                        message: "Proyecto guardado correctamente.",
                        type: "success",
                        onConfirm: () => window.location.href = "../dashboard.html"
                    });
                } else {
                    window.location.href = "../dashboard.html";
                }
            } else {
                throw new Error(result.message);
            }

        } catch (error) {
            console.error(error);
            if (window.mostrarModal) window.mostrarModal({ title: "Error", message: error.message, type: "error" });
            else alert("Error: " + error.message);
        }
    }
});
