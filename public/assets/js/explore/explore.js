
document.addEventListener('DOMContentLoaded', function() {
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
    metaFinanciacionSlider.addEventListener('input', function() {
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
    
    // Funcionalidad para los botones de like/corazón
    const likeButtons = document.querySelectorAll('.project-like-btn');
    
    likeButtons.forEach(button => {
      button.addEventListener('click', function() {
        const isLiked = this.getAttribute('data-liked') === 'true';
        
        // Cambiar el estado del atributo data-liked
        this.setAttribute('data-liked', !isLiked);
        
        // Animación del corazón
        const heartIcon = isLiked ?
          this.querySelector('.heart-icon-empty') :
          this.querySelector('.heart-icon-filled');
        
        if (heartIcon) {
          heartIcon.style.transform = 'scale(1.3)';
          setTimeout(() => {
            heartIcon.style.transform = 'scale(1)';
          }, 200);
        }
      });
    });
  });