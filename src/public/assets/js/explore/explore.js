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
    // 1. Obtener usuario actual (usando sessionStorage como en auth-guard.js)
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    currentUserId = userData.id;

    // 2. Cargar categorías en el dropdown
    await loadCategories();

    // 3. Cargar favoritos iniciales
    await loadUserFavorites();

    // 4. Verificar parámetros URL (ej. ?category=tech)
    checkUrlParams();

    // 5. Cargar proyectos iniciales
    await loadProjects();

    // 6. Configurar listeners
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

      // 4. Sincronizar estado de favoritos (ui-components.js maneja los clicks)
      await syncFavoriteStates();
    } else {
      console.error("Error al cargar proyectos:", result.message);
    }
  }

  /**
   * Sincroniza el estado visual de los botones de favoritos
   */
  async function syncFavoriteStates() {
    if (!currentUserId) return;

    const likeButtons = document.querySelectorAll('.project-like-btn');
    likeButtons.forEach(button => {
      const projectId = parseInt(button.getAttribute('data-id') || button.getAttribute('data-project-id'));
      const isLiked = userFavorites.includes(projectId);

      button.setAttribute('data-liked', isLiked ? 'true' : 'false');
      button.setAttribute('aria-pressed', isLiked ? 'true' : 'false');

      const emptyIcon = button.querySelector('.heart-icon-empty, .heart-icon-border');
      const filledIcon = button.querySelector('.heart-icon-filled, .heart-icon');

      if (isLiked) {
        if (emptyIcon) emptyIcon.style.display = 'none';
        if (filledIcon) filledIcon.style.display = 'block';
      } else {
        if (emptyIcon) emptyIcon.style.display = 'block';
        if (filledIcon) filledIcon.style.display = 'none';
      }
    });
  }


  /**
   * Carga las categorías en el dropdown
   */
  async function loadCategories() {
    console.log('🔍 loadCategories() iniciando...');
    console.log('categorySelect:', categorySelect);
    
    try {
      const result = await ProjectAPI.getCategories();
      console.log('📦 Resultado de getCategories():', result);
      
      if (result.success && result.data) {
        const categories = result.data;
        console.log('✅ Categorías recibidas:', categories.length);
        
        // Poblar el select de categorías
        if (categorySelect) {
          // Mantener la opción "Todas las categorías"
          categorySelect.innerHTML = '<option value="todas">Todas las categorías</option>';
          
          // Agregar cada categoría
          categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            categorySelect.appendChild(option);
            console.log(`  ➕ Agregada categoría: ${cat.name} (ID: ${cat.id})`);
          });
          
          console.log('✅ Categorías cargadas exitosamente');
        } else {
          console.error('❌ categorySelect es null');
        }
      } else {
        console.error('❌ result.success es false o result.data está vacío');
      }
    } catch (error) {
      console.error("❌ Error cargando categorías:", error);
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
  // NOTA: Los clicks en botones de favoritos son manejados por ui-components.js
  // que usa delegación de eventos y llama a ProjectAPI.toggleFavorite()


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
