document.addEventListener("DOMContentLoaded", () => {
  const formActivar = document.getElementById("form__activate");
  const btnReenviar = document.getElementById("btn__resend__code");

  // 1. Obtener email desde URL query params (prioridad)
  const urlParams = new URLSearchParams(window.location.search);
  const emailFromURL = urlParams.get('email');
  
  // 2. Obtener email del localStorage como fallback
  const emailFromStorage = localStorage.getItem("emailPendienteActivacion");
  
  // 3. Usar el que esté disponible (prioridad: URL > localStorage)
  const emailToFill = emailFromURL || emailFromStorage;
  if (emailToFill) {
    document.getElementById("activate__email").value = emailToFill;
  }

  // Manejar envío del formulario de activación
  if (formActivar) {
    formActivar.addEventListener("submit", async (e) => {
      e.preventDefault();

      const datos = {
        email: document.getElementById("activate__email").value.trim(),
        token: document.getElementById("activate__code").value.trim(),
      };

      // Validación
     if (!validarActivacion(datos)) {
        return;
      }

      try {
        const resultado = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datos),
        });

        const data = await resultado.json();
        console.log("Respuesta de activación:", data);

        if (data.success) {
          // Limpiar localStorage
          localStorage.removeItem("emailPendienteActivacion");

          mostrarModal({
            title: "Cuenta Activada",
            message: "Tu cuenta ha sido activada exitosamente. Ya puedes iniciar sesión.",
            type: "success",
            onConfirm: () => {
              window.location.href = "/auth.html";
            },
          });
        } else {
          mostrarModal({
            title: "Error de Activación",
            message: data.message || "No se pudo activar tu cuenta. Verifica el código.",
            type: "error",
          });
        }
      } catch (error) {
        console.error("Error al activar cuenta:", error);
        mostrarModal({
          title: "Error de Conexión",
          message: "No se pudo conectar con el servidor. Intenta nuevamente.",
          type: "error",
        });
      }
    });
  }

  // Manejar reenvío de código
  if (btnReenviar) {
    btnReenviar.addEventListener("click", async () => {
      const email = document.getElementById("activate__email").value.trim();

      if (!email) {
        mostrarModal({
          title: "Email Requerido",
          message: "Por favor, ingresa tu correo electrónico primero.",
          type: "warning",
        });
        return;
      }

      if (!validarEmail(email)) {
        mostrarModal({
          title: "Email Inválido",
          message: "Por favor, ingresa un correo electrónico válido.",
          type: "warning",
        });
        return;
      }

      try {
        const resultado = await fetch("/api/auth/resend-code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const data = await resultado.json();
        console.log("Respuesta de reenvío:", data);

        if (data.success) {
          mostrarModal({
            title: "Código Reenviado",
            message: `Se ha enviado un nuevo código de verificación a ${email}. Revisa tu correo.`,
            type: "success",
          });
        } else {
          mostrarModal({
            title: "Error al Reenviar",
            message: data.message || "No se pudo reenviar el código.",
            type: "error",
          });
        }
      } catch (error) {
        console.error("Error al reenviar código:", error);
        mostrarModal({
          title: "Error de Conexión",
          message: "No se pudo conectar con el servidor. Intenta nuevamente.",
          type: "error",
        });
      }
    });
  }
});

// Validar datos de activación
function validarActivacion(datos) {
  const errorEmail = document.getElementById("activate__email-error");
  const errorCodigo = document.getElementById("activate__code-error");

  // Limpiar errores previos
  errorEmail.innerHTML = "";
  errorEmail.classList.remove("show");
  errorCodigo.innerHTML = "";
  errorCodigo.classList.remove("show");

  let hayError = false;

  // Validar email
  if (!datos.email || !validarEmail(datos.email)) {
    hayError = true;
    errorEmail.innerHTML = "Ingresa un correo electrónico válido";
    errorEmail.classList.add("show");
  }

  // Validar código
  if (!datos.token) {
    hayError = true;
    errorCodigo.innerHTML = "El código es requerido";
    errorCodigo.classList.add("show");
  } else if (!/^\d{5}$/.test(datos.token)) {
    hayError = true;
    errorCodigo.innerHTML = "El código debe ser de 5 dígitos numéricos";
    errorCodigo.classList.add("show");
  }

  return !hayError;
}

// Función auxiliar para validar email
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
