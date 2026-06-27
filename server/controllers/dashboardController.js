import { supabase, isSupabaseReady } from '../lib/supabase.js';
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
  if (!isSupabaseReady()) return res.json(STORE);
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', 1)
    .single();

  if (error || !data) return res.json(STORE);
  res.json(mapStore(data));
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

  if (!isSupabaseReady()) {
    Object.assign(STORE, body);
    return res.json(STORE);
  }

  const { data, error } = await supabase
    .from('stores')
    .update(row)
    .eq('id', 1)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(mapStore(data));
};

export const initDashboardStore = (req, res) => res.status(201).json(STORE);

/* ─────────────────────────────── PRODUCTS ──────────────────────────── */

export const listDashboardProducts = async (_, res) => {
  if (!isSupabaseReady()) return res.json(PRODUCTS);
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', 1)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(toProduct));
};

export const createDashboardProduct = async (req, res) => {
  if (!isSupabaseReady()) {
    const p = { id: PRODUCTS.length + 1, storeId: 1, createdAt: new Date().toISOString(), ...req.body };
    PRODUCTS.push(p);
    return res.status(201).json(p);
  }

  const body = req.body;
  const row = {
    store_id:    1,
    category_id: body.categoryId || null,
    name:        body.name,
    description: body.description || '',
    price:       body.price,
    images:      body.images || [],
    sizes:       body.variants?.sizes || [],
    colors:      body.variants?.colors || [],
    in_stock:    body.inStock ?? true,
    featured:    body.featured ?? false,
  };

  const { data, error } = await supabase.from('products').insert(row).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(toProduct(data));
};

export const updateDashboardProduct = async (req, res) => {
  const id = Number(req.params.id);
  if (!isSupabaseReady()) {
    const p = PRODUCTS.find(p => p.id === id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    Object.assign(p, req.body);
    return res.json(p);
  }

  const body = req.body;
  const row = {
    category_id: body.categoryId || null,
    name:        body.name,
    description: body.description || '',
    price:       body.price,
    images:      body.images || [],
    sizes:       body.variants?.sizes || [],
    colors:      body.variants?.colors || [],
    in_stock:    body.inStock ?? true,
    featured:    body.featured ?? false,
  };

  const { data, error } = await supabase
    .from('products')
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(toProduct(data));
};

export const deleteDashboardProduct = async (req, res) => {
  const id = Number(req.params.id);
  if (!isSupabaseReady()) {
    const i = PRODUCTS.findIndex(p => p.id === id);
    if (i !== -1) PRODUCTS.splice(i, 1);
    return res.status(204).end();
  }
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
};

/* ─────────────────────────────── CATEGORIES ────────────────────────── */

export const listDashboardCategories = async (_, res) => {
  if (!isSupabaseReady()) return res.json(CATEGORIES);
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', 1)
    .order('id');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(c => ({ id: c.id, storeId: c.store_id, name: c.name })));
};

export const createDashboardCategory = async (req, res) => {
  if (!isSupabaseReady()) {
    const c = { id: CATEGORIES.length + 1, storeId: 1, ...req.body };
    CATEGORIES.push(c);
    return res.status(201).json(c);
  }
  const { data, error } = await supabase
    .from('categories')
    .insert({ store_id: 1, name: req.body.name })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ id: data.id, storeId: data.store_id, name: data.name });
};

export const deleteDashboardCategory = async (req, res) => {
  const id = Number(req.params.id);
  if (!isSupabaseReady()) {
    const i = CATEGORIES.findIndex(c => c.id === id);
    if (i !== -1) CATEGORIES.splice(i, 1);
    return res.status(204).end();
  }
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
};

/* ─────────────────────────────── ORDERS ────────────────────────────── */

export const listDashboardOrders = async (_, res) => {
  if (!isSupabaseReady()) return res.json(ORDERS);
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('store_id', 1)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(toOrder));
};

export const getDashboardOrder = async (req, res) => {
  const id = Number(req.params.id);
  if (!isSupabaseReady()) {
    const o = ORDERS.find(o => o.id === id);
    return o ? res.json(o) : res.status(404).json({ error: 'Not found' });
  }
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Not found' });
  res.json(toOrder(data));
};

export const updateDashboardOrderStatus = async (req, res) => {
  const id = Number(req.params.id);
  if (!isSupabaseReady()) {
    const o = ORDERS.find(o => o.id === id);
    if (!o) return res.status(404).json({ error: 'Not found' });
    o.status = req.body.status;
    return res.json(o);
  }
  const { data, error } = await supabase
    .from('orders')
    .update({ status: req.body.status })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(toOrder(data));
};

/* ─────────────────────────────── STATS ─────────────────────────────── */

export const getDashboardStats = async (_, res) => {
  if (!isSupabaseReady()) {
    return res.json({
      totalOrders:   ORDERS.length,
      newOrders:     ORDERS.filter(o => o.status === 'new').length,
      totalProducts: PRODUCTS.length,
      totalRevenue:  ORDERS.reduce((s, o) => s + o.total, 0),
    });
  }
  const [products, orders] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('store_id', 1),
    supabase.from('orders').select('status, total').eq('store_id', 1),
  ]);
  const orderRows = orders.data || [];
  res.json({
    totalOrders:   orderRows.length,
    newOrders:     orderRows.filter(o => o.status === 'new').length,
    totalProducts: products.count || 0,
    totalRevenue:  orderRows.reduce((s, o) => s + Number(o.total), 0),
  });
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
