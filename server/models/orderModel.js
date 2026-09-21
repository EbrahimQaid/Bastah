import { query, withTransaction } from "../lib/db.js";
import { ProductModel } from "./productModel.js";

/**
 * 🛒 Order Model (MVC - Model)
 * Handles data access and business logic for Orders and Order Items
 */
export class OrderModel {
  static mapOrder(row) {
    if (!row) return null;
    let items = row.items || [];
    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch {
        items = [];
      }
    }
    return {
      id: row.id,
      storeId: row.store_id || row.storeId,
      customerName: row.customer_name || row.customerName || "",
      customerPhone: row.customer_phone || row.customerPhone || "",
      customerAddress: row.customer_address || row.customerAddress || "",
      notes: row.notes || "",
      items,
      subtotal: Number(row.subtotal || 0),
      shippingAmount: Number(row.shipping_amount || 0),
      total: Number(row.total || 0),
      status: row.status || "new",
      whatsappMessage: row.whatsapp_message || row.whatsappMessage || "",
      createdAt: row.created_at || row.createdAt || new Date().toISOString(),
      orderNumber: row.order_number || row.orderNumber || undefined,
    };
  }

  static async findAllByStore(storeId) {
    const { rows } = await query(
      "SELECT * FROM orders WHERE store_id = $1 ORDER BY created_at DESC",
      [storeId],
    );
    return (rows || []).map((r) => this.mapOrder(r));
  }

  static async findById(orderId, storeId) {
    const { rows } = await query(
      "SELECT * FROM orders WHERE id = $1 AND store_id = $2 LIMIT 1",
      [Number(orderId), storeId],
    );
    if (!rows || rows.length === 0) return null;
    return this.mapOrder(rows[0]);
  }

  static async createOrderTransaction(storeId, orderData, trustedItems) {
    return await withTransaction(async (client) => {
      const {
        customerName,
        customerPhone,
        customerAddress,
        notes,
        subtotal,
        shippingAmount,
        total,
        whatsappMessage,
      } = orderData;

      const orderResult = await client.query(
        `INSERT INTO orders (store_id, customer_name, customer_phone, customer_address, notes, items, subtotal, shipping_amount, total, status, whatsapp_message)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'new', $10)
         RETURNING *`,
        [
          storeId,
          customerName.trim(),
          customerPhone || null,
          customerAddress || null,
          notes || "",
          JSON.stringify(trustedItems),
          subtotal,
          shippingAmount,
          total,
          whatsappMessage || `طلب جديد من ${customerName.trim()}`,
        ],
      );

      const createdOrder = orderResult?.rows?.[0] || {
        id: Math.floor(1000 + Math.random() * 9000),
        store_id: storeId,
        customer_name: customerName.trim(),
        customer_phone: customerPhone || null,
        customer_address: customerAddress || null,
        notes: notes || "",
        items: trustedItems,
        subtotal,
        shipping_amount: shippingAmount,
        total,
        status: "new",
        whatsapp_message: whatsappMessage || `طلب جديد من ${customerName.trim()}`,
        created_at: new Date().toISOString(),
      };

      for (const item of trustedItems) {
        await client.query(
          `INSERT INTO order_items (order_id, store_id, product_id, product_name, product_image, quantity, unit_price, total_price)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            createdOrder.id,
            storeId,
            item.productId,
            item.productName,
            item.imageUrl,
            item.quantity,
            item.price,
            item.price * item.quantity,
          ],
        );

        await ProductModel.decrementStock(client, item.productId, item.quantity);
      }

      return this.mapOrder(createdOrder);
    });
  }

  static async updateStatus(orderId, storeId, status) {
    const { rows } = await query(
      "UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 AND store_id = $3 RETURNING *",
      [status, Number(orderId), storeId],
    );
    if (!rows || rows.length === 0) return null;
    return this.mapOrder(rows[0]);
  }

  static async getStats(storeId) {
    const [ordersResult, newResult, prodsResult, revResult] = await Promise.all([
      query("SELECT COUNT(*) FROM orders WHERE store_id = $1", [storeId]),
      query(
        "SELECT COUNT(*) FROM orders WHERE store_id = $1 AND status = 'new'",
        [storeId],
      ),
      query(
        "SELECT COUNT(*) FROM products WHERE store_id = $1 AND is_active = true",
        [storeId],
      ),
      query(
        "SELECT COALESCE(SUM(total), 0) AS revenue FROM orders WHERE store_id = $1 AND status != 'cancelled'",
        [storeId],
      ),
    ]);

    return {
      totalOrders: Number(ordersResult.rows[0]?.count || 0),
      newOrders: Number(newResult.rows[0]?.count || 0),
      totalProducts: Number(prodsResult.rows[0]?.count || 0),
      totalRevenue: Number(revResult.rows[0]?.revenue || 0),
    };
  }
}
