import { query, withTransaction } from "../lib/db.js";

// Single-store mode: always use this store
const STORE_ID = Number(process.env.STORE_ID || 1);

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

/* ── Store ── */
export const getStore = async (req, res) => {
  try {
    const { rows } = await query("SELECT * FROM stores WHERE id = $1 LIMIT 1", [
      STORE_ID,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Store not found" });
    res.json(mapStore(rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── Products ── */
export const listProducts = async (req, res) => {
  const { categoryId, search, minPrice, maxPrice } = req.query;
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(req.query.limit, 10) || 24),
  );

  try {
    let sql = "SELECT * FROM products WHERE store_id = $1 AND is_active = true";
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
      params.push(`%${String(search).slice(0, 100)}%`);
      sql += ` AND (name ILIKE $${params.length} OR name_ar ILIKE $${params.length})`;
    }

    params.push(limit, (page - 1) * limit);
    sql += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const { rows } = await query(sql, params);
    res.setHeader("X-Page", String(page));
    res.setHeader("X-Page-Size", String(limit));
    res.json(rows.map(toProduct));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await query(
      "SELECT * FROM products WHERE id = $1 AND store_id = $2 LIMIT 1",
      [Number(id), STORE_ID],
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Product not found" });
    res.json(toProduct(rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── Categories ── */
export const listCategories = async (req, res) => {
  try {
    const { rows } = await query(
      "SELECT * FROM categories WHERE store_id = $1 AND is_active = true ORDER BY sort_order ASC",
      [STORE_ID],
    );
    res.json(
      rows.map((c) => ({ id: c.id, storeId: c.store_id, name: c.name })),
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ── Orders ── */
export const createOrder = async (req, res) => {
  const { customerName, customerPhone, customerAddress, notes, items } =
    req.body;

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

    const { rows } = await withTransaction(async (client) => {
      const productIds = [
        ...new Set(requestedItems.map((item) => item.productId)),
      ];
      const { rows: products } = await client.query(
        `SELECT id, name, price, images, stock_quantity, track_inventory, in_stock
         FROM products WHERE store_id = $1 AND id = ANY($2::int[]) AND is_active = true FOR UPDATE`,
        [STORE_ID, productIds],
      );
      if (products.length !== productIds.length) {
        const error = new Error("Some products are unavailable");
        error.statusCode = 400;
        throw error;
      }

      const productById = new Map(
        products.map((product) => [product.id, product]),
      );
      const trustedItems = requestedItems.map((item) => {
        const product = productById.get(item.productId);
        if (
          !product.in_stock ||
          (product.track_inventory && product.stock_quantity < item.quantity)
        ) {
          const error = new Error("Some products are out of stock");
          error.statusCode = 409;
          throw error;
        }
        return {
          productId: product.id,
          productName: product.name,
          price: Number(product.price),
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
          imageUrl: product.images?.[0] || null,
        };
      });
      const { rows: stores } = await client.query(
        "SELECT shipping_rate FROM stores WHERE id = $1 LIMIT 1",
        [STORE_ID],
      );
      const shippingRate = Number(stores[0]?.shipping_rate || 0);
      const subtotal = trustedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const total = subtotal + shippingRate;
      const orderResult = await client.query(
        `INSERT INTO orders (store_id, customer_name, customer_phone, customer_address, notes, items, subtotal, shipping_amount, total, status, whatsapp_message)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'new', $10) RETURNING *`,
        [
          STORE_ID,
          customerName.trim(),
          customerPhone || null,
          customerAddress || null,
          notes || "",
          JSON.stringify(trustedItems),
          subtotal,
          shippingRate,
          total,
          `طلب جديد من ${customerName.trim()}`,
        ],
      );
      for (const item of trustedItems) {
        await client.query(
          `INSERT INTO order_items (order_id, store_id, product_id, product_name, product_image, quantity, unit_price, total_price)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            orderResult.rows[0].id,
            STORE_ID,
            item.productId,
            item.productName,
            item.imageUrl,
            item.quantity,
            item.price,
            item.price * item.quantity,
          ],
        );
        await client.query(
          `UPDATE products SET stock_quantity = stock_quantity - $1, in_stock = CASE WHEN track_inventory AND stock_quantity - $1 <= 0 THEN false ELSE in_stock END WHERE id = $2 AND track_inventory = true`,
          [item.quantity, item.productId],
        );
      }
      return orderResult;
    });

    res.status(201).json(toOrder(rows[0]));
  } catch (error) {
    if (error.statusCode)
      return res.status(error.statusCode).json({ error: error.message });
    console.error("[createOrder]", error);
    res.status(500).json({ error: "تعذر إنشاء الطلب" });
  }
};

/* ── Helpers ── */
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
    orderNumber: row.order_number || undefined,
  };
}
