// assets/js/auth/seleccionTab.js
// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const action = params.get("action");

  // Debug: ver en consola qué está recibiendo
  console.log('Action recibido:', action);

  if (action === "registrarse") {
    switchTab("Registrarse");
  } else if (action === "Login") {
    switchTab("Login");
  }
});

function switchTab(tabName) {
  // 1. Ocultar todos los contenidos
  const allContents = document.querySelectorAll('.tabcontent');
  allContents.forEach(content => {
    content.classList.remove('active');
  });

  // 2. Desactivar todos los botones
  const allButtons = document.querySelectorAll('.tablinks');
  allButtons.forEach(button => {
    button.classList.remove('active');
  });

  // 3. Activar el contenido seleccionado
  const targetContent = document.getElementById(tabName);
  if (targetContent) {
    targetContent.classList.add('active');
  }

  // 4. Activar el botón correspondiente
  const targetButton = document.querySelector(`.tablinks[data-tab="${tabName}"]`);
  if (targetButton) {
    targetButton.classList.add('active');
  }
}

