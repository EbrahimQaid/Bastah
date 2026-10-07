import { StoreModel } from "../models/storeModel.js";
import { ProductModel } from "../models/productModel.js";
import { CategoryModel } from "../models/categoryModel.js";
import { OrderModel } from "../models/orderModel.js";

/**
 * 📊 Dashboard Controller (MVC - Controller)
 * Handles merchant administrative dashboard operations
 */

/* ── STORE ── */

export const getDashboardStore = async (req, res) => {
  if (!req.storeId) return res.status(404).json({ error: "المتجر غير موجود" });
  try {
    const store = await StoreModel.findById(req.storeId);
    if (!store) return res.status(404).json({ error: "المتجر غير موجود" });
    return res.json(store);
  } catch (error) {
    console.error("[dashboardController.getDashboardStore]", error);
    return res.status(500).json({ error: error.message });
  }
};

export const updateDashboardStore = async (req, res) => {
  if (!req.storeId) return res.status(404).json({ error: "المتجر غير موجود" });
  try {
    const updated = await StoreModel.update(req.storeId, req.body);
    if (!updated) return res.status(404).json({ error: "المتجر غير موجود" });
    return res.json(StoreModel.mapStore(updated));
  } catch (error) {
    console.error("[dashboardController.updateDashboardStore]", error);
    return res.status(500).json({ error: error.message });
  }
};

export const initDashboardStore = async (req, res) => {
  if (req.storeId) {
    return res.status(409).json({ error: "لديك متجر مسجل بالفعل" });
  }

  const {
    name,
    slug,
    description,
    whatsappNumber,
    primaryColor,
    secondaryColor,
    fontFamily,
    shippingRate,
    defaultCurrency,
  } = req.body || {};

  if (!name?.trim()) {
    return res.status(400).json({ error: "اسم المتجر مطلوب" });
  }

  const generatedSlug = (slug || name || "store")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 50) || `store-${Date.now().toString(36)}`;

  try {
    const createdStore = await StoreModel.create({
      ownerId: req.userId,
      name: name.trim(),
      slug: generatedSlug,
      description: description || "",
      whatsappNumber: whatsappNumber || "",
      primaryColor: primaryColor || "#991B1B",
      secondaryColor: secondaryColor || "#DC2626",
      fontFamily: fontFamily || "Tajawal",
      shippingRate: Number(shippingRate) || 0,
      defaultCurrency: defaultCurrency || "SAR",
    });

    return res.status(201).json(StoreModel.mapStore(createdStore));
  } catch (error) {
    console.error("[dashboardController.initDashboardStore]", error);
    return res.status(500).json({ error: "تعذر إنشاء المتجر، يرجى المحاولة لاحقاً" });
  }
};

/* ── PRODUCTS ── */

export const listDashboardProducts = async (req, res) => {
  if (!req.storeId) return res.json([]);
  try {
    const products = await ProductModel.findAllByStore(req.storeId);
    return res.json(products);
  } catch (error) {
    console.error("[dashboardController.listDashboardProducts]", error);
    return res.status(500).json({ error: error.message });
  }
};

export const createDashboardProduct = async (req, res) => {
  if (!req.storeId) return res.status(400).json({ error: "المتجر غير موجود" });
  const body = req.body || {};
  try {
    const product = await ProductModel.create(req.storeId, {
      categoryId: body.categoryId || null,
      name: body.name || "",
      description: body.description || "",
      price: body.price,
      images: body.images || [],
      sizes: body.variants?.sizes || body.sizes || [],
      colors: body.variants?.colors || body.colors || [],
      inStock: body.inStock ?? true,
      featured: body.featured ?? false,
    });
    return res.status(201).json(product);
  } catch (error) {
    console.error("[dashboardController.createDashboardProduct]", error);
    return res.status(500).json({ error: error.message });
  }
};

export const updateDashboardProduct = async (req, res) => {
  if (!req.storeId) return res.status(400).json({ error: "المتجر غير موجود" });
  const id = Number(req.params.id);
  const body = req.body || {};
  try {
    const product = await ProductModel.update(req.storeId, id, {
      categoryId: body.categoryId || null,
      name: body.name || "",
      description: body.description || "",
      price: body.price,
      images: body.images || [],
      sizes: body.variants?.sizes || body.sizes || [],
      colors: body.variants?.colors || body.colors || [],
      inStock: body.inStock ?? true,
      featured: body.featured ?? false,
    });
    if (!product) return res.status(404).json({ error: "المنتج غير موجود" });
    return res.json(product);
  } catch (error) {
    console.error("[dashboardController.updateDashboardProduct]", error);
    return res.status(500).json({ error: error.message });
  }
};

export const deleteDashboardProduct = async (req, res) => {
  if (!req.storeId) return res.status(400).json({ error: "المتجر غير موجود" });
  const id = Number(req.params.id);
  try {
    await ProductModel.delete(req.storeId, id);
    return res.status(204).end();
  } catch (error) {
    console.error("[dashboardController.deleteDashboardProduct]", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ── CATEGORIES ── */

export const listDashboardCategories = async (req, res) => {
  if (!req.storeId) return res.json([]);
  try {
    const categories = await CategoryModel.findAllByStore(req.storeId);
    return res.json(categories);
  } catch (error) {
    console.error("[dashboardController.listDashboardCategories]", error);
    return res.status(500).json({ error: error.message });
  }
};

export const createDashboardCategory = async (req, res) => {
  if (!req.storeId) return res.status(400).json({ error: "المتجر غير موجود" });
  const { name } = req.body || {};
  if (!name?.trim()) {
    return res.status(400).json({ error: "اسم التصنيف مطلوب" });
  }
  try {
    const category = await CategoryModel.create(req.storeId, name);
    return res.status(201).json(category);
  } catch (error) {
    console.error("[dashboardController.createDashboardCategory]", error);
    return res.status(500).json({ error: error.message });
  }
};

export const deleteDashboardCategory = async (req, res) => {
  if (!req.storeId) return res.status(400).json({ error: "المتجر غير موجود" });
  const id = Number(req.params.id);
  try {
    await CategoryModel.delete(req.storeId, id);
    return res.status(204).end();
  } catch (error) {
    console.error("[dashboardController.deleteDashboardCategory]", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ── ORDERS ── */

export const listDashboardOrders = async (req, res) => {
  if (!req.storeId) return res.json([]);
  try {
    const orders = await OrderModel.findAllByStore(req.storeId);
    return res.json(orders);
  } catch (error) {
    console.error("[dashboardController.listDashboardOrders]", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getDashboardOrder = async (req, res) => {
  if (!req.storeId) return res.status(400).json({ error: "المتجر غير موجود" });
  const id = Number(req.params.id);
  try {
    const order = await OrderModel.findById(id, req.storeId);
    if (!order) return res.status(404).json({ error: "الطلب غير موجود" });
    return res.json(order);
  } catch (error) {
    console.error("[dashboardController.getDashboardOrder]", error);
    return res.status(500).json({ error: error.message });
  }
};

export const updateDashboardOrderStatus = async (req, res) => {
  if (!req.storeId) return res.status(400).json({ error: "المتجر غير موجود" });
  const id = Number(req.params.id);
  const { status } = req.body || {};
  const allowedStatuses = new Set([
    "new",
    "contacted",
    "completed",
    "cancelled",
    "processing",
    "shipped",
    "delivered",
  ]);

  if (!allowedStatuses.has(status)) {
    return res.status(400).json({ error: "حالة الطلب غير صالحة" });
  }

  try {
    const updated = await OrderModel.updateStatus(id, req.storeId, status);
    if (!updated) return res.status(404).json({ error: "الطلب غير موجود" });
    return res.json(updated);
  } catch (error) {
    console.error("[dashboardController.updateDashboardOrderStatus]", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ── STATS ── */

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
    const stats = await OrderModel.getStats(req.storeId);
    return res.json(stats);
  } catch (error) {
    console.error("[dashboardController.getDashboardStats]", error);
    return res.status(500).json({ error: error.message });
  }
};
