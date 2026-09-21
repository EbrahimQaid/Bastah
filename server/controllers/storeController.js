import { StoreModel } from "../models/storeModel.js";
import { ProductModel } from "../models/productModel.js";
import { CategoryModel } from "../models/categoryModel.js";
import { OrderModel } from "../models/orderModel.js";

// Single-store mode
const STORE_ID = Number(process.env.STORE_ID || 1);

/**
 * 🏬 Store Controller (MVC - Controller)
 * Handles customer storefront operations
 */

export const getStore = async (req, res) => {
  try {
    const store = await StoreModel.findById(STORE_ID);
    if (!store) {
      return res.status(404).json({ error: "المتجر غير موجود" });
    }
    return res.json(store);
  } catch (error) {
    console.error("[storeController.getStore]", error);
    return res.status(500).json({ error: error.message });
  }
};

export const listProducts = async (req, res) => {
  try {
    const products = await ProductModel.findAllByStore(STORE_ID, req.query);
    return res.json(products);
  } catch (error) {
    console.error("[storeController.listProducts]", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await ProductModel.findById(id, STORE_ID);
    if (!product) {
      return res.status(404).json({ error: "المنتج غير موجود" });
    }
    return res.json(product);
  } catch (error) {
    console.error("[storeController.getProduct]", error);
    return res.status(500).json({ error: error.message });
  }
};

export const listCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.findAllByStore(STORE_ID);
    return res.json(categories);
  } catch (error) {
    console.error("[storeController.listCategories]", error);
    return res.status(500).json({ error: error.message });
  }
};

export const createOrder = async (req, res) => {
  const { customerName, customerPhone, customerAddress, notes, items } = req.body || {};

  try {
    if (
      !customerName?.trim() ||
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 50
    ) {
      return res
        .status(400)
        .json({ error: "بيانات العميل وعناصر الطلب مطلوبة" });
    }

    const requestedItems = items.map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity),
      selectedSize: item.selectedSize || null,
      selectedColor: item.selectedColor || null,
    }));

    if (
      requestedItems.some(
        (item) =>
          !Number.isInteger(item.productId) ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          item.quantity > 100,
      )
    ) {
      return res.status(400).json({ error: "عناصر الطلب غير صالحة" });
    }

    const productIds = [
      ...new Set(requestedItems.map((item) => Number(item.productId))),
    ];

    const products = await ProductModel.findManyByIds(STORE_ID, productIds);
    const productById = new Map(
      (products || []).map((product) => [Number(product.id), product]),
    );

    // Verify every requested product exists and is in stock
    for (const item of requestedItems) {
      const product = productById.get(Number(item.productId));
      if (!product) {
        return res
          .status(400)
          .json({ error: `المنتج رقم ${item.productId} غير متوفر حالياً` });
      }

      const inStock = product.in_stock !== false;
      const trackInventory = Boolean(product.track_inventory);
      const stockQuantity = Number(product.stock_quantity ?? 999);

      if (!inStock || (trackInventory && stockQuantity < item.quantity)) {
        return res.status(409).json({
          error: `المنتج "${product.name}" نفد من المخزون أو الكمية غير كافية`,
        });
      }
    }

    const trustedItems = requestedItems.map((item) => {
      const product = productById.get(Number(item.productId));
      const imageUrl =
        Array.isArray(product.images) && product.images.length > 0
          ? product.images[0]
          : typeof product.images === "string" && product.images
            ? product.images
            : null;

      return {
        productId: Number(product.id),
        productName: product.name,
        price: Number(product.price),
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        imageUrl,
      };
    });

    const shippingRate = await StoreModel.getShippingRate(STORE_ID);
    const subtotal = trustedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const total = subtotal + shippingRate;

    const createdOrder = await OrderModel.createOrderTransaction(
      STORE_ID,
      {
        customerName,
        customerPhone,
        customerAddress,
        notes,
        subtotal,
        shippingAmount: shippingRate,
        total,
        whatsappMessage: `طلب جديد من ${customerName.trim()}`,
      },
      trustedItems,
    );

    return res.status(201).json(createdOrder);
  } catch (error) {
    console.error("[storeController.createOrder]", error);
    const status = error.statusCode || 500;
    return res.status(status).json({ error: error.message || "تعذر إتمام الطلب" });
  }
};
