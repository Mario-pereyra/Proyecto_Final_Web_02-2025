document.addEventListener("DOMContentLoaded", () => {
  const containerCategories = document.querySelector(".container-categories");
  if (containerCategories) {
    loadCategories(containerCategories);
  }
});

const CATEGORY_ICONS = {
  "Tecnología": "ic:round-laptop",
  "Arte": "ic:round-brush",
  "Música": "ic:round-library-music",
  "Educación": "ic:round-auto-stories",
  "Ecología": "ic:round-eco",
  "Cine": "ic:round-emergency-recording",
  "default": "ic:round-folder-open",
};

async function loadCategories(containerCategories) {
  try {
    const response = await fetch(`/api/categories`);
    const result = await response.json();

    if (!result.success) {
      console.error("Error al obtener categorías:", result.message);
      return;
    }

    const categories = result.data;
    renderCategories(containerCategories, categories);
  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }
}

function renderCategories(containerCategories, categories) {
  containerCategories.innerHTML = ''; // Limpiar contenido existente (esqueletos o estáticos)

  categories.forEach((category) => {
    const icon = CATEGORY_ICONS[category.name] || CATEGORY_ICONS.default;
    const projectText = category.project_count === 1 ? "proyecto" : "proyectos";

    const link = document.createElement("a");
    // ./explore.html es relativo al directorio actual
    // Desde /index.html -> /explore.html
    // Desde /user/index.html -> /user/explore.html
    link.href = `./explore.html?category=${encodeURIComponent(category.name)}`;
    link.className = "item-categorie";

    link.innerHTML = `
      <iconify-icon icon="${icon}" width="24" height="24"></iconify-icon>
      <h4>${category.name}</h4>
      <p>${category.project_count} ${projectText}</p>
    `;

    containerCategories.appendChild(link);
  });
}



