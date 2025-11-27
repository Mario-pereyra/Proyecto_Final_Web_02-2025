// ==================== MODAL SYSTEM CON ICONIFY ====================

// Iconos de Iconify según tipo
const iconifyIcons = {
  success: 'ic:round-check-circle',
  error: 'ic:round-error',
  warning: 'ic:round-warning',
  info: 'ic:round-info',
  confirm: 'ic:round-help'
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
      <button class="btn btn--secondary" onclick="manejarModalCancel(${onCancel ? 'true' : 'false'})">
        <iconify-icon icon="ic:round-cancel"></iconify-icon>
        ${cancelText}
      </button>
      <button class="btn btn--primary" onclick="manejarModalConfirm(${onConfirm ? 'true' : 'false'})">
        <iconify-icon icon="ic:round-check"></iconify-icon>
        ${confirmText}
      </button>
    `;
  } else {
    // Modal informativo: Solo Aceptar (pero debe ejecutar onConfirm si existe)
    botones.innerHTML = `
      <button class="btn btn--primary" onclick="manejarModalConfirm(${onConfirm ? 'true' : 'false'})">
        <iconify-icon icon="ic:round-check"></iconify-icon>
        ${confirmText}
      </button>
    `;
  }

  // Guardar callbacks
  modal.dataset.onConfirm = onConfirm ? onConfirm.toString() : '';
  modal.dataset.onCancel = onCancel ? onCancel.toString() : '';

  // Mostrar modal
  modal.style.display = 'flex';
  
  // Animación de entrada
  setTimeout(() => {
    modal.querySelector('.modal-content').style.transform = 'scale(1)';
    modal.querySelector('.modal-content').style.opacity = '1';
  }, 10);
}

// Función para cerrar modal
function cerrarModal() {
  const modal = document.getElementById('modal-sistema');
  if (modal) {
    modal.style.display = 'none';
    modal.querySelector('.modal-content').style.transform = 'scale(0.8)';
    modal.querySelector('.modal-content').style.opacity = '0';
  }
}

// Manejar confirmación
function manejarModalConfirm(hasCallback) {
  const modal = document.getElementById('modal-sistema');
  const callback = modal.dataset.onConfirm;
  
  if (hasCallback && callback) {
    const func = new Function('return ' + callback)();
    func();
  }
  
  cerrarModal();
}

// Manejar cancelación
function manejarModalCancel(hasCallback) {
  const modal = document.getElementById('modal-sistema');
  const callback = modal.dataset.onCancel;
  
  if (hasCallback && callback) {
    const func = new Function('return ' + callback)();
    func();
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
