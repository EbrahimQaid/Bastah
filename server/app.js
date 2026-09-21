import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import storeRoutes from "./routes/storeRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { isDbReady } from "./lib/db.js";
import { JWT_SECRET } from "./lib/auth.js";

const app = express();

app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN?.split(",").map((value) => value.trim()) || true,
  }),
);
app.use(express.json({ limit: "1mb" }));

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
  res.status(500).json({ error: "حدث خطأ غير متوقع في الخادم" });
});

// Serve static assets in production when not managed by custom server.ts
if (process.env.NODE_ENV === "production" && !process.env.RUNNING_CUSTOM_SERVER) {
  const distPublic = path.join(process.cwd(), "dist/public");
  const distRoot = path.join(process.cwd(), "dist");
  const staticPath = fs.existsSync(distPublic) ? distPublic : distRoot;
  app.use(express.static(staticPath));

  // Any route that doesn't match API endpoints should return the React frontend
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    const indexPath = path.join(staticPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      next();
    }
  });
}

export default app;
