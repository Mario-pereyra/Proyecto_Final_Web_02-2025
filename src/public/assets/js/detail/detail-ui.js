/**
 * Capa de Vista: DetailUI
 * Maneja la visualización de los detalles del proyecto.
 * Implementa el patrón Singleton/Namespace.
 */
const DetailUI = {
    // --- Utilidades de Formato ---

    formatCurrency(amount) {
        return parseFloat(amount).toLocaleString('es-BO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('es-ES', options);
    },

    formatShortDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate();
        const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day} de ${month} de ${year}`;
    },

    getInitial(name) {
        return name ? name.charAt(0).toUpperCase() : '?';
    },

    getDonationBadge(amount) {
        const numAmount = parseFloat(amount);
        if (numAmount >= 500) return 'gold';
        if (numAmount >= 100) return 'silver';
        return 'bronze';
    },

    // --- Renderizado de Componentes ---

    /**
     * Renderiza la información básica del héroe y metadatos
     */
    renderBasicInfo(project) {
        // Título y doc title
        document.title = `${project.title} - Impulsa.me`;
        const titleEl = document.querySelector('.project__title');
        if (titleEl) titleEl.textContent = project.title;

        // Categoría
        const badge = document.querySelector('.badge');
        if (badge) {
            badge.textContent = project.category_name;
            badge.setAttribute('aria-label', `Categoría: ${project.category_name}`);
        }

        // Fecha
        const metaText = document.querySelector('.meta__text');
        if (metaText) {
            metaText.textContent = `Creado el ${this.formatShortDate(project.created_at)}`;
            metaText.setAttribute('datetime', new Date(project.created_at).toISOString().split('T')[0]);
        }

        // Autor
        const authorName = document.querySelector('.author__name');
        const avatar = document.querySelector('.author .avatar');
        const creatorName = document.querySelector('.creator__name');

        if (authorName) authorName.textContent = project.owner_name;
        if (avatar) avatar.textContent = this.getInitial(project.owner_name);
        if (creatorName) creatorName.textContent = project.owner_name;

        // Imagen Hero
        const heroImg = document.querySelector('.hero__img');
        if (heroImg && project.cover_image) {
            const imagePath = project.cover_image.startsWith('/') || project.cover_image.startsWith('http')
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
    },

    /**
     * Renderiza la historia detallada (Editor.js)
     */
    renderStory(storyJson) {
        const container = document.querySelector('#project-story');
        if (!container) return;

        container.innerHTML = '';

        if (!storyJson) {
            container.innerHTML = '<p class="muted">No hay una descripción detallada para este proyecto.</p>';
            return;
        }

        // Procesar JSON o String
        let data = storyJson;
        if (typeof storyJson === 'string') {
            try {
                data = JSON.parse(storyJson);
            } catch (e) {
                // Si falla, asumir que es texto plano o HTML legacy
                container.innerHTML = storyJson;
                return;
            }
        }

        // Renderizar bloques de Editor.js (versión simplificada para visualización)
        // Nota: Idealmente usaríamos la librería EditorJS en modo read-only, 
        // pero para mantener KISS y evitar dependencias complejas renderizaremos manualmente los bloques comunes
        if (data && data.blocks) {
            let html = '';
            data.blocks.forEach(block => {
                switch (block.type) {
                    case 'header':
                        html += `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
                        break;
                    case 'paragraph':
                        html += `<p>${block.data.text}</p>`;
                        break;
                    case 'list':
                        const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
                        const items = block.data.items.map(item => `<li>${item}</li>`).join('');
                        html += `<${tag}>${items}</${tag}>`;
                        break;
                    case 'image':
                        html += `<figure><img src="${block.data.file.url}" alt="${block.data.caption || ''}"><figcaption>${block.data.caption || ''}</figcaption></figure>`;
                        break;
                    // Agregar más tipos según necesidad
                    default:
                        //console.warn('Unknown block type', block.type);
                        break;
                }
            });
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p class="muted">Formato de descripción no reconocido.</p>';
        }
    },

    /**
     * Renderiza estadísticas (barra lateral)
     */
    renderStatistics(project) {
        const totalCollected = parseFloat(project.total_collected || 0);
        const goalAmount = parseFloat(project.goal_amount || 0);
        const progress = parseFloat(project.progress_percentage || 0);
        const backersCount = parseInt(project.backers_count || 0);

        // Sidebar Funding
        const fundingEl = document.querySelector('.funding__amount');
        const goalEl = document.querySelector('.muted'); // Ojo con el selector genérico, mejor ser específico
        const sidebarGoal = document.querySelector('.funding .muted');

        if (fundingEl) fundingEl.innerHTML = `${this.formatCurrency(totalCollected)}&nbsp;Bs`;
        if (sidebarGoal) sidebarGoal.textContent = `de ${this.formatCurrency(goalAmount)} Bs meta`;

        // Barras de progreso
        const progressBars = document.querySelectorAll('.progress__bar');
        progressBars.forEach(bar => {
            bar.style.setProperty('--progress', `${Math.min(progress, 100)}%`);
        });

        const progressElements = document.querySelectorAll('.progress[role="progressbar"]');
        progressElements[0]?.setAttribute('aria-valuenow', progress.toFixed(0));

        // Stats Grid
        const statVals = document.querySelectorAll('.stat__val');
        if (statVals[0]) statVals[0].textContent = `${progress.toFixed(0)}%`; // Financiado
        if (statVals[1]) statVals[1].textContent = backersCount; // Colaboradores

        // Stats Detalladas (abajo)
        const rows = document.querySelectorAll('.row strong');
        if (rows[0]) rows[0].innerHTML = `${this.formatCurrency(goalAmount)}&nbsp;Bs`;
        if (rows[1]) rows[1].innerHTML = `${this.formatCurrency(totalCollected)}&nbsp;Bs`;
        if (rows[2]) rows[2].textContent = backersCount;

        // StatSoft
        const avgDonation = backersCount > 0 ? totalCollected / backersCount : 0;
        const softStats = document.querySelectorAll('.stat--soft .stat__val');
        if (softStats[0]) softStats[0].innerHTML = `${this.formatCurrency(avgDonation)}&nbsp;Bs`;
        if (softStats[1]) softStats[1].textContent = `${progress.toFixed(0)}%`;
    },

    /**
     * Renderiza la cronología
     */
    renderTimeline(project) {
        const daysRemaining = parseInt(project.days_remaining || 0);
        const durationDays = parseInt(project.duration_days || 0);

        // Días transcurridos
        const daysElapsed = durationDays - daysRemaining;
        const timeProgress = durationDays > 0 ? Math.min((daysElapsed / durationDays * 100), 100) : 0;

        // Etiquetas y barra
        const timelineLabels = document.querySelectorAll('.timeline__labels span');
        if (timelineLabels[1]) {
            timelineLabels[1].textContent = `${timeProgress.toFixed(0)}% transcurrido`;
        }

        const timeProgressBar = document.querySelector('.progress--thin .progress__bar');
        if (timeProgressBar) {
            timeProgressBar.style.setProperty('--progress', `${timeProgress}%`);
        }

        // Lista fechas
        const timelineItems = document.querySelectorAll('.timeline__item time');
        if (project.started_at && timelineItems[0]) {
            timelineItems[0].textContent = this.formatDate(project.started_at);
            timelineItems[0].setAttribute('datetime', project.started_at.split('T')[0]);
        }

        if (project.deadline_at && timelineItems[1]) {
            timelineItems[1].textContent = this.formatDate(project.deadline_at);
            timelineItems[1].setAttribute('datetime', project.deadline_at.split('T')[0]);
        }

        // Acento días restantes
        const daysRemainingDiv = document.querySelector('.timeline__item:last-child .accent');
        if (daysRemainingDiv) {
            daysRemainingDiv.textContent = `${daysRemaining} días restantes`;
        }

        // Duración note
        const durationNote = document.querySelector('.note div:last-child');
        if (durationNote) {
            durationNote.textContent = `${durationDays} días totales`;
        }
    },

    /**
     * Genera HTML para una donación
     */
    createDonationCard(donation) {
        const badge = this.getDonationBadge(donation.amount);
        const initial = this.getInitial(donation.donor_name);

        return `
    <article class="contrib">
      <div class="avatar avatar--sm" aria-hidden="true">${initial}</div>
      <div class="contrib__body">
        <div class="contrib__top">
          <span class="contrib__name">${donation.donor_name}</span>
          <span class="chip chip--${badge}">${this.formatCurrency(donation.amount)}&nbsp;Bs</span>
        </div>
        <time class="contrib__date" datetime="${new Date(donation.created_at).toISOString()}">
          ${this.formatShortDate(donation.created_at)}
        </time>
      </div>
    </article>
    `;
    },

    /**
     * Renderiza lista de donaciones
     */
    renderDonations(donations) {
        const container = document.querySelector('.contributors-list');
        if (!container) return;

        container.innerHTML = '';

        if (!donations || donations.length === 0) {
            container.innerHTML = `
        <div class="empty-state">
          <p>Este proyecto aún no tiene colaboradores. ¡Sé el primero en apoyarlo!</p>
        </div>
      `;
            return;
        }

        donations.forEach(d => {
            container.innerHTML += this.createDonationCard(d);
        });
    }
};
