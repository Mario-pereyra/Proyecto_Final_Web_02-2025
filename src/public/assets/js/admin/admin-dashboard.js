/**
 * Controlador: Dashboard Administrativo
 * Orquesta la revisión de proyectos y gestión de usuarios.
 */

document.addEventListener("DOMContentLoaded", async () => {

    // 1. Verificación de Rol (Simple Client-Side Guard)
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!userData.id || userData.role !== 'admin') {
        alert("Acceso denegado. Se requiere rol de administrador.");
        window.location.href = "../auth.html?action=Login";
        return;
    }

    // Inicializar UI
    loadDashboardStats();
    loadPendingProjects();

    // Listeners Tabs
    document.querySelectorAll(".tab-button").forEach(btn => {
        btn.addEventListener("click", () => {
            const tabName = btn.textContent.trim();
            AdminUI.switchTab(tabName);
            if (tabName === 'Administradores') loadAdmins();
            else loadPendingProjects();
        });
    });

    // Listeners Creación Admin
    const createBtn = document.querySelector(".admin-submit-btn");
    if (createBtn) {
        createBtn.addEventListener("click", handleCreateAdmin);
    }
});

// --- Carga de Datos ---

async function loadDashboardStats() {
    const res = await AdminAPI.getStats();
    if (res.success && res.data) {
        // Actualizar contadores visuales si existieran IDs específicos
        // Por ahora hardcoded en el HTML según diseño
    }
}

async function loadPendingProjects() {
    const res = await AdminAPI.getPendingProjects();
    if (res.success) {
        AdminUI.renderProjectTable(res.data || res.projects || [], 'projects-table-body'); // Ajustar propiedad data según API real
        attachProjectEvents();
    } else {
        console.error(res.message);
    }
}

async function loadAdmins() {
    const res = await AdminAPI.getAdmins();
    if (res.success) {
        AdminUI.renderAdminTable(res.data || res.users || []); // Ajustar data
        attachAdminEvents();
    }
}


// --- Eventos y Acciones ---

function attachProjectEvents() {
    document.querySelectorAll(".action-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const action = btn.getAttribute("data-action"); // 'view', 'approve', 'observe', 'reject'
            const id = btn.getAttribute("data-id");

            if (action === 'view') {
                window.open(`../detail.html?id=${id}`, '_blank');
            } else if (action === 'approve') {
                if (confirm("¿Aprobar y publicar este proyecto?")) {
                    await executeReview(id, 'publish');
                }
            } else if (action === 'observe' || action === 'reject') {
                // Usar modal simple o prompt por restricción de tiempo, ideally custom modal
                const reason = prompt(action === 'observe' ? "Feedback para el creador:" : "Motivo del rechazo:");
                if (reason) {
                    await executeReview(id, action, reason);
                }
            }
        });
    });
}

function attachAdminEvents() {
    document.querySelectorAll(".delete-admin-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-id");
            if (confirm("¿Bloquear/Eliminar a este administrador?")) {
                const res = await AdminAPI.deleteAdmin(id);
                if (res.success) {
                    alert("Admin bloqueado correctamente.");
                    loadAdmins();
                } else {
                    alert("Error: " + res.message);
                }
            }
        });
    });
}

// --- Lógica de Negocio ---

async function executeReview(id, action, reason = null) {
    const res = await AdminAPI.reviewProject(id, action, reason);
    if (res.success) {
        alert(`Proyecto ${action === 'publish' ? 'publicado' : (action === 'observe' ? 'observado' : 'rechazado')} correctamente.`);
        loadPendingProjects();
    } else {
        alert("Error: " + res.message);
    }
}

async function handleCreateAdmin() {
    const inputs = document.querySelectorAll(".admin-form-input");
    const fullName = inputs[0].value.trim();
    const email = inputs[1].value.trim();
    const password = inputs[2].value;
    const confirmPass = inputs[3].value;

    if (!fullName || !email || !password) return alert("Completa todos los campos");
    if (password !== confirmPass) return alert("Contraseñas no coinciden");

    const res = await AdminAPI.createAdmin({ fullName, email, password, role: 'admin' });
    if (res.success) {
        alert("Administrador creado exitosamente.");
        inputs.forEach(i => i.value = "");
        loadAdmins();
    } else {
        alert("Error creando admin: " + res.message);
    }
}
