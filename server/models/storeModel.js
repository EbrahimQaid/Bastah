import { query } from "../lib/db.js";

/**
 * 🏬 Store Model (MVC - Model)
 * Handles data access and business logic for Stores
 */
export class StoreModel {
  static mapStore(row) {
    if (!row) return null;
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description || "",
      coverImage: row.cover_image || "",
      logoImage: row.logo_image || "",
      primaryColor: row.primary_color || "#991B1B",
      secondaryColor: row.secondary_color || "#DC2626",
      fontFamily: row.font_family || "Tajawal",
      currencies: JSON.stringify(row.currencies || ["YER", "SAR", "USD"]),
      defaultCurrency: row.default_currency || "YER",
      themeConfig: row.theme_config ? (typeof row.theme_config === "string" ? row.theme_config : JSON.stringify(row.theme_config)) : null,
      shippingRate: Number(row.shipping_rate || 0),
      whatsappNumber: row.whatsapp_number || "",
      createdAt: row.created_at,
    };
  }

  static async findDefault() {
    const { rows } = await query(
      "SELECT * FROM stores WHERE is_active = true ORDER BY id ASC LIMIT 1",
    );
    if (rows.length === 0) return null;
    return this.mapStore(rows[0]);
  }

  static async findById(id) {
    const { rows } = await query("SELECT * FROM stores WHERE id = $1 LIMIT 1", [
      id,
    ]);
    if (rows.length === 0) return null;
    return this.mapStore(rows[0]);
  }

  static async findBySlug(slug) {
    const { rows } = await query(
      "SELECT * FROM stores WHERE slug = $1 AND is_active = true LIMIT 1",
      [slug],
    );
    if (rows.length === 0) return null;
    return this.mapStore(rows[0]);
  }

  static async getShippingRate(id) {
    const { rows } = await query(
      "SELECT shipping_rate FROM stores WHERE id = $1 LIMIT 1",
      [id],
    );
    return Number(rows?.[0]?.shipping_rate || 0);
  }

  static async update(id, data) {
    const currencies = data.currencies
      ? typeof data.currencies === "string"
        ? JSON.parse(data.currencies)
        : data.currencies
      : ["YER", "SAR", "USD"];

    const themeConfig = data.themeConfig
      ? typeof data.themeConfig === "string"
        ? JSON.parse(data.themeConfig)
        : data.themeConfig
      : null;

    const { rows } = await query(
      `UPDATE stores SET
        name = $1, description = $2, cover_image = $3, logo_image = $4,
        primary_color = $5, secondary_color = $6, font_family = $7,
        currencies = $8, default_currency = $9, theme_config = $10,
        shipping_rate = $11, whatsapp_number = $12, updated_at = NOW()
       WHERE id = $13 RETURNING *`,
      [
        data.name,
        data.description || "",
        data.coverImage || "",
        data.logoImage || "",
        data.primaryColor || "#991B1B",
        data.secondaryColor || "#DC2626",
        data.fontFamily || "Tajawal",
        currencies,
        data.defaultCurrency || "YER",
        themeConfig,
        Number(data.shippingRate || 0),
        data.whatsappNumber || "",
        id,
      ],
    );
    if (rows.length === 0) return null;
    return this.mapStore(rows[0]);
  }

  static async create(data) {
    const currencies = data.currencies
      ? Array.isArray(data.currencies)
        ? data.currencies
        : [data.currencies]
      : [data.defaultCurrency || "YER"];

    const { rows } = await query(
      `INSERT INTO stores (owner_id, plan_id, slug, name, description, whatsapp_number, primary_color, secondary_color, font_family, shipping_rate, default_currency, currencies)
       VALUES ($1, 1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        data.ownerId,
        data.slug,
        data.name.trim(),
        data.description || "",
        data.whatsappNumber || null,
        data.primaryColor || "#991B1B",
        data.secondaryColor || "#DC2626",
        data.fontFamily || "Tajawal",
        Math.max(0, Number(data.shippingRate) || 0),
        data.defaultCurrency || "YER",
        currencies,
      ],
    );
    return rows[0];
  }
}
