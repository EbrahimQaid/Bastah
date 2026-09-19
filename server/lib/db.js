import "dotenv/config";
import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing in environment variables");
}

const pool = new pg.Pool({
  connectionString,
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: true }
      : undefined,
});

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
          const fallbackPath = path.join(
            __dirname,
            "../../supabase-schema.sql",
          );
          if (fs.existsSync(fallbackPath)) {
            const sql = fs.readFileSync(fallbackPath, "utf8");
            await client.query(sql);
            console.log(
              "✅ Database schema initialized and seeded successfully (using fallback path)!",
            );
          } else {
            console.error(
              "⚠️ Could not find supabase-schema.sql at paths:",
              sqlPath,
              "or",
              fallbackPath,
            );
          }
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
          } else {
            const fallbackPath = path.join(
              __dirname,
              "../../supabase-schema.sql",
            );
            if (fs.existsSync(fallbackPath)) {
              sql = fs.readFileSync(fallbackPath, "utf8");
            }
          }

          if (sql) {
            await client.query(sql);
            console.log("✅ Database re-seeded successfully!");
          } else {
            console.error("⚠️ Could not find schema SQL to re-seed.");
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

export const query = (text, params) => {
  return pool.query(text, params);
};

export async function withTransaction(callback) {
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

export const isDbReady = () => true;
