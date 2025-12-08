/**
 * Capa de Datos: AuthAPI
 * Maneja todas las llamadas de red relacionadas con autenticación.
 * Implementa el patrón Singleton/Namespace.
 */
const AuthAPI = {
    baseUrl: '/api/auth',

    /**
     * Inicia sesión con email y contraseña
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<Object>} Respuesta del servidor
     */
    async login(email, password) {
        try {
            // Se usa path relativo ya que el baseUrl es relativo a la raiz
            const response = await fetch(`${this.baseUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            return await response.json();
        } catch (error) {
            console.error("AuthAPI.login error:", error);
            return { success: false, message: 'Error de conexión' };
        }
    },

    /**
     * Registra un nuevo usuario
     * @param {Object} userData - { fullName, email, password, confirmarContrasena }
     * @returns {Promise<Object>} Respuesta del servidor
     */
    async register(userData) {
        try {
            const response = await fetch(`${this.baseUrl}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            return await response.json();
        } catch (error) {
            console.error("AuthAPI.register error:", error);
            return { success: false, message: 'Error de conexión' };
        }
    }
};
