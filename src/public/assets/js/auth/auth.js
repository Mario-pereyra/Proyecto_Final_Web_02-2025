/**
 * Controlador: Autenticación
 * Orquesta el Login y Registro usando AuthAPI y AuthUI.
 * Reemplaza a selecciontab.js y validarformulario.js
 */

document.addEventListener("DOMContentLoaded", () => {

    // 1. Inicializar Pestañas desde URL
    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");

    if (action === "registrarse") {
        AuthUI.switchTab("Registrarse");
    } else if (action === "Login") {
        AuthUI.switchTab("Login");
    }

    // Limpiar URL
    if (action) {
        window.history.replaceState(null, "", window.location.pathname);
    }

    // Listeners para botones de pestañas
    document.querySelectorAll(".tablinks").forEach(btn => {
        btn.addEventListener("click", () => {
            AuthUI.switchTab(btn.getAttribute("data-tab"));
            AuthUI.clearAllErrors();
        });
    });


    // 2. Manejo de Registro
    const formRegistro = document.getElementById("form__registrarse");
    if (formRegistro) {
        formRegistro.addEventListener("submit", handleRegisterSubmit);
    }

    // 3. Manejo de Login
    const formLogin = document.getElementById("form_login");
    if (formLogin) {
        formLogin.addEventListener("submit", handleLoginSubmit);
    }

});

// --- Manejadores de Eventos ---

async function handleRegisterSubmit(e) {
    e.preventDefault();
    AuthUI.clearAllErrors();

    const fullName = document.getElementById("nombre_completo").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("contrasena").value;
    const confirmPassword = document.getElementById("confirmar__contrasena").value;

    // Validación Local
    let isValid = true;

    if (fullName.length < 3) {
        AuthUI.showInputError("nombre_completo", "Mínimo 3 caracteres.");
        isValid = false;
    }

    if (!validateEmail(email)) {
        AuthUI.showInputError("email", "Email inválido.");
        isValid = false;
    }

    if (password.length < 8) {
        AuthUI.showInputError("contrasena", "Mínimo 8 caracteres.");
        isValid = false;
    }

    if (password !== confirmPassword) {
        AuthUI.showInputError("confirmar__contrasena", "Las contraseñas no coinciden.");
        isValid = false;
    }

    if (!isValid) return;

    // Llamada a API
    const result = await AuthAPI.register({ fullName, email, password, confirmarContrasena: confirmPassword });

    if (result.success) {
        localStorage.setItem("emailPendienteActivacion", email);
        AuthUI.showSuccessModal("Registro Exitoso", result.message + "\nRevisa tu correo.", () => {
            window.location.href = "/activate-account.html";
        });
    } else {
        AuthUI.showErrorModal(result.message || "Error en registro");
    }
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    AuthUI.clearAllErrors();

    const email = document.getElementById("login__email").value.trim();
    const password = document.getElementById("login__contrasena").value;

    let isValid = true;

    if (!validateEmail(email)) {
        AuthUI.showInputError("login__email", "Ingrese un email válido.");
        isValid = false;
    }
    if (!password) {
        AuthUI.showInputError("login__contrasena", "Ingrese su contraseña.");
        isValid = false;
    }

    if (!isValid) return;

    // Llamada a API
    const result = await AuthAPI.login(email, password);

    if (result.success) {
        localStorage.setItem("userData", JSON.stringify(result.data.user));
        AuthUI.showSuccessModal("Bienvenido", "Has iniciado sesión correctamente.", () => {
            // Redirección basada en rol si fuera necesario, por ahora a user/index
            window.location.href = "./user/index.html";
        });
    } else {
        if (result.statusCode === "CUENTA_INACTIVA" && result.data && result.data.email) {
            localStorage.setItem("emailPendienteActivacion", result.data.email);
            window.mostrarModal({
                title: 'Cuenta Inactiva',
                message: 'Debes activar tu cuenta primero.',
                type: 'warning',
                onConfirm: () => window.location.href = "/activate-account.html"
            });
        } else {
            AuthUI.showErrorModal(result.message || "Credenciales incorrectas");
        }
    }
}

// --- Helpers ---
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
