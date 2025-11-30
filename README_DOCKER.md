# 🐳 Guía de Dockerización - Proyecto Impulsame

## 📋 ¿Qué logras con Docker?

✅ **Portabilidad Total**: Ejecuta el proyecto en cualquier computadora con Docker  
✅ **Setup en Minutos**: Levanta app + base de datos con 2 comandos  
✅ **Consistencia**: Mismo ambiente en desarrollo, testing y producción  
✅ **Aislamiento**: No contaminas tu sistema con dependencias

---

## 🛠️ Requisitos Previos

Instala Docker Desktop en tu sistema:

- **Windows/Mac**: [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Linux**: [Docker Engine](https://docs.docker.com/engine/install/)

Verifica la instalación:

```bash
docker --version
docker-compose --version
```

---

## 🚀 Comandos Principales

### 1️⃣ Levantar el Proyecto (Primera vez)

```bash
# Construir imágenes y levantar contenedores
docker-compose up --build -d
```

**¿Qué hace este comando?**

- 📦 Construye la imagen de Node.js con tu código
- 🐘 Descarga la imagen de PostgreSQL 16
- 🗄️ Crea la base de datos y ejecuta `db_impulsames.sql`
- 🚀 Levanta ambos servicios en segundo plano (`-d`)

**Espera 10-15 segundos** para que PostgreSQL inicialice completamente.

---

### 2️⃣ Verificar que Todo Funciona

```bash
# Ver logs de ambos servicios
docker-compose logs -f

# Ver solo logs de la app
docker-compose logs -f app

# Ver solo logs de la base de datos
docker-compose logs -f postgres
```

**Señales de éxito:**

- ✅ App: `Server running on port 3000`
- ✅ PostgreSQL: `database system is ready to accept connections`

---

### 3️⃣ Acceder a la Aplicación

Abre tu navegador en:

```
http://localhost:3000
```

---

### 4️⃣ Detener el Proyecto

```bash
# Detener contenedores (conserva datos)
docker-compose stop

# Detener y eliminar contenedores (conserva volúmenes)
docker-compose down

# Eliminar TODO (contenedores + volúmenes + datos)
docker-compose down -v
```

---

### 5️⃣ Reiniciar Después de Cambios

**Si modificaste código:**

```bash
docker-compose up --build -d
```

**Si solo modificaste variables de entorno:**

```bash
docker-compose up -d
```

---

## 🔧 Comandos Útiles

### Ejecutar Comandos Dentro de los Contenedores

```bash
# Entrar a la terminal de la app
docker exec -it impulsame_app sh

# Entrar a PostgreSQL
docker exec -it impulsame_db psql -U postgres -d db_Impulsame

# Ver tablas en PostgreSQL
docker exec -it impulsame_db psql -U postgres -d db_Impulsame -c "\dt"
```

### Ver Estado de los Contenedores

```bash
# Listar contenedores activos
docker ps

# Ver uso de recursos
docker stats
```

### Limpiar Recursos de Docker

```bash
# Eliminar imágenes no usadas
docker image prune -a

# Eliminar volúmenes huérfanos
docker volume prune

# Limpieza completa del sistema
docker system prune -a --volumes
```

---

## 📁 Estructura de Archivos Docker

```
Proyecto_Final/
├── Dockerfile              # Define cómo construir la imagen de Node.js
├── compose.yml             # Orquesta app + PostgreSQL
├── .dockerignore          # Archivos a excluir del build
├── .env.example           # Plantilla de variables de entorno
├── db/
│   └── db_impulsames.sql  # Script de inicialización de la DB
└── src/
    ├── .env               # Variables de entorno (NO commitear)
    └── ...                # Código de la aplicación
```

---

## 🔐 Variables de Entorno

### Desarrollo Local (sin Docker)

Usa `src/.env`:

```env
PG_HOST=localhost
PG_USER=postgres
PG_PASSWORD=master123
PG_DATABASE=db_Impulsame
PG_PORT=5432
PORT=3000
UPLOADS_PATH=d:/NUR/2-2024/images-uploaded
```

### Con Docker

Las variables se sobrescriben en `compose.yml`:

```yaml
PG_HOST=postgres          # Nombre del servicio
UPLOADS_PATH=/app/uploads # Path del contenedor
```

---

## 🐘 Acceso a PostgreSQL

### Desde tu Computadora (Cliente GUI)

Usa herramientas como **pgAdmin**, **DBeaver** o **TablePlus**:

```
Host: localhost
Port: 5432
User: postgres
Password: master123
Database: db_Impulsame
```

### Desde la Línea de Comandos

```bash
# Conectar a PostgreSQL
docker exec -it impulsame_db psql -U postgres -d db_Impulsame

# Ejecutar consultas SQL
docker exec -it impulsame_db psql -U postgres -d db_Impulsame -c "SELECT * FROM users;"
```

---

## 📦 Volúmenes Persistentes

Docker crea volúmenes para persistir datos:

- `postgres_data`: Almacena la base de datos
- `uploads_data`: Almacena archivos subidos por usuarios

**Ubicación:**

```bash
# Ver volúmenes
docker volume ls

# Inspeccionar un volumen
docker volume inspect proyecto_final_postgres_data
```

---

## 🚨 Solución de Problemas

### ❌ Error: "Port 5432 already in use"

**Causa**: Ya tienes PostgreSQL corriendo localmente.

**Solución**:

```bash
# Opción 1: Detener PostgreSQL local
# Windows (PowerShell como Admin):
Stop-Service postgresql-x64-16

# Opción 2: Cambiar puerto en compose.yml
ports:
  - "5433:5432"  # Usa 5433 en tu máquina
```

### ❌ Error: "Port 3000 already in use"

**Causa**: Ya tienes la app corriendo localmente.

**Solución**:

```bash
# Detener procesos en puerto 3000
# Windows (PowerShell):
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### ❌ La base de datos no se inicializa

**Causa**: El script SQL tiene errores o ya existe el volumen.

**Solución**:

```bash
# Eliminar volumen y recrear
docker-compose down -v
docker-compose up --build -d
```

### ❌ Cambios en el código no se reflejan

**Causa**: Necesitas reconstruir la imagen.

**Solución**:

```bash
docker-compose up --build -d
```

---

## 🎯 Flujo de Trabajo Recomendado

### Para Desarrollo Diario

1. **Levantar servicios**:

   ```bash
   docker-compose up -d
   ```

2. **Ver logs en tiempo real**:

   ```bash
   docker-compose logs -f app
   ```

3. **Hacer cambios en el código**

4. **Reconstruir y reiniciar**:

   ```bash
   docker-compose up --build -d
   ```

5. **Al terminar**:
   ```bash
   docker-compose stop
   ```

### Para Compartir con Otro Desarrollador

1. **Clonar el repositorio**:

   ```bash
   git clone <repo-url>
   cd Proyecto_Final
   ```

2. **Copiar variables de entorno**:

   ```bash
   cp .env.example src/.env
   ```

3. **Levantar todo**:

   ```bash
   docker-compose up --build -d
   ```

4. **¡Listo!** 🎉

---

## 📚 Recursos Adicionales

- [Documentación oficial de Docker](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## ✅ Checklist de Verificación

Antes de compartir tu proyecto, verifica:

- [ ] `compose.yml` tiene las credenciales correctas
- [ ] `db/db_impulsames.sql` no tiene errores de sintaxis
- [ ] `.env.example` está actualizado
- [ ] `.dockerignore` excluye `node_modules` y `.env`
- [ ] `README_DOCKER.md` está actualizado
- [ ] Probaste `docker-compose up --build -d` en una máquina limpia

---

## 🎉 ¡Felicidades!

Ahora tu proyecto es **100% portable** y cualquier persona puede levantarlo en minutos. 🚀
