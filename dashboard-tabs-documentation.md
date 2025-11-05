# Sistema de Pestañas del Dashboard con Deep-Linking

## Overview

Se ha implementado un sistema de pestañas funcional para el dashboard del usuario con deep-linking, similar al sistema de autenticación existente. El sistema permite navegar entre tres secciones principales: "Mis Proyectos", "Mis Aportes" y "Favoritos".

## Estructura Implementada

### 1. HTML (`public/user/dashboard.html`)

#### Estructura de Pestañas
```html
<nav class="tabs" aria-label="Filtro de contenido">
  <button class="tab" type="button" data-tab="proyectos">Mis Proyectos</button>
  <button class="tab tab--active" type="button" data-tab="aportes" aria-current="page">Mis Aportes</button>
  <button class="tab" type="button" data-tab="favoritos">Favoritos</button>
</nav>
```

#### Contenido Dinámico
- **Mis Proyectos**: Muestra proyectos creados por el usuario con estado (activo/completado), barra de progreso y acciones
- **Mis Aportes**: Historial de donaciones realizadas con comentarios y enlaces a proyectos
- **Favoritos**: Proyectos marcados como favoritos con opción de aportar y gestionar favoritos

### 2. CSS (`public/assets/css/dashboard/dashboard.css`)

#### Nuevas Clases Añadidas
- `.tab-content-container`: Contenedor para el contenido de las pestañas
- `.tabcontent`: Paneles de contenido individuales
- `.tabcontent.active`: Panel visible actualmente
- `.projects-grid` / `.favorites-grid`: Grid responsivo para tarjetas
- `.project-card` / `.favorite-card`: Estilos para tarjetas de proyectos
- `.progress-bar`: Barra de progreso visual para proyectos
- `.project-card__status`: Indicadores de estado (activo/completado)

#### Responsive Design
- Adaptación a móviles con grid de una columna
- Ajustes en el header y tarjetas para pantallas pequeñas

### 3. JavaScript (`public/assets/js/dashboard/dashboard.js`)

#### Funcionalidades Principales

##### Sistema de Navegación
- `switchTab(targetTab)`: Cambia entre pestañas y actualiza la UI
- `updateBanner(tabName)`: Actualiza el banner según la pestaña activa
- `activateTabFromHash()`: Activa pestaña basada en el hash de la URL

##### Deep-Linking
- URLs con hash: `#proyectos`, `#aportes`, `#favoritos`
- Actualización dinámica del historial del navegador
- Soporte para navegación con botones atrás/adelante

##### Interactividad
- Botones de "Ver Proyecto" en aportes
- Botones de "Editar" en proyectos propios
- Botones de "Aportar" en favoritos
- Toggle de corazón para gestionar favoritos

## Uso del Sistema

### Acceso Directo con Deep-Linking

Para acceder directamente a una pestaña específica:

```html
<!-- Mis Proyectos -->
<a href="public/user/dashboard.html#proyectos">Mis Proyectos</a>

<!-- Mis Aportes -->
<a href="public/user/dashboard.html#aportes">Mis Aportes</a>

<!-- Favoritos -->
<a href="public/user/dashboard.html#favoritos">Favoritos</a>
```

### Comportamiento por Defecto

- Sin hash: Muestra "Mis Aportes" por defecto
- Con hash inválido: Redirige a "Mis Aportes"
- Navegación del navegador: Mantiene el estado de la pestaña

## Características Técnicas

### Accesibilidad
- Uso de atributos ARIA (`aria-current`, `aria-label`)
- Navegación por teclado compatible
- Estructura semántica HTML5

### Rendimiento
- Event delegation para manejo eficiente de eventos
- Transiciones CSS suaves
- Carga de contenido estático (sin llamadas AJAX)

### Mantenibilidad
- Código modular y comentado
- Separación de responsabilidades (HTML/CSS/JS)
- Nomenclatura consistente (BEM-like)

## Pruebas

### Archivo de Prueba
Se ha creado `test-dashboard-tabs.html` para verificar el funcionamiento del sistema:

1. Abre el archivo en un navegador
2. Haz clic en los enlaces de prueba
3. Verifica que:
   - La pestaña correcta se activa
   - El banner se actualiza
   - La URL muestra el hash correcto
   - Los botones funcionan correctamente

### Verificación Manual
1. Abre `public/user/dashboard.html` directamente
2. Prueba los diferentes hashes en la URL
3. Verifica la navegación entre pestañas
4. Comprueba la responsividad en diferentes tamaños de pantalla

## Extensiones Futuras

### Posibles Mejoras
1. **Carga Dinámica**: Integración con API para cargar datos reales
2. **Filtros y Búsqueda**: Añadir funcionalidad de búsqueda dentro de cada pestaña
3. **Paginación**: Para manejar grandes volúmenes de contenido
4. **Notificaciones**: Indicadores de actividad nueva
5. **Exportación**: Funcionalidad para exportar datos de cada sección

### Integración con Backend
- Endpoints para obtener datos del usuario
- Actualización en tiempo real de estadísticas
- Gestión de estado de proyectos
- Procesamiento de aportaciones y favoritos

## Conclusión

El sistema de pestañas implementado proporciona una experiencia de usuario fluida y consistente, con deep-linking que permite compartir enlaces directos a secciones específicas del dashboard. La arquitectura es escalable y mantenible, facilitando futuras extensiones y mejoras.