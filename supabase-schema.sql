-- ============================================================
--  بَسطة (Bastah) — Production PostgreSQL Schema
--  Multi-Tenant SaaS E-Commerce Platform (Standard Integer IDs for Frontend Compatibility)
--  Designed for: Scale, Speed, Security
--  Run in: Supabase → SQL Editor → New Query
-- ============================================================

-- ─── Extensions ───────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- Full-text trigram search
CREATE EXTENSION IF NOT EXISTS "unaccent";         -- Arabic/accented search

-- ============================================================
-- 1. PLANS — خطط الاشتراك
-- ============================================================
CREATE TABLE IF NOT EXISTS plans (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,                         -- 'free', 'pro', 'enterprise'
  name_ar       TEXT NOT NULL,
  price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_yearly  NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_products  INTEGER NOT NULL DEFAULT 20,
  max_orders    INTEGER NOT NULL DEFAULT 100,
  max_images    INTEGER NOT NULL DEFAULT 3,
  features      JSONB NOT NULL DEFAULT '[]',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. USERS — المستخدمون (البائعون)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  full_name       TEXT,
  phone           TEXT,
  avatar_url      TEXT,
  role            TEXT NOT NULL DEFAULT 'seller'       -- 'seller' | 'admin'
                  CHECK (role IN ('seller', 'admin')),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- 3. STORES — المتاجر (Multi-Tenant Core)
-- ============================================================
CREATE TABLE IF NOT EXISTS stores (
  id                SERIAL PRIMARY KEY,
  owner_id          INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan_id           INTEGER REFERENCES plans(id) ON DELETE SET NULL,
  slug              TEXT NOT NULL UNIQUE,              -- bastah.store/my-store
  name              TEXT NOT NULL,
  name_ar           TEXT,
  description       TEXT DEFAULT '',
  description_ar    TEXT DEFAULT '',
  logo_image        TEXT,
  cover_image       TEXT,
  -- Theme / Appearance
  primary_color     TEXT DEFAULT '#7C3AED',
  secondary_color   TEXT DEFAULT '#A78BFA',
  font_family       TEXT DEFAULT 'Tajawal',
  theme_config      JSONB DEFAULT '{}',
  -- Contact
  whatsapp_number   TEXT,
  email             TEXT,
  address           TEXT,
  -- Commerce Settings
  default_currency  TEXT DEFAULT 'SAR',
  currencies        TEXT[] DEFAULT ARRAY['SAR'],
  shipping_rate     NUMERIC(10,2) DEFAULT 0,
  free_shipping_min NUMERIC(10,2),                    -- min order for free shipping
  tax_rate          NUMERIC(5,2) DEFAULT 0,
  -- Status
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  is_published      BOOLEAN NOT NULL DEFAULT FALSE,
  plan_expires_at   TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stores_slug        ON stores(slug);
CREATE INDEX idx_stores_owner_id    ON stores(owner_id);
CREATE INDEX idx_stores_is_active   ON stores(is_active) WHERE is_active = TRUE;

-- ============================================================
-- 4. CATEGORIES — الأقسام
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  store_id    INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  parent_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,  -- sub-categories
  name        TEXT NOT NULL,
  name_ar     TEXT,
  slug        TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  image_url   TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_store_id  ON categories(store_id);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_sort      ON categories(store_id, sort_order);

-- ============================================================
-- 5. PRODUCTS — المنتجات
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id              SERIAL PRIMARY KEY,
  store_id        INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id     INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  -- Core Info
  name            TEXT NOT NULL,
  name_ar         TEXT,
  slug            TEXT NOT NULL DEFAULT '',
  description     TEXT DEFAULT '',
  description_ar  TEXT DEFAULT '',
  -- Pricing
  price           NUMERIC(10,2) NOT NULL DEFAULT 0,
  compare_price   NUMERIC(10,2),                      -- original price (for discount display)
  cost_price      NUMERIC(10,2),                      -- internal cost
  -- Media
  images          TEXT[] DEFAULT '{}',
  sizes           TEXT[] DEFAULT '{}',                -- Added for compatibility
  colors          TEXT[] DEFAULT '{}',                -- Added for compatibility
  -- Inventory
  sku             TEXT,
  stock_quantity  INTEGER NOT NULL DEFAULT 0,
  track_inventory BOOLEAN NOT NULL DEFAULT FALSE,
  in_stock        BOOLEAN NOT NULL DEFAULT TRUE,
  -- Variants stored in separate table (optional)
  has_variants    BOOLEAN NOT NULL DEFAULT FALSE,
  -- Discovery
  featured        BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  -- SEO
  meta_title      TEXT,
  meta_description TEXT,
  tags            TEXT[] DEFAULT '{}',
  -- Stats (denormalized for speed)
  views_count     INTEGER NOT NULL DEFAULT 0,
  orders_count    INTEGER NOT NULL DEFAULT 0,
  rating_avg      NUMERIC(3,2) DEFAULT 0,
  rating_count    INTEGER NOT NULL DEFAULT 0,
  -- Timestamps
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_store_id    ON products(store_id);
CREATE INDEX idx_products_category    ON products(store_id, category_id);
CREATE INDEX idx_products_featured    ON products(store_id, featured) WHERE featured = TRUE;
CREATE INDEX idx_products_active      ON products(store_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_products_price       ON products(store_id, price);
CREATE INDEX idx_products_created     ON products(store_id, created_at DESC);
CREATE INDEX idx_products_orders      ON products(store_id, orders_count DESC);
CREATE INDEX idx_products_trgm_name   ON products USING GIN (name gin_trgm_ops);
CREATE INDEX idx_products_trgm_name_ar ON products USING GIN (COALESCE(name_ar,'') gin_trgm_ops);
CREATE INDEX idx_products_tags        ON products USING GIN (tags);

-- ============================================================
-- 6. PRODUCT VARIANTS — الخيارات (مقاس، لون، إلخ)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_variants (
  id            SERIAL PRIMARY KEY,
  product_id    INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  store_id      INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  -- e.g. { "size": "XL", "color": "أحمر" }
  options       JSONB NOT NULL DEFAULT '{}',
  sku           TEXT,
  price         NUMERIC(10,2),                        -- overrides product price if set
  stock_qty     INTEGER NOT NULL DEFAULT 0,
  in_stock      BOOLEAN NOT NULL DEFAULT TRUE,
  image_url     TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_variants_store_id   ON product_variants(store_id);

-- ============================================================
-- 7. CUSTOMERS — العملاء
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id            SERIAL PRIMARY KEY,
  store_id      INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  phone         TEXT,
  email         TEXT,
  address       TEXT,
  city          TEXT,
  country       TEXT DEFAULT 'SA',
  notes         TEXT DEFAULT '',
  orders_count  INTEGER NOT NULL DEFAULT 0,
  total_spent   NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_store_id ON customers(store_id);
CREATE INDEX idx_customers_phone    ON customers(store_id, phone);
CREATE INDEX idx_customers_email    ON customers(store_id, email);

-- ============================================================
-- 8. ORDERS — الطلبات
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id                  SERIAL PRIMARY KEY,
  store_id            INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id         INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  -- Order Number (human-readable)
  order_number        TEXT,
  -- Customer Snapshot
  customer_name       TEXT NOT NULL,
  customer_phone      TEXT,
  customer_email      TEXT,
  customer_address    TEXT,
  customer_city       TEXT,
  customer_country    TEXT DEFAULT 'SA',
  -- Financial
  subtotal            NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount          NUMERIC(10,2) NOT NULL DEFAULT 0,
  total               NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency            TEXT NOT NULL DEFAULT 'SAR',
  -- Status
  status              TEXT NOT NULL DEFAULT 'new',
  payment_status      TEXT NOT NULL DEFAULT 'unpaid',
  payment_method      TEXT DEFAULT 'cod',
  payment_id          TEXT,
  -- Shipping
  tracking_number     TEXT,
  shipped_at          TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  -- Misc
  notes               TEXT DEFAULT '',
  internal_notes      TEXT DEFAULT '',
  whatsapp_message    TEXT DEFAULT '',
  items               JSONB DEFAULT '[]',             -- Kept for frontend compatibility
  source              TEXT DEFAULT 'store',
  -- Coupon
  coupon_code         TEXT,
  coupon_id           INTEGER,
  -- Timestamps
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_store_id       ON orders(store_id);
CREATE INDEX idx_orders_customer_id    ON orders(customer_id);
CREATE INDEX idx_orders_status         ON orders(store_id, status);
CREATE INDEX idx_orders_payment_status ON orders(store_id, payment_status);
CREATE INDEX idx_orders_created        ON orders(store_id, created_at DESC);

-- ============================================================
-- 9. ORDER ITEMS — عناصر الطلب
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id            SERIAL PRIMARY KEY,
  order_id      INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  store_id      INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id    INTEGER REFERENCES products(id) ON DELETE SET NULL,
  variant_id    INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
  -- Snapshot at time of purchase
  product_name  TEXT NOT NULL,
  product_image TEXT,
  variant_opts  JSONB DEFAULT '{}',
  sku           TEXT,
  quantity      INTEGER NOT NULL DEFAULT 1,
  unit_price    NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price   NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id   ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_store_id   ON order_items(store_id);

-- ============================================================
-- 10. COUPONS — كوبونات الخصم
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
  id              SERIAL PRIMARY KEY,
  store_id        INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  code            TEXT NOT NULL,
  description     TEXT DEFAULT '',
  type            TEXT NOT NULL DEFAULT 'percent'
                  CHECK (type IN ('percent','fixed')),
  value           NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_order       NUMERIC(10,2) DEFAULT 0,
  max_uses        INTEGER,
  used_count      INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (store_id, code)
);

CREATE INDEX idx_coupons_store_id ON coupons(store_id);
CREATE INDEX idx_coupons_code     ON coupons(store_id, code);

-- ============================================================
-- 11. REVIEWS — التقييمات
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id            SERIAL PRIMARY KEY,
  store_id      INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id    INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id   INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  order_id      INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title         TEXT,
  body          TEXT,
  is_approved   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_product_id  ON reviews(product_id);
CREATE INDEX idx_reviews_store_id    ON reviews(store_id);

-- ============================================================
-- 12. MEDIA — الوسائط
-- ============================================================
CREATE TABLE IF NOT EXISTS media (
  id            SERIAL PRIMARY KEY,
  store_id      INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  public_id     TEXT,
  file_name     TEXT,
  file_size     INTEGER,
  mime_type     TEXT,
  width         INTEGER,
  height        INTEGER,
  alt_text      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_store_id ON media(store_id);

-- ============================================================
-- 13. STORE ANALYTICS — التحليلات
-- ============================================================
CREATE TABLE IF NOT EXISTS store_analytics (
  id              SERIAL PRIMARY KEY,
  store_id        INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  page_views      INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  orders_count    INTEGER NOT NULL DEFAULT 0,
  revenue         NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (store_id, date)
);

CREATE INDEX idx_analytics_store_date ON store_analytics(store_id, date DESC);

-- ============================================================
-- 14. NOTIFICATIONS — الإشعارات
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id          SERIAL PRIMARY KEY,
  store_id    INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  data        JSONB DEFAULT '{}',
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_store_id ON notifications(store_id, is_read, created_at DESC);

-- ============================================================
-- 15. AUDIT LOG — سجل العمليات
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          SERIAL PRIMARY KEY,
  store_id    INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity      TEXT NOT NULL,
  entity_id   INTEGER,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-generate order_number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  store_prefix TEXT;
  seq_num      INTEGER;
BEGIN
  SELECT UPPER(LEFT(slug, 3)) INTO store_prefix FROM stores WHERE id = NEW.store_id;
  IF store_prefix IS NULL THEN
    store_prefix := 'ORD';
  END IF;
  SELECT COUNT(*) + 1 INTO seq_num FROM orders WHERE store_id = NEW.store_id;
  NEW.order_number := store_prefix || '-' || LPAD(seq_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Update product rating after review
CREATE OR REPLACE FUNCTION refresh_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products SET
    rating_avg   = (SELECT ROUND(AVG(rating)::NUMERIC, 2) FROM reviews WHERE product_id = NEW.product_id AND is_approved = TRUE),
    rating_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id AND is_approved = TRUE)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_review_rating
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION refresh_product_rating();

-- Update customer stats after order
CREATE OR REPLACE FUNCTION refresh_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.customer_id IS NOT NULL THEN
    UPDATE customers SET
      orders_count = (SELECT COUNT(*) FROM orders WHERE customer_id = NEW.customer_id AND status != 'cancelled'),
      total_spent  = (SELECT COALESCE(SUM(total), 0) FROM orders WHERE customer_id = NEW.customer_id AND status = 'delivered')
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_customer_stats
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION refresh_customer_stats();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE plans             ENABLE ROW LEVEL SECURITY;
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores            ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons           ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews           ENABLE ROW LEVEL SECURITY;
ALTER TABLE media             ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_analytics   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs        ENABLE ROW LEVEL SECURITY;

-- Service Role (Backend) — Full Access
CREATE POLICY "service_plans"      ON plans             FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_users"      ON users             FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_stores"     ON stores            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_categories" ON categories        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_products"   ON products          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_variants"   ON product_variants  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_customers"  ON customers         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_orders"     ON orders            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_order_items" ON order_items      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_coupons"    ON coupons           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_reviews"    ON reviews           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_media"      ON media             FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_analytics"  ON store_analytics   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_notifs"     ON notifications     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_audit"      ON audit_logs        FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- SEED DATA — بيانات أولية
-- ============================================================

-- Plans
INSERT INTO plans (id, name, name_ar, price_monthly, price_yearly, max_products, max_orders, max_images, features)
VALUES
  (1, 'free',       'مجاني',      0,    0,    20,   100,  3,  '["متجر إلكتروني","واتساب"]'),
  (2, 'pro',        'احترافي',    99,   990,  200,  1000, 10, '["كل ميزات المجاني","كوبونات","تحليلات","دعم أولوية"]'),
  (3, 'enterprise', 'مؤسسي',      299,  2990, 99999,99999,20, '["كل ميزات الاحترافي","API كامل","مدير حساب","SLA"]')
ON CONFLICT (id) DO NOTHING;

-- Users
INSERT INTO users (id, email, password_hash, role, is_active, is_verified)
VALUES (1, 'seller@bastah.com', '$2b$12$e0M2Vn8y9Y7bXm781i5n6ueL3H5F1D7Xh3.5v9h2P0l2V8T2u9W2.', 'seller', true, true)
ON CONFLICT (id) DO NOTHING;

-- Stores
INSERT INTO stores (id, owner_id, plan_id, slug, name, name_ar, description, primary_color, secondary_color, font_family, whatsapp_number, default_currency, currencies)
VALUES (1, 1, 1, 'bastah', 'بَسطة', 'بسطة الكتب', 'أجود الكتب والروايات العربية والعالمية', '#7C3AED', '#A78BFA', 'Tajawal', '966501234567', 'SAR', ARRAY['SAR', 'USD'])
ON CONFLICT (id) DO NOTHING;

-- Categories
INSERT INTO categories (id, store_id, name) VALUES
  (1, 1, 'روايات'),
  (2, 1, 'تطوير الذات'),
  (3, 1, 'تاريخ وحضارة'),
  (4, 1, 'أطفال')
ON CONFLICT (id) DO NOTHING;
