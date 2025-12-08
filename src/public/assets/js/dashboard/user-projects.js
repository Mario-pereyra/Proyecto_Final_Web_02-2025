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
 * Elimina un proyecto (Soft Delete)
 */
async function deleteProject(projectId) {
  // Usar el sistema de modales existente si está disponible, sino confirm nativo
  if (window.mostrarModal) {
    window.mostrarModal({
      title: '¿Eliminar proyecto?',
      message: 'Esta acción moverá el proyecto a la papelera. ¿Estás seguro?',
      type: 'warning',
      confirmText: 'Sí, eliminar',
      onConfirm: async () => await executeDelete(projectId)
    });
  } else {
    if (confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      await executeDelete(projectId);
    }
  }
}

/**
 * Ejecuta la eliminación contra la API
 */
async function executeDelete(projectId) {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (result.success) {
      // Recargar la lista
      loadUserProjects();

      // Mostrar feedback si existe el modal system
      if (window.mostrarModal) {
        window.mostrarModal({
          title: 'Proyecto eliminado',
          message: 'El proyecto ha sido eliminado correctamente.',
          type: 'success'
        });
      }
    } else {
      console.error('Error al eliminar:', result.message);
      alert('Error al eliminar el proyecto: ' + result.message);
    }
  } catch (error) {
    console.error('Error de red al eliminar:', error);
    alert('Error de conexión al intentar eliminar.');
  }
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

  // Fix path resolution: Ensure absolute path for nested pages (e.g. /user/dashboard)
  const imagePath = project.cover_image
    ? (project.cover_image.startsWith('/')
      ? project.cover_image
      : (project.cover_image.startsWith('uploads')
        ? '/' + project.cover_image
        : `/uploads/img/${project.cover_image}`))
    : '/assets/img/defaults/no-image.png';

  // Lógica de visualización de botones y estados
  const isEditable = project.approval_status === 'borrador' || project.approval_status === 'observado';
  const isPublished = project.approval_status === 'publicado';
  const isObserved = project.approval_status === 'observado';
  const isRejected = project.approval_status === 'rechazado';

  // Badge de estado de campaña (solo si está publicado)
  let campaignStatusBadge = '';
  if (isPublished) {
    let chipClass = 'chip--muted';
    if (project.campaign_status === 'en_progreso') chipClass = 'chip--success';
    if (project.campaign_status === 'finalizada') chipClass = 'chip--dark';
    campaignStatusBadge = `<span class="chip ${chipClass}">${campaignStatus}</span>`;
  }

  // Alerta de observación
  let observationAlert = '';
  if ((isObserved || isRejected) && project.rejection_reason) {
    const alertClass = isRejected ? 'error' : 'warning';
    const icon = isRejected ? 'ic:round-error' : 'ic:round-warning';
    const title = isRejected ? 'Motivo del rechazo:' : 'Observaciones del administrador:';

    observationAlert = `
      <div class="alert alert--${alertClass} alert--sm" style="margin-top: 1rem;">
        <iconify-icon icon="${icon}"></iconify-icon>
        <div>
          <strong>${title}</strong>
          <p class="small">${project.rejection_reason}</p>
        </div>
      </div>
    `;
  }

  // Botones de acción
  const editBtn = isEditable ? `
    <button class="btn btn--ghost btn--icon" type="button"
      onclick="window.location.href='./projects/crear-proyecto-completo.html?id=${project.id}'" aria-label="Editar proyecto">
      <iconify-icon icon="ic:round-edit" width="16" height="16"></iconify-icon>
      <span>Editar</span>
    </button>
  ` : '';

  const deleteBtn = `
    <button class="btn btn--ghost btn--icon text-danger" type="button"
      onclick="deleteProject(${project.id})" aria-label="Eliminar proyecto">
      <iconify-icon icon="ic:round-delete" width="16" height="16"></iconify-icon>
      <span>Eliminar</span>
    </button>
  `;

  return `
    <li class="proj-card card">
      <figure class="proj-card__media">
        <img class="proj-card__thumb" src="${imagePath}"
          alt="${project.title}" width="96" height="96" />
      </figure>

      <div class="proj-card__body">
        <header class="proj-card__head">
          <div class="proj-card__titlewrap">
            <h2 class="proj-card__title">
              ${project.title}
            </h2>
            <p class="proj-card__subtitle muted">
              ${project.category_name || 'Sin Categoría'} • ${project.short_description || 'Sin descripción'}
            </p>
          </div>

          <div class="proj-card__status">
            <span class="chip chip--dark">${approvalStatus}</span>
            ${campaignStatusBadge}
            ${!isPublished && !campaignStatusBadge ? `<span class="chip chip--muted">${progressText}</span>` : ''}
          </div>
        </header>
        
        ${observationAlert}

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
          ${editBtn}

          <button class="btn btn--ghost btn--icon" type="button"
            onclick="window.location.href='./detail.html?id=${project.id}'" aria-label="Ver detalles del proyecto">
            <iconify-icon icon="ic:round-visibility" width="16" height="16"></iconify-icon>
            <span>Ver</span>
          </button>
          
          <button class="btn btn--ghost btn--icon" type="button"
            onclick="window.location.href='./detail.html?id=${project.id}#donations'" aria-label="Ver recaudación del proyecto">
            <iconify-icon icon="ic:round-assessment" width="16" height="16"></iconify-icon>
            <span>Recaudación</span>
          </button>
          
          ${deleteBtn}
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
