/**
 * Módulo para cargar y mostrar KPIs dinámicamente
 */

const API_URL = "http://localhost:3000/api";

/**
 * Formatea un número grande con sufijos (K, M)
 * @param {number} num - Número a formatear
 * @returns {string} - Número formateado
 */
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

/**
 * Formatea un monto en bolivianos
 * @param {number} amount - Monto a formatear
 * @returns {string} - Monto formateado
 */
function formatCurrency(amount) {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + "M Bs";
  } else if (amount >= 1000) {
    return (amount / 1000).toFixed(0) + "K Bs";
  }
  return amount.toFixed(0) + " Bs";
}

/**
 * Carga los KPIs desde la API y actualiza el DOM
 */
async function loadKPIs() {
  try {
    const response = await fetch(`${API_URL}/kpis`);
    const result = await response.json();

    if (!result.success) {
      console.error("Error al obtener KPIs:", result.message);
      return;
    }

    const kpis = result.data;
    updateKPIs(kpis);
  } catch (error) {
    console.error("Error al cargar KPIs:", error);
    // Si falla, los valores permanecen vacíos
  }
}

/**
 * Actualiza los KPIs en el DOM
 * @param {Object} kpis - Objeto con los KPIs
 */
function updateKPIs(kpis) {
  // Proyectos Financiados
  const proyectosEl = document.getElementById("projects-funded");
  if (proyectosEl) {
    proyectosEl.textContent = formatNumber(kpis.proyectosFinanciados);
  }

  // Creadores Apoyados
  const creadoresEl = document.getElementById("supported-creators");
  if (creadoresEl) {
    creadoresEl.textContent = formatNumber(kpis.creadoresApoyados);
  }

  // Total Recaudado
  const totalEl = document.getElementById("total-raised");
  if (totalEl) {
    totalEl.textContent = formatCurrency(kpis.totalRecaudado);
  }
}

/**
 * Inicializar cuando el DOM esté listo
 */
document.addEventListener("DOMContentLoaded", () => {
  // Solo cargar si estamos en una página que tiene KPIs
  const dataInfoSection = document.querySelector(".data-info");
  if (dataInfoSection) {
    loadKPIs();
  }
});
