// Esperamos a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  // 1. Seleccionar todos los botones de pestaña
  const tabButtons = document.querySelectorAll(".tablinks");
  // 2. Seleccionar todos los paneles de contenido
  const tabPanels = document.querySelectorAll(".tabcontent");

  // 3. Agregar un evento de clic a cada botón
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // 4. Ocultar todos los paneles de contenido
      tabPanels.forEach((panel) => {
        panel.classList.remove("active");
      });

      // 5. Quitar la clase 'active' de todos los botones
      tabButtons.forEach((btn) => {
        btn.classList.remove("active");
      });

      // 6. Activar el botón que se ha hecho clic
      button.classList.add("active");

      // 7. Mostrar el panel de contenido correspondiente
      const tabId = button.getAttribute("data-tab");
      const panelToShow = document.getElementById(tabId);
      if (panelToShow) {
        panelToShow.classList.add("active");
      }
    });
  });
});
