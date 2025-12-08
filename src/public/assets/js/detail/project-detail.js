/**
 * Controlador: Detalle de Proyecto
 * Orquesta la interacción entre ProjectAPI (Datos) y DetailUI (Vista).
 */

document.addEventListener("DOMContentLoaded", async function () {

  // --- Inicialización ---
  async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    if (!projectId) {
      console.error('No se proporcionó ID de proyecto');
      window.location.href = './explore.html';
      return;
    }

    await loadProjectData(projectId);
  }

  // --- Lógica de Negocio ---

  async function loadProjectData(id) {
    // 1. Obtener detalles del proyecto
    const projectResult = await ProjectAPI.getById(id);

    if (!projectResult.success) {
      console.error("Error cargando proyecto:", projectResult.message);
      window.location.href = './explore.html';
      return;
    }

    const project = projectResult.data;

    // 2. Renderizar UI principal
    if (typeof DetailUI === 'undefined') {
      console.error("DetailUI no cargado.");
      return;
    }

    DetailUI.renderBasicInfo(project);
    DetailUI.renderStatistics(project);
    DetailUI.renderTimeline(project);
    DetailUI.renderStory(project.story_json);

    // 3. Cargar y renderizar donaciones (asíncrono, no bloquea lo principal)
    loadDonations(id);
  }

  async function loadDonations(id) {
    const donationResult = await ProjectAPI.getDonations(id);
    if (donationResult.success) {
      DetailUI.renderDonations(donationResult.data || []);
    } else {
      console.error("Error cargando donaciones", donationResult.message);
    }
  }

  // --- Manejo de Eventos ---
  // Aquí podríamos agregar listeners para "Favorito", "Donar", "Compartir"
  // Por ahora lo básico es cargar la data.

  // TODO: Implementar lógica de botones de acción usando ProjectAPI.toggleFavorite, etc.

  // Arrancar
  init();
});
