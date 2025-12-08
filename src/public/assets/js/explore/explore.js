/**
 * Controlador Principal: Explore Module
 * Orquesta la interacción entre ProjectAPI (Datos) y ProjectUI (Vista).
 * Se encarga de la lógica de negocio, manejo de eventos y estado.
 */

document.addEventListener("DOMContentLoaded", async function () {
  // --- Estado de la Aplicación ---
  let userFavorites = [];
  let currentUserId = null;

  // --- Referencias al DOM ---
  const container = document.querySelector('.container-project-features-item');
  const filterToggleBtn = document.getElementById("filterToggleBtn");
  const closeFiltersBtn = document.getElementById("closeFiltersBtn");
  const filtersMenu = document.getElementById("filtersMenu");
  const filtersOverlay = document.getElementById("filtersOverlay");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");
  const applyFiltersBtn = document.getElementById("applyFiltersBtn");
  const metaFinanciacionSlider = document.getElementById("metaFinanciacion");
  const metaValue = document.getElementById("metaValue");
  const searchInput = document.getElementById('busqueda');
  const categorySelect = document.getElementById('categoria');
  const orderSelect = document.getElementById('orden');

  // --- Inicialización ---
  async function init() {
    // 1. Obtener usuario actual
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    currentUserId = userData.id;

    // 2. Cargar favoritos iniciales
    await loadUserFavorites();

    // 3. Verificar parámetros URL (ej. ?category=tech)
    checkUrlParams();

    // 4. Cargar proyectos iniciales
    await loadProjects();

    // 5. Configurar listeners
    setupEventListeners();
  }

  // --- Lógica de Negocio ---

  /**
   * Carga los favoritos desde el API
   */
  async function loadUserFavorites() {
    if (!currentUserId) return;
    const result = await ProjectAPI.getFavorites(currentUserId);
    if (result.success) {
      userFavorites = result.data || [];
    }
  }

  /**
   * Orquesta la búsqueda y renderizado de proyectos
   */
  async function loadProjects() {
    // 1. Obtener parámetros de filtros del DOM
    const params = getFilterParams();

    // 2. Llamar al API
    const result = await ProjectAPI.search(params);

    // 3. Renderizar resultados con UI
    if (result.success) {
      // Asegurar que ProjectUI exista antes de usarlo
      if (typeof ProjectUI === 'undefined') {
        console.error("ProjectUI no está definido. Asegúrate de incluir project-ui.js en el HTML.");
        return;
      }

      ProjectUI.renderGrid(
        result.data || result.projects,
        container,
        userFavorites
      );

      // Re-adjuntar listeners a los nuevos elementos
      attachFavoriteListeners();
    } else {
      console.error("Error al cargar proyectos:", result.message);
    }
  }

  /**
   * Recopila el estado actual de los filtros en un URLSearchParams
   */
  function getFilterParams() {
    const params = new URLSearchParams();
    const search = searchInput ? searchInput.value.trim() : '';
    const category = categorySelect ? categorySelect.value : 'todas';
    const orderBy = orderSelect ? orderSelect.value : 'mas_recientes';
    const maxGoal = metaFinanciacionSlider ? metaFinanciacionSlider.value : '';
    const progressFilter = document.getElementById('progresoFinanciacion') ? document.getElementById('progresoFinanciacion').value : 'todos';

    if (search) params.append('search', search);
    if (category && category !== 'todas') params.append('category', category);
    if (orderBy) params.append('orderBy', orderBy);
    if (maxGoal) params.append('maxGoal', maxGoal);

    if (progressFilter && progressFilter !== 'todos') {
      mapProgressFilter(params, progressFilter);
    }
    return params;
  }

  function mapProgressFilter(params, filter) {
    switch (filter) {
      case 'menos_25': params.append('minProgress', '0'); params.append('maxProgress', '25'); break;
      case 'entre_25_75': params.append('minProgress', '25'); params.append('maxProgress', '75'); break;
      case 'mas_75': params.append('minProgress', '75'); params.append('maxProgress', '99.99'); break;
      case 'completamente': params.append('minProgress', '100'); params.append('maxProgress', '100'); break;
    }
  }

  // --- Manejo de Eventos ---

  function attachFavoriteListeners() {
    const favoriteButtons = document.querySelectorAll('.project-like-btn');
    favoriteButtons.forEach(button => {
      button.addEventListener('click', handleFavoriteClick);
    });
  }

  async function handleFavoriteClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const button = e.currentTarget;
    const projectId = parseInt(button.dataset.projectId);
    const isLiked = button.dataset.liked === 'true';

    // Validación de sesión
    if (!currentUserId) {
      if (typeof mostrarModal === 'function') {
        mostrarModal({
          title: 'Iniciar Sesión',
          message: 'Debes iniciar sesión para guardar favoritos',
          type: 'info',
          confirmText: 'Iniciar Sesión',
          onConfirm: () => window.location.href = './auth.html?action=login'
        });
      } else {
        alert("Debes iniciar sesión para guardar favoritos");
        window.location.href = './auth.html?action=login';
      }
      return;
    }

    // Llamada API Optimista (podríamos actualizar UI antes, pero por seguridad esperamos)
    const result = await ProjectAPI.toggleFavorite(currentUserId, projectId, isLiked);

    if (result.success) {
      // Actualizar estado local
      if (isLiked) {
        userFavorites = userFavorites.filter(id => id !== projectId);
      } else {
        userFavorites.push(projectId);
      }
      // Actualizar UI puntual
      ProjectUI.updateFavoriteButton(button, !isLiked);
    }
  }

  function setupEventListeners() {
    // Mobile Filters Menu
    filterToggleBtn?.addEventListener("click", () => toggleMenu(true));
    closeFiltersBtn?.addEventListener("click", () => toggleMenu(false));
    filtersOverlay?.addEventListener("click", () => toggleMenu(false));

    // Filter Actions
    clearFiltersBtn?.addEventListener("click", clearFilters);
    applyFiltersBtn?.addEventListener("click", () => {
      loadProjects();
      toggleMenu(false);
    });

    // Inputs dinámicos
    metaFinanciacionSlider?.addEventListener("input", function () {
      if (metaValue) metaValue.textContent = this.value;
    });

    searchInput?.addEventListener('input', debounce(loadProjects, 500));
    categorySelect?.addEventListener('change', loadProjects);
    orderSelect?.addEventListener('change', loadProjects);

    // Keyboard Accessibility
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && filtersMenu?.classList.contains("active")) {
        toggleMenu(false);
      }
    });
  }

  function toggleMenu(show) {
    if (!filtersMenu || !filtersOverlay) return;
    if (show) {
      filtersMenu.classList.add("active");
      filtersOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    } else {
      filtersMenu.classList.remove("active");
      filtersOverlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  function clearFilters() {
    if (searchInput) searchInput.value = "";
    if (categorySelect) categorySelect.value = "todas";
    if (orderSelect) orderSelect.value = "mas_recientes";
    if (metaFinanciacionSlider) metaFinanciacionSlider.value = "100000";
    if (metaValue) metaValue.textContent = "100000";

    const progSelect = document.getElementById("progresoFinanciacion");
    if (progSelect) progSelect.value = "todos";

    loadProjects();
  }

  function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category");
    if (category && categorySelect) {
      categorySelect.value = category;
    }
  }

  /**
   * Utilidad para evitar llamadas excesivas
   */
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // --- Arrancar ---
  init();
});
