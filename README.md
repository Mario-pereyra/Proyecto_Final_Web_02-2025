# Impulsa.me - Plataforma de Crowdfunding

Una plataforma de crowdfunding donde creativos, innovadores y visionarios encuentran el apoyo que necesitan para hacer realidad sus proyectos.

## 🚀 Despliegue en GitHub Pages

Este proyecto está configurado para funcionar con GitHub Pages sirviendo el contenido de la carpeta `public` como la raíz del sitio.

### Configuración

1. **_config.yml**: Configurado para usar la carpeta `public` como fuente
2. **.gitignore**: Configurado para ignorar archivos innecesarios
3. **Estructura**: Todos los archivos del sitio están en la carpeta `public/`

### Cómo desplegar

1. Haz push a la rama `main` o `master`
2. En tu repositorio de GitHub, ve a **Settings > Pages**
3. Selecciona **Source: Deploy from a branch**
4. Elige la rama `main` o `master`
5. La carpeta `/root` será seleccionada automáticamente
6. Haz clic en **Save**

El sitio estará disponible en: `https://[tu-usuario].github.io/[nombre-repositorio]`

## 📁 Estructura del Proyecto

```
Proyecto_Final/
├── public/                 # Contenido del sitio web
│   ├── index.html          # Página principal
│   ├── assets/             # Recursos estáticos
│   │   ├── css/           # Hojas de estilo
│   │   ├── js/            # Archivos JavaScript
│   │   ├── img/            # Imágenes
│   │   └── icons/          # Iconos
│   ├── user/               # Páginas de usuario
│   ├── admin/              # Panel de administración
│   └── auth.html           # Autenticación
├── controllers/            # Lógica del backend
├── repositories/           # Acceso a datos
├── routes/                # Rutas de la API
├── index.js               # Servidor Node.js
├── .gitignore             # Archivos ignorados por Git
└── _config.yml            # Configuración de GitHub Pages
```

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **Backend**: Node.js, Express
- **Estilos**: CSS modular con arquitectura BEM
- **Iconos**: Iconify
- **Despliegue**: GitHub Pages

## ✨ Características

- 🎯 Creación y gestión de proyectos
- 💳 Sistema de financiación
- 👥 Perfiles de usuarios
- 🔍 Búsqueda y filtrado de proyectos
- 📊 Panel de administración
- 📱 Diseño responsive

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.