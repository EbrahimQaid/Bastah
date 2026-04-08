import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, categoriesTable, storesTable } from "@workspace/db";
import {
  ListStoreCategoriesParams,
  ListStoreCategoriesResponse,
  CreateDashboardCategoryBody,
  DeleteDashboardCategoryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stores/:storeSlug/categories", async (req, res): Promise<void> => {
  const params = ListStoreCategoriesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [store] = await db.select().from(storesTable).where(eq(storesTable.slug, params.data.storeSlug));
  if (!store) {
    res.status(404).json({ error: "Store not found" });
    return;
  }
  const categories = await db.select().from(categoriesTable).where(eq(categoriesTable.storeId, store.id));
  res.json(ListStoreCategoriesResponse.parse(categories));
});

router.get("/dashboard/categories", async (req, res): Promise<void> => {
  const [store] = await db.select().from(storesTable).limit(1);
  if (!store) {
    res.status(404).json({ error: "No store found" });
    return;
  }
  const categories = await db.select().from(categoriesTable).where(eq(categoriesTable.storeId, store.id));
  res.json(categories);
});

router.post("/dashboard/categories", async (req, res): Promise<void> => {
  const parsed = CreateDashboardCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [store] = await db.select().from(storesTable).limit(1);
  if (!store) {
    res.status(404).json({ error: "No store found" });
    return;
  }
  const [cat] = await db.insert(categoriesTable).values({ name: parsed.data.name, storeId: store.id }).returning();
  res.status(201).json(cat);
});

router.delete("/dashboard/categories/:categoryId", async (req, res): Promise<void> => {
  const params = DeleteDashboardCategoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(categoriesTable).where(eq(categoriesTable.id, params.data.categoryId));
  res.sendStatus(204);
});

export default router;
