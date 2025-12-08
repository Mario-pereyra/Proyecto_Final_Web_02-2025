/**
 * Controlador: Detalle de Proyecto
 * Orquesta la interacción entre ProjectAPI (Datos) y DetailUI (Vista).
 */

document.addEventListener("DOMContentLoaded", async function () {

  // --- Inicialización ---
  async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    if (!projectId) {
      console.error('No se proporcionó ID de proyecto');
      window.location.href = './explore.html';
      return;
    }

    await loadProjectData(projectId);
  }

  // --- Lógica de Negocio ---

  async function loadProjectData(id) {
    // 1. Obtener detalles del proyecto
    const projectResult = await ProjectAPI.getById(id);

    if (!projectResult.success) {
      console.error("Error cargando proyecto:", projectResult.message);
      window.location.href = './explore.html';
      return;
    }

    const project = projectResult.data;

    // 2. Renderizar UI principal
    if (typeof DetailUI === 'undefined') {
      console.error("DetailUI no cargado.");
      return;
    }

    DetailUI.renderBasicInfo(project);
    DetailUI.renderStatistics(project);
    DetailUI.renderTimeline(project);
    DetailUI.renderStory(project.story_json);

    // 3. Cargar y renderizar donaciones (asíncrono, no bloquea lo principal)
    loadDonations(id);
  }

  async function loadDonations(id) {
    const donationResult = await ProjectAPI.getDonations(id);
    if (donationResult.success) {
      DetailUI.renderDonations(donationResult.data || []);
    } else {
      console.error("Error cargando donaciones", donationResult.message);
    }
  }

  // --- Manejo de Eventos ---

  // Botón de Donación (Pasarela de Pagos con Modales)
  const donateBtn = document.getElementById('donate-btn');
  if (donateBtn) {
    donateBtn.addEventListener('click', async () => {
      // Modal personalizado para ingresar monto
      mostrarModalInput({
        title: 'Apoyar Proyecto',
        message: 'Ingrese el monto que desea donar (Bs):',
        inputType: 'number',
        inputPlaceholder: '100',
        confirmText: 'Continuar',
        cancelText: 'Cancelar',
        onConfirm: async (amount) => {
          const amountNum = parseFloat(amount);

          if (!amount || isNaN(amountNum) || amountNum <= 0) {
            mostrarModal({
              title: 'Monto Inválido',
              message: 'Por favor ingrese un monto válido mayor a 0.',
              type: 'error'
            });
            return;
          }

          try {
            const projectId = new URLSearchParams(window.location.search).get('id');

            // Obtener userId del localStorage
            const userDataStr = localStorage.getItem('userData');
            if (!userDataStr) {
              mostrarModal({
                title: 'Sesión Requerida',
                message: 'Debe iniciar sesión para realizar una donación.',
                type: 'warning',
                onConfirm: () => {
                  window.location.href = './auth.html';
                }
              });
              return;
            }

            const userData = JSON.parse(userDataStr);
            const userId = userData.id;

            const result = await PaymentAPI.createPayment(projectId, amountNum, userId);

            if (result.success) {
              // Redirigir a la billetera del Gateway
              window.location.href = result.data.paymentUrl;
            } else {
              mostrarModal({
                title: 'Error al Procesar Pago',
                message: result.message || 'No se pudo procesar el pago. Intente nuevamente.',
                type: 'error'
              });
            }
          } catch (error) {
            console.error('Error:', error);
            mostrarModal({
              title: 'Error',
              message: 'Error al procesar el pago. Por favor intente nuevamente.',
              type: 'error'
            });
          }
        }
      });
    });
  }

  // TODO: Implementar lógica de botones de acción usando ProjectAPI.toggleFavorite, etc.

  // Arrancar
  init();
});

// Función auxiliar para modal con input
function mostrarModalInput(options) {
  const {
    title = 'Ingrese un valor',
    message = '',
    inputType = 'text',
    inputPlaceholder = '',
    confirmText = 'Aceptar',
    cancelText = 'Cancelar',
    onConfirm = null
  } = options;

  // Crear modal personalizado con input
  const modalHTML = `
    <div id="modal-input" class="modal-overlay active">
      <div class="modal-content">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close" onclick="cerrarModalInput()">
            <iconify-icon icon="ic:round-close"></iconify-icon>
          </button>
        </div>
        <div class="modal-body">
          <p>${message}</p>
          <input type="${inputType}" id="modal-input-field" class="form-control" placeholder="${inputPlaceholder}" style="margin-top: 1rem; width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; font-size: 1rem;">
        </div>
        <div class="modal-footer">
          <button class="btn btn--secondary" onclick="cerrarModalInput()">
            <iconify-icon icon="ic:round-cancel"></iconify-icon>
            ${cancelText}
          </button>
          <button class="btn btn--primary" onclick="confirmarModalInput()">
            <iconify-icon icon="ic:round-check"></iconify-icon>
            ${confirmText}
          </button>
        </div>
      </div>
    </div>
  `;

  // Remover modal anterior si existe
  const oldModal = document.getElementById('modal-input');
  if (oldModal) oldModal.remove();

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Guardar callback
  window.modalInputCallback = onConfirm;

  // Focus en input
  setTimeout(() => {
    document.getElementById('modal-input-field')?.focus();
  }, 100);

  // Enter para confirmar
  document.getElementById('modal-input-field')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') confirmarModalInput();
  });
}

function cerrarModalInput() {
  const modal = document.getElementById('modal-input');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
  window.modalInputCallback = null;
}

function confirmarModalInput() {
  const input = document.getElementById('modal-input-field');
  const value = input?.value;

  if (window.modalInputCallback && typeof window.modalInputCallback === 'function') {
    window.modalInputCallback(value);
  }

  cerrarModalInput();
}
