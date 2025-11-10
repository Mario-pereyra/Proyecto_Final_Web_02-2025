document.addEventListener("DOMContentLoaded", function () {
  const filterToggleBtn = document.getElementById("filterToggleBtn");
  const closeFiltersBtn = document.getElementById("closeFiltersBtn");
  const filtersMenu = document.getElementById("filtersMenu");
  const filtersOverlay = document.getElementById("filtersOverlay");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");
  const applyFiltersBtn = document.getElementById("applyFiltersBtn");
  const metaFinanciacionSlider = document.getElementById("metaFinanciacion");
  const metaValue = document.getElementById("metaValue");

  function openFiltersMenu() {
    filtersMenu.classList.add("active");
    filtersOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeFiltersMenu() {
    filtersMenu.classList.remove("active");
    filtersOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  function clearFilters() {
    document.getElementById("busqueda").value = "";
    document.getElementById("categoria").value = "todas";
    document.getElementById("orden").value = "mas_recientes";
    document.getElementById("metaFinanciacion").value = "100000";
    document.getElementById("metaValue").textContent = "100000";
    document.getElementById("progresoFinanciacion").value = "todos";
  }

  function applyFilters() {
    closeFiltersMenu();
  }

  metaFinanciacionSlider.addEventListener("input", function () {
    metaValue.textContent = this.value;
  });

  filterToggleBtn.addEventListener("click", openFiltersMenu);
  closeFiltersBtn.addEventListener("click", closeFiltersMenu);
  filtersOverlay.addEventListener("click", closeFiltersMenu);
  clearFiltersBtn.addEventListener("click", clearFilters);
  applyFiltersBtn.addEventListener("click", applyFilters);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && filtersMenu.classList.contains("active")) {
      closeFiltersMenu();
    }
  });

  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get("action");

  if (action === "register") {
    switchTab("Registrarse");
  } else if (action === "login") {
    switchTab("Login");
  }
});
