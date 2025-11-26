// Script de protección para páginas de usuario
// Verifica que el usuario esté autenticado y su cuenta esté activa

(function() {
  // Obtener datos del usuario del localStorage
  const userData = localStorage.getItem("userData");
  const authToken = localStorage.getItem("authToken");

  // Si no hay datos de usuario, redirigir al login
  if (!userData || !authToken) {
    window.location.href = "/auth.html";
    return;
  }

  try {
    const user = JSON.parse(userData);

    // Verificar que el usuario tenga status activo
    if (user.status !== "activo") {
      // Guardar email para activación
      localStorage.setItem("emailPendienteActivacion", user.email);
      
      // Mostrar alerta y redirigir
      alert("Tu cuenta no está activada. Serás redirigido a la página de activación.");
      window.location.href = "/activate-account.html";
      return;
    }

    // Si todo está bien, el usuario puede continuar
    console.log("Usuario autenticado:", user.fullName);
  } catch (error) {
    console.error("Error al verificar datos del usuario:", error);
    // Si hay error parseando los datos, limpiar y redirigir
    localStorage.removeItem("userData");
    localStorage.removeItem("authToken");
    window.location.href = "/auth.html";
  }
})();
