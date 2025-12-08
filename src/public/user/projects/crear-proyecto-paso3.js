// ============================================
// CREAR PROYECTO - PASO 3: Financiación
// ============================================

document.addEventListener("DOMContentLoaded", async function () {
  // Constantes
  const TOTAL_STEPS = 5;
  const CURRENT_STEP = 3;
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  // Validar navegación
  if (!projectId) {
    mostrarModal({
      title: 'Error de navegación',
      message: 'No se ha seleccionado ningún proyecto. Redirigiendo al inicio.',
      type: 'error',
      onConfirm: () => window.location.href = "./crear-proyecto-paso1.html"
    });
    return;
  }

  // Referencias a elementos
  const form = document.getElementById("paso3Form");
  const metaInput = document.getElementById("meta_financiera");
  const duracionInput = document.getElementById("duracion_campana");
  const fechaInicioInput = document.getElementById("fecha_inicio");
  const fechaFinInfo = document.getElementById("fechaFinInfo");
  const fechaFinTexto = document.getElementById("fechaFinTexto");
  const btnAnterior = document.getElementById("btnAnterior");
  const btnGuardarBorrador = document.getElementById("btnGuardarBorrador");

  // Actualizar progreso
  updateProgress(CURRENT_STEP, TOTAL_STEPS);

  // Fecha mínima
  const hoy = new Date();
  const fechaMinima = hoy.toISOString().split("T")[0];
  fechaInicioInput.setAttribute("min", fechaMinima);

  // Estado Inicial
  await loadProjectData();

  // --- FUNCIONES ---

  async function loadProjectData() {
    try {
      const response = await fetch(`/api/projects/${projectId}?userId=101`); // Auth temp
      const result = await response.json();
      if (result.success && result.data) {
        const p = result.data;
        if (p.goal_amount) metaInput.value = p.goal_amount;
        if (p.duration_days) duracionInput.value = p.duration_days;
        if (p.started_at) {
          fechaInicioInput.value = new Date(p.started_at).toISOString().split('T')[0];
        }
        calcularFechaFin();
      }
    } catch (e) {
      console.error("Error al cargar datos:", e);
    }
  }

  function calcularFechaFin() {
    const duracion = parseInt(duracionInput.value);
    const fechaInicio = fechaInicioInput.value;

    if (duracion && duracion >= 7 && duracion <= 90) {
      let fechaBase = fechaInicio ? new Date(fechaInicio) : new Date();
      fechaBase.setDate(fechaBase.getDate() + duracion);

      const opciones = { year: "numeric", month: "long", day: "numeric" };
      fechaFinTexto.textContent = `Tu campaña finalizará el ${fechaBase.toLocaleDateString("es-ES", opciones)}`;
      fechaFinInfo.style.display = "flex";
    } else {
      fechaFinInfo.style.display = "none";
    }
  }

  async function saveDraft() {
    let fechaInicio = fechaInicioInput.value ? new Date(fechaInicioInput.value) : new Date();
    // Calcular deadline
    let deadline = new Date(fechaInicio);
    const dias = parseInt(duracionInput.value) || 30; // default 30
    deadline.setDate(deadline.getDate() + dias);

    const projectData = {
      id: projectId,
      step: CURRENT_STEP,
      goal_amount: parseFloat(metaInput.value) || 0,
      duration_days: dias,
      deadline_at: deadline.toISOString(), // Guardamos la fecha calculada
      started_at: fechaInicio.toISOString()
    };

    try {
      const res = await fetch('/api/projects/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      const result = await res.json();
      return result.success;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  // --- EVENTOS ---

  duracionInput.addEventListener("input", calcularFechaFin);
  fechaInicioInput.addEventListener("change", calcularFechaFin);

  metaInput.addEventListener("blur", function () {
    if (this.value) {
      const valor = parseFloat(this.value);
      if (!isNaN(valor)) {
        this.setAttribute("data-formatted", valor.toLocaleString("es-BO"));
      }
    }
  });

  btnAnterior.addEventListener("click", () => {
    window.location.href = `./crear-proyecto-paso2.html?id=${projectId}`;
  });

  btnGuardarBorrador.addEventListener("click", async () => {
    if (await saveDraft()) {
      mostrarModal({ title: 'Guardado', message: 'Borrador guardado.', type: 'success' });
    } else {
      mostrarModal({ title: 'Error', message: 'No se pudo guardar.', type: 'error' });
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (await saveDraft()) {
      window.location.href = `./crear-proyecto-paso4.html?id=${projectId}`;
    }
  });

});
