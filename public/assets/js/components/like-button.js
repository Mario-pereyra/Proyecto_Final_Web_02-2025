/**
 * ===================================
 * LIKE-BUTTON.JS - FUNCIONALIDAD UNIFICADA
 * Sistema unificado para botones de like/corazón
 * ===================================
 */

document.addEventListener('DOMContentLoaded', function() {
  // Seleccionar todos los botones de like en la página
  const likeButtons = document.querySelectorAll('.project-like-btn');
  
  // Inicializar cada botón de like
  likeButtons.forEach(button => {
    // Inicializar estado ARIA para accesibilidad
    const isLiked = button.getAttribute('data-liked') === 'true';
    button.setAttribute('aria-pressed', isLiked);
    button.setAttribute('aria-label', isLiked ? 'Quitar de favoritos' : 'Añadir a favoritos');
    
    // Agregar evento click
    button.addEventListener('click', function() {
      const currentState = this.getAttribute('data-liked') === 'true';
      const newState = !currentState;
      
      // Actualizar atributos
      this.setAttribute('data-liked', newState);
      this.setAttribute('aria-pressed', newState);
      this.setAttribute('aria-label', newState ? 'Quitar de favoritos' : 'Añadir a favoritos');
      
      // Animación del corazón
      const heartIcon = currentState ?
        this.querySelector('.heart-icon-empty') :
        this.querySelector('.heart-icon-filled');
      
      if (heartIcon) {
        heartIcon.style.transform = 'scale(1.3)';
        heartIcon.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
          heartIcon.style.transform = 'scale(1)';
        }, 200);
      }
      
      // Emitir evento personalizado para posibles integraciones
      const customEvent = new CustomEvent('likeStateChanged', {
        detail: {
          button: this,
          isLiked: newState,
          projectId: this.getAttribute('data-project-id') || null
        }
      });
      document.dispatchEvent(customEvent);
    });
    
    // Agregar eventos de accesibilidad
    button.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });
});

/**
 * Función utilitaria para obtener el estado de todos los botones like
 * @returns {Array} Array de objetos con información de cada botón
 */
function getAllLikeButtonsState() {
  const likeButtons = document.querySelectorAll('.project-like-btn');
  return Array.from(likeButtons).map(button => ({
    element: button,
    isLiked: button.getAttribute('data-liked') === 'true',
    projectId: button.getAttribute('data-project-id')
  }));
}

/**
 * Función utilitaria para establecer el estado de un botón específico
 * @param {string} projectId - ID del proyecto
 * @param {boolean} isLiked - Estado a establecer
 */
function setLikeButtonState(projectId, isLiked) {
  const button = document.querySelector(`.project-like-btn[data-project-id="${projectId}"]`);
  if (button) {
    button.setAttribute('data-liked', isLiked);
    button.setAttribute('aria-pressed', isLiked);
    button.setAttribute('aria-label', isLiked ? 'Quitar de favoritos' : 'Añadir a favoritos');
  }
}

// Exportar funciones para uso global si es necesario
window.LikeButton = {
  getAllStates: getAllLikeButtonsState,
  setState: setLikeButtonState
};