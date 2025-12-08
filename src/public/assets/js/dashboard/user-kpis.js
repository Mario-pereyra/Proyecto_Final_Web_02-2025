/**
 * Controlador: KPIs del Usuario
 * Carga y muestra los indicadores clave de rendimiento en el dashboard.
 */
document.addEventListener("DOMContentLoaded", async () => {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const userId = userData.id;

  if (!userId) {
    console.warn('No se encontró ID de usuario para KPIs');
    return;
  }

  // Cargar estadísticas usando Data Layer
  const result = await UserAPI.getStats(userId);

  if (result.success) {
    // Renderizar usando View Layer
    if (typeof DashboardUI !== 'undefined') {
      DashboardUI.renderKpiCards(result.data);
    } else {
      console.error("DashboardUI no está definido.");
    }
  } else {
    console.error("Error al cargar KPIs:", result.message);
  }
});
