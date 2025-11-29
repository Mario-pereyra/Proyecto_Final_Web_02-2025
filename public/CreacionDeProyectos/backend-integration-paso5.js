/**
 * ========================================================================
 * FUNCIONES DE INTEGRACIÓN CON BACKEND - PASO 5
 * Agregar estas funciones al final de crear-proyecto-paso5.js
 * Modificar los event listeners de btnGuardarBorrador y btnEnviarAprobacion
 * ========================================================================
 */

/**
 * Convertir base64 Data URL a File object
 */
function dataURLtoFile(dataurl, filename) {
  if (!dataurl) return null;
  
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

/**
 * Guardar proyecto como borrador en el servidor
 */
async function saveDraftToServer() {
  // Ocultar botones del modal y mostrar solo el mensaje de carga
  const modalBotones = document.getElementById('modal-botones');
  if (modalBotones) {
    modalBotones.style.display = 'none';
  }
  
  // Mostrar modal de carga
  mostrarModal({
    title: 'Guardando proyecto',
    message: 'Por favor espera mientras subimos tus archivos al servidor...',
    type: 'info'
  });
  
  try {
    // Recopilar datos de todos los pasos
    const step1 = JSON.parse(sessionStorage.getItem('projectStep1') || '{}');
    const step2 = JSON.parse(sessionStorage.getItem('projectStep2') || '{}');
    const step3 = JSON.parse(sessionStorage.getItem('projectStep3') || '{}');
    const step4 = JSON.parse(sessionStorage.getItem('projectStep4') || '{}');
    
    // Validar que los datos existen
    if (!step1.title || !step3.goal || !step3.end_date) {
      throw new Error('Faltan datos obligatorios del proyecto');
    }
    
    // Preparar FormData
    const formData = new FormData();
    
    // Datos del proyecto (pasos 1-3)
    formData.append('title', step1.title);
    formData.append('summary', step1.description || '');
    formData.append('category_id', step1.category || '1');
    formData.append('description_json', JSON.stringify(step2));
    formData.append('goal_amount', step3.goal);
    formData.append('start_date', step3.start_date || new Date().toISOString().split('T')[0]);
    formData.append('end_date', step3.end_date);
    formData.append('requirements_text', requisitosTextarea.value.trim());
    formData.append('approval_status', 'borrador');
    
    // Imagen principal (convertir de base64 a File)
    if (step4.imageData) {
      const imageFile = dataURLtoFile(step4.imageData, step4.fileName || 'project-image.jpg');
      if (imageFile) {
        formData.append('mainImage', imageFile);
      }
    }
    
    // Documentos (objects de File)
    if (documents && documents.length > 0) {
      documents.forEach((doc) => {
        formData.append('documents', doc.file);
      });
    }
    
    // Enviar al servidor
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        // Solo incluir Authorization si tienes token
        // 'Authorization': `Bearer ${userData.token}`
      },
      body: formData
    });
    
    const result = await response.json();
    
    if (response.ok) {
      // Limpiar sessionStorage
      sessionStorage.removeItem('projectStep1');
      sessionStorage.removeItem('projectStep2');
      sessionStorage.removeItem('projectStep3');
      sessionStorage.removeItem('projectStep4');
      sessionStorage.removeItem('projectStep5');
      localStorage.removeItem('projectDraft');
      
      // Mostrar modal de éxito
      mostrarModal({
        title: '¡Proyecto guardado!',
        message: 'Tu proyecto ha sido guardado como borrador correctamente.',
        type: 'success',
        confirmText: 'Ir al Dashboard',
        onConfirm: () => {
          window.location.href = '/user/dashboard.html';
        }
      });
    } else {
      throw new Error(result.message || 'Error al guardar');
    }
    
  } catch (error) {
    console.error('Error al guardar proyecto:', error);
    
    // Mostrar modal de error
    mostrarModal({
      title: 'Error',
      message: error.message || 'Hubo un problema al guardar tu proyecto. Por favor intenta nuevamente.',
      type: 'error',
      confirmText: 'Cerrar'
    });
    
    // Restaurar botones del modal si es necesario
    if (modalBotones) {
      modalBotones.style.display = 'flex';
    }
  }
}

/**
 * Enviar proyecto para revisión (approval_status = 'en_revision')
 */
async function submitProjectForReview() {
  // Validar formulario completo
  const validation = validateForm();
  if (!validation.valid) {
    mostrarModal({
      title: 'Formulario incompleto',
      message: validation.message,
      type: 'warning',
      confirmText: 'Cerrar'
    });
    return;
  }
  
  // Mostrar modal de confirmación
  mostrarModal({
    title: '¿Enviar proyecto para revisión?',
    message: 'Una vez enviado, tu proyecto será revisado por nuestro equipo. Este proceso puede tomar entre 24-48 horas.',
    type: 'confirm',
    confirmText: 'Enviar Proyecto',
    cancelText: 'Cancelar',
    onConfirm: async () => {
      await submitWithStatus('en_revision');
    }
  });
}

/**
 * Enviar proyecto con status específico
 */
async function submitWithStatus(status) {
  // Ocultar botones del modal
  const modalBotones = document.getElementById('modal-botones');
  if (modalBotones) {
    modalBotones.style.display = 'none';
  }
  
  // Mostrar modal de carga
  mostrarModal({
    title: 'Enviando proyecto',
    message: 'Por favor espera mientras procesamos tu solicitud...',
    type: 'info'
  });
  
  try {
    // Recopilar datos (igual que saveDraftToServer)
    const step1 = JSON.parse(sessionStorage.getItem('projectStep1') || '{}');
    const step2 = JSON.parse(sessionStorage.getItem('projectStep2') || '{}');
    const step3 = JSON.parse(sessionStorage.getItem('projectStep3') || '{}');
    const step4 = JSON.parse(sessionStorage.getItem('projectStep4') || '{}');
    
    const formData = new FormData();
    
    formData.append('title', step1.title);
    formData.append('summary', step1.description || '');
    formData.append('category_id', step1.category || '1');
    formData.append('description_json', JSON.stringify(step2));
    formData.append('goal_amount', step3.goal);
    formData.append('start_date', step3.start_date || new Date().toISOString().split('T')[0]);
    formData.append('end_date', step3.end_date);
    formData.append('requirements_text', requisitosTextarea.value.trim());
    formData.append('approval_status', status); // 'en_revision' o 'borrador'
    
    // Imagen
    if (step4.imageData) {
      const imageFile = dataURLtoFile(step4.imageData, step4.fileName || 'project-image.jpg');
      if (imageFile) {
        formData.append('mainImage', imageFile);
      }
    }
    
    // Documentos
    if (documents && documents.length > 0) {
      documents.forEach((doc) => {
        formData.append('documents', doc.file);
      });
    }
    
    // Enviar
    const response = await fetch('/api/projects', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (response.ok) {
      // Limpiar storage
      sessionStorage.removeItem('projectStep1');
      sessionStorage.removeItem('projectStep2');
      sessionStorage.removeItem('projectStep3');
      sessionStorage.removeItem('projectStep4');
      sessionStorage.removeItem('projectStep5');
      localStorage.removeItem('projectDraft');
      
      // Modal de éxito
      mostrarModal({
        title: '¡Proyecto enviado!',
        message: status === 'en_revision'
          ? 'Tu proyecto ha sido enviado para revisión. Te notificaremos del resultado.'
          : 'Tu proyecto ha sido guardado correctamente.',
        type: 'success',
        confirmText: 'Ir al Dashboard',
        onConfirm: () => {
          window.location.href = '/user/dashboard.html';
        }
      });
    } else {
      throw new Error(result.message || 'Error al enviar');
    }
    
  } catch (error) {
    console.error('Error:', error);
    
    mostrarModal({
      title: 'Error',
      message: error.message || 'Hubo un problema al enviar tu proyecto.',
      type: 'error',
      confirmText: 'Cerrar'
    });
    
    if (modalBotones) {
      modalBotones.style.display = 'flex';
    }
  }
}

/**
 * ========================================================================
 * INSTRUCCIONES DE INTEGRACIÓN:
 * ========================================================================
 * 
 * 1. MODIFICAR EVENT LISTENER DE "Guardar Borrador" (línea ~346):
 * 
 *    REEMPLAZAR:
 *    btnGuardarBorrador.addEventListener('click', function() {
 *      // Código actual que guarda en localStorage
 *    });
 * 
 *    CON:
 *    btnGuardarBorrador.addEventListener('click', function(e) {
 *      e.preventDefault();
 *      saveDraftToServer(); // Llamar a la nueva función
 *    });
 * 
 * 2. MODIFICAR EVENT LISTENER DE "Enviar para Aprobación" (línea ~426):
 * 
 *    REEMPLAZAR:
 *    btnEnviarAprobacion.addEventListener('click', function() {
 *      const validation = validateForm();
 *      if (!validation.valid) {
 *        showNotification(validation.message, 'error');
 *        return;
 *      }
 *      showConfirmModal();
 *    });
 * 
 *    CON:
 *    btnEnviarAprobacion.addEventListener('click', function(e) {
 *      e.preventDefault();
 *      submitProjectForReview(); // Llamar a la nueva función
 *    });
 * 
 * 3. AGREGAR SCRIPT DE MODAL.JS EN EL HTML (si no está ya):
 *    
 *    <script src="/assets/js/components/modal.js"></script>
 * 
 * 4. NOTA: La variable 'documents' debe ser el array con los objetos File,
 *    no solo metadata. Asegurarse de que al agregar documentos se guarden
 *    los objetos File completos, no solo nombres.
 * 
 * ========================================================================
 */
