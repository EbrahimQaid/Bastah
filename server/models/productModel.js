import { query } from "../lib/db.js";

/**
 * 📦 Product Model (MVC - Model)
 * Handles data access and business logic for Products
 */
export class ProductModel {
  static mapProduct(row) {
    if (!row) return null;
    let images = [];
    if (Array.isArray(row.images)) {
      images = row.images;
    } else if (typeof row.images === "string" && row.images) {
      try {
        images = JSON.parse(row.images);
      } catch {
        images = [row.images];
      }
    }

    let sizes = [];
    if (Array.isArray(row.sizes)) {
      sizes = row.sizes;
    } else if (typeof row.sizes === "string" && row.sizes) {
      try {
        sizes = JSON.parse(row.sizes);
      } catch {
        sizes = [];
      }
    }

    let colors = [];
    if (Array.isArray(row.colors)) {
      colors = row.colors;
    } else if (typeof row.colors === "string" && row.colors) {
      try {
        colors = JSON.parse(row.colors);
      } catch {
        colors = [];
      }
    }

    return {
      id: row.id,
      storeId: row.store_id,
      categoryId: row.category_id,
      categoryName: row.category_name,
      name: row.name,
      description: row.description || "",
      price: Number(row.price),
      images,
      variants: {
        sizes,
        colors,
      },
      stockQuantity: Number(row.stock_quantity ?? 50),
      trackInventory: Boolean(row.track_inventory),
      inStock: row.in_stock !== false,
      featured: Boolean(row.featured),
      createdAt: row.created_at,
    };
  }

  static async findAllByStore(storeId, filters = {}) {
    const conditions = ["p.store_id = $1", "p.is_active = true"];
    const params = [storeId];
    let idx = 2;

    if (filters.categoryId) {
      conditions.push(`p.category_id = $${idx++}`);
      params.push(Number(filters.categoryId));
    }
    if (filters.featured !== undefined) {
      conditions.push(`p.featured = $${idx++}`);
      params.push(filters.featured === "true" || filters.featured === true);
    }
    if (filters.search) {
      conditions.push(`p.name ILIKE $${idx++}`);
      params.push(`%${filters.search}%`);
    }

    const sql = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY p.featured DESC, p.created_at DESC
    `;

    const { rows } = await query(sql, params);
    return (rows || []).map((r) => this.mapProduct(r));
  }

  static async findById(id, storeId) {
    const { rows } = await query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1 AND p.store_id = $2 AND p.is_active = true
       LIMIT 1`,
      [Number(id), storeId],
    );
    if (!rows || rows.length === 0) return null;
    return this.mapProduct(rows[0]);
  }

  static async findManyByIds(storeId, ids, client = null) {
    const numericIds = (ids || []).map(Number);
    if (numericIds.length === 0) return [];

    const dbQuery = client ? client.query.bind(client) : query;
    const { rows } = await dbQuery(
      `SELECT id, name, price, images, stock_quantity, track_inventory, in_stock
       FROM products
       WHERE store_id = $1 AND id = ANY($2::int[]) AND is_active = true`,
      [storeId, numericIds],
    );
    return rows || [];
  }

  static async create(storeId, data) {
    const { rows } = await query(
      `INSERT INTO products (store_id, category_id, name, description, price, images, sizes, colors, in_stock, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        storeId,
        data.categoryId || null,
        data.name.trim(),
        data.description || "",
        Number(data.price),
        data.images || [],
        data.sizes || [],
        data.colors || [],
        data.inStock ?? true,
        data.featured ?? false,
      ],
    );
    return this.mapProduct(rows[0]);
  }

  static async update(storeId, productId, data) {
    const { rows } = await query(
      `UPDATE products SET
        category_id = $1, name = $2, description = $3, price = $4,
        images = $5, sizes = $6, colors = $7, in_stock = $8, featured = $9, updated_at = NOW()
       WHERE id = $10 AND store_id = $11
       RETURNING *`,
      [
        data.categoryId || null,
        data.name.trim(),
        data.description || "",
        Number(data.price),
        data.images || [],
        data.sizes || [],
        data.colors || [],
        data.inStock ?? true,
        data.featured ?? false,
        productId,
        storeId,
      ],
    );
    if (!rows || rows.length === 0) return null;
    return this.mapProduct(rows[0]);
  }

  static async delete(storeId, productId) {
    await query(
      "DELETE FROM products WHERE id = $1 AND store_id = $2",
      [productId, storeId],
    );
    return true;
  }

  static async decrementStock(client, productId, quantity) {
    const dbQuery = client ? client.query.bind(client) : query;
    await dbQuery(
      `UPDATE products SET
        stock_quantity = stock_quantity - $1,
        in_stock = CASE WHEN track_inventory AND stock_quantity - $1 <= 0 THEN false ELSE in_stock END
       WHERE id = $2 AND track_inventory = true`,
      [quantity, productId],
    );
  }
}
