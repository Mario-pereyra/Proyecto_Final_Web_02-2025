const express = require("express");
const cors = require("cors");
const path = require("path");
const PORT = 3001;

const authRouter = require("./routers/authRouter");
const adminRouter = require("./routers/adminRouter");
const userRouter = require("./routers/userRouter");
const campaignRouter = require("./routers/campaignRouter");
const donationRouter = require("./routers/donationRouter");
const categoryRouter = require("./routers/categoryRouter");
const projectRouter = require("./routers/projectRouter");
const requirementRouter = require("./routers/requirementRouter");
const favoriteRouter = require("./routers/favoriteRouter");
const kpiRouter = require("./routers/kpiRouter");
const uploadRouter = require("./routers/uploadRouter");
const paymentRouter = require("./routers/paymentRouter");


const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
// Servir archivos de uploads (imágenes y documentos)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api", kpiRouter); // ← Debe ir ANTES de projectRouter
app.use("/api", campaignRouter);
app.use("/api", donationRouter);
app.use("/api", categoryRouter);
app.use("/api/projects", projectRouter);
app.use("/api", requirementRouter);
app.use("/api/favorites", favoriteRouter);
app.use("/api/upload", uploadRouter); // ← Upload de imágenes para Editor.js
app.use("/api/payments", paymentRouter); // ← Pasarela de pagos

// Health check endpoint para Docker
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint no encontrado" });
});
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
