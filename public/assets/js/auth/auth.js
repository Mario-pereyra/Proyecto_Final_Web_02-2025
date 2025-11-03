// Esperamos a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  // 1. Seleccionar todos los botones de pestaña
  const tabButtons = document.querySelectorAll(".tablinks");
  // 2. Seleccionar todos los paneles de contenido
  const tabPanels = document.querySelectorAll(".tabcontent");
  // 3. Seleccionar los formularios
  const registerForm = document.getElementById("form__registrarse");
  const loginForm = document.getElementById("form_login");

  // Función para cambiar de pestaña
  function switchTab(targetTab) {
    // Ocultar todos los paneles de contenido
    tabPanels.forEach((panel) => {
      panel.classList.remove("active");
    });

    // Quitar la clase 'active' de todos los botones
    tabButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    // Activar el botón que se ha hecho clic
    const targetButton = document.querySelector(`[data-tab="${targetTab}"]`);
    if (targetButton) {
      targetButton.classList.add("active");
    }

    // Mostrar el panel de contenido correspondiente
    const panelToShow = document.getElementById(targetTab);
    if (panelToShow) {
      panelToShow.classList.add("active");
      
      // Enfocar el primer input del formulario activo
      const firstInput = panelToShow.querySelector('input');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  }

  // 3. Agregar un evento de clic a cada botón
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.getAttribute("data-tab");
      switchTab(tabId);
    });
  });

  // Validación de formularios
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function validatePassword(password) {
    return password.length >= 6;
  }

  function showError(input, message) {
    const container = input.closest('.container-input');
    const errorElement = container.querySelector('.error-message');
    
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
    }
    
    input.classList.add('error');
    input.classList.remove('success');
  }

  function clearError(input) {
    const container = input.closest('.container-input');
    const errorElement = container.querySelector('.error-message');
    
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.remove('show');
    }
    
    input.classList.remove('error');
    input.classList.remove('success');
  }

  function showSuccess(input) {
    input.classList.add('success');
    input.classList.remove('error');
    
    const container = input.closest('.container-input');
    const errorElement = container.querySelector('.error-message');
    
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.remove('show');
    }
  }

  // Funciones de validación usando guard clauses
  function validateEmailField(input) {
    // Guard clause: si está vacío, mostrar error y salir
    if (!input.value.trim()) {
      showError(input, "El correo electrónico es obligatorio");
      return false;
    }
    
    // Guard clause: si no es válido, mostrar error y salir
    if (!validateEmail(input.value)) {
      showError(input, "Por favor, ingresa un email válido");
      return false;
    }
    
    // Si pasa todas las validaciones, mostrar éxito
    showSuccess(input);
    return true;
  }

  function validatePasswordField(input) {
    // Guard clause: si está vacío, mostrar error y salir
    if (!input.value.trim()) {
      showError(input, "La contraseña es obligatoria");
      return false;
    }
    
    // Guard clause: si no cumple la longitud, mostrar error y salir
    if (!validatePassword(input.value)) {
      showError(input, "La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    
    // Si pasa todas las validaciones, mostrar éxito
    showSuccess(input);
    return true;
  }

  function validateConfirmPasswordField(input, passwordInput) {
    // Guard clause: si está vacío, mostrar error y salir
    if (!input.value.trim()) {
      showError(input, "Confirmar la contraseña es obligatorio");
      return false;
    }
    
    // Guard clause: si no coinciden, mostrar error y salir
    if (passwordInput.value !== input.value) {
      showError(input, "Las contraseñas no coinciden");
      return false;
    }
    
    // Si pasa todas las validaciones, mostrar éxito
    showSuccess(input);
    return true;
  }

  function validateNameField(input) {
    // Guard clause: si está vacío, mostrar error y salir
    if (!input.value.trim()) {
      showError(input, "El nombre completo es obligatorio");
      return false;
    }
    
    // Guard clause: si no tiene al menos 3 caracteres, mostrar error y salir
    if (input.value.trim().length < 3) {
      showError(input, "El nombre debe tener al menos 3 caracteres");
      return false;
    }
    
    // Guard clause: si contiene caracteres no válidos, mostrar error y salir
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(input.value.trim())) {
      showError(input, "El nombre solo puede contener letras y espacios");
      return false;
    }
    
    // Si pasa todas las validaciones, mostrar éxito
    showSuccess(input);
    return true;
  }

  function validateNameFieldRealTime(input) {
    // Guard clause: si está vacío, limpiar y salir
    if (!input.value.trim()) {
      clearError(input);
      return false;
    }
    
    // Guard clause: si no tiene al menos 3 caracteres, mostrar error y salir
    if (input.value.trim().length < 3) {
      showError(input, "El nombre debe tener al menos 3 caracteres");
      return false;
    }
    
    // Guard clause: si contiene caracteres no válidos, mostrar error y salir
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(input.value.trim())) {
      showError(input, "El nombre solo puede contener letras y espacios");
      return false;
    }
    
    // Si pasa todas las validaciones, mostrar éxito
    showSuccess(input);
    return true;
  }

  function validateEmailFieldRealTime(input) {
    // Guard clause: si está vacío, limpiar y salir
    if (!input.value.trim()) {
      clearError(input);
      return false;
    }
    
    // Guard clause: si no es válido, mostrar error y salir
    if (!validateEmail(input.value)) {
      showError(input, "Por favor, ingresa un email válido");
      return false;
    }
    
    // Si pasa todas las validaciones, mostrar éxito
    showSuccess(input);
    return true;
  }

  function validatePasswordFieldRealTime(input) {
    // Guard clause: si está vacío, limpiar y salir
    if (!input.value.trim()) {
      clearError(input);
      return false;
    }
    
    // Guard clause: si no cumple la longitud, mostrar error y salir
    if (!validatePassword(input.value)) {
      showError(input, "La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    
    // Si pasa todas las validaciones, mostrar éxito
    showSuccess(input);
    return true;
  }

  function validateConfirmPasswordFieldRealTime(input, passwordInput) {
    // Guard clause: si está vacío, limpiar y salir
    if (!input.value.trim()) {
      clearError(input);
      return false;
    }
    
    // Guard clause: si no coinciden, mostrar error y salir
    if (passwordInput.value !== input.value) {
      showError(input, "Las contraseñas no coinciden");
      return false;
    }
    
    // Si pasa todas las validaciones, mostrar éxito
    showSuccess(input);
    return true;
  }

  // Manejo del formulario de registro
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const nombre = document.getElementById("nombre_completo");
      const email = document.getElementById("email");
      const password = document.getElementById("contrasena");
      const confirmPassword = document.getElementById("confirmar__contrasena");
      
      let isValid = true;
      
      // Limpiar errores anteriores
      [nombre, email, password, confirmPassword].forEach(input => clearError(input));
      
      // Validar usando guard clauses
      const isNombreValid = validateNameField(nombre);
      const isEmailValid = validateEmailField(email);
      const isPasswordValid = validatePasswordField(password);
      const isConfirmPasswordValid = validateConfirmPasswordField(confirmPassword, password);
      
      // El formulario es válido solo si todas las validaciones pasan
      isValid = isNombreValid && isEmailValid && isPasswordValid && isConfirmPasswordValid;
      
      if (isValid) {
        // Simular envío del formulario
        console.log("Formulario de registro válido", {
          nombre: nombre.value,
          email: email.value,
          password: password.value
        });
        
        // Aquí iría la lógica de envío real
        alert("Registro exitoso. Redirigiendo...");
        
        // Simular redirección después del registro
        setTimeout(() => {
          window.location.href = "index.html?registered=true";
        }, 1500);
      }
    });
  }

  // Manejo del formulario de login
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const email = document.getElementById("login__email");
      const password = document.getElementById("login__contrasena");
      
      let isValid = true;
      
      // Limpiar errores anteriores
      [email, password].forEach(input => clearError(input));
      
      // Validar usando guard clauses
      const isEmailValid = validateEmailField(email);
      const isPasswordValid = validatePasswordField(password);
      
      // El formulario es válido solo si todas las validaciones pasan
      isValid = isEmailValid && isPasswordValid;
      
      if (isValid) {
        // Simular envío del formulario
        console.log("Formulario de login válido", {
          email: email.value,
          password: password.value
        });
        
        // Aquí iría la lógica de autenticación real
        alert("Login exitoso. Redirigiendo...");
        
        // Simular redirección después del login
        setTimeout(() => {
          window.location.href = "index.html?logged_in=true";
        }, 1500);
      }
    });
  }

  // Validación en tiempo real usando guard clauses
  function setupRealTimeValidation() {
    // Validación para nombre de registro
    const nombreInput = document.getElementById("nombre_completo");
    if (nombreInput) {
      nombreInput.addEventListener("blur", () => {
        validateNameFieldRealTime(nombreInput);
      });
    }

    // Validación para email de registro
    const emailInput = document.getElementById("email");
    if (emailInput) {
      emailInput.addEventListener("blur", () => {
        validateEmailFieldRealTime(emailInput);
      });
    }

    // Validación para email de login
    const loginEmailInput = document.getElementById("login__email");
    if (loginEmailInput) {
      loginEmailInput.addEventListener("blur", () => {
        validateEmailFieldRealTime(loginEmailInput);
      });
    }

    // Validación para contraseña de registro
    const passwordInput = document.getElementById("contrasena");
    if (passwordInput) {
      passwordInput.addEventListener("blur", () => {
        validatePasswordFieldRealTime(passwordInput);
      });
    }

    // Validación para confirmar contraseña
    const confirmPasswordInput = document.getElementById("confirmar__contrasena");
    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener("blur", () => {
        validateConfirmPasswordFieldRealTime(confirmPasswordInput, passwordInput);
      });
    }

    // Validación para contraseña de login
    const loginPasswordInput = document.getElementById("login__contrasena");
    if (loginPasswordInput) {
      loginPasswordInput.addEventListener("blur", () => {
        validatePasswordFieldRealTime(loginPasswordInput);
      });
    }
  }

  // Configurar validación en tiempo real
  setupRealTimeValidation();
});
