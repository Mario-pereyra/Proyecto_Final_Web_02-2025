// Funcionalidad para los botones de like/corazón
    document.addEventListener('DOMContentLoaded', function() {
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