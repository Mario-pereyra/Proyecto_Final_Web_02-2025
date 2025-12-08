/**
 * Capa de Vista: AuthUI
 * Maneja la interacción visual de la página de autenticación.
 * Implementa el patrón Singleton/Namespace.
 */
const AuthUI = {

    // --- Gestión de Tabs (Login vs Registro) ---

    switchTab(tabName) {
        // 1. Ocultar todos los contenidos
        const allContents = document.querySelectorAll(".tabcontent");
        allContents.forEach((content) => {
            content.classList.remove("active");
        });

        // 2. Desactivar todos los botones
        const allButtons = document.querySelectorAll(".tablinks");
        allButtons.forEach((button) => {
            button.classList.remove("active");
        });

        // 3. Activar el contenido seleccionado
        const targetContent = document.getElementById(tabName);
        if (targetContent) {
            targetContent.classList.add("active");
        }

        // 4. Activar el botón correspondiente
        const targetButton = document.querySelector(`.tablinks[data-tab="${tabName}"]`);
        if (targetButton) {
            targetButton.classList.add("active");
        }
    },

    // --- Feedback Visual (Errores en Inputs) ---

    showInputError(inputId, message) {
        const errorElement = document.getElementById(`${inputId}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add("show");
        }

        // Opcional: Agregar clase al input
        const input = document.getElementById(inputId);
        if (input) input.classList.add("input-error");
    },

    clearInputError(inputId) {
        const errorElement = document.getElementById(`${inputId}-error`);
        if (errorElement) {
            errorElement.textContent = "";
            errorElement.classList.remove("show");
        }

        const input = document.getElementById(inputId);
        if (input) input.classList.remove("input-error");
    },

    clearAllErrors() {
        const errors = document.querySelectorAll(".error-message");
        errors.forEach(el => {
            el.textContent = "";
            el.classList.remove("show");
        });

        const inputs = document.querySelectorAll("input");
        inputs.forEach(input => input.classList.remove("input-error"));
    },

    // --- Modales (Wrappers para window.mostrarModal) ---

    showSuccessModal(title, message, onConfirm) {
        if (window.mostrarModal) {
            window.mostrarModal({
                title: title,
                message: message,
                type: 'success',
                onConfirm: onConfirm
            });
        } else {
            alert(message);
            if (onConfirm) onConfirm();
        }
    },

    showErrorModal(message) {
        if (window.mostrarModal) {
            window.mostrarModal({
                title: "Error",
                message: message,
                type: 'error'
            });
        } else {
            alert(message);
        }
    }
};
