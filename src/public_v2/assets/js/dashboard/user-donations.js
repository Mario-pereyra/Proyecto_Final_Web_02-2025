/**
 * Módulo para cargar y mostrar las donaciones del usuario en el dashboard
 */

// API_URL ya está definido en user-kpis.js

/**
 * Mapeo de categorías a iconos de Iconify
 */
const CATEGORY_ICONS = {
  'tecnología': 'ic:round-laptop',
  'tecnologia': 'ic:round-laptop',
  'arte': 'ic:round-brush',
  'música': 'ic:round-library-music',
  'musica': 'ic:round-library-music',
  'educación': 'ic:round-auto-stories',
  'educacion': 'ic:round-auto-stories',
  'ecología': 'ic:round-eco',
  'ecologia': 'ic:round-eco',
  'cine': 'ic:round-emergency-recording',
  'default': 'ic:round-favorite' // Icono por defecto
};

/**
 * Obtiene el icono correspondiente a una categoría
 */
function getCategoryIcon(categoryName) {
  if (!categoryName) return CATEGORY_ICONS.default;
  
  const normalized = categoryName.toLowerCase().trim();
  return CATEGORY_ICONS[normalized] || CATEGORY_ICONS.default;
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
 * Formatea una fecha en formato dd/mm/yyyy
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Crea el HTML de una tarjeta de donación
 */
function createDonationCard(donation) {
  const icon = getCategoryIcon(donation.category_name);
  const formattedDate = formatDate(donation.created_at);
  const formattedAmount = formatCurrency(donation.amount);
  
  // Comentario de la donación (si existe)
  const commentHTML = donation.comment 
    ? `<p class="donation__comment">"${donation.comment}"</p>`
    : '';

  return `
    <li class="donation">
      <div class="donation__left">
        <iconify-icon icon="${icon}" class="donation__thumb" width="48" height="48"></iconify-icon>
        <div class="donation__meta">
          <div class="donation__title">
            ${donation.project_title}
          </div>
          <time class="donation__date" datetime="${donation.created_at}">${formattedDate}</time>
          ${commentHTML}
        </div>
      </div>
      <div class="donation__right">
        <div class="donation__amount">${formattedAmount}&nbsp;Bs</div>
        <a class="donation__link" href="./detail.html?id=${donation.project_id}" 
           aria-label="Ver proyecto ${donation.project_title}">Ver Proyecto</a>
      </div>
    </li>
  `;
}

/**
 * Carga las donaciones del usuario
 */
async function loadUserDonations() {
  try {
    // Obtener datos del usuario desde localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userId = userData.id;

    if (!userId) {
      console.warn('No se encontró ID de usuario');
      return;
    }

    // Llamar al endpoint de donaciones del usuario
    const response = await fetch(`${API_URL}/users/${userId}/donations`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (!result.success) {
      console.error("Error al obtener donaciones del usuario:", result.message);
      return;
    }

    const donations = result.data || [];
    updateDonationsList(donations);

  } catch (error) {
    console.error("Error al cargar donaciones del usuario:", error);
  }
}

/**
 * Actualiza la lista de donaciones en el DOM
 */
function updateDonationsList(donations) {
  const container = document.querySelector('#aportes .donations');
  
  if (!container) {
    console.error('Contenedor de donaciones no encontrado');
    return;
  }

  // Limpiar contenido actual
  container.innerHTML = '';

  // Si no hay donaciones, mostrar mensaje
  if (donations.length === 0) {
    container.innerHTML = `
      <li class="empty-state">
        <p>No has realizado donaciones aún. ¡Apoya un proyecto!</p>
      </li>
    `;
    return;
  }

  // Agregar cada donación
  donations.forEach(donation => {
    container.innerHTML += createDonationCard(donation);
  });
}

/**
 * Inicializar cuando el DOM esté listo
 */
document.addEventListener("DOMContentLoaded", () => {
  const donationsSection = document.querySelector('#aportes');
  if (donationsSection) {
    loadUserDonations();
  }
});
