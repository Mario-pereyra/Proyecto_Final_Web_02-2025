/**
 * Componentes UI comunes para todo el proyecto
 * Elimina código duplicado y centraliza funcionalidades reutilizables
 */

// ===== MENÚ LATERAL =====
class SideMenu {
  constructor() {
    this.hamburgerBtn = document.getElementById('hamburgerBtn');
    this.closeBtn = document.getElementById('closeBtn');
    this.sideMenu = document.getElementById('sideMenu');
    this.overlay = document.getElementById('overlay');
    
    this.init();
  }

  init() {
    if (!this.hamburgerBtn || !this.closeBtn || !this.sideMenu || !this.overlay) {
      console.warn('Elementos del menú no encontrados');
      return;
    }

    this.setupEventListeners();
    this.setupAccessibility();
  }

  setupEventListeners() {
    // Abrir/cerrar menú
    this.hamburgerBtn?.addEventListener('click', () => this.toggleMenu());
    this.closeBtn?.addEventListener('click', () => this.closeMenu());
    this.overlay?.addEventListener('click', () => this.closeMenu());

    // Cerrar menú al hacer clic en enlaces
    const menuLinks = document.querySelectorAll('.menu-link, .menu-btn');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        setTimeout(() => this.closeMenu(), 150);
      });
    });

    // Cerrar con tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.sideMenu.classList.contains('active')) {
        this.closeMenu();
      }
    });

    // Cerrar al cambiar tamaño de ventana
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768 && this.sideMenu.classList.contains('active')) {
          this.closeMenu();
        }
      }, 250);
    });
  }

  setupAccessibility() {
    // Configurar atributos ARIA iniciales
    if (this.hamburgerBtn) {
      this.hamburgerBtn.setAttribute('aria-expanded', 'false');
      this.hamburgerBtn.setAttribute('aria-controls', 'sideMenu');
    }
    
    if (this.sideMenu) {
      this.sideMenu.setAttribute('aria-hidden', 'true');
      this.sideMenu.setAttribute('role', 'navigation');
      this.sideMenu.setAttribute('aria-label', 'Menú de navegación');
    }
    
    if (this.overlay) {
      this.overlay.setAttribute('aria-hidden', 'true');
    }
  }

  openMenu() {
    this.sideMenu.classList.add('active');
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Actualizar atributos ARIA
    this.hamburgerBtn.setAttribute('aria-expanded', 'true');
    this.sideMenu.setAttribute('aria-hidden', 'false');
  }

  closeMenu() {
    this.sideMenu.classList.remove('active');
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
    
    // Actualizar atributos ARIA
    this.hamburgerBtn.setAttribute('aria-expanded', 'false');
    this.sideMenu.setAttribute('aria-hidden', 'true');
  }

  toggleMenu() {
    if (this.sideMenu.classList.contains('active')) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }
}

// ===== BOTONES DE CORAZÓN (FAVORITOS) =====
class LikeButton {
  constructor() {
    this.buttons = document.querySelectorAll('.project-like-btn, .heart-icon');
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleLike(button);
      });
    });
  }

  toggleLike(button) {
    const isLiked = button.getAttribute('data-liked') === 'true';
    const emptyIcon = button.querySelector('.heart-icon-empty, .heart-icon-border');
    const filledIcon = button.querySelector('.heart-icon-filled, .heart-icon');
    
    if (isLiked) {
      // Quitar de favoritos
      button.setAttribute('data-liked', 'false');
      button.setAttribute('aria-pressed', 'false');
      if (emptyIcon) emptyIcon.style.display = 'block';
      if (filledIcon) filledIcon.style.display = 'none';
    } else {
      // Añadir a favoritos
      button.setAttribute('data-liked', 'true');
      button.setAttribute('aria-pressed', 'true');
      if (emptyIcon) emptyIcon.style.display = 'none';
      if (filledIcon) filledIcon.style.display = 'block';
    }
  }
}

// ===== PESTAÑAS (TABS) =====
class TabSystem {
  constructor() {
    this.tabButtons = document.querySelectorAll('.tab');
    this.tabPanels = document.querySelectorAll('.tabcontent');
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.activateFromHash();
  }

  setupEventListeners() {
    this.tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        this.switchTab(tabId);
      });
    });

    // Escuchar cambios en el hash
    window.addEventListener('hashchange', () => this.activateFromHash());
  }

  switchTab(targetTab) {
    // Ocultar todos los paneles
    this.tabPanels.forEach(panel => {
      panel.classList.remove('active');
    });

    // Quitar la clase 'tab--active' de todos los botones
    this.tabButtons.forEach(btn => {
      btn.classList.remove('tab--active');
      btn.removeAttribute('aria-current');
    });

    // Activar el botón correspondiente
    const targetButton = document.querySelector(`[data-tab="${targetTab}"]`);
    if (targetButton) {
      targetButton.classList.add('tab--active');
      targetButton.setAttribute('aria-current', 'page');
    }

    // Mostrar el panel correspondiente
    const panelToShow = document.getElementById(targetTab);
    if (panelToShow) {
      panelToShow.classList.add('active');
    }

    // Actualizar hash en la URL
    this.updateHash(targetTab);
  }

  activateFromHash() {
    const hash = window.location.hash.substring(1);
    
    if (hash === 'proyectos' || hash === 'mis-proyectos') {
      this.switchTab('proyectos');
    } else if (hash === 'aportes' || hash === 'mis-aportes') {
      this.switchTab('aportes');
    } else if (hash === 'favoritos') {
      this.switchTab('favoritos');
    } else {
      // Por defecto, mostrar la pestaña de aportes
      this.switchTab('aportes');
    }
  }

  updateHash(tabName) {
    if (tabName === 'proyectos') {
      window.history.pushState(null, null, '#proyectos');
    } else if (tabName === 'aportes') {
      window.history.pushState(null, null, '#aportes');
    } else if (tabName === 'favoritos') {
      window.history.pushState(null, null, '#favoritos');
    }
  }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar componentes solo si los elementos existen
  if (document.getElementById('hamburgerBtn')) {
    new SideMenu();
  }
  
  if (document.querySelector('.project-like-btn, .heart-icon')) {
    new LikeButton();
  }
  
  if (document.querySelector('.tab')) {
    new TabSystem();
  }
});