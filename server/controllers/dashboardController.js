import { query } from "../lib/db.js";

/* ── Helper: Map db store to frontend format ── */
function mapStore(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description || "",
    coverImage: row.cover_image || "",
    logoImage: row.logo_image || "",
    primaryColor: row.primary_color || "#7C3AED",
    secondaryColor: row.secondary_color || "#A78BFA",
    fontFamily: row.font_family || "Tajawal",
    currencies: JSON.stringify(row.currencies || ["SAR"]),
    defaultCurrency: row.default_currency || "SAR",
    themeConfig: row.theme_config ? JSON.stringify(row.theme_config) : null,
    shippingRate: Number(row.shipping_rate || 0),
    whatsappNumber: row.whatsapp_number || "",
    createdAt: row.created_at,
  };
}

/* ─────────────────────────────── STORE ─────────────────────────────── */

export const getDashboardStore = async (req, res) => {
  if (!req.storeId) return res.status(404).json({ error: "Store not found" });
  try {
    const { rows } = await query("SELECT * FROM stores WHERE id = $1 LIMIT 1", [
      req.storeId,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Store not found" });
    res.json(mapStore(rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDashboardStore = async (req, res) => {
  if (!req.storeId) return res.status(404).json({ error: "Store not found" });
  const body = req.body;
  const row = {
    name: body.name,
    description: body.description || "",
    cover_image: body.coverImage || "",
    logo_image: body.logoImage || "",
    primary_color: body.primaryColor || "#7C3AED",
    secondary_color: body.secondaryColor || "#A78BFA",
    font_family: body.fontFamily || "Tajawal",
    currencies: body.currencies
      ? typeof body.currencies === "string"
        ? JSON.parse(body.currencies)
        : body.currencies
      : ["SAR"],
    default_currency: body.defaultCurrency || "SAR",
    theme_config: body.themeConfig
      ? typeof body.themeConfig === "string"
        ? JSON.parse(body.themeConfig)
        : body.themeConfig
      : null,
    shipping_rate: Number(body.shippingRate || 0),
    whatsapp_number: body.whatsappNumber || "",
  };

  try {
    const { rows } = await query(
      `UPDATE stores SET
        name = $1, description = $2, cover_image = $3, logo_image = $4,
        primary_color = $5, secondary_color = $6, font_family = $7,
        currencies = $8, default_currency = $9, theme_config = $10,
        shipping_rate = $11, whatsapp_number = $12, updated_at = NOW()
       WHERE id = $13 RETURNING *`,
      [
        row.name,
        row.description,
        row.cover_image,
        row.logo_image,
        row.primary_color,
        row.secondary_color,
        row.font_family,
        row.currencies,
        row.default_currency,
        row.theme_config,
        row.shipping_rate,
        row.whatsapp_number,
        req.storeId,
      ],
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Store not found" });
    res.json(mapStore(rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const initDashboardStore = (req, res) =>
  res.status(201).json({ success: true });

/* ─────────────────────────────── PRODUCTS ──────────────────────────── */

export const listDashboardProducts = async (req, res) => {
  if (!req.storeId) return res.json([]);
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(req.query.limit, 10) || 24),
  );
  try {
    const { rows } = await query(
      "SELECT * FROM products WHERE store_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
      [req.storeId, limit, (page - 1) * limit],
    );
    res.json(rows.map(toProduct));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createDashboardProduct = async (req, res) => {
  if (!req.storeId) return res.status(400).json({ error: "Store not found" });
  const body = req.body;
  try {
    const { rows } = await query(
      `INSERT INTO products (store_id, category_id, name, description, price, images, sizes, colors, in_stock, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        req.storeId,
        body.categoryId || null,
        body.name,
        body.description || "",
        body.price,
        body.images || [],
        body.variants?.sizes || [],
        body.variants?.colors || [],
        body.inStock ?? true,
        body.featured ?? false,
      ],
    );
    res.status(201).json(toProduct(rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDashboardProduct = async (req, res) => {
  if (!req.storeId) return res.status(400).json({ error: "Store not found" });
  const id = Number(req.params.id);
  const body = req.body;
  try {
    const { rows } = await query(
      `UPDATE products SET
        category_id = $1, name = $2, description = $3, price = $4,
        images = $5, sizes = $6, colors = $7, in_stock = $8, featured = $9, updated_at = NOW()
       WHERE id = $10 AND store_id = $11 RETURNING *`,
      [
        body.categoryId || null,
        body.name,
        body.description || "",
        body.price,
        body.images || [],
        body.variants?.sizes || [],
        body.variants?.colors || [],
        body.inStock ?? true,
        body.featured ?? false,
        id,
        req.storeId,
      ],
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(toProduct(rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDashboardProduct = async (req, res) => {
  if (!req.storeId) return res.status(400).json({ error: "Store not found" });
  const id = Number(req.params.id);
  try {
    const { rows } = await query(
      "DELETE FROM products WHERE id = $1 AND store_id = $2 RETURNING id",
      [id, req.storeId],
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ─────────────────────────────── CATEGORIES ────────────────────────── */

export const listDashboardCategories = async (req, res) => {
  if (!req.storeId) return res.json([]);
  try {
    const { rows } = await query(
      "SELECT * FROM categories WHERE store_id = $1 ORDER BY id",
      [req.storeId],
    );
    res.json(
      rows.map((c) => ({ id: c.id, storeId: c.store_id, name: c.name })),
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createDashboardCategory = async (req, res) => {
  if (!req.storeId) return res.status(400).json({ error: "Store not found" });
  try {
    const { rows } = await query(
      "INSERT INTO categories (store_id, name) VALUES ($1, $2) RETURNING *",
      [req.storeId, req.body.name],
    );
    res
      .status(201)
      .json({ id: rows[0].id, storeId: rows[0].store_id, name: rows[0].name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDashboardCategory = async (req, res) => {
  if (!req.storeId) return res.status(400).json({ error: "Store not found" });
  const id = Number(req.params.id);
  try {
    const { rows } = await query(
      "DELETE FROM categories WHERE id = $1 AND store_id = $2 RETURNING id",
      [id, req.storeId],
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ─────────────────────────────── ORDERS ────────────────────────────── */

export const listDashboardOrders = async (req, res) => {
  if (!req.storeId) return res.json([]);
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(req.query.limit, 10) || 24),
  );
  try {
    const { rows } = await query(
      "SELECT * FROM orders WHERE store_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
      [req.storeId, limit, (page - 1) * limit],
    );
    res.json(rows.map(toOrder));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDashboardOrder = async (req, res) => {
  if (!req.storeId) return res.status(400).json({ error: "Store not found" });
  const id = Number(req.params.id);
  try {
    const { rows } = await query(
      "SELECT * FROM orders WHERE id = $1 AND store_id = $2 LIMIT 1",
      [id, req.storeId],
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(toOrder(rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDashboardOrderStatus = async (req, res) => {
  if (!req.storeId) return res.status(400).json({ error: "Store not found" });
  const id = Number(req.params.id);
  const allowedStatuses = new Set([
    "new",
    "contacted",
    "completed",
    "cancelled",
    "processing",
    "shipped",
    "delivered",
  ]);
  if (!allowedStatuses.has(req.body.status))
    return res.status(400).json({ error: "حالة الطلب غير صالحة" });
  try {
    const { rows } = await query(
      "UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 AND store_id = $3 RETURNING *",
      [req.body.status, id, req.storeId],
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(toOrder(rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ─────────────────────────────── STATS ─────────────────────────────── */

export const getDashboardStats = async (req, res) => {
  if (!req.storeId) {
    return res.json({
      totalOrders: 0,
      newOrders: 0,
      totalProducts: 0,
      totalRevenue: 0,
    });
  }
  try {
    const [prodRes, orderRes] = await Promise.all([
      query("SELECT COUNT(*) as count FROM products WHERE store_id = $1", [
        req.storeId,
      ]),
      query(
        `SELECT COUNT(*)::int AS total_orders,
                    COUNT(*) FILTER (WHERE status = 'new')::int AS new_orders,
                    COALESCE(SUM(total) FILTER (WHERE status != 'cancelled'), 0)::numeric AS total_revenue
             FROM orders WHERE store_id = $1`,
        [req.storeId],
      ),
    ]);
    const stats = orderRes.rows[0] || {};
    res.json({
      totalOrders: Number(stats.total_orders || 0),
      newOrders: Number(stats.new_orders || 0),
      totalProducts: parseInt(prodRes.rows[0].count, 10) || 0,
      totalRevenue: Number(stats.total_revenue || 0),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ─────────────────────────────── Helpers ────────────────────────────── */

function toProduct(row) {
  return {
    id: row.id,
    storeId: row.store_id,
    categoryId: row.category_id,
    name: row.name,
    description: row.description || "",
    price: Number(row.price),
    images: row.images || [],
    variants: { sizes: row.sizes || [], colors: row.colors || [] },
    inStock: row.in_stock,
    featured: row.featured,
    createdAt: row.created_at,
  };
}

function toOrder(row) {
  return {
    id: row.id,
    orderNumber: row.order_number || undefined,
    storeId: row.store_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerAddress: row.customer_address,
    notes: row.notes || "",
    items: row.items || [],
    total: Number(row.total),
    status: row.status,
    whatsappMessage: row.whatsapp_message || "",
    createdAt: row.created_at,
  };
}
