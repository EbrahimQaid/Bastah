import { supabase, isSupabaseReady } from '../lib/supabase.js';
import { STORE, PRODUCTS, CATEGORIES, ORDERS, incrementOrderId } from '../models/data.js';

/* ── Store ── */
export const getStore = async (req, res) => {
  if (req.params.slug !== STORE.slug)
    return res.status(404).json({ error: 'Store not found' });
  res.json(STORE);
};

/* ── Products ── */
export const listProducts = async (req, res) => {
  if (!isSupabaseReady()) {
    let products = [...PRODUCTS];
    const { categoryId, search, minPrice, maxPrice } = req.query;
    if (categoryId) products = products.filter(p => p.categoryId === Number(categoryId));
    if (search)     products = products.filter(p => p.name.includes(search));
    if (minPrice)   products = products.filter(p => p.price >= Number(minPrice));
    if (maxPrice)   products = products.filter(p => p.price <= Number(maxPrice));
    return res.json(products);
  }

  let query = supabase.from('products').select('*').order('created_at', { ascending: false });
  const { categoryId, search, minPrice, maxPrice } = req.query;
  if (categoryId) query = query.eq('category_id', Number(categoryId));
  if (search)     query = query.ilike('name', `%${search}%`);
  if (minPrice)   query = query.gte('price', Number(minPrice));
  if (maxPrice)   query = query.lte('price', Number(maxPrice));

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(toProduct));
};

export const getProduct = async (req, res) => {
  if (!isSupabaseReady()) {
    const product = PRODUCTS.find(p => p.id === Number(req.params.id));
    return product ? res.json(product) : res.status(404).json({ error: 'Product not found' });
  }
  const { data, error } = await supabase
    .from('products').select('*').eq('id', Number(req.params.id)).single();
  if (error) return res.status(404).json({ error: 'Product not found' });
  res.json(toProduct(data));
};

/* ── Categories ── */
export const listCategories = async (req, res) => {
  if (!isSupabaseReady()) return res.json(CATEGORIES);
  const { data, error } = await supabase.from('categories').select('*').order('id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(c => ({ id: c.id, storeId: c.store_id, name: c.name })));
};

/* ── Orders ── */
export const createOrder = async (req, res) => {
  const { customerName, customerPhone, customerAddress, notes, items } = req.body;
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (!isSupabaseReady()) {
    const order = {
      id: incrementOrderId(), storeId: 1, customerName, customerPhone,
      customerAddress, notes, items, total,
      status: 'new',
      whatsappMessage: `طلب جديد من ${customerName}`,
      createdAt: new Date().toISOString(),
    };
    ORDERS.push(order);
    return res.status(201).json(order);
  }

  const row = {
    store_id:         1,
    customer_name:    customerName,
    customer_phone:   customerPhone,
    customer_address: customerAddress,
    notes:            notes || '',
    items:            items,
    total:            total,
    status:           'new',
    whatsapp_message: `طلب جديد من ${customerName}`,
  };

  const { data, error } = await supabase.from('orders').insert(row).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(toOrder(data));
};

/* ── Helpers ── */
function toProduct(row) {
  return {
    id:          row.id,
    storeId:     row.store_id,
    categoryId:  row.category_id,
    name:        row.name,
    description: row.description,
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
    notes:           row.notes,
    items:           row.items || [],
    total:           Number(row.total),
    status:          row.status,
    whatsappMessage: row.whatsapp_message,
    createdAt:       row.created_at,
  };
}
