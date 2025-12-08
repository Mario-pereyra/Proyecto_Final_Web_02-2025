/**
 * Capa de Datos: UserAPI
 * Maneja las llamadas de red relacionadas con información del usuario y KPIs.
 * Implementa el patrón Singleton/Namespace.
 */
const UserAPI = {
    baseUrl: 'http://localhost:3001/api',

    /**
     * Obtiene las estadísticas (KPIs) del usuario
     * @param {number|string} userId - ID del usuario
     * @returns {Promise<Object>} Promesa con los KPIs
     */
    async getStats(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/users/${userId}/kpis`);
            return await response.json();
        } catch (error) {
            console.error("UserAPI.getStats error:", error);
            return { success: false, message: error.message };
        }
    },

    // Aquí se podrían agregar métodos futuros como:
    // getProfile(userId)
    // updateProfile(userId, data)
};
