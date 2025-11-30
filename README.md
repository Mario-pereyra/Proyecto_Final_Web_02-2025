# Impulsame - Plataforma de Crowdfunding

Esta es una aplicación web de crowdfunding creada para conectar creadores con patrocinadores. En esta plataforma, los usuarios pueden crear proyectos, gestionar campañas de financiamiento, recibir donaciones y seguir el progreso de sus iniciativas. Cada proyecto incluye información detallada como título, descripción rica (Editor.js), meta de financiamiento, galería de imágenes y documentación de respaldo.

## Características

- ✅ Sistema de autenticación con verificación por email
- ✅ Creación de proyectos con editor rico (Editor.js)
- ✅ Gestión de campañas de financiamiento
- ✅ Sistema de donaciones
- ✅ Categorías personalizadas con requisitos específicos
- ✅ Panel de administración
- ✅ Dashboard de usuario con métricas
- ✅ Sistema de favoritos
- ✅ Carga de archivos e imágenes

## Requisitos

- Node.js 18+
- PostgreSQL 16+
- Docker y Docker Compose (opcional)

## Ejecución Local

### 1. Clonar el repositorio:

```bash
git clone <tu-repositorio>
cd Proyecto_Final
```

### 2. Ejecutar el script de base de datos:

Ejecuta el script `/db/db_impulsames.sql` en PostgreSQL para crear la estructura de la base de datos.

**Opción A - Desde psql:**

```bash
psql -U postgres -d db_Impulsame < db/db_impulsames.sql
```

**Opción B - Desde pgAdmin:**

1. Crear base de datos `db_Impulsame`
2. Abrir Query Tool
3. Ejecutar el contenido de `db/db_impulsames.sql`

### 3. Configurar variables de entorno:

Copia el archivo de ejemplo y ajusta los valores:

```bash
cp .env.example src/.env
```

Edita `src/.env` con tus credenciales:

```env
PG_HOST=localhost
PG_USER=postgres
PG_PASSWORD=tu_password
PG_DATABASE=db_Impulsame
PG_PORT=5432
PORT=3000
UPLOADS_IMG_PATH=D:/ruta/a/uploads/images
UPLOADS_FILES_PATH=D:/ruta/a/uploads/files
```

### 4. Instalar las dependencias:

```bash
cd src
npm install
```

### 5. Iniciar la aplicación:

```bash
node index.js
```

### 6. Abrir el navegador:

Accede a la aplicación en:

```
http://localhost:3000
```

## Ejecución mediante Docker

Para ejecutar la aplicación mediante Docker, asegúrate de tener Docker Desktop instalado y ejecuta el siguiente comando en la raíz del proyecto:

```bash
docker-compose up --build -d
```

### Acceso con Docker:

- **Aplicación**: http://localhost:4000
- **PostgreSQL**: localhost:5532

### Ver logs:

```bash
docker-compose logs -f
```

### Detener contenedores:

```bash
docker-compose down
```

> **Nota**: Con Docker, la aplicación corre en el puerto **4000** y PostgreSQL en el puerto **5532** para evitar conflictos con servicios locales.

## Estructura del Proyecto

```
Proyecto_Final/
├── src/
│   ├── controllers/      # Lógica de negocio
│   ├── repositories/     # Acceso a datos
│   ├── routers/          # Rutas de la API
│   ├── middleware/       # Middleware personalizado
│   ├── public/           # Archivos estáticos (HTML, CSS, JS)
│   ├── db/               # Configuración de conexión
│   ├── utils/            # Utilidades
│   ├── index.js          # Punto de entrada
│   └── .env              # Variables de entorno (no commitear)
├── db/
│   └── db_impulsames.sql # Script de inicialización de BD
├── Dockerfile            # Configuración de Docker para la app
├── compose.yml           # Orquestación de servicios
├── .dockerignore         # Archivos excluidos del build
├── .env.example          # Plantilla de variables de entorno
└── README.md             # Este archivo
```

## Tecnologías Utilizadas

### Backend:

- Node.js + Express
- PostgreSQL
- dotenv
- pg (PostgreSQL client)
- multer (upload de archivos)
- nodemailer (envío de emails)

### Frontend:

- HTML5, CSS3, JavaScript
- Editor.js (editor rico de contenido)
- Fetch API

### DevOps:

- Docker
- Docker Compose

## Documentación Adicional

- **Esquema de Base de Datos**: Ver [`db/db_impulsames.sql`](./db/db_impulsames.sql)

## Solución de Problemas

### Puerto en uso:

Si el puerto 3000 está ocupado, cambia el valor de `PORT` en `src/.env`:

```env
PORT=3001
```

### Error de conexión a PostgreSQL:

Verifica que PostgreSQL esté corriendo y que las credenciales en `src/.env` sean correctas:

```bash
# Windows
Get-Service postgresql-x64-16

# Linux/Mac
sudo systemctl status postgresql
```

### Problemas con Docker:

Si Docker falla al iniciar, verifica que Docker Desktop esté corriendo:

```bash
docker --version
docker ps
```


## Contacto

Para preguntas o sugerencias, abre un issue en el repositorio.

---

**¡Gracias por usar Impulsame!** 🚀
