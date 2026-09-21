import { query } from "../lib/db.js";

/**
 * 👤 User Model (MVC - Model)
 * Handles data access for Merchants / Users
 */
export class UserModel {
  static async findById(id) {
    const { rows } = await query(
      "SELECT id, email, full_name, phone, role, avatar_url, is_active FROM users WHERE id = $1 LIMIT 1",
      [id],
    );
    if (!rows || rows.length === 0) return null;
    return rows[0];
  }

  static async findByEmail(email) {
    const { rows } = await query(
      "SELECT id, email, password_hash, full_name, phone, role, is_active FROM users WHERE email = $1 LIMIT 1",
      [email.toLowerCase()],
    );
    if (!rows || rows.length === 0) return null;
    return rows[0];
  }

  static async create({ email, passwordHash, fullName, phone, role = "seller" }) {
    const { rows } = await query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, is_active, is_verified)
       VALUES ($1, $2, $3, $4, $5, true, false)
       RETURNING id, email, full_name, phone, role`,
      [email.toLowerCase(), passwordHash, fullName, phone || null, role],
    );
    return rows[0];
  }

  static async updateLastLogin(id) {
    await query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [id]);
  }
}
