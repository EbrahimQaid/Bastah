import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import storeRoutes from "./routes/storeRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { isDbReady } from "./lib/db.js";
import { JWT_SECRET } from "./lib/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN?.split(",").map((value) => value.trim()) || true,
  }),
);
app.use(express.json({ limit: "4mb" }));

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Health check
app.get("/api/healthz", (_, res) => {
  const configured = Boolean(isDbReady() && JWT_SECRET);
  res.status(configured ? 200 : 503).json({
    status: configured ? "ok" : "misconfigured",
    database: isDbReady() ? "configured" : "missing DATABASE_URL",
    auth: JWT_SECRET ? "configured" : "missing JWT_SECRET",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((error, _req, res, _next) => {
  console.error("[api]", error);
  const status = error.code === "CONFIGURATION_ERROR" ? 503 : 500;
  res.status(status).json({
    error:
      status === 503
        ? "الخادم غير مكتمل الإعداد: أضف DATABASE_URL ثم أعد تشغيل الخادم"
        : "حدث خطأ غير متوقع في الخادم",
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist/public")));

  // Any route that doesn't match API endpoints should return the React frontend
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/public/index.html"));
  });
}

export default app;
