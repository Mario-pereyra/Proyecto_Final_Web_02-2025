/**
 * Capa de Vista: AdminUI
 * Maneja el renderizado del dashboard administrativo.
 * Singleton.
 */
const AdminUI = {

    // --- Renderizado de Tablas ---

    renderProjectTable(projects, tableBodyId) {
        const tbody = document.getElementById(tableBodyId || 'projects-table-body');
        if (!tbody) return; // Si usamos tu HTML, necesitamos agregar este ID al tbody o usar querySelector

        tbody.innerHTML = '';
        const data = Array.isArray(projects) ? projects : [];

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No hay proyectos pendientes.</td></tr>';
            return;
        }

        data.forEach(p => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="table-project-info">
                        <img src="${this.getImagePath(p.cover_image)}" alt="${p.title}" class="project-image" />
                        <div>
                            <div class="project-title" style="font-weight: 500;">${p.title}</div>
                            <div class="project-description" style="color: var(--text-secondary); font-size: 0.875rem;">
                                ${p.short_description ? p.short_description.substring(0, 50) + '...' : ''}
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="table-creator">
                        <div class="creator-avatar">${p.owner_name ? p.owner_name.charAt(0).toUpperCase() : '?'}</div>
                        <span>${p.owner_name}</span>
                    </div>
                </td>
                <td><span class="category-tag">${p.category_name || 'General'}</span></td>
                <td>${this.formatCurrency(p.goal_amount)}</td>
                <td>${this.getStatusBadge(p.approval_status)}</td>
                <td>${new Date(p.created_at).toLocaleDateString()}</td>
                <td>
                    <div class="project-actions">
                        <button class="btn btn--sm btn--secondary action-btn" data-action="view" data-id="${p.id}" title="Ver detalle">
                            <iconify-icon icon="ic:round-visibility"></iconify-icon>
                        </button>
                        <button class="btn btn--sm btn--primary action-btn" data-action="approve" data-id="${p.id}" title="Aprobar">
                            <iconify-icon icon="ic:round-check"></iconify-icon>
                        </button>
                        <button class="btn btn--sm btn--secondary action-btn" data-action="observe" data-id="${p.id}" title="Observar" style="color: #fbbf24;">
                            <iconify-icon icon="ic:round-warning"></iconify-icon>
                        </button>
                         <button class="btn btn--sm btn--secondary action-btn" data-action="reject" data-id="${p.id}" title="Rechazar" style="color: #ef4444;">
                            <iconify-icon icon="ic:round-close"></iconify-icon>
                        </button>
                    </div>
                </td>
             `;
            tbody.appendChild(row);
        });
    },

    renderAdminTable(admins, tableBodyId) {
        // Asumiendo que agregaremos un ID al tbody de admins también
        const tbody = document.querySelector('.admin-table-desktop tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        const data = Array.isArray(admins) ? admins : [];

        data.forEach(adm => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="table-admin-info">
                        <div class="table-admin-avatar">${adm.fullName ? adm.fullName.charAt(0).toUpperCase() : 'A'}</div>
                        <span>${adm.fullName}</span>
                    </div>
                </td>
                <td>${adm.email}</td>
                <td>•••••••••••</td>
                <td>
                    <div class="admin-actions">
                        <!-- 
                        <button class="admin-action-btn" title="Editar">
                            <iconify-icon icon="ic:round-edit" class="admin-action-icon"></iconify-icon>
                        </button>
                        -->
                        <button class="admin-action-btn delete-admin-btn" data-id="${adm.id}" title="Eliminar/Bloquear">
                            <iconify-icon icon="ic:round-delete" class="admin-action-icon"></iconify-icon>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    },

    // --- Helpers ---

    getImagePath(path) {
        if (!path) return '../../assets/img/defaults/no-image.png';
        return path.startsWith('uploads') || path.startsWith('/') ? path : `/uploads/img/${path}`;
    },

    formatCurrency(amount) {
        return parseFloat(amount).toLocaleString('es-BO', { style: 'currency', currency: 'BOB' });
    },

    getStatusBadge(status) {
        // Mapeo de estados a Iconify + Clases CSS
        const badges = {
            'publicado': {
                icon: 'ic:round-check-circle',
                class: 'status-published',
                text: 'Publicado'
            },
            'en_revision': {
                icon: 'ic:round-hourglass-empty',
                class: 'status-review', // Asegúrate de tener CSS para esta clase
                text: 'En Revisión'
            },
            'observado': {
                icon: 'ic:round-warning',
                class: 'status-review', // O create una status-warning
                text: 'Observado'
            },
            'rechazado': {
                icon: 'ic:round-cancel',
                class: 'status-rejected',
                text: 'Rechazado'
            }
        };

        const config = badges[status] || { icon: 'ic:round-help-outline', class: '', text: status };

        return `
            <span class="status-badge ${config.class}" style="display: inline-flex; align-items: center; gap: 4px;">
                <iconify-icon icon="${config.icon}"></iconify-icon>
                <span>${config.text}</span>
            </span>
        `;
    },

    // --- Tabs ---
    switchTab(tabName) {
        const projectsSection = document.querySelector(".projects-section");
        const adminTabContent = document.querySelector(".admin-tab-content");
        const btns = document.querySelectorAll(".tab-button");

        btns.forEach(b => {
            if (b.textContent.trim() === tabName) b.classList.add('active');
            else b.classList.remove('active');
        });

        if (tabName === "Proyectos") {
            if (projectsSection) projectsSection.style.display = "block";
            if (adminTabContent) adminTabContent.classList.remove("active");
        } else if (tabName === "Administradores") {
            if (projectsSection) projectsSection.style.display = "none";
            if (adminTabContent) adminTabContent.classList.add("active");
        }
    }
};
