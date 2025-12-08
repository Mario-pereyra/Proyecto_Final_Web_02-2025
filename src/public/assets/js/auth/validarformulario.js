document.addEventListener("DOMContentLoaded", interceptarForm);

async function interceptarForm() {
  const formRegistro = document.getElementById("form__registrarse");
  const formLogin = document.getElementById("form_login");

  // Validar formulario de registro
  if (formRegistro) {
    formRegistro.addEventListener("submit", async (e) => {
      e.preventDefault();

      const datos = {
        fullName: document.getElementById("nombre_completo").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("contrasena").value,
        confirmarContrasena: document.getElementById("confirmar__contrasena")
          .value,
      };
      console.log(datos);

      const formValido = validarCamposRegistro(datos);

      if (formValido) {
        try {
          const resultado = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(datos),
          });

          const data = await resultado.json();
          console.log("Respuesta del servidor:", data);
          
          if (data.success) {
             // Guardar email para la pantalla de activación
             localStorage.setItem("emailPendienteActivacion", datos.email);
             
             mostrarModal({
                title: 'Registro Exitoso',
                message: `${data.message}\n\nRevisa tu correo electrónico para obtener el código de verificación.`,
                type: 'success',
                onConfirm: () => {
                  window.location.href = "/activate-account.html";
                }
             });
          } else {
             mostrarModal({
                title: 'Error en Registro',
                message: data.message,
                type: 'error'
             });
          }

        } catch (error) {
          console.error("Error al registrar:", error);
          mostrarModal({
            title: 'Error de Conexión',
            message: 'No se pudo conectar con el servidor. Intenta nuevamente.',
            type: 'error'
          });
        }
      }
    });
  }

  // Validar formulario de login
  if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();

      const datos = {
        email: document.getElementById("login__email").value.trim(),
        password: document.getElementById("login__contrasena").value,
      };

      const formValido = validarCamposLogin(datos);

      if (formValido) {
        try {
          console.log("Formulario de login válido:", datos);
          const resultado = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(datos),
          });

          const data = await resultado.json();
          console.log("Respuesta login:", data);

          if (data.success) {
            // Guardar datos del usuario en localStorage
            localStorage.setItem("userData", JSON.stringify(data.data.user));

            mostrarModal({
              title: 'Bienvenido',
              message: 'Has iniciado sesión correctamente.',
              type: 'success',
              onConfirm: () => {
                window.location.href = "./user/index.html";
              }
            });
          } else {
            // Verificar si la cuenta está inactiva
            if (data.statusCode === "CUENTA_INACTIVA" && data.data && data.data.email) {
              // Guardar email para auto-relleno en pantalla de activación
              localStorage.setItem("emailPendienteActivacion", data.data.email);
              
              mostrarModal({
                title: 'Cuenta Inactiva',
                message: 'Tu cuenta aún no está activada. Te redirigiremos para que ingreses el código de verificación.',
                type: 'warning',
                onConfirm: () => {
                  window.location.href = "/activate-account.html";
                }
              });
            

            } else {
              // Otros errores de login
              mostrarModal({
                title: 'Error de Inicio de Sesión',
                message: data.message,
                type: 'error'
              });
            }
          }

        } catch (error) {
          console.error("Error al iniciar sesión:", error);
          mostrarModal({
            title: 'Error de Conexión',
            message: 'No se pudo conectar con el servidor. Intenta nuevamente.',
            type: 'error'
          });
        }
      }
    });
  }
}

// Validación específica para registro
function validarCamposRegistro(datos) {
  // Limpiar errores previos
  const errorRegistroNombreCompleto = document.getElementById(
    "nombre_completo-error"
  );
  const errorRegistroEmail = document.getElementById("email-error");
  const errorRegistroContrasena = document.getElementById("contrasena-error");
  const errorRegistroConfirmarContrasena = document.getElementById(
    "confirmar__contrasena-error"
  );

  errorRegistroNombreCompleto.innerHTML = "";
  errorRegistroEmail.innerHTML = "";
  errorRegistroContrasena.innerHTML = "";
  errorRegistroConfirmarContrasena.innerHTML = "";

  errorRegistroNombreCompleto.classList.remove("show");
  errorRegistroEmail.classList.remove("show");
  errorRegistroContrasena.classList.remove("show");
  errorRegistroConfirmarContrasena.classList.remove("show");

  let hayError = false;

  // Validar nombre completo
  if (!datos.fullName || datos.fullName.length < 3) {
    hayError = true;
    errorRegistroNombreCompleto.innerHTML =
      "Ingresa un nombre válido (mín. 3 caracteres)";
    errorRegistroNombreCompleto.classList.add("show");
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(datos.fullName)) {
    hayError = true;
    errorRegistroNombreCompleto.innerHTML =
      "El nombre solo debe contener letras";
    errorRegistroNombreCompleto.classList.add("show");
  }

  // Validar email
  if (!datos.email || !validarEmail(datos.email)) {
    hayError = true;
    errorRegistroEmail.innerHTML = "Ingresa un correo electrónico válido";
    errorRegistroEmail.classList.add("show");
  }

  // Validar contraseña
  if (!datos.password) {
    hayError = true;
    errorRegistroContrasena.innerHTML = "La contraseña es requerida";
    errorRegistroContrasena.classList.add("show");
  } else if (datos.password.length < 8) {
    hayError = true;
    errorRegistroContrasena.innerHTML = "Mínimo 8 caracteres";
    errorRegistroContrasena.classList.add("show");
  }

  // Validar confirmar contraseña
  if (datos.password !== datos.confirmarContrasena) {
    hayError = true;
    errorRegistroConfirmarContrasena.innerHTML = "Las contraseñas no coinciden";
    errorRegistroConfirmarContrasena.classList.add("show");
  }
  if (datos.confirmarContrasena === "") {
    hayError = true;
    errorRegistroConfirmarContrasena.innerHTML = "Confirma tu contraseña";
    errorRegistroConfirmarContrasena.classList.add("show");
  }

  return !hayError;
}

// Validación específica para login
function validarCamposLogin(datos) {
  const errorLoginEmail = document.getElementById("login__email-error");
  const errorLoginContrasena = document.getElementById(
    "login__contrasena-error"
  );

  errorLoginEmail.innerHTML = "";
  errorLoginContrasena.innerHTML = "";

  errorLoginEmail.classList.remove("show");
  errorLoginContrasena.classList.remove("show");

  let hayErrorLogin = false;

  if (!datos.email) {
    hayErrorLogin = true;
    errorLoginEmail.innerHTML = "Ingresa tu correo electrónico";
    errorLoginEmail.classList.add("show");
  } else if (!validarEmail(datos.email)) {
    hayErrorLogin = true;
    errorLoginEmail.innerHTML = "Formato de email inválido";
    errorLoginEmail.classList.add("show");
  }

  // Validar contraseña
  if (!datos.password) {
    hayErrorLogin = true;
    errorLoginContrasena.innerHTML = "Ingresa tu contraseña";
    errorLoginContrasena.classList.add("show");
  }

  return !hayErrorLogin;
}

// Función auxiliar para validar email
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
