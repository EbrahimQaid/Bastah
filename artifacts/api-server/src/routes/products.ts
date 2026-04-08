import { Router, type IRouter } from "express";
import { eq, and, gte, lte, ilike, sql } from "drizzle-orm";
import { db, productsTable, storesTable } from "@workspace/db";
import {
  ListStoreProductsParams,
  ListStoreProductsQueryParams,
  GetStoreProductParams,
  CreateDashboardProductBody,
  UpdateDashboardProductParams,
  UpdateDashboardProductBody,
  DeleteDashboardProductParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapProduct(p: typeof productsTable.$inferSelect) {
  const variants = p.variants as { sizes: string[]; colors: string[] };
  return {
    id: p.id,
    storeId: p.storeId,
    categoryId: p.categoryId ?? null,
    name: p.name,
    description: p.description ?? null,
    price: Number(p.price),
    images: p.images,
    variants: {
      sizes: variants?.sizes ?? [],
      colors: variants?.colors ?? [],
    },
    inStock: p.inStock,
    featured: p.featured,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/stores/:storeSlug/products", async (req, res): Promise<void> => {
  const params = ListStoreProductsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const query = ListStoreProductsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const [store] = await db.select().from(storesTable).where(eq(storesTable.slug, params.data.storeSlug));
  if (!store) {
    res.status(404).json({ error: "Store not found" });
    return;
  }

  const conditions = [eq(productsTable.storeId, store.id)];

  if (query.data.categoryId) {
    conditions.push(eq(productsTable.categoryId, query.data.categoryId));
  }
  if (query.data.search) {
    conditions.push(ilike(productsTable.name, `%${query.data.search}%`));
  }
  if (query.data.minPrice !== undefined && query.data.minPrice !== null) {
    conditions.push(gte(productsTable.price, String(query.data.minPrice)));
  }
  if (query.data.maxPrice !== undefined && query.data.maxPrice !== null) {
    conditions.push(lte(productsTable.price, String(query.data.maxPrice)));
  }
  if (query.data.size) {
    conditions.push(sql`${productsTable.variants}->>'sizes' ILIKE ${'%' + query.data.size + '%'}`);
  }
  if (query.data.color) {
    conditions.push(sql`${productsTable.variants}->>'colors' ILIKE ${'%' + query.data.color + '%'}`);
  }

  const products = await db.select().from(productsTable).where(and(...conditions)).orderBy(productsTable.createdAt);
  res.json(products.map(mapProduct));
});

router.get("/stores/:storeSlug/products/:productId", async (req, res): Promise<void> => {
  const params = GetStoreProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, params.data.productId));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(mapProduct(product));
});

router.get("/dashboard/products", async (req, res): Promise<void> => {
  const [store] = await db.select().from(storesTable).limit(1);
  if (!store) {
    res.status(404).json({ error: "No store found" });
    return;
  }
  const products = await db.select().from(productsTable).where(eq(productsTable.storeId, store.id)).orderBy(productsTable.createdAt);
  res.json(products.map(mapProduct));
});

router.post("/dashboard/products", async (req, res): Promise<void> => {
  const parsed = CreateDashboardProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [store] = await db.select().from(storesTable).limit(1);
  if (!store) {
    res.status(404).json({ error: "No store found" });
    return;
  }
  const [product] = await db.insert(productsTable).values({
    storeId: store.id,
    categoryId: parsed.data.categoryId ?? null,
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    price: String(parsed.data.price),
    images: parsed.data.images,
    variants: parsed.data.variants,
    inStock: parsed.data.inStock,
    featured: parsed.data.featured,
  }).returning();
  res.status(201).json(mapProduct(product));
});

router.put("/dashboard/products/:productId", async (req, res): Promise<void> => {
  const params = UpdateDashboardProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateDashboardProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [product] = await db
    .update(productsTable)
    .set({
      categoryId: parsed.data.categoryId ?? null,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      price: String(parsed.data.price),
      images: parsed.data.images,
      variants: parsed.data.variants,
      inStock: parsed.data.inStock,
      featured: parsed.data.featured,
    })
    .where(eq(productsTable.id, params.data.productId))
    .returning();
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(mapProduct(product));
});

router.delete("/dashboard/products/:productId", async (req, res): Promise<void> => {
  const params = DeleteDashboardProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(productsTable).where(eq(productsTable.id, params.data.productId));
  res.sendStatus(204);
});

export default router;
