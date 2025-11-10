document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".tablinks");

  const tabPanels = document.querySelectorAll(".tabcontent");

  const registerForm = document.getElementById("form__registrarse");
  const loginForm = document.getElementById("form_login");

  function switchTab(targetTab) {
    tabPanels.forEach((panel) => {
      panel.classList.remove("active");
    });

    tabButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    const targetButton = document.querySelector(`[data-tab="${targetTab}"]`);
    if (targetButton) {
      targetButton.classList.add("active");
    }

    const panelToShow = document.getElementById(targetTab);
    if (panelToShow) {
      panelToShow.classList.add("active");

      const firstInput = panelToShow.querySelector("input");
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }

    if (targetTab === "Registrarse") {
      window.history.pushState(null, null, "#registro");
    } else if (targetTab === "Login") {
      window.history.pushState(null, null, "#login");
    }
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.getAttribute("data-tab");
      switchTab(tabId);
    });
  });

  function activateTabFromHash() {
    const hash = window.location.hash.substring(1);

    if (
      hash === "registro" ||
      hash === "registrarse" ||
      hash === "Registrarse"
    ) {
      switchTab("Registrarse");
    } else if (
      hash === "login" ||
      hash === "iniciar-sesion" ||
      hash === "Login"
    ) {
      switchTab("Login");
    }
  }

  activateTabFromHash();

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function validatePassword(password) {
    return password.length >= 6;
  }

  function showError(input, message) {
    const container = input.closest(".container-input");
    const errorElement = container.querySelector(".error-message");

    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add("show");
    }

    input.classList.add("error");
    input.classList.remove("success");
  }

  function clearError(input) {
    const container = input.closest(".container-input");
    const errorElement = container.querySelector(".error-message");

    if (errorElement) {
      errorElement.textContent = "";
      errorElement.classList.remove("show");
    }

    input.classList.remove("error");
    input.classList.remove("success");
  }

  function showSuccess(input) {
    input.classList.add("success");
    input.classList.remove("error");

    const container = input.closest(".container-input");
    const errorElement = container.querySelector(".error-message");

    if (errorElement) {
      errorElement.textContent = "";
      errorElement.classList.remove("show");
    }
  }

  function validateEmailField(input) {
    if (!input.value.trim()) {
      showError(input, "El correo electrónico es obligatorio");
      return false;
    }

    if (!validateEmail(input.value)) {
      showError(input, "Por favor, ingresa un email válido");
      return false;
    }

    showSuccess(input);
    return true;
  }

  function validatePasswordField(input) {
    if (!input.value.trim()) {
      showError(input, "La contraseña es obligatoria");
      return false;
    }

    if (!validatePassword(input.value)) {
      showError(input, "La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    showSuccess(input);
    return true;
  }

  function validateConfirmPasswordField(input, passwordInput) {
    if (!input.value.trim()) {
      showError(input, "Confirmar la contraseña es obligatorio");
      return false;
    }

    if (passwordInput.value !== input.value) {
      showError(input, "Las contraseñas no coinciden");
      return false;
    }

    showSuccess(input);
    return true;
  }

  function validateNameField(input) {
    if (!input.value.trim()) {
      showError(input, "El nombre completo es obligatorio");
      return false;
    }

    if (input.value.trim().length < 3) {
      showError(input, "El nombre debe tener al menos 3 caracteres");
      return false;
    }

    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(input.value.trim())) {
      showError(input, "El nombre solo puede contener letras y espacios");
      return false;
    }

    showSuccess(input);
    return true;
  }

  function validateNameFieldRealTime(input) {
    if (!input.value.trim()) {
      clearError(input);
      return false;
    }

    if (input.value.trim().length < 3) {
      showError(input, "El nombre debe tener al menos 3 caracteres");
      return false;
    }

    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(input.value.trim())) {
      showError(input, "El nombre solo puede contener letras y espacios");
      return false;
    }

    showSuccess(input);
    return true;
  }

  function validateEmailFieldRealTime(input) {
    if (!input.value.trim()) {
      clearError(input);
      return false;
    }

    if (!validateEmail(input.value)) {
      showError(input, "Por favor, ingresa un email válido");
      return false;
    }

    showSuccess(input);
    return true;
  }

  function validatePasswordFieldRealTime(input) {
    if (!input.value.trim()) {
      clearError(input);
      return false;
    }

    if (!validatePassword(input.value)) {
      showError(input, "La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    showSuccess(input);
    return true;
  }

  function validateConfirmPasswordFieldRealTime(input, passwordInput) {
    if (!input.value.trim()) {
      clearError(input);
      return false;
    }

    if (passwordInput.value !== input.value) {
      showError(input, "Las contraseñas no coinciden");
      return false;
    }

    showSuccess(input);
    return true;
  }

  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const nombre = document.getElementById("nombre_completo");
      const email = document.getElementById("email");
      const password = document.getElementById("contrasena");
      const confirmPassword = document.getElementById("confirmar__contrasena");

      let isValid = true;

      [nombre, email, password, confirmPassword].forEach((input) =>
        clearError(input)
      );

      const isNombreValid = validateNameField(nombre);
      const isEmailValid = validateEmailField(email);
      const isPasswordValid = validatePasswordField(password);
      const isConfirmPasswordValid = validateConfirmPasswordField(
        confirmPassword,
        password
      );

      isValid =
        isNombreValid &&
        isEmailValid &&
        isPasswordValid &&
        isConfirmPasswordValid;

      if (isValid) {
        console.log("Formulario de registro válido", {
          nombre: nombre.value,
          email: email.value,
          password: password.value,
        });

        alert("Registro exitoso. Redirigiendo...");

        setTimeout(() => {
          window.location.href = "index.html?registered=true";
        }, 1500);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("login__email");
      const password = document.getElementById("login__contrasena");

      let isValid = true;

      [email, password].forEach((input) => clearError(input));

      const isEmailValid = validateEmailField(email);
      const isPasswordValid = validatePasswordField(password);

      isValid = isEmailValid && isPasswordValid;

      if (isValid) {
        console.log("Formulario de login válido", {
          email: email.value,
          password: password.value,
        });

        alert("Login exitoso. Redirigiendo...");

        setTimeout(() => {
          window.location.href = "index.html?logged_in=true";
        }, 1500);
      }
    });
  }

  function setupRealTimeValidation() {
    const nombreInput = document.getElementById("nombre_completo");
    if (nombreInput) {
      nombreInput.addEventListener("blur", () => {
        validateNameFieldRealTime(nombreInput);
      });
    }

    const emailInput = document.getElementById("email");
    if (emailInput) {
      emailInput.addEventListener("blur", () => {
        validateEmailFieldRealTime(emailInput);
      });
    }

    const loginEmailInput = document.getElementById("login__email");
    if (loginEmailInput) {
      loginEmailInput.addEventListener("blur", () => {
        validateEmailFieldRealTime(loginEmailInput);
      });
    }

    const passwordInput = document.getElementById("contrasena");
    if (passwordInput) {
      passwordInput.addEventListener("blur", () => {
        validatePasswordFieldRealTime(passwordInput);
      });
    }

    const confirmPasswordInput = document.getElementById(
      "confirmar__contrasena"
    );
    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener("blur", () => {
        validateConfirmPasswordFieldRealTime(
          confirmPasswordInput,
          passwordInput
        );
      });
    }

    const loginPasswordInput = document.getElementById("login__contrasena");
    if (loginPasswordInput) {
      loginPasswordInput.addEventListener("blur", () => {
        validatePasswordFieldRealTime(loginPasswordInput);
      });
    }
  }

  setupRealTimeValidation();
});
