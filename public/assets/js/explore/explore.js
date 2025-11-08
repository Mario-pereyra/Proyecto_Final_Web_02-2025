
document.addEventListener('DOMContentLoaded', function () {
  // Obtener elementos del DOM para filtros
  const filterToggleBtn = document.getElementById('filterToggleBtn');
  const closeFiltersBtn = document.getElementById('closeFiltersBtn');
  const filtersMenu = document.getElementById('filtersMenu');
  const filtersOverlay = document.getElementById('filtersOverlay');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  const applyFiltersBtn = document.getElementById('applyFiltersBtn');
  const metaFinanciacionSlider = document.getElementById('metaFinanciacion');
  const metaValue = document.getElementById('metaValue');


  // Función para abrir el menú de filtros
  function openFiltersMenu() {
    filtersMenu.classList.add('active');
    filtersOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Función para cerrar el menú de filtros
  function closeFiltersMenu() {
    filtersMenu.classList.remove('active');
    filtersOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Función para limpiar filtros
  function clearFilters() {
    document.getElementById('busqueda').value = '';
    document.getElementById('categoria').value = 'todas';
    document.getElementById('orden').value = 'mas_recientes';
    document.getElementById('metaFinanciacion').value = '100000';
    document.getElementById('metaValue').textContent = '100000';
    document.getElementById('progresoFinanciacion').value = 'todos';
  }

  // Función para aplicar filtros
  function applyFilters() {
    // Aquí se puede agregar la lógica para aplicar los filtros
    // Por ahora, solo cerramos el menú
    closeFiltersMenu();
  }

  // Actualizar valor del slider
  metaFinanciacionSlider.addEventListener('input', function () {
    metaValue.textContent = this.value;
  });

  // Event listeners
  filterToggleBtn.addEventListener('click', openFiltersMenu);
  closeFiltersBtn.addEventListener('click', closeFiltersMenu);
  filtersOverlay.addEventListener('click', closeFiltersMenu);
  clearFiltersBtn.addEventListener('click', clearFilters);
  applyFiltersBtn.addEventListener('click', applyFilters);

  // Cerrar menú con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && filtersMenu.classList.contains('active')) {
      closeFiltersMenu();
    }
  });

  // La funcionalidad de botones like ahora está en el componente unificado
  // /assets/js/components/like-button.js
  
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');

  if (action === 'register') {
    switchTab('Registrarse');
  } else if (action === 'login') {
    switchTab('Login');
  }
});