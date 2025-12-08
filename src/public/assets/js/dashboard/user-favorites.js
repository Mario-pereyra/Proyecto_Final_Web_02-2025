/**
 * Módulo para cargar y mostrar proyectos favoritos del usuario en el dashboard
 */

// API_URL ya está definido en user-kpis.js

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
 * Crea el HTML de una tarjeta de proyecto favorito
 */
function createFavoriteCard(project) {
  const progress = parseFloat(project.progress_percentage || 0).toFixed(0);
  const progressText = `${progress}% ${progress >= 100 ? 'Financiado' : 'financiado'}`;

  return `
    <article class="project-card">
      <div class="container-project-img">
        <a href="./detail.html?id=${project.id}">
          <img src="${!project.cover_image ? '/assets/img/defaults/no-image.png' : (project.cover_image.startsWith('/') ? project.cover_image : (project.cover_image.startsWith('uploads') ? '/' + project.cover_image : '/uploads/img/' + project.cover_image))}" 
               alt="${project.title}" class="project-img" />
        </a>
        <div class="project-category" role="status" aria-label="Categoría: ${project.category_name}">
          ${project.category_name}
        </div>
        <button class="project-like-btn" data-liked="true" aria-pressed="true"
          aria-label="Quitar de favoritos" data-project-id="${project.id}">
          <iconify-icon icon="ic:round-favorite-border" class="heart-icon-empty" style="display: none"></iconify-icon>
          <iconify-icon icon="ic:round-favorite" class="heart-icon-filled"></iconify-icon>
        </button>
      </div>
      <div class="project-card__content">
        <div class="project-card__title-container">
          <h3>${project.title}</h3>
          <p>${project.short_description || ''}</p>
        </div>
        <div class="project-card__progress">
          <div class="project-card__stats">
            <h4>${formatCurrency(project.total_collected || 0)}Bs</h4>
            <p>de ${formatCurrency(project.goal_amount)}Bs</p>
          </div>
          <div class="project-card__progress-bar">
            <progress class="project-card__progress-bar-fill" max="100" value="${progress}"></progress>
          </div>
          <p>${progressText}</p>
        </div>
        <div class="project-card__meta">
          <iconify-icon icon="ic:round-person" width="24" height="24"></iconify-icon>
          <p class="owner-project">Por ${project.owner_name}</p>
        </div>
        <div class="project-card__meta">
          <iconify-icon icon="ic:round-calendar-today" width="24" height="24"></iconify-icon>
          <p class="date-project">${project.days_remaining || 0} días restantes</p>
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
 * Carga los proyectos favoritos del usuario
 */
async function loadUserFavorites() {
  try {
    // Obtener datos del usuario desde sessionStorage (consistente con auth-guard.js)
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    const userId = userData.id;

    if (!userId) {
      console.warn('No se encontró ID de usuario');
      return;
    }

    // Llamar al endpoint de favoritos del usuario
    const response = await fetch(`${API_URL}/users/${userId}/favorites`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (!result.success) {
      console.error("Error al obtener favoritos del usuario:", result.message);
      return;
    }

    const favorites = result.data || [];
    updateFavoritesList(favorites);

  } catch (error) {
    console.error("Error al cargar favoritos del usuario:", error);
  }
}

/**
 * Actualiza la lista de favoritos en el DOM
 */
function updateFavoritesList(favorites) {
  const container = document.querySelector('#favoritos .container-project-features-item');

  if (!container) {
    console.error('Contenedor de favoritos no encontrado');
    return;
  }

  // Limpiar contenido actual
  container.innerHTML = '';

  // Si no hay favoritos, mostrar mensaje
  if (favorites.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No tienes proyectos favoritos aún. ¡Explora y guarda tus proyectos preferidos!</p>
      </div>
    `;
    return;
  }

  // Agregar cada proyecto favorito
  favorites.forEach(project => {
    container.innerHTML += createFavoriteCard(project);
  });
}

/**
 * Inicializar cuando el DOM esté listo
 */
document.addEventListener("DOMContentLoaded", () => {
  const favoritesSection = document.querySelector('#favoritos');
  if (favoritesSection) {
    loadUserFavorites();
  }
});
