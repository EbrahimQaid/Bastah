import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, storesTable } from "@workspace/db";
import {
  GetStoreParams,
  GetStoreResponse,
  GetDashboardStoreResponse,
  UpdateDashboardStoreBody,
  UpdateDashboardStoreResponse,
  InitDashboardStoreBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stores/:storeSlug", async (req, res): Promise<void> => {
  const params = GetStoreParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [store] = await db.select().from(storesTable).where(eq(storesTable.slug, params.data.storeSlug));
  if (!store) {
    res.status(404).json({ error: "Store not found" });
    return;
  }
  res.json(GetStoreResponse.parse({
    ...store,
    createdAt: store.createdAt.toISOString(),
  }));
});

router.get("/dashboard/store", async (req, res): Promise<void> => {
  const [store] = await db.select().from(storesTable).limit(1);
  if (!store) {
    res.status(404).json({ error: "No store found" });
    return;
  }
  res.json(GetDashboardStoreResponse.parse({
    ...store,
    createdAt: store.createdAt.toISOString(),
  }));
});

router.put("/dashboard/store", async (req, res): Promise<void> => {
  const parsed = UpdateDashboardStoreBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [existing] = await db.select().from(storesTable).limit(1);
  if (!existing) {
    res.status(404).json({ error: "No store found" });
    return;
  }
  const [updated] = await db
    .update(storesTable)
    .set({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      coverImage: parsed.data.coverImage ?? null,
      logoImage: parsed.data.logoImage ?? null,
      primaryColor: parsed.data.primaryColor,
      whatsappNumber: parsed.data.whatsappNumber,
    })
    .where(eq(storesTable.id, existing.id))
    .returning();
  res.json(UpdateDashboardStoreResponse.parse({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
  }));
});

router.post("/dashboard/store/init", async (req, res): Promise<void> => {
  const parsed = InitDashboardStoreBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [existing] = await db.select().from(storesTable).where(eq(storesTable.slug, parsed.data.slug));
  if (existing) {
    res.status(400).json({ error: "Slug already taken" });
    return;
  }
  const [store] = await db.insert(storesTable).values({
    slug: parsed.data.slug,
    name: parsed.data.name,
    whatsappNumber: parsed.data.whatsappNumber,
    description: parsed.data.description ?? null,
    primaryColor: parsed.data.primaryColor,
  }).returning();
  res.status(201).json({
    ...store,
    createdAt: store.createdAt.toISOString(),
  });
});

export default router;
