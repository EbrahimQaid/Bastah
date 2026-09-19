import jwt from "jsonwebtoken";
import { query } from "./db.js";

export const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production"
    ? null
    : "bastah-dev-secret-change-in-production");

export function getJwtSecret() {
  if (!JWT_SECRET) {
    const error = new Error("JWT_SECRET is missing in Vercel environment variables");
    error.code = "CONFIGURATION_ERROR";
    throw error;
  }
  return JWT_SECRET;
}

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "غير مصرح للوصول، الرجاء تسجيل الدخول أولاً" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const { rows } = await query(
      `SELECT u.id, u.email, u.role, s.id AS store_id
       FROM users u
       LEFT JOIN stores s ON s.owner_id = u.id AND s.is_active = true
       WHERE u.id = $1 AND u.is_active = true
       LIMIT 1`,
      [decoded.userId],
    );
    if (rows.length === 0)
      return res.status(401).json({ error: "الحساب غير فعال أو غير موجود" });
    req.userId = rows[0].id;
    req.user = rows[0];
    req.storeId = rows[0].store_id || null;
    next();
  } catch (err) {
    if (err.name !== "JsonWebTokenError" && err.name !== "TokenExpiredError") {
      console.error("[auth]", err);
    }
    return res.status(401).json({
      error: "جلسة عمل غير صالحة أو منتهية، الرجاء تسجيل الدخول مجدداً",
    });
  }
};
