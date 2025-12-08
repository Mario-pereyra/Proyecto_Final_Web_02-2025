/**
 * FilterManager - Módulo unificado para gestión de filtros de búsqueda
 * 
 * Centraliza toda la lógica de:
 * - Inicialización de controles de filtro
 * - Carga dinámica de categorías desde API
 * - Manejo de eventos de filtros
 * - Construcción de query params
 * - Comunicación con la API de búsqueda
 */

const FilterManager = (function () {
    'use strict';

    // Configuración
    const API_URL = 'http://localhost:3001/api';

    // Estado interno
    let state = {
        categories: [],
        currentFilters: {},
        userFavorites: [],
        currentUserId: null,
        isInitialized: false
    };

    // Referencias a elementos DOM
    let elements = {};

    /**
     * Inicializa el FilterManager
     * @param {Object} options - Opciones de configuración
     */
    async function init(options = {}) {
        if (state.isInitialized) {
            console.warn('FilterManager ya está inicializado');
            return;
        }

        // Cachear referencias DOM
        cacheElements();

        // Cargar datos del usuario si está autenticado
        await loadUserData();

        // Cargar categorías dinámicamente
        await loadCategories();

        // Configurar event listeners
        setupEventListeners();

        // Cargar parámetros de URL si existen
        loadFiltersFromURL();

        // Realizar búsqueda inicial
        await search();

        state.isInitialized = true;
        console.log('FilterManager inicializado correctamente');
    }

    /**
     * Cachea referencias a elementos DOM
     */
    function cacheElements() {
        elements = {
            // Inputs principales
            searchInput: document.getElementById('busqueda'),
            categorySelect: document.getElementById('categoria'),
            orderSelect: document.getElementById('orden'),

            // Filtros avanzados
            goalSlider: document.getElementById('metaFinanciacion'),
            goalValue: document.getElementById('metaValue'),
            progressSelect: document.getElementById('progresoFinanciacion'),

            // Botones
            filterToggleBtn: document.getElementById('filterToggleBtn'),
            closeFiltersBtn: document.getElementById('closeFiltersBtn'),
            clearFiltersBtn: document.getElementById('clearFiltersBtn'),
            applyFiltersBtn: document.getElementById('applyFiltersBtn'),

            // Contenedores
            filtersMenu: document.getElementById('filtersMenu'),
            filtersOverlay: document.getElementById('filtersOverlay'),
            projectsContainer: document.querySelector('.container-project-features-item')
        };
    }

    /**
     * Carga datos del usuario autenticado
     */
    async function loadUserData() {
        try {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            state.currentUserId = userData.id || null;

            if (state.currentUserId) {
                const response = await fetch(`${API_URL}/favorites/${state.currentUserId}`);
                const result = await response.json();
                if (result.success) {
                    state.userFavorites = result.data || [];
                }
            }
        } catch (error) {
            console.error('Error al cargar datos del usuario:', error);
        }
    }

    /**
     * Carga categorías desde la API y las renderiza en el select
     */
    async function loadCategories() {
        if (!elements.categorySelect) return;

        try {
            const response = await fetch(`${API_URL}/categories`);
            const result = await response.json();

            if (!result.success) {
                console.error('Error al cargar categorías:', result.message);
                return;
            }

            state.categories = result.data || [];
            renderCategoryOptions();
        } catch (error) {
            console.error('Error al cargar categorías:', error);
        }
    }

    /**
     * Renderiza las opciones de categorías en el select
     */
    function renderCategoryOptions() {
        if (!elements.categorySelect) return;

        // Mantener la opción "Todas"
        elements.categorySelect.innerHTML = '<option value="todas">Todas las categorías</option>';

        // Agregar categorías dinámicas
        state.categories.forEach(category => {
            const option = document.createElement('option');
            // Usar el nombre tal cual viene de la DB para el value
            option.value = category.name;
            option.textContent = category.name;
            elements.categorySelect.appendChild(option);
        });
    }

    /**
     * Configura todos los event listeners
     */
    function setupEventListeners() {
        // Búsqueda con debounce
        if (elements.searchInput) {
            elements.searchInput.addEventListener('input', debounce(search, 500));
        }

        // Cambios en selects principales
        if (elements.categorySelect) {
            elements.categorySelect.addEventListener('change', search);
        }
        if (elements.orderSelect) {
            elements.orderSelect.addEventListener('change', search);
        }

        // Slider de meta
        if (elements.goalSlider && elements.goalValue) {
            elements.goalSlider.addEventListener('input', function () {
                elements.goalValue.textContent = this.value;
            });
        }

        // Botones de menú de filtros
        if (elements.filterToggleBtn) {
            elements.filterToggleBtn.addEventListener('click', openFiltersMenu);
        }
        if (elements.closeFiltersBtn) {
            elements.closeFiltersBtn.addEventListener('click', closeFiltersMenu);
        }
        if (elements.filtersOverlay) {
            elements.filtersOverlay.addEventListener('click', closeFiltersMenu);
        }

        // Botones de acción de filtros
        if (elements.clearFiltersBtn) {
            elements.clearFiltersBtn.addEventListener('click', clearFilters);
        }
        if (elements.applyFiltersBtn) {
            elements.applyFiltersBtn.addEventListener('click', applyFilters);
        }

        // Escape para cerrar menú
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && elements.filtersMenu?.classList.contains('active')) {
                closeFiltersMenu();
            }
        });
    }

    /**
     * Abre el menú de filtros avanzados
     */
    function openFiltersMenu() {
        if (elements.filtersMenu) elements.filtersMenu.classList.add('active');
        if (elements.filtersOverlay) elements.filtersOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Cierra el menú de filtros avanzados
     */
    function closeFiltersMenu() {
        if (elements.filtersMenu) elements.filtersMenu.classList.remove('active');
        if (elements.filtersOverlay) elements.filtersOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Limpia todos los filtros a sus valores por defecto
     */
    function clearFilters() {
        if (elements.searchInput) elements.searchInput.value = '';
        if (elements.categorySelect) elements.categorySelect.value = 'todas';
        if (elements.orderSelect) elements.orderSelect.value = 'mas_recientes';
        if (elements.goalSlider) {
            elements.goalSlider.value = '100000';
            if (elements.goalValue) elements.goalValue.textContent = '100000';
        }
        if (elements.progressSelect) elements.progressSelect.value = 'todos';

        search();
    }

    /**
     * Aplica los filtros avanzados y cierra el menú
     */
    function applyFilters() {
        search();
        closeFiltersMenu();
    }

    /**
     * Carga TODOS los filtros desde parámetros URL (para deep linking)
     */
    function loadFiltersFromURL() {
        const params = new URLSearchParams(window.location.search);

        // Búsqueda
        const searchTerm = params.get('search') || params.get('q');
        if (searchTerm && elements.searchInput) {
            elements.searchInput.value = searchTerm;
        }

        // Categoría (buscar coincidencia case-insensitive)
        const category = params.get('category');
        if (category && elements.categorySelect) {
            const options = Array.from(elements.categorySelect.options);
            const match = options.find(opt =>
                opt.value.toLowerCase() === category.toLowerCase()
            );
            if (match) {
                elements.categorySelect.value = match.value;
            }
        }

        // Ordenamiento
        const orderBy = params.get('orderBy');
        if (orderBy && elements.orderSelect) {
            elements.orderSelect.value = orderBy;
        }

        // Meta de financiación
        const maxGoal = params.get('maxGoal');
        if (maxGoal && elements.goalSlider) {
            elements.goalSlider.value = maxGoal;
            if (elements.goalValue) elements.goalValue.textContent = maxGoal;
        }

        // Progreso de financiación
        const minProgress = params.get('minProgress');
        const maxProgress = params.get('maxProgress');
        if (minProgress !== null && maxProgress !== null && elements.progressSelect) {
            // Determinar qué opción seleccionar basado en los valores
            if (minProgress === '0' && maxProgress === '25') {
                elements.progressSelect.value = 'menos_25';
            } else if (minProgress === '25' && maxProgress === '75') {
                elements.progressSelect.value = 'entre_25_75';
            } else if (minProgress === '75' && parseFloat(maxProgress) < 100) {
                elements.progressSelect.value = 'mas_75';
            } else if (minProgress === '100' || maxProgress === '100') {
                elements.progressSelect.value = 'completamente';
            }
        }
    }

    /**
     * Actualiza la URL del navegador con los filtros actuales (sin recargar la página)
     */
    function updateURLWithFilters() {
        const params = buildSearchParams();
        const newURL = params.toString()
            ? `${window.location.pathname}?${params.toString()}`
            : window.location.pathname;

        // Usar replaceState para no llenar el historial con cada cambio de filtro
        window.history.replaceState({}, '', newURL);
    }

    /**
     * Construye los parámetros de búsqueda desde el estado actual de los filtros
     */
    function buildSearchParams() {
        const params = new URLSearchParams();

        // Término de búsqueda
        const searchTerm = elements.searchInput?.value.trim();
        if (searchTerm) {
            params.append('search', searchTerm);
        }

        // Categoría
        const category = elements.categorySelect?.value;
        if (category && category !== 'todas') {
            params.append('category', category);
        }

        // Ordenamiento
        const order = elements.orderSelect?.value;
        if (order) {
            params.append('orderBy', order);
        }

        // Meta de financiación (solo si no es el máximo)
        const maxGoal = elements.goalSlider?.value;
        if (maxGoal && parseInt(maxGoal) < 100000) {
            params.append('maxGoal', maxGoal);
        }

        // Progreso de financiación
        const progress = elements.progressSelect?.value;
        if (progress && progress !== 'todos') {
            switch (progress) {
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

        return params;
    }

    /**
     * Realiza la búsqueda de proyectos y actualiza la URL
     */
    async function search() {
        if (!elements.projectsContainer) {
            console.error('Contenedor de proyectos no encontrado');
            return;
        }

        try {
            const params = buildSearchParams();

            // Actualizar URL con los filtros actuales
            updateURLWithFilters();

            const response = await fetch(`${API_URL}/projects/search?${params.toString()}`);
            const result = await response.json();

            if (!result.success) {
                console.error('Error al buscar proyectos:', result.message);
                return;
            }

            renderProjects(result.data || []);
        } catch (error) {
            console.error('Error en búsqueda:', error);
        }
    }

    /**
     * Renderiza los proyectos en el contenedor
     */
    function renderProjects(projects) {
        if (!elements.projectsContainer) return;

        elements.projectsContainer.innerHTML = '';

        if (projects.length === 0) {
            elements.projectsContainer.innerHTML = `
        <div class="empty-state">
          <iconify-icon icon="ic:round-search-off" width="48" height="48"></iconify-icon>
          <p>No se encontraron proyectos con los filtros seleccionados.</p>
        </div>
      `;
            return;
        }

        projects.forEach(project => {
            elements.projectsContainer.innerHTML += createProjectCard(project);
        });

        // Agregar listeners a botones de favoritos
        attachFavoriteListeners();
    }

    /**
     * Crea el HTML de una tarjeta de proyecto
     */
    function createProjectCard(project) {
        const progress = parseFloat(project.progress_percentage || 0);
        const progressText = progress >= 100
            ? `${Math.round(progress)}% Financiado`
            : `${progress.toFixed(0)}% financiado`;

        const isFavorite = state.userFavorites.includes(project.id);
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

                if (!state.currentUserId) {
                    if (typeof mostrarModal === 'function') {
                        mostrarModal({
                            title: 'Iniciar Sesión',
                            message: 'Debes iniciar sesión para guardar favoritos',
                            type: 'info',
                            confirmText: 'Iniciar Sesión',
                            onConfirm: () => window.location.href = './auth.html?action=login'
                        });
                    } else {
                        alert('Debes iniciar sesión para guardar favoritos');
                    }
                    return;
                }

                try {
                    const url = `${API_URL}/favorites/${state.currentUserId}/${projectId}`;
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
                            state.userFavorites.push(projectId);
                        } else {
                            emptyIcon.style.display = '';
                            filledIcon.style.display = 'none';
                            state.userFavorites = state.userFavorites.filter(id => id !== projectId);
                        }
                    }
                } catch (error) {
                    console.error('Error al actualizar favorito:', error);
                }
            });
        });
    }

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
     * Helper de debounce para búsqueda
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

    // API pública
    return {
        init,
        search,
        clearFilters,
        getState: () => ({ ...state }),
        getCategories: () => [...state.categories]
    };

})();

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    FilterManager.init();
});
