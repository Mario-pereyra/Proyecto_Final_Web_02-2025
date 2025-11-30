/**
 * Módulo para cargar y mostrar categorías dinámicamente
 */

// API_URL ya está definido en kpis.js

/**
 * Mapeo de nombres de categorías a iconos de Iconify
 */
const CATEGORY_ICONS = {
  Tecnología: "ic:round-laptop",
  Arte: "ic:round-brush",
  Música: "ic:round-library-music",
  Educación: "ic:round-auto-stories",
  Ecología: "ic:round-eco",
  Cine: "ic:round-emergency-recording",
  // Agregar más iconos según sea necesario
  default: "ic:round-folder-open",
};

/**
 * Obtiene el icono correspondiente a una categoría
 * @param {string} categoryName - Nombre de la categoría
 * @returns {string} - Nombre del icono de Iconify
 */
function getCategoryIcon(categoryName) {
  return CATEGORY_ICONS[categoryName] || CATEGORY_ICONS.default;
}

/**
 * Carga las categorías desde la API y actualiza los contadores
 */
async function loadCategories() {
  try {
    const response = await fetch(`${API_URL}/categories`);
    const result = await response.json();

    if (!result.success) {
      console.error("Error al obtener categorías:", result.message);
      return;
    }

    const categories = result.data;
    updateCategoryCounts(categories);
  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }
}

/**
 * Actualiza los contadores de proyectos en el DOM usando IDs específicos
 * @param {Array} categories - Array de categorías con conteo de proyectos
 */
function updateCategoryCounts(categories) {
  // Mapeo de nombres de categorías a sus IDs en el HTML
  const categoryMap = {
    "Tecnología": "projects-tecnology",
    "Arte": "projects-art",
    "Música": "projects-music",
    "Educación": "projects-education",
    "Ecología": "projects-ecology",
    "Cine": "projects-cine"
  };

  // Actualizar cada categoría por su ID
  categories.forEach((category) => {
    const elementId = categoryMap[category.name];
    
    if (elementId) {
      const element = document.getElementById(elementId);
      
      if (element) {
        const projectText = category.project_count === 1 ? "proyecto" : "proyectos";
        element.textContent = `${category.project_count} ${projectText}`;
      }
    }
  });
}


/**
 * Inicializar cuando el DOM esté listo
 */
document.addEventListener("DOMContentLoaded", () => {
  // Solo cargar si estamos en una página que tiene el contenedor de categorías
  const container = document.querySelector(".container-categories");
  
  if (container) {
    loadCategories();
  }
});
