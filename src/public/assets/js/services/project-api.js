/**
 * Capa de Datos: ProjectAPI
 * Maneja todas las llamadas de red relacionadas con proyectos y favoritos.
 * Implementa el patrón Singleton/Namespace.
 */
const ProjectAPI = {
    baseUrl: 'http://localhost:3001/api',

    /**
     * Busca proyectos con los filtros proporcionados
     * @param {URLSearchParams} params - Parámetros de búsqueda
     * @returns {Promise<Object>} Promesa con los resultados
     */
    async search(params) {
        try {
            const response = await fetch(`${this.baseUrl}/projects/search?${params.toString()}`);
            return await response.json();
        } catch (error) {
            console.error("ProjectAPI.search error:", error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Obtiene los favoritos del usuario
     * @param {number} userId - ID del usuario
     * @returns {Promise<Object>} Promesa con la lista de favoritos
     */
    async getFavorites(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/favorites/${userId}`);
            return await response.json();
        } catch (error) {
            console.error("ProjectAPI.getFavorites error:", error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Alterna el estado de favorito de un proyecto
     * @param {number} userId - ID del usuario
     * @param {number} projectId - ID del proyecto
     * @param {boolean} isCurrentlyLiked - Estado actual (true si ya es favorito)
     * @returns {Promise<Object>} Resultado de la operación
     */
    async toggleFavorite(userId, projectId, isCurrentlyLiked) {
        try {
            const url = `${this.baseUrl}/favorites/${userId}/${projectId}`;
            const method = isCurrentlyLiked ? 'DELETE' : 'POST';
            const response = await fetch(url, { method });
            return await response.json();
        } catch (error) {
            console.error("ProjectAPI.toggleFavorite error:", error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Obtiene los detalles de un proyecto por ID
     * @param {number|string} id - ID del proyecto
     * @returns {Promise<Object>} Promesa con los detalles del proyecto
     */
    async getById(id) {
        try {
            const response = await fetch(`${this.baseUrl}/projects/${id}`);
            return await response.json();
        } catch (error) {
            console.error("ProjectAPI.getById error:", error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Obtiene las donaciones de un proyecto
     * @param {number|string} id - ID del proyecto
     * @returns {Promise<Object>} Promesa con la lista de donaciones
     */
    async getDonations(id) {
        try {
            const response = await fetch(`${this.baseUrl}/projects/${id}/donations`);
            return await response.json();
        } catch (error) {
            console.error("ProjectAPI.getDonations error:", error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Obtiene los proyectos creados por un usuario
     * @param {number|string} userId - ID del usuario
     * @returns {Promise<Object>} Promesa con la lista de proyectos
     */
    async getUserProjects(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/projects?userId=${userId}`);
            return await response.json();
        } catch (error) {
            console.error("ProjectAPI.getUserProjects error:", error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Elimina un proyecto (Soft delete)
     * @param {number|string} projectId - ID del proyecto
     * @returns {Promise<Object>} Resultado de la operación
     */
    async deleteProject(projectId) {
        try {
            const response = await fetch(`${this.baseUrl}/projects/${projectId}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error("ProjectAPI.deleteProject error:", error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Guarda un proyecto (Crear o Actualizar)
     * @param {FormData} formData - Datos del proyecto
     * @returns {Promise<Object>} Resultado de la operación
     */
    async save(formData) {
        try {
            const response = await fetch(`${this.baseUrl}/projects/save`, {
                method: 'POST',
                body: formData
            });
            return await response.json();
        } catch (error) {
            console.error("ProjectAPI.save error:", error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Elimina una imagen de galería del servidor
     * @param {number|string} projectId - ID del proyecto
     * @param {number|string} imageId - ID de la imagen
     * @returns {Promise<Object>} Resultado de la operación
     */
    async deleteImage(projectId, imageId) {
        try {
            const response = await fetch(`${this.baseUrl}/projects/${projectId}/images/${imageId}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error("ProjectAPI.deleteImage error:", error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Obtiene todas las categorías disponibles
     * @returns {Promise<Object>} Lista de categorías
     */
    async getCategories() {
        try {
            const response = await fetch(`${this.baseUrl}/categories`);
            return await response.json();
        } catch (error) {
            console.error("ProjectAPI.getCategories error:", error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Obtiene los requisitos de una categoría
     * @param {number|string} categoryId - ID de la categoría
     * @returns {Promise<Object>} Requisitos
     */
    async getRequirements(categoryId) {
        try {
            // Ajuste para coincidir con la ruta real de tu backend si es distinta
            // Asumo que GET /categories/:id/requirements existe
            const response = await fetch(`${this.baseUrl}/categories/${categoryId}/requirements`);
            return await response.json();
        } catch (error) {
            console.error("ProjectAPI.getRequirements error:", error);
            return { success: false, message: error.message };
        }
    },

    /**
     * Obtiene estadísticas globales de la plataforma
     * @returns {Promise<Object>} Estadísticas globales
     */
    async getGlobalStats() {
        try {
            const response = await fetch(`${this.baseUrl}/projects/stats/global`);
            return await response.json();
        } catch (error) {
            console.error("ProjectAPI.getGlobalStats error:", error);
            return { success: false, message: error.message };
        }
    }
};
