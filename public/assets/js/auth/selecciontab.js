// assets/js/auth/seleccionTab.js

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const action = params.get("action");

  // Si viene un action en la URL, activar la pestaña correspondiente
  if (action === "registrarse") {
    switchTab("Registrarse");
  } else if (action === "Login") {
    switchTab("Login");
  }

  // Limpiar el parámetro action de la URL para que no interfiera con los clics
  if (action) {
    const cleanUrl = window.location.pathname;
    window.history.replaceState(null, "", cleanUrl);
  }

  // Agregar event listeners a los botones de tabs
  const tabButtons = document.querySelectorAll(".tablinks");
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.getAttribute("data-tab");
      switchTab(tabName);
    });
  });
});

function switchTab(tabName) {
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
  const targetButton = document.querySelector(
    `.tablinks[data-tab="${tabName}"]`
  );
  if (targetButton) {
    targetButton.classList.add("active");
  }
}
