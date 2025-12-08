/**
 * Capa de Vista: HomeUI
 * Maneja el renderizado de la página de inicio (Hero, Featured, Categories).
 * Implementa el patrón Singleton/Namespace.
 */
const HomeUI = {

    // --- Utilidades ---
    formatCurrency(amount) {
        return parseFloat(amount).toLocaleString('es-BO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },

    formatCompactNumber(num) {
        return Intl.NumberFormat('es-BO', { notation: "compact", maximumFractionDigits: 1 }).format(num);
    },

    // --- Sección Hero (Stats Globales) ---

    renderHero(stats) {
        const update = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        // Asumimos que stats trae { totalProjects, totalBackers, totalRaised }
        update('projects-funded', stats.totalProjects || 0);
        update('supported-creators', stats.totalBackers || 0); // O totalCreators
        update('total-raised', this.formatCurrency(stats.totalRaised || 0));
    },

    // --- Sección Proyectos Destacados ---

    createProjectCard(project) {
        const progress = parseFloat(project.progress_percentage || 0);
        const progressText = progress >= 100
            ? `${Math.round(progress)}% Financiado`
            : `${progress.toFixed(0)}% financiado`;

        const imagePath = project.cover_image
            ? (project.cover_image.startsWith('/')
                ? project.cover_image
                : (project.cover_image.startsWith('uploads')
                    ? '/' + project.cover_image
                    : '/uploads/img/' + project.cover_image))
            : '/assets/img/defaults/no-image.png';

        return `
        <article class="project-card">
          <div class="project-card__header">
            <a href="./detail.html?id=${project.id}">
              <img src="${imagePath}" alt="${project.title}" class="project-card__image" />
            </a>
            <div class="project-category">${project.category_name || 'General'}</div>
            
            <!-- Botón Favorito (opcional, requiere lógica extra) -->
            <!-- 
            <button class="project-like-btn" data-id="${project.id}" aria-label="Añadir a favoritos">
              <iconify-icon icon="ic:round-favorite-border" class="heart-icon-empty"></iconify-icon>
            </button> 
            -->
          </div>
          <div class="project-card__content">
            <div class="project-card__title-container">
              <h3>${project.title}</h3>
              <p>${project.short_description || ''}</p>
            </div>
            <div class="project-card__progress">
              <div class="project-card__stats">
                <span class="project-card__amount">${this.formatCurrency(project.total_collected || 0)}Bs</span>
                <span class="project-card__goal">de ${this.formatCurrency(project.goal_amount)}Bs</span>
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
                <p class="project-card__goal" style="margin:0;">${project.days_remaining} días restantes</p>
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

    renderFeaturedProjects(projects) {
        const container = document.querySelector('.container-project-features-item');
        if (!container) return;

        container.innerHTML = '';

        if (!projects || projects.length === 0) {
            container.innerHTML = '<p>No hay proyectos destacados en este momento.</p>';
            return;
        }

        projects.forEach(p => {
            container.innerHTML += this.createProjectCard(p);
        });
    },

    // --- Sección Categorías ---

    renderCategories(categories) {
        const container = document.querySelector('.container-categories');
        if (!container) return;

        container.innerHTML = '';

        categories.forEach(cat => {
            // Asumiendo que category tiene { id, name, icon, description, count }
            // Si no tiene icono, usamos uno genérico
            const icon = cat.icon || 'ic:round-category';

            const article = document.createElement('article');
            article.className = 'category-card';
            // Hacer clickeable
            article.onclick = () => window.location.href = `./explore.html?category=${cat.id}`;

            article.innerHTML = `
                <div class="category-icon">
                     <iconify-icon icon="${icon}" width="32" height="32"></iconify-icon>
                </div>
                <h3>${cat.name}</h3>
                <p>${cat.projects_count || 0} proyectos</p>
            `;
            container.appendChild(article);
        });
    }
};
