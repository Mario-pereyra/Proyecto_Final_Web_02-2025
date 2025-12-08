// ============================================
// CREAR PROYECTO - PASO 2: Descripción Detallada
// ============================================

let editor;

document.addEventListener("DOMContentLoaded", async function () {
  // Constantes
  const TOTAL_STEPS = 5;
  const CURRENT_STEP = 2;
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  // Validar flujo: Si no hay ID, volver al paso 1
  if (!projectId) {
    mostrarModal({
      title: 'Error de navegación',
      message: 'No se ha seleccionado ningún proyecto. Redirigiendo al inicio.',
      type: 'error',
      onConfirm: () => window.location.href = "./crear-proyecto-paso1.html"
    });
    return;
  }

  // Referencias a botones
  const btnAnterior = document.getElementById("btnAnterior");
  const btnGuardarBorrador = document.getElementById("btnGuardarBorrador");
  const btnSiguiente = document.getElementById("btnSiguiente");

  // Actualizar progreso
  updateProgress(CURRENT_STEP, TOTAL_STEPS);

  // Cargar datos del proyecto antes de iniciar el editor
  let initialEditorData = {};
  if (projectId) {
    initialEditorData = await loadProjectData(projectId);
  }

  // Inicializar Editor.js
  initEditor(initialEditorData);

  // --- FUNCIONES ---

  async function loadProjectData(id) {
    try {
      const response = await fetch(`/api/projects/${id}?userId=${getUserId()}`); // userId temporal por query param si faltara auth
      const result = await response.json();

      if (result.success && result.data && result.data.story_json) {
        return result.data.story_json;
      }
      return {};
    } catch (error) {
      console.error("Error cargando datos del proyecto:", error);
      mostrarModal({ title: 'Error', message: 'No se pudieron cargar los datos del proyecto', type: 'error' });
      return {};
    }
  }

  // Helper temporal para obtener ID de usuario (simulado si no hay auth context)
  function getUserId() {
    // Idealmente vendría de un contexto auth, por ahora confiamos en el endpoint
    return 101;
  }

  function initEditor(data) {
    editor = new EditorJS({
      holder: "editorjs",
      placeholder: "Comienza a escribir la historia de tu proyecto...",
      data: data, // Cargar datos recuperados de la DB
      onReady: () => {
        console.log('✅ Editor.js está listo');
      },
      onChange: (api, event) => {
        console.log('📝 Contenido modificado', event);
      },
      // Autosave real a la DB cada 30 segundos
      autosave: {
        interval: 30000,
        save: async (editorData) => {
          await saveProjectDraft(editorData, true); // true = silencioso
          console.log("✅ Borrador autoguardado en DB");
        }
      },
      tools: {
        header: {
          class: window.Header,
          config: { placeholder: "Ingresa un encabezado", levels: [2, 3, 4], defaultLevel: 2 },
          inlineToolbar: true,
          shortcut: 'CMD+SHIFT+H'
        },
        list: {
          class: window.EditorjsList,
          inlineToolbar: true,
          config: { defaultStyle: 'unordered' }
        },
        checklist: {
          class: window.Checklist,
          inlineToolbar: true
        },
        table: {
          class: window.Table,
          inlineToolbar: true,
          config: { rows: 2, cols: 3, withHeadings: false }
        },
        warning: {
          class: window.Warning,
          inlineToolbar: true,
          config: { titlePlaceholder: 'Título', messagePlaceholder: 'Mensaje' }
        },
        quote: {
          class: window.Quote,
          inlineToolbar: true,
          config: { quotePlaceholder: "Cita", captionPlaceholder: "Autor" },
        },
        code: {
          class: window.CodeTool,
          config: { placeholder: 'Código aquí' }
        },
        delimiter: window.Delimiter,
        inlineCode: window.InlineCode,
        marker: window.Marker,
        embed: {
          class: window.Embed,
          inlineToolbar: true,
          config: {
            services: { youtube: true, vimeo: true, twitter: true }
          },
        },
        image: {
          class: window.ImageTool,
          config: {
            // Nota: Mantenemos upload directo. La vinculación real ocurre en saveProjectDraft
            endpoints: {
              byFile: '/api/upload/story-image',
            },
            field: 'image',
            types: 'image/*',
            captionPlaceholder: 'Descripción (opcional)',
            buttonContent: 'Seleccionar imagen',
            uploader: {
              uploadByFile(file) {
                const formData = new FormData();
                formData.append('image', file);
                return fetch('/api/upload/story-image', {
                  method: 'POST',
                  body: formData
                })
                  .then(response => response.json())
                  .then(data => {
                    if (data.success === 1) return data;
                    throw new Error(data.message || 'Error al subir');
                  });
              }
            }
          },
          inlineToolbar: true
        },
        linkTool: {
          class: window.LinkTool,
          config: { endpoint: "/api/fetchUrl" },
        }
      },
      i18n: {
        messages: {
          ui: {
            "blockTunes": { "toggler": { "Click to tune": "Clic para configurar" } },
            "inlineToolbar": { "converter": { "Convert to": "Convertir a" } },
            "toolbar": { "toolbox": { "Add": "Agregar" } }
          },
          toolNames: {
            "Text": "Texto", "Heading": "Encabezado", "List": "Lista", "Checklist": "Checklist",
            "Table": "Tabla", "Warning": "Aviso", "Quote": "Cita", "Code": "Código",
            "Delimiter": "Separador", "Embed": "Insertar", "Image": "Imagen", "Link": "Enlace"
          }
        }
      }
    });
  }

  async function saveProjectDraft(editorData, silent = false) {
    if (!editorData) {
      editorData = await editor.save();
    }

    const projectData = {
      id: projectId,
      step: CURRENT_STEP,
      story_json: editorData
    };

    try {
      const response = await fetch('/api/projects/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }
      return true;
    } catch (error) {
      console.error("Error guardando borrador:", error);
      if (!silent) {
        mostrarModal({ title: 'Error', message: 'No se pudo guardar el borrador', type: 'error' });
      }
      return false;
    }
  }

  // --- EVENT LISTENERS ---

  btnAnterior.addEventListener("click", function () {
    window.location.href = `./crear-proyecto-paso1.html?id=${projectId}`;
  });

  btnGuardarBorrador.addEventListener("click", async function () {
    const success = await saveProjectDraft();
    if (success) {
      mostrarModal({
        title: 'Borrador guardado',
        message: 'Tu historia se ha guardado correctamente. Las imágenes están sincronizadas.',
        type: 'success'
      });
    }
  });

  btnSiguiente.addEventListener("click", async function () {
    try {
      const editorData = await editor.save();

      // Validaciones mínimas
      if (!editorData.blocks || editorData.blocks.length === 0) {
        mostrarModal({ title: 'Descripción requerida', message: 'Agrega contenido a tu historia', type: 'warning' });
        return;
      }
      if (editorData.blocks.length < 3) {
        mostrarModal({ title: 'Contenido insuficiente', message: 'Tu historia es muy corta. Agrega más detalles.', type: 'warning' });
        return;
      }

      // Guardar en Backend
      const success = await saveProjectDraft(editorData);

      if (success) {
        // Redundancia session
        sessionStorage.setItem("projectId", projectId);
        // Navegar
        window.location.href = `./crear-proyecto-paso3.html?id=${projectId}`;
      }
    } catch (error) {
      console.error("Error al procesar contenido:", error);
    }
  });

});
