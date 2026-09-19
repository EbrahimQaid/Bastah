import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../lib/db.js";
import { requireAuth, JWT_SECRET } from "../lib/auth.js";

const router = express.Router();
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

/* ── Helper: generate JWT ── */
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/* ── POST /api/auth/register ── */
router.post("/register", async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: "الاسم والبريد وكلمة المرور مطلوبة" });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" });
  }

  try {
    const { rows: existingUsers } = await query(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [email.toLowerCase()],
    );
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: "البريد الإلكتروني مستخدم بالفعل" });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const { rows } = await query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, is_active, is_verified)
       VALUES ($1, $2, $3, $4, 'seller', true, false) RETURNING id, email, full_name, phone, role`,
      [email.toLowerCase(), passwordHash, fullName, phone || null],
    );
    const user = rows[0];

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("[register]", err);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

/* ── POST /api/auth/login ── */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "البريد وكلمة المرور مطلوبان" });

  try {
    const { rows } = await query(
      "SELECT id, email, password_hash, full_name, phone, role FROM users WHERE email = $1 AND is_active = true LIMIT 1",
      [email.toLowerCase()],
    );
    if (rows.length === 0)
      return res.status(401).json({ error: "بيانات الدخول خاطئة" });
    const user = rows[0];

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "بيانات الدخول خاطئة" });

    await query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [
      user.id,
    ]);

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("[login]", err);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

/* ── POST /api/auth/store/create ── */
router.post("/store/create", requireAuth, async (req, res) => {
  if (req.storeId) return res.status(409).json({ error: "لديك متجر بالفعل" });

  const {
    name,
    slug,
    description,
    whatsappNumber,
    primaryColor,
    secondaryColor,
    fontFamily,
    shippingRate,
    defaultCurrency,
  } = req.body || {};
  if (!name?.trim() || !/^[a-z0-9-]{3,60}$/.test(slug || "")) {
    return res
      .status(400)
      .json({ error: "اسم المتجر والرابط بصيغة صحيحة مطلوبان" });
  }

  try {
    const { rows } = await query(
      `INSERT INTO stores (owner_id, plan_id, slug, name, description, whatsapp_number, primary_color, secondary_color, font_family, shipping_rate, default_currency, currencies)
       VALUES ($1, 1, $2, $3, $4, $5, $6, $7, $8, $9, $10, ARRAY[$10]) RETURNING *`,
      [
        req.userId,
        slug,
        name.trim(),
        description || "",
        whatsappNumber || null,
        primaryColor || "#7C3AED",
        secondaryColor || "#A78BFA",
        fontFamily || "Tajawal",
        Math.max(0, Number(shippingRate) || 0),
        defaultCurrency || "SAR",
      ],
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === "23505")
      return res.status(409).json({ error: "رابط المتجر مستخدم بالفعل" });
    console.error("[store/create]", error);
    res.status(500).json({ error: "تعذر إنشاء المتجر" });
  }
});

/* ── GET /api/auth/me ── */
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ error: "غير مصرح" });

  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET);
    const { rows } = await query(
      "SELECT id, email, full_name, phone, role, avatar_url FROM users WHERE id = $1 LIMIT 1",
      [payload.userId],
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "المستخدم غير موجود" });

    res.json({
      id: rows[0].id,
      email: rows[0].email,
      fullName: rows[0].full_name,
      phone: rows[0].phone,
      role: rows[0].role,
      avatarUrl: rows[0].avatar_url,
    });
  } catch {
    res.status(401).json({ error: "token غير صالح" });
  }
});

export default router;
