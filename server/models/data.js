/**
 * Mock Database - Data Model
 */

const BASE = '';

const IMG = {
  cover:   `${BASE}/WhatsApp Image 2026-05-05 at 8.24.16 AM.jpeg`,
  logo:    `${BASE}/logo.png`,
  book1:   `${BASE}/WhatsApp Image 2026-05-02 at 9.21.03 PM.jpeg`,
  book2:   `${BASE}/WhatsApp Image 2026-05-02 at 9.23.14 PM.jpeg`,
  book3:   `${BASE}/WhatsApp Image 2026-05-02 at 9.23.41 PM.jpeg`,
  book4:   `${BASE}/WhatsApp Image 2026-05-02 at 9.25.31 PM.jpeg`,
  book5:   `${BASE}/WhatsApp Image 2026-05-02 at 9.27.46 PM.jpeg`,
  book6:   `${BASE}/WhatsApp Image 2026-05-03 at 8.11.50 PM.jpeg`,
  book7:   `${BASE}/WhatsApp Image 2026-05-03 at 8.12.42 PM.jpeg`,
  book8:   `${BASE}/WhatsApp Image 2026-05-03 at 8.13.48 PM.jpeg`,
  book9:   `${BASE}/WhatsApp Image 2026-05-03 at 8.18.08 PM.jpeg`,
  book10:  `${BASE}/WhatsApp Image 2026-05-03 at 8.19.55 PM.jpeg`,
  book11:  `${BASE}/WhatsApp Image 2026-05-03 at 8.21.11 PM.jpeg`,
  book12:  `${BASE}/WhatsApp Image 2026-05-08 at 5.21.30 PM.jpeg`,
};

export const STORE = {
  id: 1,
  slug: 'bastah',
  name: 'بَسطة',
  description: 'أجود المنتجات — شحن لجميع المناطق',
  coverImage: IMG.cover,
  logoImage: IMG.logo,
  primaryColor: '#7C3AED',
  secondaryColor: '#A78BFA',
  fontFamily: 'Tajawal',
  currencies: '["SAR","USD","YER"]',
  defaultCurrency: 'SAR',
  themeConfig: null,
  shippingRate: 0,
  whatsappNumber: '966501234567',
  createdAt: new Date().toISOString(),
};

export const CATEGORIES = [
  { id: 1, storeId: 1, name: 'روايات' },
  { id: 2, storeId: 1, name: 'تطوير الذات' },
  { id: 3, storeId: 1, name: 'تاريخ وحضارة' },
  { id: 4, storeId: 1, name: 'أطفال' },
];

export const PRODUCTS = [
  { id: 1,  storeId: 1, categoryId: 1, name: 'ثلاثية نجيب محفوظ',          description: 'بين القصرين، قصر الشوق، السكرية',  price: 85,  images: [IMG.book1],  variants: { sizes: [], colors: [] }, inStock: true,  featured: true,  createdAt: new Date().toISOString() },
  { id: 2,  storeId: 1, categoryId: 2, name: 'العادات الذرية',              description: 'جيمس كلير — كيف تبني عادات جيدة',    price: 55,  images: [IMG.book2],  variants: { sizes: [], colors: [] }, inStock: true,  featured: true,  createdAt: new Date().toISOString() },
  { id: 3,  storeId: 1, categoryId: 1, name: 'أنا الذي رأى',                description: 'أحمد سعداوي — رواية عراقية معاصرة',   price: 60,  images: [IMG.book3],  variants: { sizes: [], colors: [] }, inStock: true,  featured: true,  createdAt: new Date().toISOString() },
  { id: 4,  storeId: 1, categoryId: 3, name: 'تاريخ الحضارة الإسلامية',     description: 'ول ديورانت — مجلد فاخر',              price: 120, images: [IMG.book4],  variants: { sizes: [], colors: [] }, inStock: true,  featured: false, createdAt: new Date().toISOString() },
  { id: 5,  storeId: 1, categoryId: 2, name: 'قوة اللحظة الحاضرة',          description: 'إيكهارت تول — الوعي والسلام الداخلي',  price: 48,  images: [IMG.book5],  variants: { sizes: [], colors: [] }, inStock: true,  featured: false, createdAt: new Date().toISOString() },
  { id: 6,  storeId: 1, categoryId: 1, name: 'موسم الهجرة إلى الشمال',      description: 'الطيب صالح — رواية عالمية',           price: 45,  images: [IMG.book6],  variants: { sizes: [], colors: [] }, inStock: true,  featured: false, createdAt: new Date().toISOString() },
  { id: 7,  storeId: 1, categoryId: 4, name: 'قصص ما قبل النوم للبنات',     description: 'ربيكا ستيف — قصص ملهمة للأطفال',    price: 75,  images: [IMG.book7],  variants: { sizes: [], colors: [] }, inStock: true,  featured: true,  createdAt: new Date().toISOString() },
  { id: 8,  storeId: 1, categoryId: 3, name: 'مختصر ابن خلدون',             description: 'المقدمة — تلخيص وتبسيط حديث',        price: 65,  images: [IMG.book8],  variants: { sizes: [], colors: [] }, inStock: false, featured: false, createdAt: new Date().toISOString() },
  { id: 9,  storeId: 1, categoryId: 2, name: 'التفكير السريع والبطيء',      description: 'دانيال كانيمان — علم الإدراك',        price: 58,  images: [IMG.book9],  variants: { sizes: [], colors: [] }, inStock: true,  featured: false, createdAt: new Date().toISOString() },
  { id: 10, storeId: 1, categoryId: 1, name: 'الخيميائي',                   description: 'باولو كويلو — رحلة البحث عن الكنز',   price: 40,  images: [IMG.book10], variants: { sizes: [], colors: [] }, inStock: true,  featured: false, createdAt: new Date().toISOString() },
  { id: 11, storeId: 1, categoryId: 4, name: 'أميرة الأميرات — للأطفال',    description: 'قصة مصورة — 4 إلى 10 سنوات',         price: 35,  images: [IMG.book11], variants: { sizes: [], colors: [] }, inStock: true,  featured: false, createdAt: new Date().toISOString() },
  { id: 12, storeId: 1, categoryId: 2, name: 'من يحرك قطعة الجبن؟',         description: 'سبنسر جونسون — التغيير والتكيف',      price: 35,  images: [IMG.book12], variants: { sizes: [], colors: [] }, inStock: true,  featured: false, createdAt: new Date().toISOString() },
];

export const ORDERS = [];
export let nextOrderId = 1;

export const incrementOrderId = () => {
  return nextOrderId++;
};
