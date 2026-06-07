# 🧠 PROJECT CONTEXT — Bastah (بَسطة)
> ملف الذاكرة الكاملة للمشروع — يُحدَّث بعد كل خطوة تنفيذية
> **آخر تحديث:** 2026-06-07 | **المدير التقني:** AI Project Manager

---

## 📌 1. وصف المشروع

**Bastah (بَسطة)** هو منصة متجر إلكتروني عربي مع لوحة تحكم للبائع.
الحالة المستهدفة: **SaaS Multi-Tenant E-Commerce Platform** جاهز للإنتاج.

| الخاصية | القيمة |
|---------|--------|
| الاسم | بَسطة | Bastah |
| الجمهور | بائعون عرب صغار ومتوسطون |
| النموذج التجاري | SaaS (Multi-Tenant في المستقبل) |
| اللغات | عربي + إنجليزي |
| العملة الافتراضية | SAR (قابلة للتغيير) |

---

## 🏗️ 2. Architecture الحالي

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                    │
│  React 18 + TypeScript + Vite + TailwindCSS v4          │
│  Wouter (Router) + React Query + Framer Motion          │
├─────────────────────────────────────────────────────────┤
│                   FRONTEND LAYERS                       │
│  Pages: Store (5) + Dashboard (8)                       │
│  Context: Language + Currency + Theme + Cart            │
│  Services: api.ts (React Query hooks)                   │
├─────────────────────────────────────────────────────────┤
│              PROXY (Vite Dev Server)                    │
│           /api  →  localhost:3001                       │
├─────────────────────────────────────────────────────────┤
│               BACKEND (Express.js)                      │
│  Port: 3001 | MVC Pattern                               │
│  Routes: /api/stores/* | /api/dashboard/*               │
│  Controllers: storeController + dashboardController     │
├─────────────────────────────────────────────────────────┤
│              DATABASE (⚠️ MOCK ONLY)                    │
│  server/models/data.js — In-Memory JavaScript Array     │
│  ❌ NO PERSISTENCE — data lost on server restart        │
└─────────────────────────────────────────────────────────┘
```

### API Endpoints الحالية:

**Store API** (`/api/stores/`):
- `GET /:slug` — جلب بيانات المتجر
- `GET /:slug/products` — قائمة المنتجات (مع فلاتر)
- `GET /:slug/products/:id` — منتج واحد
- `GET /:slug/categories` — الأقسام
- `POST /:slug/orders` — إنشاء طلب

**Dashboard API** (`/api/dashboard/`):
- `GET/PUT /store` — بيانات المتجر
- `GET/POST /products` + `PUT/DELETE /products/:id` — CRUD منتجات
- `GET/POST /categories` + `DELETE /categories/:id` — CRUD أقسام
- `GET /orders` + `GET/PUT /orders/:id` — إدارة الطلبات
- `GET /stats` — الإحصائيات

---

## 📊 3. حالة المشروع

```
المرحلة: MVP متقدم — 60-65% مكتمل
الجاهزية للإنتاج: ❌ غير جاهز
```

| الجانب | الحالة | النسبة |
|--------|--------|--------|
| واجهة المتجر (UI) | ✅ مكتملة | 95% |
| لوحة التحكم (UI) | ✅ مكتملة | 90% |
| نظام التخصيص (Theme) | ✅ متقدم | 85% |
| API Layer (Frontend) | ✅ منظم | 90% |
| Backend API | ⚠️ Mock فقط | 40% |
| قاعدة البيانات | ❌ غير موجودة | 0% |
| المصادقة (Auth) | ❌ غير موجودة | 0% |
| رفع الصور | ❌ URL فقط | 10% |
| نظام الدفع | ❌ غير موجود | 0% |
| الأمان | ❌ معدوم | 5% |
| SEO | ❌ ضعيف | 10% |
| التوثيق | ⚠️ جزئي | 30% |

---

## ⚙️ 4. التقنيات المستخدمة

### Frontend
| التقنية | الإصدار | الغرض |
|---------|---------|-------|
| React | 18.3.1 | UI Framework |
| TypeScript | latest | Type Safety |
| Vite | 6.0.0 | Build Tool |
| TailwindCSS | 4.0.0 | Styling |
| Wouter | 3.3.5 | Client Routing |
| React Query | 5.62.0 | Server State Management |
| Framer Motion | 11.13.0 | Animations |
| Radix UI | latest | Headless UI Components (56 مكون) |
| Lucide React | 0.468.0 | Icons |
| React Hook Form | 7.54.0 | Forms |
| Zod | 3.23.8 | Schema Validation (Frontend) |
| Recharts | 2.14.1 | Charts |
| Sonner | 1.7.0 | Toast Notifications |

### Backend
| التقنية | الإصدار | الغرض |
|---------|---------|-------|
| Node.js | latest | Runtime |
| Express.js | 4.21.1 | HTTP Framework |
| CORS | 2.8.5 | Cross-Origin |
| **❌ لا يوجد ORM** | — | — |
| **❌ لا توجد DB** | — | — |
| **❌ لا توجد Auth** | — | — |

### المطلوب إضافته (Stack المستهدف)
| التقنية | الغرض |
|---------|-------|
| PostgreSQL | قاعدة البيانات الرئيسية |
| Prisma ORM | إدارة قاعدة البيانات |
| JWT + bcrypt | المصادقة |
| Cloudinary | رفع الصور |
| Zod (Backend) | Validation |
| Helmet.js | أمان HTTP Headers |
| Rate Limiter | حماية API |

---

## 📁 5. هيكل المشروع الحالي

```
f:/Layla Alakhli/Bastah/
│
├── 📄 project-context.md         ← هذا الملف (ذاكرة المشروع)
├── 📄 package.json
├── 📄 vite.config.ts             ← Proxy: /api → localhost:3001
├── 📄 tsconfig.json
├── 📄 index.html                 ← Title: بَسطة
│
├── 📁 server/                    ← Backend Express.js
│   ├── index.js                  ← يشغّل السيرفر Port 3001
│   ├── app.js                    ← Express setup + Routes
│   ├── 📁 controllers/
│   │   ├── storeController.js    ← 5 وظائف للمتجر العام
│   │   └── dashboardController.js← 11 وظيفة للوحة التحكم
│   ├── 📁 models/
│   │   └── data.js               ← ⚠️ Mock DB (1 متجر، 12 كتاب، 4 أقسام)
│   └── 📁 routes/
│       ├── storeRoutes.js        ← GET/POST للمتجر
│       └── dashboardRoutes.js    ← CRUD كامل للداشبورد
│
├── 📁 src/                       ← Frontend React
│   ├── main.tsx                  ← Entry Point
│   ├── App.tsx                   ← Router (15 صفحة)
│   ├── index.css                 ← Tailwind v4 + CSS Variables
│   │
│   ├── 📁 pages/
│   │   ├── 📁 store/ (5 صفحات)
│   │   │   ├── Home.tsx          ← صفحة رئيسية متخصصة
│   │   │   ├── ProductList.tsx   ← قائمة + فلاتر
│   │   │   ├── ProductDetail.tsx ← تفاصيل المنتج
│   │   │   ├── Cart.tsx          ← السلة
│   │   │   └── Checkout.tsx      ← إتمام الطلب
│   │   └── 📁 dashboard/ (8 صفحات)
│   │       ├── Overview.tsx      ← الإحصائيات
│   │       ├── Products.tsx      ← جدول المنتجات
│   │       ├── ProductForm.tsx   ← نموذج إضافة/تعديل
│   │       ├── Categories.tsx    ← إدارة الأقسام
│   │       ├── Orders.tsx        ← قائمة الطلبات
│   │       ├── OrderDetail.tsx   ← تفاصيل طلب
│   │       ├── Settings.tsx      ← إعدادات (538 سطر - ممتاز)
│   │       └── Setup.tsx         ← إعداد أولي
│   │
│   ├── 📁 components/
│   │   ├── 📁 layout/
│   │   │   ├── StoreLayout.tsx   ← Navbar + BottomNav + Footer
│   │   │   └── DashboardLayout.tsx← Sidebar (Desktop) + Overlay (Mobile)
│   │   ├── 📁 store/
│   │   │   └── MiniCart.tsx      ← سلة مصغرة
│   │   └── 📁 ui/ (56 مكون)    ← ShadCN-style Components
│   │
│   ├── 📁 context/
│   │   ├── language-context.tsx  ← AR/EN (48 ترجمة)
│   │   ├── currency-context.tsx  ← 6 عملات + تحويل
│   │   └── theme-context.tsx     ← 24 خاصية تخصيص
│   │
│   ├── 📁 hooks/
│   │   ├── use-cart.tsx          ← Cart Context + localStorage
│   │   ├── use-toast.ts          ← Toast System
│   │   ├── use-mobile.tsx        ← Mobile Detection
│   │   └── use-debounce.ts       ← Search Debounce
│   │
│   ├── 📁 services/
│   │   └── api.ts                ← 339 سطر — كل hooks الـ API
│   │
│   └── 📁 lib/
│       └── utils.ts              ← cn() helper
│
└── 📁 public/                    ← الصور الحالية (14 صورة WhatsApp)
```

---

## 🚨 6. المشاكل الحالية (مرتبة بالأولوية)

### 🔴 حرجة (Blockers) — تمنع الإنتاج تمامًا

| # | المشكلة | الملف المعني | التأثير |
|---|---------|-------------|---------|
| B1 | **لا توجد قاعدة بيانات** | `server/models/data.js` | كل البيانات تضيع عند restart |
| B2 | **لا يوجد نظام مصادقة** | لا يوجد | أي شخص يصل `/dashboard` |
| B3 | **لا يوجد نظام دفع** | `Checkout.tsx` | لا دفع فعلي، فقط تسجيل طلب |
| B4 | **لا يوجد رفع صور** | `ImageUpload.tsx` | URL فقط، لا upload حقيقي |
| B5 | **IDs غير آمنة** | `dashboardController.js` | `PRODUCTS.length+1` يسبب تكرار IDs |

### 🟠 مهمة — تؤثر على الجودة

| # | المشكلة | الملف المعني |
|---|---------|-------------|
| M1 | CORS مفتوح بالكامل | `server/app.js` |
| M2 | لا Validation في Backend | جميع Controllers |
| M3 | البحث في Dashboard غير مرتبط | `Products.tsx` |
| M4 | `shippingRate` لا يُطبَّق | `Checkout.tsx` |
| M5 | `categoryName` غير موجود في Model | `Products.tsx`, `data.js` |
| M6 | إحصائيات وهمية (12% زيادة) | `Overview.tsx` |
| M7 | Dependencies في مكان خاطئ | `package.json` |

### 🟡 بسيطة — تحسينات

| # | المشكلة | الملف المعني |
|---|---------|-------------|
| L1 | خلط لغات في Checkout | `Checkout.tsx` |
| L2 | اللغة الافتراضية "en" وليس "ar" | `language-context.tsx` |
| L3 | أسماء صور غير احترافية | `public/` |
| L4 | لا SEO / Meta Tags | `index.html` |
| L5 | أسعار العملات ثابتة | `currency-context.tsx` |

---

## 🚀 7. خطة العمل (Step-by-Step Backlog)

### ═══ PHASE 1: الأساسيات (الأسبوع 1-2) ═══
> الهدف: جعل المشروع حقيقيًا (بيانات دائمة + أمان)

**Sprint 1A: قاعدة البيانات**
- [ ] **STEP-01**: تثبيت PostgreSQL محليًا + Prisma ORM
- [ ] **STEP-02**: تصميم Database Schema (Stores, Products, Categories, Orders, Users)
- [ ] **STEP-03**: إنشاء Prisma Schema File
- [ ] **STEP-04**: Migration + Seed البيانات الحالية
- [ ] **STEP-05**: استبدال `data.js` بـ Prisma Queries في Controllers

**Sprint 1B: المصادقة**
- [ ] **STEP-06**: تثبيت JWT + bcrypt
- [ ] **STEP-07**: إنشاء User Model + Auth Controller
- [ ] **STEP-08**: Login/Register API Endpoints
- [ ] **STEP-09**: Auth Middleware (حماية Dashboard Routes)
- [ ] **STEP-10**: صفحة Login في Frontend

**Sprint 1C: إصلاحات عاجلة**
- [ ] **STEP-11**: إصلاح IDs (UUID بدلاً من length+1)
- [ ] **STEP-12**: إضافة Zod Validation في Backend
- [ ] **STEP-13**: تحديد CORS (السماح بـ origins محددة فقط)
- [ ] **STEP-14**: نقل dependencies لمكانها الصحيح في package.json

### ═══ PHASE 2: الميزات الأساسية (الأسبوع 3-4) ═══

**Sprint 2A: رفع الصور**
- [ ] **STEP-15**: إعداد Cloudinary Account
- [ ] **STEP-16**: بناء Upload Endpoint في Backend
- [ ] **STEP-17**: تحديث `ImageUpload.tsx` للرفع الحقيقي

**Sprint 2B: الدفع**
- [ ] **STEP-18**: تكامل Stripe أو Moyasar
- [ ] **STEP-19**: تحديث صفحة Checkout
- [ ] **STEP-20**: تحديث Order Model (payment_status, payment_id)

**Sprint 2C: الإشعارات**
- [ ] **STEP-21**: واتساب API (Twilio أو WhatsApp Business)
- [ ] **STEP-22**: إشعار فوري عند طلب جديد
- [ ] **STEP-23**: إرسال تأكيد للعميل

**Sprint 2D: إصلاحات متوسطة**
- [ ] **STEP-24**: ربط shippingRate في Checkout
- [ ] **STEP-25**: ربط البحث في Dashboard/Products
- [ ] **STEP-26**: إضافة categoryName في API response
- [ ] **STEP-27**: إصلاح الإحصائيات الوهمية

### ═══ PHASE 3: التحسينات (الأسبوع 5-6) ═══

- [ ] **STEP-28**: SEO — Meta tags + Open Graph + robots.txt
- [ ] **STEP-29**: PWA — manifest.json + Service Worker
- [ ] **STEP-30**: توحيد اللغة + جعل العربية الافتراضية
- [ ] **STEP-31**: Pagination في Products/Orders
- [ ] **STEP-32**: Rate Limiting + Helmet.js
- [ ] **STEP-33**: Error Handling Middleware شامل
- [ ] **STEP-34**: Logging (Winston أو Morgan)

### ═══ PHASE 4: SaaS Transformation (الأسبوع 7-8) ═══

- [ ] **STEP-35**: Multi-Tenant Architecture (storeId في كل entity)
- [ ] **STEP-36**: Tenant Registration Flow
- [ ] **STEP-37**: Subdomain Routing (store.vendorconnect.com)
- [ ] **STEP-38**: Subscription Plans (Free / Pro / Enterprise)
- [ ] **STEP-39**: Admin Super Dashboard
- [ ] **STEP-40**: Deployment (Vercel + Railway/Render)

---

## ✅ 8. آخر خطوة تم تنفيذها

```
التاريخ: 2026-05-26
الخطوة: تحليل شامل للمشروع + إنشاء project-context.md
الحالة: ✅ مكتمل
الملاحظات: تم تحليل جميع الملفات (40+ ملف) وتوثيق المشاكل والخطة
```

---

## ▶️ 9. من أين نبدأ في الجلسة القادمة

```
🎯 الخطوة التالية: STEP-01
المهمة: تثبيت PostgreSQL + Prisma ORM
الأولوية: 🔴 أعلى أولوية

أوامر التنفيذ:
cd "f:/Layla Alakhli/Bastah"
npm install prisma @prisma/client
npx prisma init

ثم: تصميم schema.prisma (STEP-02)
```

---

## 📝 سجل التغييرات (Change Log)

| التاريخ | الخطوة | الحالة | المنفذ |
|---------|--------|--------|--------|
| 2026-05-26 | تحليل المشروع الكامل | ✅ | AI PM |
| 2026-05-26 | إنشاء project-context.md | ✅ | AI PM |
| — | STEP-01: تثبيت Prisma | ⏳ قادم | — |
| — | STEP-02: Database Schema | ⏳ قادم | — |
| — | STEP-03: Prisma Schema File | ⏳ قادم | — |

---

## 🔑 متغيرات البيئة المطلوبة (.env)

```env
# قاعدة البيانات
DATABASE_URL="postgresql://user:password@localhost:5432/vendorconnect"

# المصادقة
JWT_SECRET="your-super-secret-key-here"
JWT_EXPIRES_IN="7d"
BCRYPT_ROUNDS=12

# رفع الصور (Cloudinary)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# الدفع (Stripe)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# الإشعارات (WhatsApp)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_WHATSAPP_FROM=""

# السيرفر
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

---

> ⚡ **قاعدة ذهبية:** لا تنتقل من خطوة إلى التالية إلا بعد التأكد من نجاحها بالكامل.
> 📌 **تذكير:** هذا الملف يُحدَّث بعد كل خطوة تنفيذية.
