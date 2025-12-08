/**
 * Capa de Vista: DashboardUI
 * Maneja el renderizado de los componentes del Dashboard.
 * Implementa el patrón Singleton/Namespace.
 */
const DashboardUI = {
    // --- Utilidades de Formato ---
    formatNumber(num) {
        return parseInt(num).toLocaleString('es-BO');
    },

    formatCurrency(amount) {
        return parseFloat(amount).toLocaleString('es-BO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },

    translateApprovalStatus(status) {
        const translations = {
            'borrador': 'Borrador',
            'pendiente': 'Pendiente',
            'publicado': 'Publicado',
            'rechazado': 'Rechazado'
        };
        return translations[status] || status;
    },

    translateCampaignStatus(status) {
        const translations = {
            'no_iniciada': 'No Iniciada',
            'en_progreso': 'En Progreso',
            'finalizada': 'Finalizada',
            'cancelada': 'Cancelada'
        };
        return translations[status] || status;
    },

    getImagePath(path) {
        if (!path) return '/assets/img/defaults/no-image.png';
        if (path.startsWith('/') || path.startsWith('http')) return path;
        if (path.startsWith('uploads')) return '/' + path;
        return '/uploads/img/' + path;
    },

    // --- Renderizado de KPIs ---

    renderKpiCards(stats) {
        const updateElement = (selector, value) => {
            const el = document.querySelector(selector);
            if (el) el.textContent = value;
        };

        updateElement('[data-kpi="total-projects"]', this.formatNumber(stats.totalProjects || 0));
        updateElement('[data-kpi="active-campaigns"]', this.formatNumber(stats.activeCampaigns || 0));
        updateElement('[data-kpi="total-raised"]', `${this.formatCurrency(stats.totalRaised || 0)} Bs`);
        updateElement('[data-kpi="total-donated"]', `${this.formatCurrency(stats.totalDonated || 0)} Bs`);
    },

    // --- Renderizado de Lista de Proyectos ---

    createProjectCard(project) {
        const approvalStatus = this.translateApprovalStatus(project.approval_status);
        const campaignStatus = this.translateCampaignStatus(project.campaign_status);

        const progress = project.goal_amount > 0
            ? Math.min((project.total_collected || 0) / project.goal_amount * 100, 100).toFixed(0)
            : 0;

        const progressText = `${progress}% ${progress >= 100 ? 'Financiado' : 'financiado'}`;
        const imagePath = this.getImagePath(project.cover_image);

        const isEditable = project.approval_status === 'borrador' || project.approval_status === 'observado';
        const isPublished = project.approval_status === 'publicado';
        const isObserved = project.approval_status === 'observado';
        const isRejected = project.approval_status === 'rechazado';

        let campaignStatusBadge = '';
        if (isPublished) {
            let chipClass = 'chip--muted';
            if (project.campaign_status === 'en_progreso') chipClass = 'chip--success';
            if (project.campaign_status === 'finalizada') chipClass = 'chip--dark';
            campaignStatusBadge = `<span class="chip ${chipClass}">${campaignStatus}</span>`;
        }

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

        const editBtn = isEditable ? `
      <button class="btn btn--ghost btn--icon" type="button"
        onclick="window.location.href='./projects/crear-proyecto-completo.html?id=${project.id}'" aria-label="Editar proyecto">
        <iconify-icon icon="ic:round-edit" width="16" height="16"></iconify-icon>
        <span>Editar</span>
      </button>
    ` : '';

        // Nota: Usamos un atributo data-delete-id para que el controlador pueda delegar el evento
        const deleteBtn = `
      <button class="btn btn--ghost btn--icon text-danger delete-project-btn" type="button"
        data-id="${project.id}" aria-label="Eliminar proyecto">
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
            <span class="small">${this.formatCurrency(project.total_collected || 0)}&nbsp;Bs recaudado</span>
            <span class="small">${progress}% de ${this.formatCurrency(project.goal_amount)}&nbsp;Bs</span>
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
    },

    renderUserProjects(projects) {
        const container = document.querySelector('#proyectos .project-list');
        if (!container) return;

        container.innerHTML = '';

        if (!projects || projects.length === 0) {
            container.innerHTML = `
        <li class="empty-state">
          <p>No tienes proyectos aún. ¡Crea tu primer proyecto!</p>
        </li>
      `;
            return;
        }

        projects.forEach(p => {
            container.innerHTML += this.createProjectCard(p);
        });
    }
};
