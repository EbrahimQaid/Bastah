-- =============================================
--  بَسطة — Supabase Schema
--  شغّل هذا في Supabase → SQL Editor → New query
-- =============================================

-- 1) الأقسام
CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL PRIMARY KEY,
  store_id   INTEGER NOT NULL DEFAULT 1,
  name       TEXT    NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) المنتجات
CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  store_id    INTEGER NOT NULL DEFAULT 1,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name        TEXT    NOT NULL,
  description TEXT    DEFAULT '',
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  images      TEXT[]  DEFAULT '{}',
  sizes       TEXT[]  DEFAULT '{}',
  colors      TEXT[]  DEFAULT '{}',
  in_stock    BOOLEAN DEFAULT TRUE,
  featured    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3) الطلبات
CREATE TABLE IF NOT EXISTS orders (
  id               SERIAL PRIMARY KEY,
  store_id         INTEGER NOT NULL DEFAULT 1,
  customer_name    TEXT,
  customer_phone   TEXT,
  customer_address TEXT,
  notes            TEXT DEFAULT '',
  items            JSONB DEFAULT '[]',
  total            NUMERIC(10,2) DEFAULT 0,
  status           TEXT DEFAULT 'new',
  whatsapp_message TEXT DEFAULT '',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── تفعيل RLS (Row Level Security) وفتح الصلاحيات ───
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders     ENABLE ROW LEVEL SECURITY;

-- سماح لـ Service Role (السيرفر) بكل العمليات
CREATE POLICY "service_all_categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_products"   ON products   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_orders"     ON orders     FOR ALL USING (true) WITH CHECK (true);

-- ─── بيانات تجريبية (اختيارية) ───
INSERT INTO categories (name) VALUES
  ('روايات'),
  ('تطوير الذات'),
  ('تاريخ وحضارة'),
  ('أطفال')
ON CONFLICT DO NOTHING;
