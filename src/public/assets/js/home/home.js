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

    if (result.success && result.projects) {
        if (typeof HomeUI !== 'undefined') {
            HomeUI.renderFeaturedProjects(result.projects);
        }
    } else {
        console.error("Error cargando destacados:", result.message);
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
