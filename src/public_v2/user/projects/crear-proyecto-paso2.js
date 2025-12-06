// ============================================
// CREAR PROYECTO - PASO 2: Descripción Detallada
// ============================================

let editor;

document.addEventListener("DOMContentLoaded", function () {
  // Constantes
  const TOTAL_STEPS = 5;
  const CURRENT_STEP = 2;

  // Referencias a botones
  const btnAnterior = document.getElementById("btnAnterior");
  const btnGuardarBorrador = document.getElementById("btnGuardarBorrador");
  const btnSiguiente = document.getElementById("btnSiguiente");

  // Actualizar progreso
  updateProgress(CURRENT_STEP, TOTAL_STEPS);

  // Inicializar Editor.js con configuración completa basada en documentación oficial
  editor = new EditorJS({
    holder: "editorjs",
    placeholder: "Comienza a escribir la historia de tu proyecto...",
    
    // Callback cuando el editor esté listo
    onReady: () => {
      console.log('✅ Editor.js está listo');
    },
    
    // Callback cuando haya cambios en el contenido
    onChange: (api, event) => {
      console.log('📝 Contenido modificado', event);
    },
    
    // Autosave cada 10 segundos
    autosave: {
      interval: 10000,
      save: async (data) => {
        const draft = JSON.parse(localStorage.getItem("projectDraft") || "{}");
        draft.descripcionDetallada = data;
        draft.savedAt = new Date().toISOString();
        localStorage.setItem("projectDraft", JSON.stringify(draft));
        console.log("✅ Borrador guardado automáticamente");
      }
    },
    
    tools: {
      // Header tool - Documentación: https://github.com/editor-js/header
      header: {
        class: Header,
        config: {
          placeholder: "Ingresa un encabezado",
          levels: [2, 3, 4],
          defaultLevel: 2,
        },
        inlineToolbar: true,
        shortcut: 'CMD+SHIFT+H'
      },
      
      // List tool - Documentación: https://github.com/editor-js/list
      // IMPORTANTE: En versión 2.0+ se llama EditorjsList, no List
      list: {
        class: EditorjsList,
        inlineToolbar: true,
        config: {
          defaultStyle: 'unordered'
        }
      },
      
      // Checklist tool - Documentación: https://github.com/editor-js/checklist
      checklist: {
        class: Checklist,
        inlineToolbar: true
      },
      
      // Table tool - Documentación: https://github.com/editor-js/table
      table: {
        class: Table,
        inlineToolbar: true,
        config: {
          rows: 2,
          cols: 3,
          withHeadings: false
        }
      },
      
      // Warning tool - Documentación: https://github.com/editor-js/warning
      warning: {
        class: Warning,
        inlineToolbar: true,
        config: {
          titlePlaceholder: 'Título de la advertencia',
          messagePlaceholder: 'Mensaje de la advertencia'
        }
      },
      
      // Quote tool - Documentación: https://github.com/editor-js/quote
      quote: {
        class: Quote,
        inlineToolbar: true,
        config: {
          quotePlaceholder: "Ingresa una cita",
          captionPlaceholder: "Autor de la cita",
        },
      },
      
      // Code tool - Documentación: https://github.com/editor-js/code
      code: {
        class: CodeTool,
        config: {
          placeholder: 'Ingresa código aquí'
        }
      },
      
      // Delimiter tool - Documentación: https://github.com/editor-js/delimiter
      delimiter: Delimiter,
      
      // Inline tools
      inlineCode: InlineCode,
      marker: Marker,
      
      // Embed tool - Documentación: https://github.com/editor-js/embed
      embed: {
        class: Embed,
        inlineToolbar: true,
        config: {
          services: {
            youtube: true,
            vimeo: true,
            coub: true,
            twitter: true,
            instagram: true
          }
        },
      },
      
      // Simple Image tool - Documentación: https://github.com/editor-js/simple-image
      image: {
        class: SimpleImage,
        inlineToolbar: true
      },
      
      // Link tool - Documentación: https://github.com/editor-js/link
      linkTool: {
        class: LinkTool,
        config: {
          endpoint: "/api/fetchUrl"
        },
      }
    },
    
    // Traducción al español
    i18n: {
      messages: {
        ui: {
          "blockTunes": {
            "toggler": {
              "Click to tune": "Clic para configurar",
              "or drag to move": "o arrastra para mover"
            }
          },
          "inlineToolbar": {
            "converter": {
              "Convert to": "Convertir a"
            }
          },
          "toolbar": {
            "toolbox": {
              "Add": "Agregar"
            }
          }
        },
        toolNames: {
          "Text": "Texto",
          "Heading": "Encabezado",
          "List": "Lista",
          "Checklist": "Lista de tareas",
          "Table": "Tabla",
          "Warning": "Advertencia",
          "Quote": "Cita",
          "Code": "Código",
          "Delimiter": "Delimitador",
          "Embed": "Insertar",
          "Image": "Imagen",
          "Link": "Enlace",
          "Attaches": "Archivo adjunto"
        },
        tools: {
          "warning": {
            "Title": "Título",
            "Message": "Mensaje"
          },
          "link": {
            "Add a link": "Agregar enlace"
          },
          "stub": {
            "The block can not be displayed correctly.": "El bloque no se puede mostrar correctamente."
          }
        },
        blockTunes: {
          "delete": {
            "Delete": "Eliminar"
          },
          "moveUp": {
            "Move up": "Mover arriba"
          },
          "moveDown": {
            "Move down": "Mover abajo"
          }
        }
      }
    },
    
    logLevel: 'ERROR',
    data: loadEditorData(),
  });

  // Botón Anterior
  btnAnterior.addEventListener("click", function () {
    // Guardar datos actuales antes de navegar
    saveCurrentStep();
    window.location.href = "./crear-proyecto-paso1.html";
  });

  // Guardar borrador
  btnGuardarBorrador.addEventListener("click", async function () {
    try {
      const editorData = await editor.save();

      const projectData = {
        descripcionDetallada: editorData,
        status: "draft",
        step: CURRENT_STEP,
        savedAt: new Date().toISOString(),
      };

      // Guardar en localStorage
      const existingDraft = localStorage.getItem("projectDraft");
      const draft = existingDraft ? JSON.parse(existingDraft) : {};
      Object.assign(draft, projectData);
      localStorage.setItem("projectDraft", JSON.stringify(draft));

      alert("✅ Borrador guardado correctamente");
    } catch (error) {
      console.error("Error al guardar borrador:", error);
      alert("❌ Error al guardar el borrador");
    }
  });

  // Botón Siguiente
  btnSiguiente.addEventListener("click", async function () {
    try {
      const editorData = await editor.save();

      // Validar que haya contenido
      if (!editorData.blocks || editorData.blocks.length === 0) {
        alert("⚠️ Por favor, agrega contenido a la descripción de tu proyecto");
        return;
      }

      // Validar mínimo de bloques
      if (editorData.blocks.length < 3) {
        alert("⚠️ Agrega al menos 3 bloques de contenido para una descripción completa");
        return;
      }

      // Guardar datos del paso actual
      const projectData = {
        descripcionDetallada: editorData,
        step: CURRENT_STEP,
      };

      sessionStorage.setItem("projectStep2", JSON.stringify(projectData));

      // Navegar al siguiente paso
      window.location.href = "./crear-proyecto-paso3.html";
    } catch (error) {
      console.error("Error al validar editor:", error);
      alert("❌ Error al procesar el contenido");
    }
  });

  // Función para guardar paso actual
  async function saveCurrentStep() {
    try {
      const editorData = await editor.save();
      const projectData = {
        descripcionDetallada: editorData,
        step: CURRENT_STEP,
      };
      sessionStorage.setItem("projectStep2", JSON.stringify(projectData));
    } catch (error) {
      console.error("Error al guardar paso:", error);
    }
  }

  // Función para cargar datos del editor
  function loadEditorData() {
    // Intentar cargar desde sessionStorage primero
    const stepData = sessionStorage.getItem("projectStep2");
    if (stepData) {
      const data = JSON.parse(stepData);
      if (data.descripcionDetallada) {
        return data.descripcionDetallada;
      }
    }

    // Intentar cargar desde localStorage (borrador)
    const draft = localStorage.getItem("projectDraft");
    if (draft) {
      const data = JSON.parse(draft);
      if (data.descripcionDetallada) {
        return data.descripcionDetallada;
      }
    }

    // Retornar estructura vacía
    return {
      blocks: [],
    };
  }
});
