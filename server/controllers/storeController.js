import { query } from '../lib/db.js';

// Single-store mode: always use this store
const STORE_ID = Number(process.env.STORE_ID || 1);

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

/* ── Store ── */
export const getStore = async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM stores WHERE id = $1 LIMIT 1', [STORE_ID]);
    if (rows.length === 0) return res.status(404).json({ error: 'Store not found' });
    res.json(mapStore(rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── Products ── */
export const listProducts = async (req, res) => {
  const { categoryId, search, minPrice, maxPrice } = req.query;

  try {
    let sql = 'SELECT * FROM products WHERE store_id = $1 AND is_active = true';
    const params = [STORE_ID];

    if (categoryId) {
      params.push(Number(categoryId));
      sql += ` AND category_id = $${params.length}`;
    }
    if (minPrice) {
      params.push(Number(minPrice));
      sql += ` AND price >= $${params.length}`;
    }
    if (maxPrice) {
      params.push(Number(maxPrice));
      sql += ` AND price <= $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND name ILIKE $${params.length}`;
    }

    sql += ' ORDER BY created_at DESC';

    const { rows } = await query(sql, params);
    res.json(rows.map(toProduct));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await query(
      'SELECT * FROM products WHERE id = $1 AND store_id = $2 LIMIT 1',
      [Number(id), STORE_ID]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(toProduct(rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── Categories ── */
export const listCategories = async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM categories WHERE store_id = $1 AND is_active = true ORDER BY sort_order ASC',
      [STORE_ID]
    );
    res.json(rows.map(c => ({ id: c.id, storeId: c.store_id, name: c.name })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── Orders ── */
export const createOrder = async (req, res) => {
  const { customerName, customerPhone, customerAddress, notes, items } = req.body;

  try {
    const { rows: storeRows } = await query('SELECT shipping_rate FROM stores WHERE id = $1 LIMIT 1', [STORE_ID]);
    if (storeRows.length === 0) return res.status(404).json({ error: 'Store not found' });

    const shippingRate = Number(storeRows[0].shipping_rate || 0);
    const subtotal = items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0);
    const total = subtotal + shippingRate;

    const { rows } = await query(
      `INSERT INTO orders (store_id, customer_name, customer_phone, customer_address, notes, items, total, status, whatsapp_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        STORE_ID,
        customerName,
        customerPhone,
        customerAddress,
        notes || '',
        JSON.stringify(items),
        total,
        'new',
        `طلب جديد من ${customerName}`
      ]
    );

    res.status(201).json(toOrder(rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── Helpers ── */
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

