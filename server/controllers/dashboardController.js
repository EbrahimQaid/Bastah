import { STORE, PRODUCTS, CATEGORIES, ORDERS } from '../models/data.js';

export const getDashboardStore = (_, res) => res.json(STORE);

export const updateDashboardStore = (req, res) => {
  Object.assign(STORE, req.body);
  res.json(STORE);
};

export const initDashboardStore = (req, res) => res.status(201).json(STORE);

export const listDashboardProducts = (_, res) => res.json(PRODUCTS);

export const createDashboardProduct = (req, res) => {
  const p = {
    id: PRODUCTS.length + 1,
    storeId: 1,
    createdAt: new Date().toISOString(),
    ...req.body
  };
  PRODUCTS.push(p);
  res.status(201).json(p);
};

export const updateDashboardProduct = (req, res) => {
  const p = PRODUCTS.find(p => p.id === Number(req.params.id));
  if (!p) return res.status(404).json({ error: 'Not found' });
  Object.assign(p, req.body);
  res.json(p);
};

export const deleteDashboardProduct = (req, res) => {
  const i = PRODUCTS.findIndex(p => p.id === Number(req.params.id));
  if (i !== -1) PRODUCTS.splice(i, 1);
  res.status(204).end();
};

export const listDashboardCategories = (_, res) => res.json(CATEGORIES);

export const createDashboardCategory = (req, res) => {
  const c = { id: CATEGORIES.length + 1, storeId: 1, ...req.body };
  CATEGORIES.push(c);
  res.status(201).json(c);
};

export const deleteDashboardCategory = (req, res) => {
  const i = CATEGORIES.findIndex(c => c.id === Number(req.params.id));
  if (i !== -1) CATEGORIES.splice(i, 1);
  res.status(204).end();
};

export const listDashboardOrders = (_, res) => res.json(ORDERS);

export const getDashboardOrder = (req, res) => {
  const o = ORDERS.find(o => o.id === Number(req.params.id));
  o ? res.json(o) : res.status(404).json({ error: 'Not found' });
};

export const updateDashboardOrderStatus = (req, res) => {
  const o = ORDERS.find(o => o.id === Number(req.params.id));
  if (!o) return res.status(404).json({ error: 'Not found' });
  o.status = req.body.status;
  res.json(o);
};

export const getDashboardStats = (_, res) => res.json({
  totalOrders:   ORDERS.length,
  newOrders:     ORDERS.filter(o => o.status === 'new').length,
  totalProducts: PRODUCTS.length,
  totalRevenue:  ORDERS.reduce((s, o) => s + o.total, 0),
});
