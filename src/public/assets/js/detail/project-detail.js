/**
 * Módulo para cargar y mostrar detalles de un proyecto
 */

const API_URL = "http://localhost:3001/api";

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
 * Formatea una fecha en formato legible
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('es-ES', options);
}

/**
 * Formatea una fecha corta
 */
function formatShortDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} de ${month} de ${year}`;
}

/**
 * Obtiene la inicial del nombre
 */
function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : '?';
}

/**
 * Determina el badge según el monto de donación
 */
function getDonationBadge(amount) {
  const numAmount = parseFloat(amount);
  if (numAmount >= 500) return 'gold';
  if (numAmount >= 100) return 'silver';
  return 'bronze';
}

/**
 * Actualiza la información básica del proyecto
 */
function updateBasicInfo(project) {
  // Título
  document.title = project.title;
  document.querySelector('.project__title').textContent = project.title;

  // Categoría
  const badge = document.querySelector('.badge');
  badge.textContent = project.category_name;
  badge.setAttribute('aria-label', `Categoría: ${project.category_name}`);

  // Fecha de creación
  const createdDate = new Date(project.created_at);
  const metaText = document.querySelector('.meta__text');
  metaText.textContent = `Creado el ${formatShortDate(project.created_at)}`;
  metaText.setAttribute('datetime', createdDate.toISOString().split('T')[0]);

  // Creador
  const authorName = document.querySelector('.author__name');
  const avatar = document.querySelector('.author .avatar');
  const creatorName = document.querySelector('.creator__name');

  authorName.textContent = project.owner_name;
  avatar.textContent = getInitial(project.owner_name);
  if (creatorName) creatorName.textContent = project.owner_name;

  // Imagen de portada
  const heroImg = document.querySelector('.hero__img');
  if (project.cover_image) {
    const imagePath = project.cover_image.startsWith('/')
      ? project.cover_image
      : (project.cover_image.startsWith('uploads')
        ? '/' + project.cover_image
        : `/uploads/img/${project.cover_image}`);
    heroImg.src = imagePath;
    heroImg.alt = `Imagen representativa de ${project.title}`;
  }

  // Descripción Corta
  const shortDescContainer = document.querySelector('#project-short-description');
  if (shortDescContainer && project.short_description) {
    shortDescContainer.textContent = project.short_description;
  }

  // Historia Completa (Editor.js)
  const storyContainer = document.querySelector('#project-story');
  if (storyContainer && project.story_json) {
    renderStory(project.story_json, storyContainer);
  } else if (storyContainer && project.short_description) {
    // Fallback si no hay story_json pero hay descripcion corta (para proyectos legacy)
    // Aunque idealmente story_json siempre debería existir si se creó con el nuevo wizard
    storyContainer.innerHTML = '';
  }
}

/**
 * Renderiza el contenido JSON de Editor.js usando la librería en modo Read-Only
 */
function renderStory(storyJson, container) {
  // Limpiar contenedor
  container.innerHTML = '';

  if (!storyJson || (storyJson.blocks && storyJson.blocks.length === 0)) {
    container.innerHTML = '<p class="muted">No hay una descripción detallada para este proyecto.</p>';
    return;
  }

  // Si storyJson es string, parsearlo safety check
  let data = storyJson;
  if (typeof storyJson === 'string') {
    try {
      data = JSON.parse(storyJson);
    } catch (e) {
    }
  }


  /**
   * Actualiza las estadísticas del proyecto
   */
  function updateStatistics(project) {
    const totalCollected = parseFloat(project.total_collected || 0);
    const goalAmount = parseFloat(project.goal_amount);
    const progress = parseFloat(project.progress_percentage || 0);
    const backersCount = parseInt(project.backers_count || 0);

    // Monto recaudado y meta
    document.querySelector('.funding__amount').innerHTML = `${formatCurrency(totalCollected)}&nbsp;Bs`;
    document.querySelector('.muted').textContent = `de ${formatCurrency(goalAmount)} Bs meta`;

    // Barras de progreso
    const progressBars = document.querySelectorAll('.progress__bar');
    progressBars.forEach(bar => {
      bar.style.setProperty('--progress', `${progress}%`);
    });

    // Actualizar aria-valuenow
    const progressElements = document.querySelectorAll('.progress[role="progressbar"]');
    progressElements[0]?.setAttribute('aria-valuenow', progress.toFixed(0));

    // Porcentaje financiado
    const statVals = document.querySelectorAll('.stat__val');
    if (statVals[0]) statVals[0].textContent = `${progress.toFixed(0)}%`;

    // Colaboradores
    if (statVals[1]) statVals[1].textContent = backersCount;

    // Estadísticas detalladas
    const rows = document.querySelectorAll('.row strong');
    if (rows[0]) rows[0].innerHTML = `${formatCurrency(goalAmount)}&nbsp;Bs`;
    if (rows[1]) rows[1].innerHTML = `${formatCurrency(totalCollected)}&nbsp;Bs`;
    if (rows[2]) rows[2].textContent = backersCount;

    // Donación promedio
    const avgDonation = backersCount > 0 ? totalCollected / backersCount : 0;
    const softStats = document.querySelectorAll('.stat--soft .stat__val');
    if (softStats[0]) softStats[0].innerHTML = `${formatCurrency(avgDonation)}&nbsp;Bs`;

    // Ritmo de progreso (simplificado)
    if (softStats[1]) softStats[1].textContent = `${progress.toFixed(0)}%`;
  }

  /**
   * Actualiza la cronología del proyecto
   */
  function updateTimeline(project) {
    const daysRemaining = parseInt(project.days_remaining || 0);
    const durationDays = parseInt(project.duration_days || 0);

    // Calcular porcentaje de tiempo transcurrido
    const daysElapsed = durationDays - daysRemaining;
    const timeProgress = durationDays > 0 ? (daysElapsed / durationDays * 100) : 0;

    // Actualizar etiqueta de progreso
    const timelineLabels = document.querySelectorAll('.timeline__labels span');
    if (timelineLabels[1]) {
      timelineLabels[1].textContent = `${timeProgress.toFixed(0)}% transcurrido`;
    }

    // Actualizar barra de progreso de tiempo
    const timeProgressBar = document.querySelector('.progress--thin .progress__bar');
    if (timeProgressBar) {
      timeProgressBar.style.setProperty('--progress', `${timeProgress}%`);
    }

    const timeProgressElement = document.querySelector('.progress--thin[role="progressbar"]');
    if (timeProgressElement) {
      timeProgressElement.setAttribute('aria-valuenow', timeProgress.toFixed(0));
    }

    // Fechas de inicio y fin
    const timelineItems = document.querySelectorAll('.timeline__item time');
    if (project.started_at && timelineItems[0]) {
      timelineItems[0].textContent = formatDate(project.started_at);
      timelineItems[0].setAttribute('datetime', project.started_at.split('T')[0]);
    }

    if (project.deadline_at && timelineItems[1]) {
      timelineItems[1].textContent = formatDate(project.deadline_at);
      timelineItems[1].setAttribute('datetime', project.deadline_at.split('T')[0]);
    }

    // Días restantes
    const daysRemainingDiv = document.querySelector('.timeline__item:last-child .accent');
    if (daysRemainingDiv) {
      daysRemainingDiv.textContent = `${daysRemaining} días restantes`;
    }

    // Duración total
    const durationNote = document.querySelector('.note div:last-child');
    if (durationNote) {
      durationNote.textContent = `${durationDays} días totales`;
    }
  }

  /**
   * Crea el HTML de una donación
   */
  function createDonationHTML(donation) {
    const badge = getDonationBadge(donation.amount);
    const badgeClass = `chip--${badge}`;
    const initial = getInitial(donation.donor_name);
    const formattedDate = formatShortDate(donation.created_at);
    const dateISO = new Date(donation.created_at).toISOString().split('T')[0];

    return `
    <article class="contrib">
      <div class="avatar avatar--sm" aria-hidden="true">${initial}</div>
      <div class="contrib__body">
        <div class="contrib__top">
          <span class="contrib__name">${donation.donor_name}</span>
          <span class="chip ${badgeClass}">${formatCurrency(donation.amount)}&nbsp;Bs</span>
        </div>
        <time class="contrib__date" datetime="${dateISO}">
          ${formattedDate}
        </time>
      </div>
    </article>
  `;
  }

  /**
   * Carga y muestra las donaciones del proyecto
   */
  async function loadDonations(projectId) {
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/donations`);
      const result = await response.json();

      if (!result.success) {
        console.error("Error al obtener donaciones:", result.message);
        return;
      }

      const donations = result.data || [];
      const container = document.querySelector('.contributors-list');

      if (!container) {
        console.error('Contenedor de donaciones no encontrado');
        return;
      }

      // Limpiar contenido actual
      container.innerHTML = '';

      // Si no hay donaciones, mostrar mensaje
      if (donations.length === 0) {
        container.innerHTML = `
        <div class="empty-state">
          <p>Este proyecto aún no tiene colaboradores. ¡Sé el primero en apoyarlo!</p>
        </div>
      `;
        return;
      }

      // Agregar cada donación
      donations.forEach(donation => {
        container.innerHTML += createDonationHTML(donation);
      });

    } catch (error) {
      console.error("Error al cargar donaciones:", error);
    }
  }

  /**
   * Carga todos los datos del proyecto
   */
  async function loadProjectDetail() {
    try {
      // Obtener ID del proyecto de la URL
      const urlParams = new URLSearchParams(window.location.search);
      const projectId = urlParams.get('id');

      if (!projectId) {
        console.error('No se proporcionó ID de proyecto');
        window.location.href = './explore.html';
        return;
      }

      // Cargar datos del proyecto
      const response = await fetch(`${API_URL}/projects/${projectId}`);
      const result = await response.json();

      if (!result.success) {
        console.error("Error al obtener proyecto:", result.message);
        window.location.href = './explore.html';
        return;
      }

      const project = result.data;

      // Actualizar todas las secciones
      updateBasicInfo(project);
      updateStatistics(project);
      updateTimeline(project);

      // Cargar donaciones
      await loadDonations(projectId);

    } catch (error) {
      console.error("Error al cargar detalle del proyecto:", error);
      window.location.href = './explore.html';
    }
  }

  // Inicializar cuando el DOM esté listo
  document.addEventListener("DOMContentLoaded", loadProjectDetail);
