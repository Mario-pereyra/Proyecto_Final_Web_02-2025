/**
 * Crear Proyecto - Paso 2 con Editor.js
 * Implementación del editor enriquecido para la descripción detallada del proyecto
 */

// Variable global para el editor
let editor;

document.addEventListener("DOMContentLoaded", function () {
  // Validar que el paso 1 esté completo
  const step1Data = sessionStorage.getItem("projectStep1");
  if (!step1Data) {
    alert("Debes completar el paso 1 primero");
    window.location.href = "crear-proyecto.html";
    return;
  }

  // Referencias a elementos
  const btnAnterior = document.getElementById("btnAnterior");
  const btnGuardarBorrador = document.getElementById("btnGuardarBorrador");
  const btnSiguiente = document.getElementById("btnSiguiente");
  const progressFill = document.querySelector(".progress-fill");

  // Constantes
  const TOTAL_STEPS = 5;
  const CURRENT_STEP = 2;

  // Actualizar progreso
  function updateProgress() {
    const progressPercentage = (CURRENT_STEP / TOTAL_STEPS) * 100;
    progressFill.style.width = progressPercentage + "%";
  }

  // Verificar herramientas disponibles
  const toolsAvailable = {
    Header: typeof Header !== "undefined",
    List: typeof List !== "undefined",
    Quote: typeof Quote !== "undefined",
    Code: typeof Code !== "undefined",
    Embed: typeof Embed !== "undefined",
    Delimiter: typeof Delimiter !== "undefined",
    InlineCode: typeof InlineCode !== "undefined",
    Marker: typeof Marker !== "undefined",
    ImageTool: typeof ImageTool !== "undefined",
    LinkTool: typeof LinkTool !== "undefined",
  };

  console.log("Herramientas disponibles:", toolsAvailable);

  // Configurar herramientas
  const tools = {};

  if (toolsAvailable.Header) {
    tools.header = {
      class: Header,
      inlineToolbar: true,
      config: {
        placeholder: "Ingresa un encabezado",
        levels: [1, 2, 3, 4],
        defaultLevel: 2,
      },
    };
  }

  if (toolsAvailable.List) {
    tools.list = {
      class: List,
      inlineToolbar: true,
      config: {
        defaultStyle: "unordered",
      },
    };
  }

  if (toolsAvailable.Quote) {
    tools.quote = {
      class: Quote,
      inlineToolbar: true,
      config: {
        quotePlaceholder: "Ingresa una cita",
        captionPlaceholder: "Autor de la cita",
      },
    };
  }

  if (toolsAvailable.Code) {
    tools.code = {
      class: Code,
      config: {
        placeholder: "Ingresa código",
      },
    };
  }

  if (toolsAvailable.Embed) {
    tools.embed = {
      class: Embed,
      config: {
        services: {
          youtube: true,
          vimeo: true,
          instagram: true,
          twitter: true,
          facebook: true,
        },
      },
    };
  }

  if (toolsAvailable.Delimiter) {
    tools.delimiter = Delimiter;
  }

  if (toolsAvailable.InlineCode) {
    tools.inlineCode = {
      class: InlineCode,
    };
  }

  if (toolsAvailable.Marker) {
    tools.marker = {
      class: Marker,
      shortcut: "CMD+SHIFT+M",
    };
  }

  if (toolsAvailable.ImageTool) {
    tools.image = {
      class: ImageTool,
      config: {
        uploader: {
          // Simulación de carga de imagen (en producción conectar a backend)
          uploadByFile(file) {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = function (e) {
                resolve({
                  success: 1,
                  file: {
                    url: e.target.result,
                  },
                });
              };
              reader.readAsDataURL(file);
            });
          },
          uploadByUrl(url) {
            return Promise.resolve({
              success: 1,
              file: {
                url: url,
              },
            });
          },
        },
      },
    };
  }

  if (toolsAvailable.LinkTool) {
    tools.linkTool = {
      class: LinkTool,
      config: {
        endpoint: "", // En producción, agregar endpoint para fetch de metadata
      },
    };
  }

  // Inicializar Editor.js
  editor = new EditorJS({
    holder: "editorjs",
    tools: tools,
    placeholder:
      "Cuenta la historia completa de tu proyecto. ¿Qué problema resuelve? ¿Cómo funciona? ¿Por qué debería la gente apoyarte?",

    // Configuración de idioma
    i18n: {
      messages: {
        ui: {
          blockTunes: {
            toggler: {
              "Click to tune": "Clic para configurar",
              "or drag to move": "o arrastra para mover",
            },
          },
          inlineToolbar: {
            converter: {
              "Convert to": "Convertir a",
            },
          },
          toolbar: {
            toolbox: {
              Add: "Añadir",
            },
          },
        },
        toolNames: {
          Text: "Texto",
          Heading: "Encabezado",
          List: "Lista",
          Quote: "Cita",
          Code: "Código",
          Delimiter: "Separador",
          Image: "Imagen",
          Link: "Enlace",
          Marker: "Resaltador",
          Bold: "Negrita",
          Italic: "Cursiva",
          InlineCode: "Código en línea",
          Embed: "Insertar",
        },
        tools: {
          header: {
            "Heading 1": "Encabezado 1",
            "Heading 2": "Encabezado 2",
            "Heading 3": "Encabezado 3",
            "Heading 4": "Encabezado 4",
          },
          list: {
            Unordered: "Sin orden",
            Ordered: "Ordenada",
          },
          quote: {
            "Align Left": "Alinear izquierda",
            "Align Center": "Alinear centro",
          },
        },
      },
    },

    onReady: () => {
      console.log("Editor.js está listo");
      loadDraft();
    },

    onChange: () => {
      console.log("El contenido ha cambiado");
    },
  });

  // Función para guardar el contenido
  async function saveContent() {
    try {
      const outputData = await editor.save();
      console.log("Datos guardados:", outputData);
      return outputData;
    } catch (error) {
      console.error("Error al guardar:", error);
      return null;
    }
  }

  // Función para validar el contenido
  async function validateContent() {
    const data = await saveContent();

    if (!data || !data.blocks || data.blocks.length === 0) {
      return {
        valid: false,
        message: "Debes agregar contenido a la descripción del proyecto",
      };
    }

    // Verificar que haya contenido significativo
    const hasContent = data.blocks.some((block) => {
      if (block.type === "paragraph" && block.data.text.trim().length > 50) {
        return true;
      }
      if (block.type === "header" && block.data.text.trim().length > 0) {
        return true;
      }
      return false;
    });

    if (!hasContent) {
      return {
        valid: false,
        message:
          "La descripción debe tener al menos 50 caracteres de contenido",
      };
    }

    return { valid: true, data: data };
  }

  // Guardar borrador
  btnGuardarBorrador.addEventListener("click", async function () {
    const data = await saveContent();

    if (data) {
      // Recuperar datos del paso 1
      const step1Data = sessionStorage.getItem("projectStep1");

      const draftData = {
        step1: step1Data ? JSON.parse(step1Data) : null,
        step2: {
          description: data,
        },
        currentStep: CURRENT_STEP,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem("projectDraft", JSON.stringify(draftData));
      showNotification("Borrador guardado correctamente", "success");
    } else {
      showNotification("Error al guardar el borrador", "error");
    }
  });

  // Botón anterior
  btnAnterior.addEventListener("click", async function (e) {
    e.preventDefault();

    // Guardar estado actual antes de ir atrás
    const data = await saveContent();
    if (data) {
      sessionStorage.setItem("projectStep2", JSON.stringify(data));
    }

    // Navegar al paso anterior
    window.location.href = "crear-proyecto.html";
  });

  // Botón siguiente
  btnSiguiente.addEventListener("click", async function (e) {
    e.preventDefault();

    const validation = await validateContent();

    if (!validation.valid) {
      showNotification(validation.message, "error");
      return;
    }

    // Guardar datos del paso actual
    sessionStorage.setItem("projectStep2", JSON.stringify(validation.data));

    showNotification("Paso 2 completado. Redirigiendo al paso 3...", "success");

    // Navegar inmediatamente
    window.location.href = "crear-proyecto-paso3.html";
  });

  // Cargar borrador si existe
  function loadDraft() {
    const draft = localStorage.getItem("projectDraft");

    if (draft) {
      const draftData = JSON.parse(draft);

      if (draftData.step2 && draftData.step2.description) {
        editor
          .render(draftData.step2.description)
          .then(() => {
            console.log("Borrador cargado");
          })
          .catch((error) => {
            console.error("Error al cargar borrador:", error);
          });
      }
    }

    // También verificar si hay datos del paso 2 en sessionStorage
    const step2Data = sessionStorage.getItem("projectStep2");
    if (step2Data) {
      const data = JSON.parse(step2Data);
      editor
        .render(data)
        .then(() => {
          console.log("Datos de sesión cargados");
        })
        .catch((error) => {
          console.error("Error al cargar datos de sesión:", error);
        });
    }
  }

  // Función para mostrar notificaciones
  function showNotification(message, type) {
    // Remover notificación existente si hay
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    // Crear notificación
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

    // Cerrar notificación
    const closeBtn = notification.querySelector(".notification-close");
    closeBtn.addEventListener("click", () => notification.remove());

    document.body.appendChild(notification);

    // Auto-cerrar después de 4 segundos
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 4000);
  }

  // Función para exportar el contenido a HTML
  async function exportToHTML() {
    const data = await saveContent();
    if (!data) return "";

    return data.blocks
      .map((block) => {
        switch (block.type) {
          case "header":
            return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
          case "paragraph":
            return `<p>${block.data.text}</p>`;
          case "list":
            const listType = block.data.style === "ordered" ? "ol" : "ul";
            const items = block.data.items
              .map((item) => `<li>${item}</li>`)
              .join("");
            return `<${listType}>${items}</${listType}>`;
          case "quote":
            return `<blockquote><p>${block.data.text}</p><cite>${block.data.caption}</cite></blockquote>`;
          case "code":
            return `<pre><code>${block.data.code}</code></pre>`;
          case "image":
            const caption = block.data.caption
              ? `<figcaption>${block.data.caption}</figcaption>`
              : "";
            return `<figure><img src="${block.data.file.url}" alt="${
              block.data.caption || ""
            }">${caption}</figure>`;
          case "embed":
            return `<div class="embed">${block.data.embed}</div>`;
          case "delimiter":
            return "<hr>";
          default:
            return "";
        }
      })
      .join("\n");
  }

  // Inicialización
  updateProgress();
});

/**
 * Funciones adicionales para integración con backend
 */

// Función para guardar en el servidor
async function saveToBackend(url, token) {
  if (!editor) {
    throw new Error("Editor no está inicializado");
  }

  try {
    const outputData = await editor.save();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content: outputData,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error("Error al guardar en el servidor");
    }

    const result = await response.json();
    console.log("Guardado exitoso:", result);
    return result;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// Función para cargar desde el servidor
async function loadFromBackend(url, id, token) {
  try {
    const response = await fetch(`${url}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al cargar desde el servidor");
    }

    const data = await response.json();
    await editor.render(data.content);
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
