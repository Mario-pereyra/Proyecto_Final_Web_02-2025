// Esperamos a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  // 1. Seleccionar todos los botones de pestaña
  const tabButtons = document.querySelectorAll(".tab");
  // 2. Seleccionar todos los paneles de contenido
  const tabPanels = document.querySelectorAll(".tabcontent");
  // 3. Seleccionar el banner para actualizar dinámicamente
  const dashBanner = document.querySelector(".dash-banner");

  // Función para cambiar de pestaña
  function switchTab(targetTab) {
    // Ocultar todos los paneles de contenido
    tabPanels.forEach((panel) => {
      panel.classList.remove("active");
    });

    // Quitar la clase 'tab--active' de todos los botones
    tabButtons.forEach((btn) => {
      btn.classList.remove("tab--active");
      btn.removeAttribute("aria-current");
    });

    // Activar el botón que se ha hecho clic
    const targetButton = document.querySelector(`[data-tab="${targetTab}"]`);
    if (targetButton) {
      targetButton.classList.add("tab--active");
      targetButton.setAttribute("aria-current", "page");
    }

    // Mostrar el panel de contenido correspondiente
    const panelToShow = document.getElementById(targetTab);
    if (panelToShow) {
      panelToShow.classList.add("active");
    }
    
    // Actualizar el banner según la pestaña activa
    updateBanner(targetTab);
    
    // Actualizar el hash en la URL según la pestaña activa
    if (targetTab === 'proyectos') {
      window.history.pushState(null, null, '#proyectos');
    } else if (targetTab === 'aportes') {
      window.history.pushState(null, null, '#aportes');
    } else if (targetTab === 'favoritos') {
      window.history.pushState(null, null, '#favoritos');
    }
  }

  // Función para actualizar el banner según la pestaña activa
  function updateBanner(tabName) {
    if (dashBanner) {
      switch(tabName) {
        case 'proyectos':
          dashBanner.textContent = 'USUARIO : MIS PROYECTOS';
          break;
        case 'aportes':
          dashBanner.textContent = 'USUARIO : MIS APORTES';
          break;
        case 'favoritos':
          dashBanner.textContent = 'USUARIO : FAVORITOS';
          break;
        default:
          dashBanner.textContent = 'USUARIO : MIS APORTES';
      }
    }
  }

  // Agregar un evento de clic a cada botón
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.getAttribute("data-tab");
      switchTab(tabId);
    });
  });

  // Función para activar pestaña desde el hash de la URL
  function activateTabFromHash() {
    const hash = window.location.hash.substring(1); // Eliminar el #
    
    if (hash === 'proyectos' || hash === 'mis-proyectos') {
      switchTab('proyectos');
    } else if (hash === 'aportes' || hash === 'mis-aportes') {
      switchTab('aportes');
    } else if (hash === 'favoritos') {
      switchTab('favoritos');
    } else {
      // Por defecto, mostrar la pestaña de aportes
      switchTab('aportes');
    }
  }

  // Llamar a la función para activar pestaña desde hash al cargar la página
  activateTabFromHash();

  // Escuchar cambios en el hash de la URL
  window.addEventListener('hashchange', activateTabFromHash);

  // Funcionalidad para botones de "Ver Proyecto" en la sección de aportes
  const donationLinks = document.querySelectorAll('.donation__link');
  donationLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      // Aquí podrías redirigir a la página de detalles del proyecto
      const projectTitle = link.getAttribute('aria-label').replace('Ver proyecto ', '');
      console.log(`Navegando al proyecto: ${projectTitle}`);
      // Ejemplo: window.location.href = `detail.html?project=${encodeURIComponent(projectTitle)}`;
    });
  });

  // Funcionalidad para botones de "Editar" en la sección de proyectos
  const editButtons = document.querySelectorAll('.project-card .btn--primary');
  editButtons.forEach(button => {
    if (button.textContent.trim() === 'Editar') {
      button.addEventListener('click', () => {
        const projectTitle = button.closest('.project-card').querySelector('.project-card__title').textContent;
        console.log(`Editando proyecto: ${projectTitle}`);
        // Aquí podrías abrir un modal de edición o redirigir a una página de edición
      });
    }
  });

  // Funcionalidad para botones de "Aportar" en la sección de favoritos
  const contributeButtons = document.querySelectorAll('.favorite-card .btn--primary');
  contributeButtons.forEach(button => {
    if (button.textContent.trim() === 'Aportar') {
      button.addEventListener('click', () => {
        const projectTitle = button.closest('.favorite-card').querySelector('.favorite-card__title').textContent;
        console.log(`Aportando al proyecto: ${projectTitle}`);
        // Aquí podrías redirigir a la página de detalles para aportar
      });
    }
  });

  // Funcionalidad para botones de corazón en favoritos
  const heartButtons = document.querySelectorAll('.favorite-card .btn--icon');
  heartButtons.forEach(button => {
    button.addEventListener('click', () => {
      const projectTitle = button.closest('.favorite-card').querySelector('.favorite-card__title').textContent;
      const icon = button.querySelector('img');
      
      // Alternar estado de favorito
      if (icon.alt === 'Corazón') {
        icon.alt = 'Corazón lleno';
        icon.src = 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/tnALkbB2kW/hjqpl7jk_expires_30_days.png';
        console.log(`Proyecto marcado como favorito: ${projectTitle}`);
      } else {
        icon.alt = 'Corazón';
        icon.src = 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/tnALkbB2kW/m0fx6pvx_expires_30_days.png';
        console.log(`Proyecto eliminado de favoritos: ${projectTitle}`);
      }
    });
  });

  // Funcionalidad para el botón "Nuevo Proyecto"
  const newProjectButton = document.querySelector('.dash-header .btn--primary');
  if (newProjectButton) {
    newProjectButton.addEventListener('click', () => {
      console.log('Creando nuevo proyecto');
      // Aquí podrías redirigir a una página de creación de proyectos
      // o abrir un modal para crear un nuevo proyecto
    });
  }
});