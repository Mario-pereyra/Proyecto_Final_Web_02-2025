/**
 * Crear Proyecto - Paso 3: Meta de Financiación y Fecha Límite
 * Implementación del formulario para establecer la meta y fecha del proyecto
 */

document.addEventListener("DOMContentLoaded", function () {
  // Validar que los pasos anteriores estén completos
  const step1Data = sessionStorage.getItem("projectStep1");
  const step2Data = sessionStorage.getItem("projectStep2");

  if (!step1Data) {
    alert("Debes completar el paso 1 primero");
    window.location.href = "crear-proyecto.html";
    return;
  }

  if (!step2Data) {
    alert("Debes completar el paso 2 primero");
    window.location.href = "crear-proyecto-paso2.html";
    return;
  }

  // Referencias a elementos
  const metaInput = document.getElementById("metaFinanciacion");
  const fechaInput = document.getElementById("fechaLimite");
  const btnAnterior = document.getElementById("btnAnterior");
  const btnGuardarBorrador = document.getElementById("btnGuardarBorrador");
  const btnSiguiente = document.getElementById("btnSiguiente");
  const progressFill = document.querySelector(".progress-fill");

  // Constantes
  const TOTAL_STEPS = 5;
  const CURRENT_STEP = 3;
  const MIN_GOAL = 100; // Meta mínima en euros
  const MAX_GOAL = 10000000; // Meta máxima en euros
  const MIN_CAMPAIGN_DAYS = 7; // Mínimo días de campaña
  const MAX_CAMPAIGN_DAYS = 90; // Máximo días de campaña

  // Actualizar progreso
  function updateProgress() {
    const progressPercentage = (CURRENT_STEP / TOTAL_STEPS) * 100;
    progressFill.style.width = progressPercentage + "%";
  }

  // Establecer fecha mínima (mañana)
  function setMinDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + MIN_CAMPAIGN_DAYS);
    const minDate = tomorrow.toISOString().split("T")[0];
    fechaInput.min = minDate;

    // Establecer fecha máxima
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + MAX_CAMPAIGN_DAYS);
    fechaInput.max = maxDate.toISOString().split("T")[0];
  }

  // Formatear número con separadores de miles
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // Calcular días restantes
  function calculateDaysRemaining(dateString) {
    const targetDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Validar meta de financiación
  function validateGoal(value) {
    const goal = parseFloat(value);

    if (isNaN(goal) || goal <= 0) {
      return {
        valid: false,
        message: "La meta de financiación es obligatoria",
      };
    }

    if (goal < MIN_GOAL) {
      return {
        valid: false,
        message: `La meta mínima es de €${formatNumber(MIN_GOAL)}`,
      };
    }

    if (goal > MAX_GOAL) {
      return {
        valid: false,
        message: `La meta máxima es de €${formatNumber(MAX_GOAL)}`,
      };
    }

    return { valid: true };
  }

  // Validar fecha límite
  function validateDeadline(value) {
    if (!value) {
      return {
        valid: false,
        message: "La fecha límite es obligatoria",
      };
    }

    const days = calculateDaysRemaining(value);

    if (days < MIN_CAMPAIGN_DAYS) {
      return {
        valid: false,
        message: `La campaña debe durar al menos ${MIN_CAMPAIGN_DAYS} días`,
      };
    }

    if (days > MAX_CAMPAIGN_DAYS) {
      return {
        valid: false,
        message: `La campaña no puede durar más de ${MAX_CAMPAIGN_DAYS} días`,
      };
    }

    return { valid: true, days: days };
  }

  // Validar formulario completo
  function validateForm() {
    const goalValidation = validateGoal(metaInput.value);
    if (!goalValidation.valid) {
      return goalValidation;
    }

    const deadlineValidation = validateDeadline(fechaInput.value);
    if (!deadlineValidation.valid) {
      return deadlineValidation;
    }

    return { valid: true };
  }

  // Eventos de validación en tiempo real
  metaInput.addEventListener("input", function () {
    const validation = validateGoal(this.value);
    if (!validation.valid && this.value !== "") {
      this.style.boxShadow = "0 0 0 2px var(--color-accent)";
    } else {
      this.style.boxShadow = "";
    }
  });

  metaInput.addEventListener("blur", function () {
    this.style.boxShadow = "";
  });

  fechaInput.addEventListener("change", function () {
    const validation = validateDeadline(this.value);
    if (!validation.valid) {
      this.style.boxShadow = "0 0 0 2px var(--color-accent)";
    } else {
      this.style.boxShadow = "";
      // Mostrar días de campaña
      const hint = this.parentElement.nextElementSibling;
      if (hint && validation.days) {
        hint.textContent = `Tu campaña durará ${validation.days} días. Las campañas más exitosas duran entre 30-60 días.`;
      }
    }
  });

  // Guardar borrador
  btnGuardarBorrador.addEventListener("click", function () {
    // Recuperar datos de pasos anteriores
    const step1Data = sessionStorage.getItem("projectStep1");
    const step2Data = sessionStorage.getItem("projectStep2");

    const draftData = {
      step1: step1Data ? JSON.parse(step1Data) : null,
      step2: step2Data ? JSON.parse(step2Data) : null,
      step3: {
        goal: metaInput.value,
        deadline: fechaInput.value,
      },
      currentStep: CURRENT_STEP,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem("projectDraft", JSON.stringify(draftData));
    showNotification("Borrador guardado correctamente", "success");
  });

  // Botón anterior
  btnAnterior.addEventListener("click", function (e) {
    e.preventDefault();

    // Guardar estado actual antes de ir atrás
    sessionStorage.setItem(
      "projectStep3",
      JSON.stringify({
        goal: metaInput.value,
        deadline: fechaInput.value,
      })
    );

    // Navegar al paso anterior
    window.location.href = "crear-proyecto-paso2.html";
  });

  // Formulario submit
  const form = document.getElementById("paso3Form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const validation = validateForm();

    if (!validation.valid) {
      showNotification(validation.message, "error");
      return;
    }

    // Guardar datos del paso actual
    const step3Data = {
      goal: parseFloat(metaInput.value),
      deadline: fechaInput.value,
      campaignDays: calculateDaysRemaining(fechaInput.value),
    };

    sessionStorage.setItem("projectStep3", JSON.stringify(step3Data));

    // Navegar al siguiente paso
    window.location.href = "crear-proyecto-paso4.html";
  });

  // Cargar borrador si existe
  function loadDraft() {
    // Primero intentar cargar desde sessionStorage
    const step3Session = sessionStorage.getItem("projectStep3");
    if (step3Session) {
      const data = JSON.parse(step3Session);
      if (data.goal) metaInput.value = data.goal;
      if (data.deadline) fechaInput.value = data.deadline;
      return;
    }

    // Si no hay en session, intentar desde localStorage
    const draft = localStorage.getItem("projectDraft");
    if (draft) {
      const draftData = JSON.parse(draft);
      if (draftData.step3) {
        if (draftData.step3.goal) metaInput.value = draftData.step3.goal;
        if (draftData.step3.deadline)
          fechaInput.value = draftData.step3.deadline;
      }
    }
  }

  // Función para mostrar notificaciones
  function showNotification(message, type) {
    // Remover notificación existente si hay
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    // Crear notificación
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

    // Cerrar notificación
    const closeBtn = notification.querySelector(".notification-close");
    closeBtn.addEventListener("click", () => notification.remove());

    document.body.appendChild(notification);

    // Auto-cerrar después de 4 segundos
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 4000);
  }

  // Inicialización
  updateProgress();
  setMinDate();
  loadDraft();
});

/**
 * Funciones adicionales para integración
 */

// Función para obtener resumen del proyecto hasta el paso 3
function getProjectSummary() {
  const step1 = sessionStorage.getItem("projectStep1");
  const step2 = sessionStorage.getItem("projectStep2");
  const step3 = sessionStorage.getItem("projectStep3");

  return {
    basicInfo: step1 ? JSON.parse(step1) : null,
    description: step2 ? JSON.parse(step2) : null,
    funding: step3 ? JSON.parse(step3) : null,
  };
}

// Función para calcular el progreso mínimo diario recomendado
function calculateDailyTarget(goal, days) {
  if (!goal || !days || days <= 0) return 0;
  return Math.ceil(goal / days);
}

// Función para validar meta según categoría (puede ajustarse según requisitos)
function validateGoalByCategory(goal, category) {
  const categoryLimits = {
    tecnologia: { min: 1000, max: 500000 },
    salud: { min: 500, max: 1000000 },
    educacion: { min: 500, max: 200000 },
    "medio-ambiente": { min: 1000, max: 500000 },
    social: { min: 200, max: 100000 },
    "arte-cultura": { min: 500, max: 100000 },
  };

  const limits = categoryLimits[category] || { min: 100, max: 10000000 };

  if (goal < limits.min) {
    return {
      valid: false,
      message: `Para esta categoría, la meta mínima es €${limits.min}`,
    };
  }

  if (goal > limits.max) {
    return {
      valid: false,
      message: `Para esta categoría, la meta máxima es €${limits.max}`,
    };
  }

  return { valid: true };
}
