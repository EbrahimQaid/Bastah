import { STORE, PRODUCTS, CATEGORIES, ORDERS, incrementOrderId } from '../models/data.js';

export const getStore = (req, res) => {
  if (req.params.slug !== STORE.slug) {
    return res.status(404).json({ error: 'Store not found' });
  }
  res.json(STORE);
};

export const listProducts = (req, res) => {
  let products = [...PRODUCTS];
  const { categoryId, search, minPrice, maxPrice } = req.query;
  if (categoryId) products = products.filter(p => p.categoryId === Number(categoryId));
  if (search)     products = products.filter(p => p.name.includes(search));
  if (minPrice)   products = products.filter(p => p.price >= Number(minPrice));
  if (maxPrice)   products = products.filter(p => p.price <= Number(maxPrice));
  res.json(products);
};

export const getProduct = (req, res) => {
  const product = PRODUCTS.find(p => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
};

export const listCategories = (req, res) => {
  res.json(CATEGORIES);
};

export const createOrder = (req, res) => {
  const { customerName, customerPhone, customerAddress, notes, items } = req.body;
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const order = {
    id: incrementOrderId(), storeId: 1, customerName, customerPhone,
    customerAddress, notes, items, total,
    status: 'new',
    whatsappMessage: `طلب جديد من ${customerName}`,
    createdAt: new Date().toISOString(),
  };
  ORDERS.push(order);
  res.status(201).json(order);
};
