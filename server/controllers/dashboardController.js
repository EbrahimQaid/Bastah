import { query, isDbReady } from '../lib/db.js';
import { STORE, PRODUCTS, CATEGORIES, ORDERS } from '../models/data.js';

/* ── Helper: Map db store to frontend format ── */
function mapStore(row) {
  return {
    id:              row.id,
    slug:            row.slug,
    name:            row.name,
    description:     row.description || '',
    coverImage:      row.cover_image || '',
    logoImage:       row.logo_image || '',
    primaryColor:    row.primary_color || '#7C3AED',
    secondaryColor:  row.secondary_color || '#A78BFA',
    fontFamily:      row.font_family || 'Tajawal',
    currencies:      JSON.stringify(row.currencies || ['SAR']),
    defaultCurrency: row.default_currency || 'SAR',
    themeConfig:     row.theme_config ? JSON.stringify(row.theme_config) : null,
    shippingRate:    Number(row.shipping_rate || 0),
    whatsappNumber:  row.whatsapp_number || '',
    createdAt:       row.created_at,
  };
}

/* ─────────────────────────────── STORE ─────────────────────────────── */

export const getDashboardStore = async (_, res) => {
  if (!isDbReady()) return res.json(STORE);
  try {
    const { rows } = await query('SELECT * FROM stores WHERE id = $1 LIMIT 1', [1]);
    if (rows.length === 0) return res.json(STORE);
    res.json(mapStore(rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDashboardStore = async (req, res) => {
  const body = req.body;
  const row = {
    name:             body.name,
    description:      body.description || '',
    cover_image:      body.coverImage || '',
    logo_image:       body.logoImage || '',
    primary_color:    body.primaryColor || '#7C3AED',
    secondary_color:  body.secondaryColor || '#A78BFA',
    font_family:      body.fontFamily || 'Tajawal',
    currencies:       body.currencies ? JSON.parse(body.currencies) : ['SAR'],
    default_currency: body.defaultCurrency || 'SAR',
    theme_config:     body.themeConfig ? JSON.parse(body.themeConfig) : null,
    shipping_rate:    Number(body.shippingRate || 0),
    whatsapp_number:  body.whatsappNumber || '',
  };

  if (!isDbReady()) {
    Object.assign(STORE, body);
    return res.json(STORE);
  }

  try {
    const { rows } = await query(
      `UPDATE stores SET
        name = $1, description = $2, cover_image = $3, logo_image = $4,
        primary_color = $5, secondary_color = $6, font_family = $7,
        currencies = $8, default_currency = $9, theme_config = $10,
        shipping_rate = $11, whatsapp_number = $12
       WHERE id = 1 RETURNING *`,
      [
        row.name, row.description, row.cover_image, row.logo_image,
        row.primary_color, row.secondary_color, row.font_family,
        row.currencies, row.default_currency, row.theme_config,
        row.shipping_rate, row.whatsapp_number
      ]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Store not found' });
    res.json(mapStore(rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const initDashboardStore = (req, res) => res.status(201).json(STORE);

/* ─────────────────────────────── PRODUCTS ──────────────────────────── */

export const listDashboardProducts = async (_, res) => {
  if (!isDbReady()) return res.json(PRODUCTS);
  try {
    const { rows } = await query('SELECT * FROM products WHERE store_id = $1 ORDER BY created_at DESC', [1]);
    res.json(rows.map(toProduct));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createDashboardProduct = async (req, res) => {
  if (!isDbReady()) {
    const p = { id: PRODUCTS.length + 1, storeId: 1, createdAt: new Date().toISOString(), ...req.body };
    PRODUCTS.push(p);
    return res.status(201).json(p);
  }

  const body = req.body;
  try {
    const { rows } = await query(
      `INSERT INTO products (store_id, category_id, name, description, price, images, sizes, colors, in_stock, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        1,
        body.categoryId || null,
        body.name,
        body.description || '',
        body.price,
        body.images || [],
        body.variants?.sizes || [],
        body.variants?.colors || [],
        body.inStock ?? true,
        body.featured ?? false
      ]
    );
    res.status(201).json(toProduct(rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDashboardProduct = async (req, res) => {
  const id = Number(req.params.id);
  if (!isDbReady()) {
    const p = PRODUCTS.find(p => p.id === id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    Object.assign(p, req.body);
    return res.json(p);
  }

  const body = req.body;
  try {
    const { rows } = await query(
      `UPDATE products SET
        category_id = $1, name = $2, description = $3, price = $4,
        images = $5, sizes = $6, colors = $7, in_stock = $8, featured = $9
       WHERE id = $10 RETURNING *`,
      [
        body.categoryId || null,
        body.name,
        body.description || '',
        body.price,
        body.images || [],
        body.variants?.sizes || [],
        body.variants?.colors || [],
        body.inStock ?? true,
        body.featured ?? false,
        id
      ]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(toProduct(rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDashboardProduct = async (req, res) => {
  const id = Number(req.params.id);
  if (!isDbReady()) {
    const i = PRODUCTS.findIndex(p => p.id === id);
    if (i !== -1) PRODUCTS.splice(i, 1);
    return res.status(204).end();
  }
  try {
    await query('DELETE FROM products WHERE id = $1', [id]);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ─────────────────────────────── CATEGORIES ────────────────────────── */

export const listDashboardCategories = async (_, res) => {
  if (!isDbReady()) return res.json(CATEGORIES);
  try {
    const { rows } = await query('SELECT * FROM categories WHERE store_id = $1 ORDER BY id', [1]);
    res.json(rows.map(c => ({ id: c.id, storeId: c.store_id, name: c.name })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createDashboardCategory = async (req, res) => {
  if (!isDbReady()) {
    const c = { id: CATEGORIES.length + 1, storeId: 1, ...req.body };
    CATEGORIES.push(c);
    return res.status(201).json(c);
  }
  try {
    const { rows } = await query(
      'INSERT INTO categories (store_id, name) VALUES ($1, $2) RETURNING *',
      [1, req.body.name]
    );
    res.status(201).json({ id: rows[0].id, storeId: rows[0].store_id, name: rows[0].name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDashboardCategory = async (req, res) => {
  const id = Number(req.params.id);
  if (!isDbReady()) {
    const i = CATEGORIES.findIndex(c => c.id === id);
    if (i !== -1) CATEGORIES.splice(i, 1);
    return res.status(204).end();
  }
  try {
    await query('DELETE FROM categories WHERE id = $1', [id]);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ─────────────────────────────── ORDERS ────────────────────────────── */

export const listDashboardOrders = async (_, res) => {
  if (!isDbReady()) return res.json(ORDERS);
  try {
    const { rows } = await query('SELECT * FROM orders WHERE store_id = $1 ORDER BY created_at DESC', [1]);
    res.json(rows.map(toOrder));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDashboardOrder = async (req, res) => {
  const id = Number(req.params.id);
  if (!isDbReady()) {
    const o = ORDERS.find(o => o.id === id);
    return o ? res.json(o) : res.status(404).json({ error: 'Not found' });
  }
  try {
    const { rows } = await query('SELECT * FROM orders WHERE id = $1 LIMIT 1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(toOrder(rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDashboardOrderStatus = async (req, res) => {
  const id = Number(req.params.id);
  if (!isDbReady()) {
    const o = ORDERS.find(o => o.id === id);
    if (!o) return res.status(404).json({ error: 'Not found' });
    o.status = req.body.status;
    return res.json(o);
  }
  try {
    const { rows } = await query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [req.body.status, id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(toOrder(rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ─────────────────────────────── STATS ─────────────────────────────── */

export const getDashboardStats = async (_, res) => {
  if (!isDbReady()) {
    return res.json({
      totalOrders:   ORDERS.length,
      newOrders:     ORDERS.filter(o => o.status === 'new').length,
      totalProducts: PRODUCTS.length,
      totalRevenue:  ORDERS.reduce((s, o) => s + o.total, 0),
    });
  }
  try {
    const [prodRes, orderRes] = await Promise.all([
      query('SELECT COUNT(*) as count FROM products WHERE store_id = $1', [1]),
      query('SELECT status, total FROM orders WHERE store_id = $1', [1]),
    ]);
    const orderRows = orderRes.rows || [];
    res.json({
      totalOrders:   orderRows.length,
      newOrders:     orderRows.filter(o => o.status === 'new').length,
      totalProducts: parseInt(prodRes.rows[0].count, 10) || 0,
      totalRevenue:  orderRows.reduce((s, o) => s + Number(o.total), 0),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ─────────────────────────────── Helpers ────────────────────────────── */

function toProduct(row) {
  return {
    id:          row.id,
    storeId:     row.store_id,
    categoryId:  row.category_id,
    name:        row.name,
    description: row.description || '',
    price:       Number(row.price),
    images:      row.images || [],
    variants:    { sizes: row.sizes || [], colors: row.colors || [] },
    inStock:     row.in_stock,
    featured:    row.featured,
    createdAt:   row.created_at,
  };
}

function toOrder(row) {
  return {
    id:              row.id,
    storeId:         row.store_id,
    customerName:    row.customer_name,
    customerPhone:   row.customer_phone,
    customerAddress: row.customer_address,
    notes:           row.notes || '',
    items:           row.items || [],
    total:           Number(row.total),
    status:          row.status,
    whatsappMessage: row.whatsapp_message || '',
    createdAt:       row.created_at,
  };
}
