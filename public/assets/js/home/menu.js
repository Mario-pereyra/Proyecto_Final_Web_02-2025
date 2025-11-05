// Obtener elementos del DOM
const hamburgerBtn = document.getElementById('hamburgerBtn');
const closeBtn = document.getElementById('closeBtn');
const sideMenu = document.getElementById('sideMenu');
const overlay = document.getElementById('overlay');

// Función para abrir el menú
function openMenu() {
  sideMenu.classList.add('active');
  overlay.classList.add('active');
  hamburgerBtn.classList.add('active');
  document.body.style.overflow = 'hidden'; // Previene scroll
  
  // Asegurar accesibilidad
  hamburgerBtn.setAttribute('aria-expanded', 'true');
  sideMenu.setAttribute('aria-hidden', 'false');
}

// Función para cerrar el menú
function closeMenu() {
  sideMenu.classList.remove('active');
  overlay.classList.remove('active');
  hamburgerBtn.classList.remove('active');
  document.body.style.overflow = ''; // Restaura scroll
  
  // Asegurar accesibilidad
  hamburgerBtn.setAttribute('aria-expanded', 'false');
  sideMenu.setAttribute('aria-hidden', 'true');
}

// Función para alternar el menú (abrir/cerrar)
function toggleMenu() {
  if (sideMenu.classList.contains('active')) {
    closeMenu(); // Si está abierto, lo cierra
  } else {
    openMenu(); // Si está cerrado, lo abre
  }
}

// Event listeners
if (hamburgerBtn) {
  hamburgerBtn.addEventListener('click', toggleMenu);
}

if (closeBtn) {
  closeBtn.addEventListener('click', closeMenu);
}

if (overlay) {
  overlay.addEventListener('click', closeMenu);
}

// Cerrar menú al hacer clic en un enlace
const menuLinks = document.querySelectorAll('.menu-link, .menu-btn');
menuLinks.forEach(link => {
  link.addEventListener('click', () => {
    setTimeout(closeMenu, 150); // Pequeño retraso para permitir la navegación
  });
});

// Cerrar menú con tecla Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && sideMenu.classList.contains('active')) {
    closeMenu();
  }
});

// Cerrar menú al cambiar el tamaño de la ventana si supera 768px
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (window.innerWidth > 768 && sideMenu.classList.contains('active')) {
      closeMenu();
    }
  }, 250);
});

// Inicializar atributos de accesibilidad
document.addEventListener('DOMContentLoaded', () => {
  if (hamburgerBtn) {
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.setAttribute('aria-controls', 'sideMenu');
  }
  
  if (sideMenu) {
    sideMenu.setAttribute('aria-hidden', 'true');
    sideMenu.setAttribute('role', 'navigation');
    sideMenu.setAttribute('aria-label', 'Menú de navegación');
  }
  
  if (overlay) {
    overlay.setAttribute('aria-hidden', 'true');
  }
});