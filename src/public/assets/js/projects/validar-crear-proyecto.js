// ============================================
// VALIDACIÓN DE CREACIÓN DE PROYECTOS
// Sigue el patrón de validarformulario.js
// ============================================

// ============================================
// PASO 1: Información Básica
// ============================================
function validarPaso1(datos) {
  const errorTitulo = document.getElementById("titulo-error");
  const errorDescripcion = document.getElementById("descripcion-error");
  const errorCategoria = document.getElementById("categoria-error");

  // Limpiar errores previos
  errorTitulo.innerHTML = "";
  errorDescripcion.innerHTML = "";
  errorCategoria.innerHTML = "";
  
  errorTitulo.classList.remove("show");
  errorDescripcion.classList.remove("show");
  errorCategoria.classList.remove("show");

  let hayError = false;

  // Validar título
  if (!datos.titulo || datos.titulo.trim().length === 0) {
    hayError = true;
    errorTitulo.innerHTML = "El título del proyecto es obligatorio";
    errorTitulo.classList.add("show");
  } else if (datos.titulo.trim().length < 10) {
    hayError = true;
    errorTitulo.innerHTML = "El título debe tener al menos 10 caracteres";
    errorTitulo.classList.add("show");
  } else if (datos.titulo.trim().length > 100) {
    hayError = true;
    errorTitulo.innerHTML = "El título no puede exceder 100 caracteres";
    errorTitulo.classList.add("show");
  }

  // Validar descripción
  if (!datos.descripcion || datos.descripcion.trim().length === 0) {
    hayError = true;
    errorDescripcion.innerHTML = "La descripción corta es obligatoria";
    errorDescripcion.classList.add("show");
  } else if (datos.descripcion.trim().length < 20) {
    hayError = true;
    errorDescripcion.innerHTML = "La descripción debe tener al menos 20 caracteres";
    errorDescripcion.classList.add("show");
  } else if (datos.descripcion.trim().length > 200) {
    hayError = true;
    errorDescripcion.innerHTML = "La descripción no puede exceder 200 caracteres";
    errorDescripcion.classList.add("show");
  }

  // Validar categoría
  if (!datos.categoria) {
    hayError = true;
    errorCategoria.innerHTML = "Debes seleccionar una categoría";
    errorCategoria.classList.add("show");
  }

  return !hayError;
}

// ============================================
// PASO 3: Financiación
// ============================================
function validarPaso3(datos) {
  const errorMeta = document.getElementById("meta_financiera-error");
  const errorDuracion = document.getElementById("duracion_campana-error");

  // Limpiar errores previos
  errorMeta.innerHTML = "";
  errorDuracion.innerHTML = "";
  
  errorMeta.classList.remove("show");
  errorDuracion.classList.remove("show");

  let hayError = false;

  // Validar meta financiera
  if (!datos.metaFinanciera) {
    hayError = true;
    errorMeta.innerHTML = "La meta financiera es obligatoria";
    errorMeta.classList.add("show");
  } else if (parseFloat(datos.metaFinanciera) < 100) {
    hayError = true;
    errorMeta.innerHTML = "La meta debe ser al menos 100 Bs";
    errorMeta.classList.add("show");
  } else if (parseFloat(datos.metaFinanciera) > 1000000) {
    hayError = true;
    errorMeta.innerHTML = "La meta no puede exceder 1,000,000 Bs";
    errorMeta.classList.add("show");
  }

  // Validar duración
  if (!datos.duracion) {
    hayError = true;
    errorDuracion.innerHTML = "La duración de la campaña es obligatoria";
    errorDuracion.classList.add("show");
  } else if (parseInt(datos.duracion) < 7) {
    hayError = true;
    errorDuracion.innerHTML = "La campaña debe durar al menos 7 días";
    errorDuracion.classList.add("show");
  } else if (parseInt(datos.duracion) > 90) {
    hayError = true;
    errorDuracion.innerHTML = "La campaña no puede durar más de 90 días";
    errorDuracion.classList.add("show");
  }

  return !hayError;
}

// ============================================
// PASO 4: Multimedia
// ============================================
function validarPaso4(datos) {
  const errorImagen = document.getElementById("imagen_principal-error");

  // Limpiar errores previos
  errorImagen.innerHTML = "";
  errorImagen.classList.remove("show");

  let hayError = false;

  // Validar imagen principal
  if (!datos.imagenPrincipal) {
    hayError = true;
    errorImagen.innerHTML = "La imagen principal es obligatoria";
    errorImagen.classList.add("show");
  }

  return !hayError;
}

// ============================================
// PASO 4: Multimedia
// ============================================
function validarPaso4(datos) {
  const errorImagen = document.getElementById("imagen_principal-error");

  // Limpiar errores previos
  errorImagen.innerHTML = "";
  errorImagen.classList.remove("show");

  let hayError = false;

  // Validar imagen principal
  if (!datos.imagenPrincipal) {
    hayError = true;
    errorImagen.innerHTML = "La imagen principal es obligatoria";
    errorImagen.classList.add("show");
  }

  return !hayError;
}

// ============================================
// PASO 5: Recompensas
// ============================================
function validarRecompensa(datos) {
  const errorTitulo = document.getElementById("recompensa_titulo-error");
  const errorDescripcion = document.getElementById("recompensa_descripcion-error");
  const errorMonto = document.getElementById("recompensa_monto-error");

  // Limpiar errores previos
  errorTitulo.innerHTML = "";
  errorDescripcion.innerHTML = "";
  errorMonto.innerHTML = "";
  
  errorTitulo.classList.remove("show");
  errorDescripcion.classList.remove("show");
  errorMonto.classList.remove("show");

  let hayError = false;

  // Validar título
  if (!datos.titulo || datos.titulo.trim().length === 0) {
    hayError = true;
    errorTitulo.innerHTML = "El título de la recompensa es obligatorio";
    errorTitulo.classList.add("show");
  } else if (datos.titulo.trim().length < 5) {
    hayError = true;
    errorTitulo.innerHTML = "El título debe tener al menos 5 caracteres";
    errorTitulo.classList.add("show");
  } else if (datos.titulo.trim().length > 50) {
    hayError = true;
    errorTitulo.innerHTML = "El título no puede exceder 50 caracteres";
    errorTitulo.classList.add("show");
  }

  // Validar descripción
  if (!datos.descripcion || datos.descripcion.trim().length === 0) {
    hayError = true;
    errorDescripcion.innerHTML = "La descripción es obligatoria";
    errorDescripcion.classList.add("show");
  } else if (datos.descripcion.trim().length < 10) {
    hayError = true;
    errorDescripcion.innerHTML = "La descripción debe tener al menos 10 caracteres";
    errorDescripcion.classList.add("show");
  } else if (datos.descripcion.trim().length > 200) {
    hayError = true;
    errorDescripcion.innerHTML = "La descripción no puede exceder 200 caracteres";
    errorDescripcion.classList.add("show");
  }

  // Validar monto
  if (!datos.monto) {
    hayError = true;
    errorMonto.innerHTML = "El monto es obligatorio";
    errorMonto.classList.add("show");
  } else if (parseFloat(datos.monto) < 10) {
    hayError = true;
    errorMonto.innerHTML = "El monto debe ser al menos 10 Bs";
    errorMonto.classList.add("show");
  }

  return !hayError;
}

// ============================================
// UTILIDADES
// ============================================

// Función auxiliar para validar email
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Configurar contador de caracteres
function setupCharCounter(inputId, counterId, maxLength) {
  const input = document.getElementById(inputId);
  const counter = document.getElementById(counterId);
  
  if (!input || !counter) return;
  
  input.addEventListener('input', function() {
    const currentLength = this.value.length;
    counter.textContent = currentLength;
    
    // Cambiar color si está cerca del límite
    if (currentLength >= maxLength * 0.9) {
      counter.style.color = 'var(--color-error)';
    } else {
      counter.style.color = 'var(--text-secondary)';
    }
    
    // Limitar caracteres
    if (currentLength > maxLength) {
      this.value = this.value.substring(0, maxLength);
      counter.textContent = maxLength;
    }
  });
}

// Actualizar barra de progreso
function updateProgress(currentStep, totalSteps) {
  const progressFill = document.querySelector('.progress-fill');
  const stepIndicator = document.querySelector('.step-indicator');
  
  if (progressFill) {
    const percentage = (currentStep / totalSteps) * 100;
    progressFill.style.width = `${percentage}%`;
  }
  
  if (stepIndicator) {
    stepIndicator.textContent = `Paso ${currentStep} de ${totalSteps}`;
  }
}
