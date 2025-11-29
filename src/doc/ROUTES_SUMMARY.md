# Resumen de Rutas de la API

## 📋 **Estructura General**

```
/api/v1/
├── auth/
├── users/
├── categories/
├── projects/
├── admin/
├── donations/
└── favorites/
```

---

## 🔐 **Autenticación**

**Router:** `routers/authRouter.js`

| Método | Ruta                | Descripción                      |
| ------ | ------------------- | -------------------------------- |
| POST   | `/auth/register`    | Registro de nuevo usuario        |
| POST   | `/auth/login`       | Inicio de sesión                 |
| POST   | `/auth/verify`      | Verificación de email con código |
| POST   | `/auth/resend-code` | Reenviar código de verificación  |

---

## 👤 **Usuarios**

**Router:** `routers/userRouter.js`

| Método | Ruta                       | Descripción                            |
| ------ | -------------------------- | -------------------------------------- |
| GET    | `/me`                      | Obtener perfil del usuario autenticado |
| PATCH  | `/admin/users/:id/block`   | Bloquear usuario (solo admin)          |
| PATCH  | `/admin/users/:id/unblock` | Desbloquear usuario (solo admin)       |

---

## 📂 **Categorías y Requisitos**

**Router:** `routers/categoriesRouter.js`

| Método | Ruta                                 | Descripción                                 |
| ------ | ------------------------------------ | ------------------------------------------- |
| GET    | `/categories`                        | Obtener todas las categorías                |
| GET    | `/categories/:id/requirements`       | Obtener requisitos de una categoría         |
| POST   | `/admin/categories`                  | Crear nueva categoría (solo admin)          |
| POST   | `/admin/categories/:id/requirements` | Crear requisito para categoría (solo admin) |
| PATCH  | `/admin/requirements/:id`            | Actualizar requisito (solo admin)           |

---

## 🚀 **Proyectos**

**Router:** `routers/projectRouter.js`

| Método | Ruta                            | Descripción                               |
| ------ | ------------------------------- | ----------------------------------------- |
| POST   | `/projects`                     | Crear nuevo proyecto                      |
| GET    | `/projects`                     | Obtener todos los proyectos (con filtros) |
| GET    | `/projects/:id`                 | Obtener proyecto por ID                   |
| PATCH  | `/projects/:id`                 | Actualizar proyecto                       |
| POST   | `/projects/:id/submit`          | Enviar proyecto para revisión             |
| POST   | `/projects/:id/images`          | Subir imágenes de proyecto                |
| DELETE | `/projects/:id/images/:imageId` | Eliminar imagen de proyecto               |

---

## 🔍 **Revisión de Proyectos (Admin)**

**Router:** `routers/adminRouter.js`

| Método | Ruta                          | Descripción                    |
| ------ | ----------------------------- | ------------------------------ |
| POST   | `/admin/projects/:id/observe` | Observar proyecto (solo admin) |
| POST   | `/admin/projects/:id/publish` | Publicar proyecto (solo admin) |
| POST   | `/admin/projects/:id/reject`  | Rechazar proyecto (solo admin) |

---

## 💰 **Campaña**

**Router:** `routers/campainRouter.js`

| Método | Ruta                           | Descripción                              |
| ------ | ------------------------------ | ---------------------------------------- |
| PATCH  | `/projects/:id/campaign-state` | Actualizar estado de campaña de proyecto |

---

## 💳 **Donaciones**

**Router:** `routers/donationRouter.js`

| Método | Ruta                      | Descripción                                |
| ------ | ------------------------- | ------------------------------------------ |
| POST   | `/projects/:id/donations` | Crear donación a proyecto                  |
| POST   | `/payments/callback`      | Callback de pasarela de pago               |
| GET    | `/me/donations`           | Obtener donaciones del usuario autenticado |

---

## ⭐ **Favoritos**

**Router:** `routers/favoritiesRouter.js`

| Método | Ruta                     | Descripción                             |
| ------ | ------------------------ | --------------------------------------- |
| POST   | `/projects/:id/favorite` | Agregar proyecto a favoritos            |
| DELETE | `/projects/:id/favorite` | Eliminar proyecto de favoritos          |
| GET    | `/me/favorites`          | Obtener proyectos favoritos del usuario |

---

## 🔧 **Configuración en index.js**

Para que todas las rutas funcionen, asegúrate de configurarlas en tu archivo principal:

```javascript
const express = require("express");
const app = express();

// Importar routers
const authRouter = require("./routers/authRouter");
const userRouter = require("./routers/userRouter");
const categoriesRouter = require("./routers/categoriesRouter");
const projectRouter = require("./routers/projectRouter");
const adminRouter = require("./routers/adminRouter");
const campaignRouter = require("./routers/campainRouter");
const donationRouter = require("./routers/donationRouter");
const favoriteRouter = require("./routers/favoritiesRouter");

// Montar routers
app.use("/api/v1/auth", authRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1", categoriesRouter);
app.use("/api/v1", projectRouter);
app.use("/api/v1", adminRouter);
app.use("/api/v1", campaignRouter);
app.use("/api/v1", donationRouter);
app.use("/api/v1", favoriteRouter);
```

---

## 📝 **Notas Importantes**

1. **Middleware de Autenticación:** Las rutas que requieren autenticación deben tener un middleware que verifique el token JWT
2. **Middleware de Administrador:** Las rutas marcadas como "solo admin" deben verificar que el usuario tenga rol de administrador
3. **Validación:** Se recomienda usar `express-validator` para validar los datos de entrada
4. **Manejo de Errores:** Implementar un middleware de manejo de errores centralizado
5. **CORS:** Configurar CORS adecuadamente para las rutas de la API

---

## 🎯 **Controllers Requeridos**

Para que estas rutas funcionen, necesitarás crear los siguientes controllers:

- `authController.js` ✅ (existente)
- `userController.js` ✅ (existente)
- `categoryController.js` (por crear)
- `projectController.js` (por crear)
- `adminController.js` (por crear)
- `campaignController.js` (por crear)
- `donationController.js` (por crear)
- `favoriteController.js` (por crear)
