// ============================================
// CREAR PROYECTO - PASO 3: Financiación
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  // Referencias a elementos
  const form = document.getElementById("paso3Form");
  const metaInput = document.getElementById("meta_financiera");
  const duracionInput = document.getElementById("duracion_campana");
  const fechaInicioInput = document.getElementById("fecha_inicio");
  const fechaFinInfo = document.getElementById("fechaFinInfo");
  const fechaFinTexto = document.getElementById("fechaFinTexto");
  const btnAnterior = document.getElementById("btnAnterior");
  const btnGuardarBorrador = document.getElementById("btnGuardarBorrador");

  // Constantes
  const TOTAL_STEPS = 5;
  const CURRENT_STEP = 3;

  // Actualizar progreso
  updateProgress(CURRENT_STEP, TOTAL_STEPS);

  // Establecer fecha mínima (hoy)
  const hoy = new Date();
  const fechaMinima = hoy.toISOString().split("T")[0];
  fechaInicioInput.setAttribute("min", fechaMinima);

  // Calcular y mostrar fecha de fin cuando cambian los inputs
  function calcularFechaFin() {
    const duracion = parseInt(duracionInput.value);
    const fechaInicio = fechaInicioInput.value;

    if (duracion && duracion >= 7 && duracion <= 90) {
      let fechaBase = fechaInicio ? new Date(fechaInicio) : new Date();
      fechaBase.setDate(fechaBase.getDate() + duracion);

      const opciones = { year: "numeric", month: "long", day: "numeric" };
      const fechaFormateada = fechaBase.toLocaleDateString("es-ES", opciones);

      fechaFinTexto.textContent = `Tu campaña finalizará el ${fechaFormateada}`;
      fechaFinInfo.style.display = "flex";
    } else {
      fechaFinInfo.style.display = "none";
    }
  }

  duracionInput.addEventListener("input", calcularFechaFin);
  fechaInicioInput.addEventListener("change", calcularFechaFin);

  // Formatear números con separadores de miles
  metaInput.addEventListener("blur", function () {
    if (this.value) {
      const valor = parseFloat(this.value);
      if (!isNaN(valor)) {
        // Mostrar con formato pero mantener el valor numérico
        this.setAttribute("data-formatted", valor.toLocaleString("es-BO"));
      }
    }
  });

  // Botón Anterior
  btnAnterior.addEventListener("click", function () {
    window.location.href = "./crear-proyecto-paso2.html";
  });

  // Guardar borrador
  btnGuardarBorrador.addEventListener("click", function () {
    const projectData = {
      metaFinanciera: metaInput.value,
      duracionCampana: duracionInput.value,
      fechaInicio: fechaInicioInput.value,
      status: "draft",
      step: CURRENT_STEP,
      savedAt: new Date().toISOString(),
    };

    // Guardar en localStorage
    const existingDraft = localStorage.getItem("projectDraft");
    const draft = existingDraft ? JSON.parse(existingDraft) : {};
    Object.assign(draft, projectData);
    localStorage.setItem("projectDraft", JSON.stringify(draft));

    mostrarModal({
      title: 'Borrador guardado',
      message: 'Borrador guardado correctamente',
      type: 'success'
    });
  });

  // Formulario submit
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const datos = {
      metaFinanciera: metaInput.value,
      duracion: duracionInput.value,
    };

    // Validar usando la función del archivo validar-crear-proyecto.js
    const formValido = validarPaso3(datos);

    if (formValido) {
      // Calcular fecha de fin
      let fechaInicio = fechaInicioInput.value
        ? new Date(fechaInicioInput.value)
        : new Date();
      let fechaFin = new Date(fechaInicio);
      fechaFin.setDate(fechaFin.getDate() + parseInt(duracionInput.value));

      // Guardar datos del paso actual
      const projectData = {
        metaFinanciera: parseFloat(metaInput.value),
        duracionCampana: parseInt(duracionInput.value),
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString(),
        step: CURRENT_STEP,
      };

      sessionStorage.setItem("projectStep3", JSON.stringify(projectData));

      // Navegar al siguiente paso
      window.location.href = "./crear-proyecto-paso4.html";
    }
  });

  // Cargar datos guardados
  function loadStepData() {
    // Intentar cargar desde sessionStorage
    const stepData = sessionStorage.getItem("projectStep3");
    if (stepData) {
      const data = JSON.parse(stepData);
      if (data.metaFinanciera) metaInput.value = data.metaFinanciera;
      if (data.duracionCampana) duracionInput.value = data.duracionCampana;
      if (data.fechaInicio) {
        const fecha = new Date(data.fechaInicio);
        fechaInicioInput.value = fecha.toISOString().split("T")[0];
      }
      calcularFechaFin();
      return;
    }

    // Intentar cargar desde localStorage (borrador)
    const draft = localStorage.getItem("projectDraft");
    if (draft) {
      const data = JSON.parse(draft);
      if (data.metaFinanciera) metaInput.value = data.metaFinanciera;
      if (data.duracionCampana) duracionInput.value = data.duracionCampana;
      if (data.fechaInicio) fechaInicioInput.value = data.fechaInicio;
      calcularFechaFin();
    }
  }

  // Inicialización
  loadStepData();
});
