/**
 * Capa de Datos: AdminAPI
 * Maneja las operaciones administrativas.
 * Singleton.
 */
const AdminAPI = {
    baseUrl: '/api/admin',
    projectsUrl: '/api/projects',
    usersUrl: '/api/users', // Asumimos existencia para listar

    /**
     * Obtiene estadísticas del dashboard (KPIs)
     */
    async getStats() {
        try {
            // Si existe endpoint específico
            const response = await fetch(`${this.baseUrl}/stats`);
            if (response.ok) return await response.json();

            // Fallback: Calcular basándose en listas (demo)
            return { success: true, data: { pending: 0, observed: 0, published: 0, rejected: 0 } };
        } catch (error) {
            console.error("AdminAPI.getStats error:", error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Obtiene proyectos pendientes de revisión
     */
    async getPendingProjects() {
        try {
            // Filtramos por estado 'en_revision' (ajustar según enum backend)
            const response = await fetch(`${this.projectsUrl}?approval_status=en_revision`);
            return await response.json();
        } catch (error) {
            console.error("AdminAPI.getPendingProjects error:", error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Revisa un proyecto (Aprobar, Observar, Rechazar)
     * @param {number} id 
     * @param {string} action 'publish', 'observe', 'reject'
     * @param {string|null} reason 
     */
    async reviewProject(id, action, reason = null) {
        try {
            let url = `${this.baseUrl}/projects/${id}/${action}`;
            let body = {};

            if (action === 'observe') body = { feedback: reason };
            if (action === 'reject') body = { reason: reason };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            return await response.json();
        } catch (error) {
            console.error(`AdminAPI.reviewProject (${action}) error:`, error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Obtiene lista de administradores
     */
    async getAdmins() {
        try {
            // Asumimos endpoint user con filtro role
            const response = await fetch(`${this.usersUrl}?role=admin`);
            return await response.json();
        } catch (error) {
            console.error("AdminAPI.getAdmins error:", error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Crea un nuevo administrador
     * @param {Object} data { fullName, email, password }
     */
    async createAdmin(data) {
        try {
            // Endpoint específico o usar registro general con flag
            const response = await fetch(`${this.baseUrl}/users/create-admin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error("AdminAPI.createAdmin error:", error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Elimina (o bloquea) un administrador
     * @param {number} id 
     */
    async deleteAdmin(id) {
        try {
            // Usamos blockUser del router admin como borrado lógico
            const response = await fetch(`${this.baseUrl}/users/${id}/block`, {
                method: 'PATCH'
            });
            return await response.json();
        } catch (error) {
            console.error("AdminAPI.deleteAdmin error:", error);
            return { success: false, message: error.message };
        }
    }
};
