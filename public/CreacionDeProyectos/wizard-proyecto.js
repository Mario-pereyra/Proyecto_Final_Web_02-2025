// =============================================================================
// WIZARD DE PROYECTO - MODO DUAL (Crear/Editar)
// =============================================================================

// ========================================
// ESTADO GLOBAL
// ========================================
let currentProjectId = null;  // null = modo creación, Number = modo edición
let currentStep = 1;
let editorInstance = null;
let selectedImageFile = null; // Archivo File nuevo seleccionado
let existingImageUrl = null;  // URL de imagen existente del servidor

let projectData = {
    // Paso 1
    titulo: '',
    resumen: '',
    categoria_id: null,
    
    // Paso 2
    description_json: { blocks: [] },
    
    // Paso 3
    meta_financiera: 0,
    duracion_campana: 0,
    fecha_inicio: null,
    fecha_fin: null,
    
    // Paso 4
    hasNewImage: false
};

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Wizard iniciado');
    
    // 1. Detectar modo (crear vs editar)
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    
    if (projectId) {
        currentProjectId = parseInt(projectId);
        document.getElementById('pageTitle').textContent = 'Editar Proyecto';
        console.log(`📝 Modo EDICIÓN - Proyecto ID: ${currentProjectId}`);
        await loadExistingProject(currentProjectId);
    } else {
        console.log('✨ Modo CREACIÓN - Nuevo proyecto');
    }
    
    // 2. Cargar categorías desde la API
    await loadCategories();
    
    // 3. Inicializar Editor.js (una sola vez)
    initializeEditor();
    
    // 4. Setup event listeners
    setupEventListeners();
    
    // 5. Setup contadores de caracteres
    setupCharCounters();
    
    // 6. Mostrar paso inicial
    mostrarPaso(1);
});

// ========================================
// CARGAR CATEGORÍAS
// ========================================
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Error al cargar categorías');
        
        const { categories } = await response.json();
        const select = document.getElementById('categoria');
        
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            select.appendChild(option);
        });
        
        console.log(`✅ ${categories.length} categorías cargadas`);
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        alert('⚠️ Error al cargar las categorías');
    }
}

// ========================================
// CARGAR PROYECTO EXISTENTE
// ========================================
async function loadExistingProject(projectId) {
    try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) throw new Error('Proyecto no encontrado');
        
        const { project, images } = await response.json();
        console.log('📦 Datos del proyecto cargados:', project);
        
        // Poblar datos en memoria
        projectData = {
            titulo: project.title || '',
            resumen: project.summary || '',
            categoria_id: project.category_id || null,
            description_json: project.description_json || { blocks: [] },
            meta_financiera: project.goal_amount || 0,
            fecha_inicio: project.start_date || null,
            fecha_fin: project.end_date || null,
            duracion_campana: calculateDuration(project.start_date, project.end_date),
            hasNewImage: false
        };
        
        // Poblar imagen existente
        if (images && images.length > 0) {
            existingImageUrl = images[0].url;
            console.log('🖼️ Imagen existente:', existingImageUrl);
        }
        
        // Poblar formularios DESPUÉS de cargar categorías
        setTimeout(() => populateFormFields(), 500);
        
    } catch (error) {
        console.error('❌ Error al cargar proyecto:', error);
        alert('⚠️ Error al cargar el proyecto. Redirigiendo al dashboard...');
        setTimeout(() => window.location.href = '../dashboard.html', 2000);
    }
}

// Calcular duración entre dos fechas
function calculateDuration(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Poblar campos del formulario
function populateFormFields() {
    console.log('📝 Poblando formularios con datos existentes...');
    
    document.getElementById('titulo').value = projectData.titulo || '';
    document.getElementById('resumen').value = projectData.resumen || '';
    document.getElementById('categoria').value = projectData.categoria_id || '';
    document.getElementById('meta').value = projectData.meta_financiera || '';
    document.getElementById('duracion').value = projectData.duracion_campana || '';
    
    if (projectData.fecha_inicio) {
        document.getElementById('fechaInicio').value = projectData.fecha_inicio;
    }
    
    // Mostrar imagen existente
    if (existingImageUrl) {
        showImagePreview(existingImageUrl, true);
    }
    
    // Actualizar contadores
    updateCharCount('titulo');
    updateCharCount('resumen');
    
    console.log('✅ Formularios poblados');
}

// ========================================
// EDITOR.JS - INICIALIZACIÓN ÚNICA
// ========================================
function initializeEditor() {
    console.log('📝 Inicializando Editor.js...');
    
    editorInstance = new EditorJS({
        holder: 'editorjs',
        placeholder: 'Comienza a escribir la historia de tu proyecto...',
        tools: {
            header: {
                class: Header,
                config: {
                    levels: [2, 3, 4],
                    defaultLevel: 2
                }
            },
            list: {
                class: EditorjsList,
                inlineToolbar: true
            },
            checklist: Checklist,
            table: Table,
            warning: Warning,
            quote: Quote,
            code: CodeTool,
            delimiter: Delimiter,
            inlineCode: InlineCode,
            marker: Marker,
            image: SimpleImage,
            embed: Embed
        },
        data: projectData.description_json,  // Cargar datos existentes (si hay)
        onReady: () => {
            console.log('✅ Editor.js listo');
        }
    });
}

// ========================================
// NAVEGACIÓN ENTRE PASOS
// ========================================
function mostrarPaso(paso) {
    console.log(`➡️ Mostrando paso ${paso}`);
    
    // Ocultar todos
    document.querySelectorAll('.form-card').forEach(el => el.classList.add('hidden'));
    
    // Mostrar actual
    document.getElementById(`paso-${paso}`).classList.remove('hidden');
    
    // Actualizar progress bar
    const titulos = [
        'Información Básica',
        'Descripción Detallada',
        'Financiación',
        'Imagen del Proyecto',
        'Vista Previa'
    ];
    
    document.getElementById('stepTitle').textContent = titulos[paso - 1];
    document.getElementById('stepIndicator').textContent = `Paso ${paso} de 5`;
    document.getElementById('progressFill').style.width = `${paso * 20}%`;
    
    currentStep = paso;
    
    // Si es paso 5, generar vista previa
    if (paso === 5) {
        generatePreview();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================
// VALIDACIONES POR PASO
// ========================================
async function validarPaso1() {
    const titulo = document.getElementById('titulo').value.trim();
    const resumen = document.getElementById('resumen').value.trim();
    const categoria = document.getElementById('categoria').value;
    
    if (!titulo || titulo.length < 10) {
        alert('⚠️ El título debe tener al menos 10 caracteres');
        return false;
    }
    
    if (!resumen || resumen.length < 20) {
        alert('⚠️ La descripción debe tener al menos 20 caracteres');
        return false;
    }
    
    if (!categoria) {
        alert('⚠️ Selecciona una categoría');
        return false;
    }
    
    // Guardar en memoria
    projectData.titulo = titulo;
    projectData.resumen = resumen;
    projectData.categoria_id = parseInt(categoria);
    
    console.log('✅ Paso 1 validado');
    return true;
}

async function validarPaso2() {
    try {
        const data = await editorInstance.save();
        
        if (!data.blocks || data.blocks.length < 2) {
            alert('⚠️ Agrega al menos 2 bloques de contenido para describir tu proyecto');
            return false;
        }
        
        projectData.description_json = data;
        console.log('✅ Paso 2 validado - Bloques:', data.blocks.length);
        return true;
    } catch (error) {
        console.error('Error al guardar editor:', error);
        alert('⚠️ Error al guardar el contenido');
        return false;
    }
}

function validarPaso3() {
    const meta = parseFloat(document.getElementById('meta').value);
    const duracion = parseInt(document.getElementById('duracion').value);
    
    if (!meta || meta < 100) {
        alert('⚠️ La meta financiera debe ser al menos Bs 100');
        return false;
    }
    
    if (meta > 1000000) {
        alert('⚠️ La meta financiera no puede superar Bs 1,000,000');
        return false;
    }
    
    if (!duracion || duracion < 7) {
        alert('⚠️ La duración mínima es de 7 días');
        return false;
    }
    
    if (duracion > 90) {
        alert('⚠️ La duración máxima es de 90 días');
        return false;
    }
    
    projectData.meta_financiera = meta;
    projectData.duracion_campana = duracion;
    
    // Calcular fechas
    const fechaInicioInput = document.getElementById('fechaInicio').value;
    const fechaInicio = fechaInicioInput 
        ? new Date(fechaInicioInput + 'T00:00:00')
        : new Date();
    
    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + duracion);
    
    projectData.fecha_inicio = fechaInicio.toISOString().split('T')[0];
    projectData.fecha_fin = fechaFin.toISOString().split('T')[0];
    
    console.log('✅ Paso 3 validado');
    console.log(`📅 Fechas: ${projectData.fecha_inicio} → ${projectData.fecha_fin}`);
    return true;
}

// ========================================
// MANEJO DE IMÁGENES
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    
    if (uploadArea) {
        uploadArea.addEventListener('click', () => {
            imageInput.click();
        });
        
        // Drag & Drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#667eea';
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                handleImageFile(file);
            }
        });
    }
    
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleImageFile(file);
            }
        });
    }
});

function handleImageFile(file) {
    // Validar tipo
    if (!file.type.startsWith('image/')) {
        alert('⚠️ Por favor selecciona una imagen (JPG, PNG, WebP)');
        return;
    }
    
    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('⚠️ La imagen no debe superar 5MB');
        return;
    }
    
    // Guardar archivo
    selectedImageFile = file;
    projectData.hasNewImage = true;
    
    console.log('🖼️ Nueva imagen seleccionada:', file.name, `(${(file.size / 1024).toFixed(2)} KB)`);
    
    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
        showImagePreview(e.target.result, false);
    };
    reader.readAsDataURL(file);
}

function showImagePreview(url, isExisting) {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = `
        <div class="image-preview-container">
            <img src="${url}" alt="Preview del proyecto"/>
            <button type="button" class="btn-remove-image" onclick="removeImage()">
                <iconify-icon icon="ic:round-close"></iconify-icon>
            </button>
            ${isExisting 
                ? '<span class="badge-existing">Imagen actual</span>' 
                : '<span class="badge-new">Nueva imagen</span>'}
        </div>
    `;
    preview.classList.remove('hidden');
}

function removeImage() {
    selectedImageFile = null;
    existingImageUrl = null;
    projectData.hasNewImage = false;
    document.getElementById('imagePreview').classList.add('hidden');
    document.getElementById('imageInput').value = '';
    console.log('🗑️ Imagen eliminada');
}

// ========================================
// GENERAR VISTA PREVIA (Paso 5)
// ========================================
async function generatePreview() {
    console.log('👁️ Generando vista previa...');
    
    const container = document.getElementById('vistaPrevia');
    const categoriaSelect = document.getElementById('categoria');
    const categoriaNombre = categoriaSelect.options[categoriaSelect.selectedIndex]?.text || 'Sin categoría';
    
    // Renderizar contenido de Editor.js
    let contenidoHTML = '<p class="preview-content">Sin descripción detallada</p>';
    if (projectData.description_json && projectData.description_json.blocks) {
        contenidoHTML = await renderEditorBlocks(projectData.description_json.blocks);
    }
    
    // Imagen preview
    const imagenPreviewHTML = (selectedImageFile || existingImageUrl)
        ? `<div class="preview-image-container">
               <img src="${selectedImageFile ? URL.createObjectURL(selectedImageFile) : existingImageUrl}" alt="${projectData.titulo}"/>
           </div>`
        : '<p style="color: var(--text-secondary);">Sin imagen</p>';
    
    container.innerHTML = `
        <div class="preview-header">
            <h3 class="preview-title">${projectData.titulo}</h3>
            <div class="preview-meta">
                <span class="preview-meta-item">
                    <iconify-icon icon="ic:round-category"></iconify-icon>
                    ${categoriaNombre}
                </span>
                <span class="preview-meta-item">
                    <iconify-icon icon="ic:round-attach-money"></iconify-icon>
                    Meta: Bs ${projectData.meta_financiera.toLocaleString()}
                </span>
                <span class="preview-meta-item">
                    <iconify-icon icon="ic:round-calendar-today"></iconify-icon>
                    ${projectData.duracion_campana} días
                </span>
            </div>
        </div>
        
        <div class="preview-section">
            <h4>Resumen</h4>
            <p>${projectData.resumen}</p>
        </div>
        
        <div class="preview-section">
            <h4>Imagen del Proyecto</h4>
            ${imagenPreviewHTML}
        </div>
        
        <div class="preview-section">
            <h4>Descripción Detallada</h4>
            ${contenidoHTML}
        </div>
        
        <div class="preview-section">
            <h4>Detalles de Financiación</h4>
            <ul style="list-style: none; padding: 0;">
                <li>💰 Meta: Bs ${projectData.meta_financiera.toLocaleString()}</li>
                <li>📅 Inicio: ${new Date(projectData.fecha_inicio).toLocaleDateString('es-BO')}</li>
                <li>📅 Fin: ${new Date(projectData.fecha_fin).toLocaleDateString('es-BO')}</li>
                <li>⏱️ Duración: ${projectData.duracion_campana} días</li>
            </ul>
        </div>
    `;
}

// Renderizar bloques de Editor.js a HTML
async function renderEditorBlocks(blocks) {
    let html = '<div class="preview-content">';
    
    blocks.forEach(block => {
        switch (block.type) {
            case 'header':
                html += `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
                break;
            case 'paragraph':
                html += `<p>${block.data.text}</p>`;
                break;
            case 'list':
                const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
                html += `<${tag}>`;
                block.data.items.forEach(item => {
                    html += `<li>${item}</li>`;
                });
                html += `</${tag}>`;
                break;
            case 'quote':
                html += `<blockquote>${block.data.text}</blockquote>`;
                break;
            case 'delimiter':
                html += '<hr/>';
                break;
            case 'warning':
                html += `<div class="warning-block"><strong>${block.data.title}</strong><p>${block.data.message}</p></div>`;
                break;
            default:
                console.log('Tipo de bloque no soportado:', block.type);
        }
    });
    
    html += '</div>';
    return html;
}

// ========================================
// GUARDAR PROYECTO (Dual: POST o PATCH)
// ========================================
async function guardarProyecto(enviarARevision = false) {
    console.log(`💾 Guardando proyecto (${currentProjectId ? 'PATCH' : 'POST'})...`);
    
    try {
        // Preparar payload
        const payload = {
            title: projectData.titulo,
            summary: projectData.resumen,
            category_id: projectData.categoria_id,
            description_json: JSON.stringify(projectData.description_json),
            goal_amount: projectData.meta_financiera,
            start_date: projectData.fecha_inicio,
            end_date: projectData.fecha_fin,
            approval_status: enviarARevision ? 'en_revision' : 'borrador'
        };
        
        let response;
        let savedProjectId;
        
        if (currentProjectId) {
            // MODO EDICIÓN: PATCH
            console.log(`🔄 Actualizando proyecto ${currentProjectId}`);
            response = await fetch(`/api/projects/${currentProjectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            // MODO CREACIÓN: POST
            console.log('✨ Creando nuevo proyecto');
            response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al guardar proyecto');
        }
        
        const result = await response.json();
        savedProjectId = result.projectId || currentProjectId;
        
        console.log('✅ Proyecto guardado - ID:', savedProjectId);
        
        // Si hay nueva imagen, subirla
        if (projectData.hasNewImage && selectedImageFile) {
            console.log('📤 Subiendo imagen...');
            await uploadImage(savedProjectId);
        }
        
        // Mensaje de éxito
        const mensaje = enviarARevision 
            ? '✅ ¡Proyecto enviado para revisión! Recibirás una notificación cuando sea aprobado.' 
            : '✅ Borrador guardado correctamente';
        
        alert(mensaje);
        
        // Redirigir al dashboard
        setTimeout(() => {
            window.location.href = '../dashboard.html';
        }, 1500);
        
    } catch (error) {
        console.error('❌ Error al guardar:', error);
        alert(`❌ Error: ${error.message}`);
    }
}

async function uploadImage(projectId) {
    try {
        const formData = new FormData();
        formData.append('mainImage', selectedImageFile);
        
        const response = await fetch(`/api/projects/${projectId}/images`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            console.log('✅ Imagen subida correctamente');
        } else {
            console.error('⚠️ Error al subir imagen');
        }
    } catch (error) {
        console.error('❌ Error al subir imagen:', error);
    }
}

// ========================================
// EVENT LISTENERS
// ========================================
function setupEventListeners() {
    // Botones Siguiente
    document.getElementById('btnSiguiente1').addEventListener('click', async () => {
        if (await validarPaso1()) mostrarPaso(2);
    });
    
    document.getElementById('btnSiguiente2').addEventListener('click', async () => {
        if (await validarPaso2()) mostrarPaso(3);
    });
    
    document.getElementById('btnSiguiente3').addEventListener('click', () => {
        if (validarPaso3()) mostrarPaso(4);
    });
    
    document.getElementById('btnSiguiente4').addEventListener('click', () => {
        mostrarPaso(5);
    });
    
    // Botones Anterior
    document.getElementById('btnAnterior2').addEventListener('click', () => mostrarPaso(1));
    document.getElementById('btnAnterior3').addEventListener('click', () => mostrarPaso(2));
    document.getElementById('btnAnterior4').addEventListener('click', () => mostrarPaso(3));
    document.getElementById('btnAnterior5').addEventListener('click', () => mostrarPaso(1));
    
    // Guardar Borrador (todos los pasos)
    document.querySelectorAll('[id^="btnGuardarBorrador"]').forEach(btn => {
        btn.addEventListener('click', async () => {
            // Recoger datos del paso actual antes de guardar
            if (currentStep === 1) await validarPaso1();
            if (currentStep === 2) await validarPaso2();
            if (currentStep === 3) validarPaso3();
            
            guardarProyecto(false);
        });
    });
    
    // Publicar
    document.getElementById('btnPublicar').addEventListener('click', () => {
        if (confirm('¿Enviar proyecto para revisión? Un administrador lo revisará antes de publicarlo.')) {
            guardarProyecto(true);
        }
    });
}

// ========================================
// CONTADORES DE CARACTERES
// ========================================
function setupCharCounters() {
    const titulo = document.getElementById('titulo');
    const resumen = document.getElementById('resumen');
    
    titulo.addEventListener('input', () => updateCharCount('titulo'));
    resumen.addEventListener('input', () => updateCharCount('resumen'));
}

function updateCharCount(fieldId) {
    const field = document.getElementById(fieldId);
    const counter = document.getElementById(`${fieldId}-count`);
    if (field && counter) {
        counter.textContent = field.value.length;
    }
}

// ========================================
// UTILIDADES
// ========================================
console.log('✨ Wizard de Proyecto cargado');
