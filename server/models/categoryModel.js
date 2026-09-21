import { query } from "../lib/db.js";

/**
 * 🏷️ Category Model (MVC - Model)
 * Handles data access for Product Categories
 */
export class CategoryModel {
  static async findAllByStore(storeId) {
    const { rows } = await query(
      "SELECT * FROM categories WHERE store_id = $1 ORDER BY id ASC",
      [storeId],
    );
    return (rows || []).map((r) => ({
      id: r.id,
      storeId: r.store_id,
      name: r.name,
    }));
  }

  static async findById(id, storeId) {
    const { rows } = await query(
      "SELECT * FROM categories WHERE id = $1 AND store_id = $2 LIMIT 1",
      [Number(id), storeId],
    );
    if (!rows || rows.length === 0) return null;
    return {
      id: rows[0].id,
      storeId: rows[0].store_id,
      name: rows[0].name,
    };
  }

  static async create(storeId, name) {
    const { rows } = await query(
      "INSERT INTO categories (store_id, name) VALUES ($1, $2) RETURNING *",
      [storeId, name.trim()],
    );
    return {
      id: rows[0].id,
      storeId: rows[0].store_id,
      name: rows[0].name,
    };
  }

  static async delete(storeId, categoryId) {
    await query(
      "DELETE FROM categories WHERE id = $1 AND store_id = $2",
      [Number(categoryId), storeId],
    );
    return true;
  }
}
