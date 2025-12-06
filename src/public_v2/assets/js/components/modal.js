// ==================== MODAL SYSTEM CON ICONIFY ====================

// Iconos de Iconify según tipo
const iconifyIcons = {
  success: 'ic:round-check-circle',
  error: 'ic:round-error',
  warning: 'ic:round-warning',
  info: 'ic:round-info',
  confirm: 'ic:round-help'
};

// Callbacks en memoria
const currentCallbacks = {
  onConfirm: null,
  onCancel: null
};

function mostrarModal(options) {
  const {
    title = 'Mensaje',
    message = '',
    type = 'info',
    onConfirm = null,
    onCancel = null,
    confirmText = 'Aceptar',
    cancelText = 'Cancelar'
  } = options;

  // Crear modal si no existe
  if (!document.getElementById('modal-sistema')) {
    const modalHTML = `
      <div id="modal-sistema" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="modal-titulo"></h3>
            <button class="modal-close" onclick="cerrarModal()">
              <iconify-icon icon="ic:round-close"></iconify-icon>
            </button>
          </div>
          <div class="modal-body">
            <!-- Icono de Iconify -->
            <iconify-icon id="modal-icono" class="modal-icon"></iconify-icon>
            <p id="modal-mensaje"></p>
          </div>
          <div class="modal-footer" id="modal-botones">
            <!-- Botones se generan dinámicamente -->
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  const modal = document.getElementById('modal-sistema');
  const titulo = document.getElementById('modal-titulo');
  const mensaje = document.getElementById('modal-mensaje');
  const icono = document.getElementById('modal-icono');
  const botones = document.getElementById('modal-botones');

  // Configurar contenido
  titulo.textContent = title;
  mensaje.textContent = message;

  // Configurar icono de Iconify según tipo
  const iconoNombre = iconifyIcons[type] || iconifyIcons.info;
  icono.setAttribute('icon', iconoNombre);
  icono.className = `modal-icon modal-icon-${type}`;

  // Configurar botones según tipo
  botones.innerHTML = '';

  if (type === 'confirm') {
    // Modal de confirmación: Aceptar y Cancelar
    botones.innerHTML = `
      <button class="btn btn--secondary" onclick="manejarModalCancel()">
        <iconify-icon icon="ic:round-cancel"></iconify-icon>
        ${cancelText}
      </button>
      <button class="btn btn--primary" onclick="manejarModalConfirm()">
        <iconify-icon icon="ic:round-check"></iconify-icon>
        ${confirmText}
      </button>
    `;
  } else {
    // Modal informativo: Solo Aceptar (pero debe ejecutar onConfirm si existe)
    botones.innerHTML = `
      <button class="btn btn--primary" onclick="manejarModalConfirm()">
        <iconify-icon icon="ic:round-check"></iconify-icon>
        ${confirmText}
      </button>
    `;
  }

  // Guardar callbacks en memoria
  currentCallbacks.onConfirm = onConfirm;
  currentCallbacks.onCancel = onCancel;

  // Mostrar modal
  modal.style.display = 'flex';

  // Animación de entrada usando clase CSS
  // Usamos requestAnimationFrame para asegurar que el navegador procese el display:flex antes de añadir la clase
  requestAnimationFrame(() => {
    modal.classList.add('active');
  });
}

// Función para cerrar modal
function cerrarModal() {
  const modal = document.getElementById('modal-sistema');
  if (modal) {
    modal.classList.remove('active');

    // Esperar a que termine la transición CSS (300ms) antes de ocultar
    setTimeout(() => {
      modal.style.display = 'none';
      // Limpiar callbacks
      currentCallbacks.onConfirm = null;
      currentCallbacks.onCancel = null;
    }, 300);
  }
}

// Manejar confirmación
function manejarModalConfirm() {
  if (currentCallbacks.onConfirm && typeof currentCallbacks.onConfirm === 'function') {
    currentCallbacks.onConfirm();
  }
  cerrarModal();
}

// Manejar cancelación
function manejarModalCancel() {
  if (currentCallbacks.onCancel && typeof currentCallbacks.onCancel === 'function') {
    currentCallbacks.onCancel();
  }
  cerrarModal();
}

// Cerrar modal al hacer clic fuera
document.addEventListener('click', (e) => {
  const modal = document.getElementById('modal-sistema');
  if (modal && e.target === modal) {
    cerrarModal();
  }
});
