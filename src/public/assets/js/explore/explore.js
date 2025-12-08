/**
 * Módulo para explorar proyectos con búsqueda y filtros
 */

const API_URL = "http://localhost:3001/api";
let userFavorites = []; // IDs de proyectos favoritos del usuario
let currentUserId = null;

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
  const progress = parseFloat(project.progress_percentage || 0);
  const progressText = progress >= 100
    ? `${Math.round(progress)}% Financiado`
    : `${progress.toFixed(0)}% financiado`;

  const isFavorite = userFavorites.includes(project.id);
  const collected = parseFloat(project.total_collected || 0);
  const goal = parseFloat(project.goal_amount || 0);

  return `
    <article class="project-card">
      <div class="project-card__header">
      <a href="./detail.html?id=${project.id}">
          <img src="${!project.cover_image ? '/assets/img/defaults/no-image.png' : (project.cover_image.startsWith('/') ? project.cover_image : (project.cover_image.startsWith('uploads') ? '/' + project.cover_image : '/uploads/img/' + project.cover_image))}" 
               alt="${project.title}" class="project-card__image" />
        </a>
        <div class="project-category">${project.category_name}</div>
        <button class="project-like-btn" 
                data-liked="${isFavorite}" 
                data-project-id="${project.id}"
                aria-pressed="${isFavorite}" 
                aria-label="${isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}">
          <iconify-icon icon="ic:round-favorite-border" class="heart-icon-empty" 
                        style="${isFavorite ? 'display: none' : ''}"></iconify-icon>
          <iconify-icon icon="ic:round-favorite" class="heart-icon-filled" 
                        style="${isFavorite ? '' : 'display: none'}"></iconify-icon>
        </button>
      </div>
      <div class="project-card__content">
        <div class="project-card__title-container">
          <h3>${project.title}</h3>
          <p>${project.short_description || ''}</p>
        </div>
        <div class="project-card__progress">
          <div class="project-card__stats">
            <span class="project-card__amount">${formatCurrency(collected)}Bs</span>
            <span class="project-card__goal">de ${formatCurrency(goal)}Bs</span>
          </div>
          <div class="project-card__progress-bar">
            <div class="project-card__progress-bar-fill" style="width: ${Math.min(progress, 100)}%;"></div>
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
            <p class="project-card__goal" style="margin:0;">${project.days_remaining || 0} días restantes</p>
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
 * Carga proyectos con filtros
 */
async function loadProjects() {
  try {
    // Obtener valores de los filtros
    const search = document.getElementById('busqueda').value.trim();
    const category = document.getElementById('categoria').value;
    const orderBy = document.getElementById('orden').value;
    const maxGoal = document.getElementById('metaFinanciacion').value;
    const progressFilter = document.getElementById('progresoFinanciacion').value;

    // Construir parámetros de búsqueda
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'todas') params.append('category', category);
    if (orderBy) params.append('orderBy', orderBy);
    if (maxGoal) params.append('maxGoal', maxGoal);

    // Filtros de progreso
    if (progressFilter && progressFilter !== 'todos') {
      switch (progressFilter) {
        case 'menos_25':
          params.append('minProgress', '0');
          params.append('maxProgress', '25');
          break;
        case 'entre_25_75':
          params.append('minProgress', '25');
          params.append('maxProgress', '75');
          break;
        case 'mas_75':
          params.append('minProgress', '75');
          params.append('maxProgress', '99.99');
          break;
        case 'completamente':
          params.append('minProgress', '100');
          params.append('maxProgress', '100');
          break;
      }
    }

    // Llamar al endpoint de búsqueda
    const response = await fetch(`${API_URL}/projects/search?${params.toString()}`);
    const result = await response.json();

    if (!result.success) {
      console.error("Error al buscar proyectos:", result.message);
      return;
    }

    updateProjectsGrid(result.data || result.projects);

  } catch (error) {
    console.error("Error al cargar proyectos:", error);
  }
}

/**
 * Actualiza la grilla de proyectos
 */
function updateProjectsGrid(projectsData) {
  const projects = projectsData || [];
  const container = document.querySelector('.container-project-features-item');

  if (!container) {
    console.error('Contenedor de proyectos no encontrado');
    return;
  }

  // Limpiar contenido actual
  container.innerHTML = '';

  // Si no hay proyectos, mostrar mensaje
  if (projects.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No se encontraron proyectos con los filtros seleccionados.</p>
      </div>
    `;
    return;
  }

  // Agregar cada proyecto
  projects.forEach(project => {
    container.innerHTML += createProjectCard(project);
  });

  // Agregar event listeners a los botones de favoritos
  attachFavoriteListeners();
}

/**
 * Carga los favoritos del usuario
 */
async function loadUserFavorites() {
  try {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    currentUserId = userData.id;

    if (!currentUserId) {
      console.warn('No se encontró ID de usuario');
      return;
    }

    const response = await fetch(`${API_URL}/favorites/${currentUserId}`);
    const result = await response.json();

    if (result.success) {
      userFavorites = result.data || [];
    }
  } catch (error) {
    console.error("Error al cargar favoritos:", error);
  }
}

/**
 * Agrega event listeners a los botones de favoritos
 */
function attachFavoriteListeners() {
  const favoriteButtons = document.querySelectorAll('.project-like-btn');

  favoriteButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const projectId = parseInt(button.dataset.projectId);
      const isLiked = button.dataset.liked === 'true';

      if (!currentUserId) {
        mostrarModal({
          title: 'Iniciar Sesión',
          message: 'Debes iniciar sesión para guardar favoritos',
          type: 'info',
          confirmText: 'Iniciar Sesión',
          onConfirm: () => window.location.href = './auth.html?action=login'
        });
        return;
      }

      try {
        const url = `${API_URL}/favorites/${currentUserId}/${projectId}`;
        const method = isLiked ? 'DELETE' : 'POST';

        const response = await fetch(url, { method });
        const result = await response.json();

        if (result.success) {
          // Actualizar estado del botón
          button.dataset.liked = !isLiked;
          button.setAttribute('aria-pressed', !isLiked);
          button.setAttribute('aria-label', !isLiked ? 'Quitar de favoritos' : 'Añadir a favoritos');

          const emptyIcon = button.querySelector('.heart-icon-empty');
          const filledIcon = button.querySelector('.heart-icon-filled');

          if (!isLiked) {
            emptyIcon.style.display = 'none';
            filledIcon.style.display = '';
            userFavorites.push(projectId);
          } else {
            emptyIcon.style.display = '';
            filledIcon.style.display = 'none';
            userFavorites = userFavorites.filter(id => id !== projectId);
          }
        }
      } catch (error) {
        console.error("Error al actualizar favorito:", error);
      }
    });
  });
}

// ===== UI DE FILTROS =====
document.addEventListener("DOMContentLoaded", async function () {
  const filterToggleBtn = document.getElementById("filterToggleBtn");
  const closeFiltersBtn = document.getElementById("closeFiltersBtn");
  const filtersMenu = document.getElementById("filtersMenu");
  const filtersOverlay = document.getElementById("filtersOverlay");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");
  const applyFiltersBtn = document.getElementById("applyFiltersBtn");
  const metaFinanciacionSlider = document.getElementById("metaFinanciacion");
  const metaValue = document.getElementById("metaValue");

  function openFiltersMenu() {
    filtersMenu.classList.add("active");
    filtersOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeFiltersMenu() {
    filtersMenu.classList.remove("active");
    filtersOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  function clearFilters() {
    document.getElementById("busqueda").value = "";
    document.getElementById("categoria").value = "todas";
    document.getElementById("orden").value = "mas_recientes";
    document.getElementById("metaFinanciacion").value = "100000";
    document.getElementById("metaValue").textContent = "100000";
    document.getElementById("progresoFinanciacion").value = "todos";

    // Recargar proyectos
    loadProjects();
  }

  function applyFilters() {
    loadProjects();
    closeFiltersMenu();
  }

  metaFinanciacionSlider.addEventListener("input", function () {
    metaValue.textContent = this.value;
  });

  filterToggleBtn.addEventListener("click", openFiltersMenu);
  closeFiltersBtn.addEventListener("click", closeFiltersMenu);
  filtersOverlay.addEventListener("click", closeFiltersMenu);
  clearFiltersBtn.addEventListener("click", clearFilters);
  applyFiltersBtn.addEventListener("click", applyFilters);

  // Aplicar filtros al cambiar los selectores principales
  document.getElementById('busqueda').addEventListener('input', debounce(loadProjects, 500));
  document.getElementById('categoria').addEventListener('change', loadProjects);
  document.getElementById('orden').addEventListener('change', loadProjects);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && filtersMenu.classList.contains("active")) {
      closeFiltersMenu();
    }
  });

  // Check for category parameter in URL and auto-select it
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category");

  if (category) {
    const categorySelect = document.getElementById("categoria");
    if (categorySelect) {
      const option = Array.from(categorySelect.options).find(
        opt => opt.value === category
      );
      if (option) {
        categorySelect.value = category;
      }
    }
  }

  // Cargar favoritos y proyectos iniciales
  await loadUserFavorites();
  await loadProjects();
});

/**
 * Debounce helper para búsqueda
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
