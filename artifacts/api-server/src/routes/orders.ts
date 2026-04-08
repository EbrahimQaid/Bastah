import { Router, type IRouter } from "express";
import { eq, count, sum, sql } from "drizzle-orm";
import { db, ordersTable, storesTable } from "@workspace/db";
import {
  CreateOrderParams,
  CreateOrderBody,
  GetDashboardOrderParams,
  UpdateDashboardOrderStatusParams,
  UpdateDashboardOrderStatusBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

type OrderItem = {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
};

function mapOrder(o: typeof ordersTable.$inferSelect) {
  const items = o.items as OrderItem[];
  return {
    id: o.id,
    storeId: o.storeId,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    customerAddress: o.customerAddress,
    notes: o.notes ?? null,
    items: items ?? [],
    total: Number(o.total),
    status: o.status as "new" | "contacted" | "completed",
    whatsappMessage: o.whatsappMessage,
    createdAt: o.createdAt.toISOString(),
  };
}

function buildWhatsappMessage(storeName: string, items: OrderItem[], total: number, customerName: string, address: string, notes?: string | null): string {
  const lines = [
    `New Order from ${storeName}`,
    ``,
    `Customer: ${customerName}`,
    `Address: ${address}`,
    notes ? `Notes: ${notes}` : null,
    ``,
    `Order Details:`,
    ...items.map(item => {
      const opts = [item.selectedSize, item.selectedColor].filter(Boolean).join(", ");
      return `- ${item.productName}${opts ? ` (${opts})` : ""} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`;
    }),
    ``,
    `Total: $${total.toFixed(2)}`,
  ].filter(l => l !== null);
  return lines.join("\n");
}

router.post("/stores/:storeSlug/orders", async (req, res): Promise<void> => {
  const params = CreateOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [store] = await db.select().from(storesTable).where(eq(storesTable.slug, params.data.storeSlug));
  if (!store) {
    res.status(404).json({ error: "Store not found" });
    return;
  }

  const items = parsed.data.items as OrderItem[];
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const whatsappMessage = buildWhatsappMessage(store.name, items, total, parsed.data.customerName, parsed.data.customerAddress, parsed.data.notes);

  const [order] = await db.insert(ordersTable).values({
    storeId: store.id,
    customerName: parsed.data.customerName,
    customerPhone: parsed.data.customerPhone,
    customerAddress: parsed.data.customerAddress,
    notes: parsed.data.notes ?? null,
    items: items,
    total: String(total),
    status: "new",
    whatsappMessage,
  }).returning();

  res.status(201).json(mapOrder(order));
});

router.get("/dashboard/orders", async (req, res): Promise<void> => {
  const [store] = await db.select().from(storesTable).limit(1);
  if (!store) {
    res.status(404).json({ error: "No store found" });
    return;
  }
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.storeId, store.id)).orderBy(sql`${ordersTable.createdAt} DESC`);
  res.json(orders.map(mapOrder));
});

router.get("/dashboard/orders/:orderId", async (req, res): Promise<void> => {
  const params = GetDashboardOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.orderId));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(mapOrder(order));
});

router.put("/dashboard/orders/:orderId", async (req, res): Promise<void> => {
  const params = UpdateDashboardOrderStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateDashboardOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [order] = await db
    .update(ordersTable)
    .set({ status: parsed.data.status })
    .where(eq(ordersTable.id, params.data.orderId))
    .returning();
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(mapOrder(order));
});

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const [store] = await db.select().from(storesTable).limit(1);
  if (!store) {
    res.json({ totalOrders: 0, newOrders: 0, totalProducts: 0, totalRevenue: 0 });
    return;
  }

  const [totalOrdersResult] = await db
    .select({ count: count() })
    .from(ordersTable)
    .where(eq(ordersTable.storeId, store.id));

  const [newOrdersResult] = await db
    .select({ count: count() })
    .from(ordersTable)
    .where(eq(ordersTable.storeId, store.id));

  const [revenueResult] = await db
    .select({ total: sum(ordersTable.total) })
    .from(ordersTable)
    .where(eq(ordersTable.storeId, store.id));

  const { productsTable } = await import("@workspace/db");
  const [productCountResult] = await db
    .select({ count: count() })
    .from(productsTable)
    .where(eq(productsTable.storeId, store.id));

  const [newCountResult] = await db
    .select({ count: count() })
    .from(ordersTable)
    .where(sql`${ordersTable.storeId} = ${store.id} AND ${ordersTable.status} = 'new'`);

  res.json({
    totalOrders: totalOrdersResult?.count ?? 0,
    newOrders: newCountResult?.count ?? 0,
    totalProducts: productCountResult?.count ?? 0,
    totalRevenue: Number(revenueResult?.total ?? 0),
  });
});

export default router;
