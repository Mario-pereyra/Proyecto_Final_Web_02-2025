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
}

// Función para cerrar el menú
function closeMenu() {
  sideMenu.classList.remove('active');
  overlay.classList.remove('active');
  hamburgerBtn.classList.remove('active');
  document.body.style.overflow = ''; // Restaura scroll
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
hamburgerBtn.addEventListener('click', toggleMenu);
closeBtn.addEventListener('click', closeMenu);
overlay.addEventListener('click', closeMenu);

// Cerrar menú al hacer clic en un enlace
const menuLinks = document.querySelectorAll('.menu-link');
menuLinks.forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Cerrar menú con tecla Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && sideMenu.classList.contains('active')) {
    closeMenu();
  }
});