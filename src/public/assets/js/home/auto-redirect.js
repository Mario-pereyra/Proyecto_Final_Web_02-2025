// Script de redirección automática en la página principal
// Si el usuario ya tiene sesión activa, redirigir a user/index.html

(function() {
  // Verificar si hay datos de usuario en localStorage
  const userData = localStorage.getItem("userData");
  
  if (userData) {
    try {
      const user = JSON.parse(userData);
      
      // Si el usuario está activo, redirigir a la interfaz de usuario
      if (user.status === "activo") {
        console.log("Usuario con sesión activa detectado, redirigiendo...");
        window.location.href = "/user/index.html";
      } else if (user.status === "inactivo") {
        // Si está inactivo, redirigir a activación
        console.log("Usuario inactivo detectado, redirigiendo a activación...");
        localStorage.setItem("emailPendienteActivacion", user.email);
        window.location.href = "/activate-account.html";
      }
    } catch (error) {
      console.error("Error al verificar sesión:", error);
      // Si hay error parseando, limpiar localStorage
      localStorage.removeItem("userData");
    }
  }
})();
