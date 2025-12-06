const hamburgerBtn = document.getElementById("hamburgerBtn");
const closeBtn = document.getElementById("closeBtn");
const sideMenu = document.getElementById("sideMenu");
const overlay = document.getElementById("overlay");

function openMenu() {
  sideMenu.classList.add("active");
  overlay.classList.add("active");
  hamburgerBtn.classList.add("active");
  document.body.style.overflow = "hidden";

  hamburgerBtn.setAttribute("aria-expanded", "true");
  sideMenu.setAttribute("aria-hidden", "false");
}

function closeMenu() {
  sideMenu.classList.remove("active");
  overlay.classList.remove("active");
  hamburgerBtn.classList.remove("active");
  document.body.style.overflow = "";

  hamburgerBtn.setAttribute("aria-expanded", "false");
  sideMenu.setAttribute("aria-hidden", "true");
}

function toggleMenu() {
  if (sideMenu.classList.contains("active")) {
    closeMenu();
  } else {
    openMenu();
  }
}

if (hamburgerBtn) {
  hamburgerBtn.addEventListener("click", toggleMenu);
}

if (closeBtn) {
  closeBtn.addEventListener("click", closeMenu);
}

if (overlay) {
  overlay.addEventListener("click", closeMenu);
}

const menuLinks = document.querySelectorAll(".menu-link, .menu-btn");
menuLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setTimeout(closeMenu, 150);
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && sideMenu.classList.contains("active")) {
    closeMenu();
  }
});

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (window.innerWidth > 768 && sideMenu.classList.contains("active")) {
      closeMenu();
    }
  }, 250);
});

document.addEventListener("DOMContentLoaded", () => {
  if (hamburgerBtn) {
    hamburgerBtn.setAttribute("aria-expanded", "false");
    hamburgerBtn.setAttribute("aria-controls", "sideMenu");
  }

  if (sideMenu) {
    sideMenu.setAttribute("aria-hidden", "true");
    sideMenu.setAttribute("role", "navigation");
    sideMenu.setAttribute("aria-label", "Menú de navegación");
  }

  if (overlay) {
    overlay.setAttribute("aria-hidden", "true");
  }
});
