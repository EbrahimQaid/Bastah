import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Replace with your database connection string from Supabase
// Format: postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres
const connectionString = process.env.DATABASE_URL || "YOUR_CONNECTION_STRING_HERE";

async function run() {
  if (connectionString === "YOUR_CONNECTION_STRING_HERE" || !connectionString) {
    console.error("الرجاء وضع رابط الاتصال بقاعدة البيانات (Connection String) أولاً.");
    console.error("يمكنك وضعه كمتغير بيئة DATABASE_URL أو استبدال القيمة مباشرة في هذا الملف.");
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log("جاري الاتصال بقاعدة البيانات...");
    await client.connect();
    console.log("تم الاتصال بنجاح!");

    const sqlPath = path.join(__dirname, 'supabase-schema.sql');
    console.log(`جاري قراءة ملف SQL من: ${sqlPath}`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("جاري تشغيل الـ SQL (قد يستغرق ذلك بضع ثوانٍ)...");
    await client.query(sql);
    console.log("✅ تم تشغيل ملف الـ SQL وإنشاء جميع الجداول والوظائف بنجاح!");

  } catch (err) {
    console.error("❌ حدث خطأ أثناء تشغيل الـ SQL:");
    console.error(err.message || err);
  } finally {
    await client.end();
  }
}

run();
