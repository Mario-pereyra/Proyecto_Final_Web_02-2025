/**
 * Módulo para cargar y mostrar KPIs del dashboard de usuario
 */

const API_URL = "http://localhost:3000/api";

/**
 * Formatea un número con separadores de miles
 */
function formatNumber(num) {
  return parseInt(num).toLocaleString('es-BO');
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
 * Actualiza un KPI en el DOM
 */
function updateKPI(selector, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
}

/**
 * Carga los KPIs del usuario desde la API
 */
async function loadUserKPIs() {
  try {
    // Obtener datos del usuario desde localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userId = userData.id;

    if (!userId) {
      console.warn('No se encontró ID de usuario');
      return;
    }

    // Llamar al endpoint de KPIs del usuario
    const response = await fetch(`${API_URL}/users/${userId}/kpis`);
    const result = await response.json();

    if (!result.success) {
      console.error("Error al obtener KPIs del usuario:", result.message);
      return;
    }

    const kpis = result.data;

    // Actualizar cada KPI
    updateKPI('[data-kpi="total-projects"]', formatNumber(kpis.totalProjects || 0));
    updateKPI('[data-kpi="active-campaigns"]', formatNumber(kpis.activeCampaigns || 0));
    updateKPI('[data-kpi="total-raised"]', `${formatCurrency(kpis.totalRaised || 0)} Bs`);
    updateKPI('[data-kpi="total-donated"]', `${formatCurrency(kpis.totalDonated || 0)} Bs`);

  } catch (error) {
    console.error("Error al cargar KPIs del usuario:", error);
  }
}

/**
 * Inicializar cuando el DOM esté listo
 */
document.addEventListener("DOMContentLoaded", () => {
  loadUserKPIs();
});
