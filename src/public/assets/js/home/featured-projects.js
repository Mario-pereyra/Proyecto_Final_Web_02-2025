/**
 * Módulo para cargar y mostrar proyectos destacados dinámicamente
 */

// API_URL ya está definido en kpis.js

/**
 * Formatea un monto en bolivianos
 */
function formatCurrency(amount) {
  return parseFloat(amount).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Crea el HTML de una tarjeta de proyecto
 */
function createProjectCard(project) {
  const progressText = project.progress_percentage >= 100
    ? `${Math.round(project.progress_percentage)}% Financiado`
    : `${project.progress_percentage}% financiado`;

  return `
    <article class="project-card">
      <div class="project-card__header">
        <a href="./detail.html?id=${project.id}">
          <img src="/${project.cover_image}" alt="${project.title}" class="project-card__image" />
        </a>
        <div class="project-category">${project.category_name}</div>
        <button class="project-like-btn" data-liked="false" aria-pressed="false" aria-label="Añadir a favoritos">
          <iconify-icon icon="ic:round-favorite-border" class="heart-icon-empty"></iconify-icon>
          <iconify-icon icon="ic:round-favorite" class="heart-icon-filled" style="display: none"></iconify-icon>
        </button>
      </div>
      <div class="project-card__content">
        <div class="project-card__title-container">
          <h3>${project.title}</h3>
          <p>${project.short_description || ''}</p>
        </div>
        <div class="project-card__progress">
          <div class="project-card__stats">
            <span class="project-card__amount">${formatCurrency(project.total_collected)}Bs</span>
            <span class="project-card__goal">de ${formatCurrency(project.goal_amount)}Bs</span>
          </div>
          <div class="project-card__progress-bar">
            <div class="project-card__progress-bar-fill" style="width: ${Math.min(project.progress_percentage, 100)}%;"></div>
          </div>
          <p class="project-card__goal">${progressText}</p>
        </div>
        
        <div class="project-card__stats">
          <div style="display: flex; gap: 4px; align-items: center;">
            <iconify-icon icon="ic:round-person" width="16" height="16"></iconify-icon>
            <p class="project-card__goal" style="margin:0;">Por ${project.owner_name}</p>
          </div>
          <div style="display: flex; gap: 4px; align-items: center;">
            <iconify-icon icon="ic:round-calendar-today" width="16" height="16"></iconify-icon>
            <p class="project-card__goal" style="margin:0;">${project.days_remaining} días restantes</p>
          </div>
        </div>

        <div class="project-card__footer">
          <button type="button" onclick="window.location.href='./detail.html?id=${project.id}'" class="btn">
            Ver detalles
          </button>
        </div>
      </div>
    </article>
  `;
}

/**
 * Carga los proyectos más visitados
 */
async function loadFeaturedProjects() {
  try {
    const response = await fetch(`${API_URL}/projects?orderBy=visits&limit=3`);
    const result = await response.json();

    if (!result.success) {
      console.error("Error al obtener proyectos destacados:", result.message);
      return;
    }

    const projects = result.projects;
    updateFeaturedProjects(projects);
  } catch (error) {
    console.error("Error al cargar proyectos destacados:", error);
  }
}

/**
 * Actualiza el contenedor de proyectos destacados con los datos
 */
function updateFeaturedProjects(projects) {
  const container = document.querySelector('.container-project-features-item');

  if (!container) {
    console.error('Contenedor de proyectos destacados no encontrado');
    return;
  }

  // Limpiar contenido actual
  container.innerHTML = '';

  // Agregar cada proyecto
  projects.forEach(project => {
    container.innerHTML += createProjectCard(project);
  });
}

/**
 * Inicializar cuando el DOM esté listo
 */
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector('.container-project-features-item');
  if (container) {
    loadFeaturedProjects();
  }
});
