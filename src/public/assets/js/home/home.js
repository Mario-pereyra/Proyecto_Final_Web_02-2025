/**
 * Controlador: Landing Page
 * Orquesta la carga de datos para la página de inicio.
 * Reemplaza a kpis.js, featured-projects.js y categories.js
 */

document.addEventListener("DOMContentLoaded", async () => {

    // 1. Cargar Estadísticas Globales (Hero)
    loadGlobalStats();

    // 2. Cargar Proyectos Destacados (Top 3 por visitas o recaudación)
    loadFeaturedProjects();

    // 3. Cargar Categorías
    loadCategories();

});

async function loadGlobalStats() {
    // Si la API no tiene un endpoint específico aun, podemos simular o llamar a uno existente.
    // Usaremos el método nuevo getGlobalStats si existe, o un fallback.
    const result = await ProjectAPI.getGlobalStats();

    if (result.success && result.data) {
        if (typeof HomeUI !== 'undefined') {
            HomeUI.renderHero(result.data);
        }
    } else {
        // Fallback visual o silencio
        console.warn("No se pudieron cargar estadísticas globales");
    }
}

async function loadFeaturedProjects() {
    // Buscar proyectos ordenados por 'visits' o 'popular'
    const params = new URLSearchParams({
        orderBy: 'visits', // o 'collected_desc'
        limit: 3
    });

    const result = await ProjectAPI.search(params);

    if (result.success && result.data) {
        if (typeof HomeUI !== 'undefined') {
            HomeUI.renderFeaturedProjects(result.data);

            // Sincronizar estado de favoritos
            await syncFavoriteStates();
        }
    } else {
        console.error("Error cargando destacados:", result.message);
    }
}

async function syncFavoriteStates() {
    // Obtener userId del sessionStorage
    const userDataStr = sessionStorage.getItem("user");
    if (!userDataStr) {
        // Usuario no autenticado, todos los botones quedan en estado "no liked"
        return;
    }

    const userData = JSON.parse(userDataStr);
    const userId = userData.id;

    // Obtener favoritos del usuario
    const favResult = await ProjectAPI.getFavorites(userId);

    if (favResult.success && favResult.data) {
        const favoriteIds = favResult.data; // Array de IDs

        // Actualizar todos los botones de like
        const likeButtons = document.querySelectorAll('.project-like-btn');
        likeButtons.forEach(button => {
            const projectId = parseInt(button.getAttribute('data-id'));
            const isLiked = favoriteIds.includes(projectId);

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
}


async function loadCategories() {
    const result = await ProjectAPI.getCategories();

    if (result.success && result.data) {
        if (typeof HomeUI !== 'undefined') {
            HomeUI.renderCategories(result.data);
        }
    } else {
        console.error("Error cargando categorías:", result.message);
    }
}
