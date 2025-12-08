/**
 * Capa de Vista: ProjectUI
 * Maneja la generación de HTML y renderizado del DOM para los proyectos.
 * Implementa el patrón Singleton/Namespace.
 */
const ProjectUI = {
    /**
     * Formatea un monto numérico a moneda (Bolivianos)
     * @param {number|string} amount 
     * @returns {string} Monto formateado
     */
    formatCurrency(amount) {
        return parseFloat(amount).toLocaleString('es-BO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },

    /**
     * Genera el HTML de una tarjeta de proyecto individual
     * @param {Object} project - Datos del proyecto
     * @param {Array<number>} userFavorites - Lista de IDs de favoritos del usuario
     * @returns {string} HTML string de la tarjeta
     */
    createProjectCard(project, userFavorites = []) {
        const progress = parseFloat(project.progress_percentage || 0);
        const progressText = progress >= 100
            ? `${Math.round(progress)}% Financiado`
            : `${progress.toFixed(0)}% financiado`;

        const isFavorite = userFavorites.includes(project.id);
        const collected = parseFloat(project.total_collected || 0);
        const goal = parseFloat(project.goal_amount || 0);

        // Lógica para determinar la ruta de la imagen (DRY)
        let imagePath = '/assets/img/defaults/no-image.png';
        if (project.cover_image) {
            if (project.cover_image.startsWith('/') || project.cover_image.startsWith('http')) {
                imagePath = project.cover_image;
            } else if (project.cover_image.startsWith('uploads')) {
                imagePath = '/' + project.cover_image;
            } else {
                imagePath = '/uploads/img/' + project.cover_image;
            }
        }

        return `
      <article class="project-card">
        <div class="project-card__header">
        <a href="./detail.html?id=${project.id}">
            <img src="${imagePath}" 
                 alt="${project.title}" class="project-card__image" />
          </a>
          <div class="project-category">${project.category_name}</div>
          <button class="project-like-btn" 
                  data-liked="${isFavorite}" 
                  data-project-id="${project.id}"
                  aria-pressed="${isFavorite}" 
                  aria-label="${isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}">
            <iconify-icon icon="ic:round-favorite-border" class="heart-icon-empty" 
                          style="${isFavorite ? 'display: none' : ''}"></iconify-icon>
            <iconify-icon icon="ic:round-favorite" class="heart-icon-filled" 
                          style="${isFavorite ? '' : 'display: none'}"></iconify-icon>
          </button>
        </div>
        <div class="project-card__content">
          <div class="project-card__title-container">
            <h3>${project.title}</h3>
            <p>${project.short_description || ''}</p>
          </div>
          <div class="project-card__progress">
            <div class="project-card__stats">
              <span class="project-card__amount">${this.formatCurrency(collected)}Bs</span>
              <span class="project-card__goal">de ${this.formatCurrency(goal)}Bs</span>
            </div>
            <div class="project-card__progress-bar">
              <div class="project-card__progress-bar-fill" style="width: ${Math.min(progress, 100)}%;"></div>
            </div>
            <p class="project-card__goal">${progressText}</p>
          </div>
          
          <div class="project-card__stats">
            <div style="display: flex; gap: 4px; align-items: center;">
              <iconify-icon icon="ic:round-person" width="16" height="16"></iconify-icon>
              <p class="project-card__goal" style="margin:0;">Por ${project.owner_name}</p>
            </div>
            <div style="display: flex; gap: 4px; align-items: center;">
              <iconify-icon icon="ic:round-calendar-today" width="16" height="16"></iconify-icon>
              <p class="project-card__goal" style="margin:0;">${project.days_remaining || 0} días restantes</p>
            </div>
          </div>

          <div class="project-card__footer">
            <button type="button" onclick="window.location.href='./detail.html?id=${project.id}'" class="btn">
              Ver detalles
            </button>
          </div>
        </div>
      </article>
    `;
    },

    /**
     * Renderiza la grilla de proyectos en el contenedor
     * @param {Array<Object>} projects - Lista de proyectos
     * @param {HTMLElement} container - Elemento DOM contenedor
     * @param {Array<number>} userFavorites - Lista de IDs de favoritos
     */
    renderGrid(projects, container, userFavorites) {
        if (!container) {
            console.error('ProjectUI: Contenedor no encontrado');
            return;
        }

        container.innerHTML = '';

        if (!projects || projects.length === 0) {
            container.innerHTML = `
        <div class="empty-state">
          <p>No se encontraron proyectos con los filtros seleccionados.</p>
        </div>
      `;
            return;
        }

        const html = projects.map(p => this.createProjectCard(p, userFavorites)).join('');
        container.innerHTML = html;
    },

    /**
     * Actualiza visualmente el botón de favorito
     * @param {HTMLElement} button - El botón clickeado
     * @param {boolean} isLiked - Nuevo estado
     */
    updateFavoriteButton(button, isLiked) {
        button.dataset.liked = isLiked;
        button.setAttribute('aria-pressed', isLiked);
        button.setAttribute('aria-label', isLiked ? 'Quitar de favoritos' : 'Añadir a favoritos');

        const emptyIcon = button.querySelector('.heart-icon-empty');
        const filledIcon = button.querySelector('.heart-icon-filled');

        if (isLiked) {
            if (emptyIcon) emptyIcon.style.display = 'none';
            if (filledIcon) filledIcon.style.display = '';
        } else {
            if (emptyIcon) emptyIcon.style.display = '';
            if (filledIcon) filledIcon.style.display = 'none';
        }
    }
};
