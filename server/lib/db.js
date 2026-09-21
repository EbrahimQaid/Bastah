import "dotenv/config";
import pg from "pg";
import fs from "fs";
import path from "path";

const connectionString = process.env.DATABASE_URL;

const pool = connectionString
  ? new pg.Pool({
      connectionString,
      max: Number(process.env.DB_POOL_MAX || 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: true }
          : undefined,
    })
  : null;

function requirePool() {
  if (!pool) {
    const error = new Error("DATABASE_URL is missing in Vercel environment variables");
    error.code = "CONFIGURATION_ERROR";
    throw error;
  }
  return pool;
}

// Migrations are an explicit deployment step; never run them during a request.
if (process.env.AUTO_INIT_DB === "true") {
  initializeDatabase().catch((err) =>
    console.error("Database initialization failed:", err.message),
  );
}

async function initializeDatabase() {
  console.log("🔍 Checking database schema status on Neon...");
  try {
    const client = await pool.connect();
    try {
      // Check if the stores table exists
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'stores'
        );
      `);

      const storesExists = tableCheck.rows[0].exists;
      if (!storesExists) {
        console.log("🔄 Database tables not found. Initializing schema...");
        const sqlPath = path.join(process.cwd(), "supabase-schema.sql");
        if (fs.existsSync(sqlPath)) {
          const sql = fs.readFileSync(sqlPath, "utf8");
          await client.query(sql);
          console.log(
            "✅ Database schema initialized and seeded successfully!",
          );
        } else {
          console.error(
            "⚠️ Could not find supabase-schema.sql at path:",
            sqlPath,
          );
        }
      } else {
        // Table exists, check if it's empty
        const storesCount = await client.query("SELECT COUNT(*) FROM stores;");
        if (parseInt(storesCount.rows[0].count, 10) === 0) {
          console.log("🔄 Stores table is empty. Re-seeding default store...");
          const sqlPath = path.join(process.cwd(), "supabase-schema.sql");
          let sql = null;
          if (fs.existsSync(sqlPath)) {
            sql = fs.readFileSync(sqlPath, "utf8");
          }

          if (sql) {
            await client.query(sql);
            console.log("✅ Database re-seeded successfully!");
          } else {
            console.error("⚠️ Could not find schema SQL to re-seed at path:", sqlPath);
          }
        } else {
          console.log(
            "✅ Database is ready and seeded (stores table already has data).",
          );
        }
      }
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("❌ Error during database check/init:", err.message);
  }
}

// Fallback in-memory state for local preview when DATABASE_URL is not provided
const fallbackState = {
  stores: [
    {
      id: 1,
      slug: "bastah",
      name: "دكاني - Dukkani",
      description: "منصة المتاجر الذكية بهوية محفظة جيب الإلكترونية",
      cover_image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
      logo_image: "",
      primary_color: "#991B1B",
      secondary_color: "#DC2626",
      font_family: "Tajawal",
      currencies: ["YER", "SAR", "USD"],
      default_currency: "YER",
      theme_config: {},
      shipping_rate: 15,
      whatsapp_number: "967770000000",
      created_at: new Date().toISOString(),
    }
  ],
  categories: [
    { id: 1, store_id: 1, name: "ملابس وأزياء" },
    { id: 2, store_id: 1, name: "عطور وبخور" },
    { id: 3, store_id: 1, name: "إلكترونيات" },
    { id: 4, store_id: 1, name: "إكسسوارات" },
  ],
  products: [
    {
      id: 1,
      store_id: 1,
      category_id: 1,
      name: "ثوب رسمي فاخر",
      description: "قماش كوري أصلي عالي الجودة مع تطريز يدوي دقيق وتفصيل متقن",
      price: 180,
      images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80"],
      variants: { sizes: ["S", "M", "L", "XL"], colors: ["أبيض", "كريمي"] },
      in_stock: true,
      featured: true,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      store_id: 1,
      category_id: 2,
      name: "بخور عدني ملكي",
      description: "خلطة بخور أصيلة مخلطة بدهن العود والعنبر الفاخر برائحة تدوم طويلاً",
      price: 95,
      images: ["https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=800&q=80"],
      variants: { sizes: ["50g", "100g"], colors: [] },
      in_stock: true,
      featured: true,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      store_id: 1,
      category_id: 4,
      name: "جنبية يمنية كلاسيكية مع حزام مطرز",
      description: "صناعة تراثية متقنة بنصل فولاذي صلب وحزام مذهب فاخر",
      price: 350,
      images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80"],
      variants: { sizes: [], colors: [] },
      in_stock: true,
      featured: true,
      is_active: true,
      created_at: new Date().toISOString(),
    }
  ],
  orders: [],
  users: [
    {
      id: 1,
      email: "demo@dukkani.store",
      password_hash: "$2a$10$X8aL7vNqAkmG8zC1cRj1g.21l1M3b2sX1d5g8m1r2k3j4h5g6",
      full_name: "تاجر دكاني",
      phone: "967770000000",
      role: "seller",
      avatar_url: ""
    }
  ]
};

function handleFallbackQuery(text, params = []) {
  const normalized = text.trim().toUpperCase();

  if (normalized.startsWith("SELECT * FROM STORES")) {
    return { rows: fallbackState.stores };
  }
  if (normalized.startsWith("UPDATE STORES")) {
    if (params.length >= 1) {
      const store = fallbackState.stores[0];
      if (params[0] !== undefined) store.name = params[0];
      if (params[1] !== undefined) store.description = params[1];
      if (params[2] !== undefined) store.cover_image = params[2];
      if (params[3] !== undefined) store.logo_image = params[3];
      if (params[4] !== undefined) store.primary_color = params[4];
      if (params[5] !== undefined) store.secondary_color = params[5];
    }
    return { rows: fallbackState.stores };
  }
  if (normalized.startsWith("SELECT * FROM CATEGORIES") || normalized.includes("FROM CATEGORIES")) {
    return { rows: fallbackState.categories };
  }
  if (normalized.startsWith("SELECT * FROM PRODUCTS") || normalized.includes("FROM PRODUCTS")) {
    let prods = [...fallbackState.products];
    if (text.includes("id = $") && params[0]) {
      prods = prods.filter(p => p.id === Number(params[0]));
    }
    return { rows: prods };
  }
  if (normalized.startsWith("SELECT * FROM ORDERS") || normalized.includes("FROM ORDERS")) {
    return { rows: fallbackState.orders };
  }
  if (normalized.includes("COUNT(*)")) {
    return { rows: [{ count: "1" }] };
  }
  if (normalized.includes("SELECT ID, EMAIL, ROLE, S.ID AS STORE_ID FROM USERS")) {
    return { rows: [{ id: 1, email: "demo@dukkani.store", role: "seller", store_id: 1 }] };
  }
  if (normalized.includes("FROM USERS")) {
    return { rows: fallbackState.users };
  }

  return { rows: [] };
}

export const query = (text, params) => {
  if (pool) {
    return pool.query(text, params);
  }
  return Promise.resolve(handleFallbackQuery(text, params));
};

export async function withTransaction(callback) {
  if (!pool) {
    const mockClient = {
      query: (text, params) => Promise.resolve(handleFallbackQuery(text, params)),
    };
    return await callback(mockClient);
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export const isDbReady = () => Boolean(pool);
