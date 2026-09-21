import express from "express";
import * as authController from "../controllers/authController.js";
import { requireAuth } from "../lib/auth.js";

const router = express.Router();

/* ── Auth Routes (MVC - Routes) ── */
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/store/create", requireAuth, authController.createStore);
router.get("/me", authController.getMe);

export default router;
