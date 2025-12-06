/**
 * Módulo para cargar y mostrar los proyectos del usuario en el dashboard
 */

// API_URL ya está definido en user-kpis.js

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
 * Traduce el estado de aprobación
 */
function translateApprovalStatus(status) {
  const translations = {
    'borrador': 'Borrador',
    'pendiente': 'Pendiente',
    'publicado': 'Publicado',
    'rechazado': 'Rechazado'
  };
  return translations[status] || status;
}

/**
 * Traduce el estado de campaña
 */
function translateCampaignStatus(status) {
  const translations = {
    'no_iniciada': 'No Iniciada',
    'en_progreso': 'En Progreso',
    'finalizada': 'Finalizada',
    'cancelada': 'Cancelada'
  };
  return translations[status] || status;
}

/**
 * Crea el HTML de una tarjeta de proyecto para el dashboard
 */
function createProjectCard(project) {
  const approvalStatus = translateApprovalStatus(project.approval_status);
  const campaignStatus = translateCampaignStatus(project.campaign_status);

  // Calcular progreso si tenemos los datos
  const progress = project.goal_amount > 0
    ? Math.min((project.total_collected || 0) / project.goal_amount * 100, 100).toFixed(0)
    : 0;

  const progressText = `${progress}% ${progress >= 100 ? 'Financiado' : 'financiado'}`;

  return `
    <li class="proj-card card">
      <figure class="proj-card__media">
        <img class="proj-card__thumb" src="/${project.cover_image || 'assets/img/default-project.png'}"
          alt="${project.title}" width="96" height="96" />
      </figure>

      <div class="proj-card__body">
        <header class="proj-card__head">
          <div class="proj-card__titlewrap">
            <h2 class="proj-card__title">
              ${project.title}
            </h2>
            <p class="proj-card__subtitle muted">
              ${project.short_description || ''}
            </p>
          </div>

          <div class="proj-card__status">
            <span class="chip chip--dark">${approvalStatus}</span>
            <span class="chip chip--muted">${progressText}</span>
          </div>
        </header>

        <div class="proj-card__stats">
          <span class="small">${formatCurrency(project.total_collected || 0)}&nbsp;Bs recaudado</span>
          <span class="small">${progress}% de ${formatCurrency(project.goal_amount)}&nbsp;Bs</span>
        </div>

        <div class="progress progress--thin" role="progressbar" aria-label="Progreso de recaudación"
          aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}">
          <div class="progress__bar" style="--progress: ${progress}%"></div>
        </div>

        <div class="proj-card__meta">
          <div class="proj-card__owner">
            <iconify-icon icon="ic:round-person" width="16" height="16"></iconify-icon>
            <span class="small">Por ${project.owner_name || 'Usuario'}</span>
          </div>
          <div class="proj-card__date">
            <iconify-icon icon="ic:round-calendar-today" width="16" height="16"></iconify-icon>
            <span class="small">${project.days_remaining || 0} días restantes</span>
          </div>
        </div>

        <div class="proj-card__actions">
          <button class="btn btn--ghost btn--icon" type="button"
            onclick="window.location.href='./detail.html?id=${project.id}'" aria-label="Ver detalles del proyecto">
            <iconify-icon icon="ic:round-visibility" width="16" height="16"></iconify-icon>
            <span>Ver</span>
          </button>

          <button class="btn btn--ghost btn--icon" type="button"
            onclick="alert('Función de editar próximamente')" aria-label="Editar proyecto">
            <iconify-icon icon="ic:round-edit" width="16" height="16"></iconify-icon>
            <span>Editar</span>
          </button>

          <button class="btn btn--ghost btn--icon" type="button"
            onclick="alert('Función de recaudación próximamente')" aria-label="Ver recaudación del proyecto">
            <iconify-icon icon="ic:round-assessment" width="16" height="16"></iconify-icon>
            <span>Ver Recaudación</span>
          </button>
        </div>
      </div>
    </li>
  `;
}

/**
 * Carga los proyectos del usuario
 */
async function loadUserProjects() {
  try {
    // Obtener datos del usuario desde localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userId = userData.id;

    if (!userId) {
      console.warn('No se encontró ID de usuario');
      return;
    }

    // Llamar al endpoint de proyectos del usuario (agregando filter por query param temporalmente)
    const response = await fetch(`${API_URL}/projects?userId=${userId}`, {
      headers: {
        'Content-Type': 'application/json'
        // Aquí iría el token de autenticación si lo tuvieras
      }
    });

    const result = await response.json();

    if (!result.success) {
      console.error("Error al obtener proyectos del usuario:", result.message);
      return;
    }

    const projects = result.projects;
    updateProjectsList(projects);

  } catch (error) {
    console.error("Error al cargar proyectos del usuario:", error);
  }
}

/**
 * Actualiza la lista de proyectos en el DOM
 */
function updateProjectsList(projects) {
  const container = document.querySelector('#proyectos .project-list');

  if (!container) {
    console.error('Contenedor de proyectos no encontrado');
    return;
  }

  // Limpiar contenido actual
  container.innerHTML = '';

  // Si no hay proyectos, mostrar mensaje
  if (projects.length === 0) {
    container.innerHTML = `
      <li class="empty-state">
        <p>No tienes proyectos aún. ¡Crea tu primer proyecto!</p>
      </li>
    `;
    return;
  }

  // Agregar cada proyecto
  projects.forEach(project => {
    container.innerHTML += createProjectCard(project);
  });
}

/**
 * Inicializar cuando el DOM esté listo
 */
document.addEventListener("DOMContentLoaded", () => {
  const projectsSection = document.querySelector('#proyectos');
  if (projectsSection) {
    loadUserProjects();
  }
});
