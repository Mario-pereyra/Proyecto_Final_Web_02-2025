/**
 * Controlador: Proyectos del Usuario
 * Gestiona la lista de proyectos y sus acciones (Eliminar).
 */
document.addEventListener("DOMContentLoaded", () => {
  const projectsSection = document.querySelector('#proyectos');
  if (projectsSection) {
    loadUserProjects();
  }
});

async function loadUserProjects() {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const userId = userData.id;

  if (!userId) {
    console.warn('No se encontró ID de usuario');
    return;
  }

  // 1. Obtener datos (Data Layer)
  const result = await ProjectAPI.getUserProjects(userId);

  if (result.success) {
    // 2. Renderizar (View Layer)
    if (typeof DashboardUI !== 'undefined') {
      DashboardUI.renderUserProjects(result.projects);

      // 3. Delegar eventos
      attachProjectEvents();
    }
  } else {
    console.error("Error cargando proyectos:", result.message);
  }
}

function attachProjectEvents() {
  // Delegación de eventos para botones de eliminar
  const container = document.querySelector('#proyectos .project-list');
  if (!container) return;

  container.addEventListener('click', async (e) => {
    const deleteBtn = e.target.closest('.delete-project-btn');
    if (deleteBtn) {
      const projectId = deleteBtn.dataset.id;
      await handleDeleteProject(projectId);
    }
  });
}

async function handleDeleteProject(projectId) {
  // Usar modal si existe
  if (window.mostrarModal) {
    window.mostrarModal({
      title: '¿Eliminar proyecto?',
      message: 'Esta acción moverá el proyecto a la papelera. ¿Estás seguro?',
      type: 'warning',
      confirmText: 'Sí, eliminar',
      onConfirm: async () => await executeDelete(projectId)
    });
  } else {
    if (confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      await executeDelete(projectId);
    }
  }
}

async function executeDelete(projectId) {
  const result = await ProjectAPI.deleteProject(projectId);

  if (result.success) {
    await loadUserProjects(); // Recargar lista

    if (window.mostrarModal) {
      window.mostrarModal({
        title: 'Proyecto eliminado',
        message: 'El proyecto ha sido eliminado correctamente.',
        type: 'success'
      });
    }
  } else {
    alert('Error al eliminar: ' + result.message);
  }
}
