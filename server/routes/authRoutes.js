import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../lib/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bastah-dev-secret-change-in-production';
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

/* ── Helper: generate JWT ── */
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/* ── POST /api/auth/register ── */
router.post('/register', async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'الاسم والبريد وكلمة المرور مطلوبة' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
  }

  try {
    // التحقق من عدم تكرار البريد
    const { rows: existingUsers } = await query('SELECT id FROM users WHERE email = $1 LIMIT 1', [email.toLowerCase()]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'البريد الإلكتروني مستخدم بالفعل' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const { rows } = await query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, is_active, is_verified)
       VALUES ($1, $2, $3, $4, 'seller', true, false) RETURNING id, email, full_name, phone, role`,
      [email.toLowerCase(), passwordHash, fullName, phone || null]
    );
    const user = rows[0];

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.role,
        hasStore: false,
      },
    });
  } catch (err) {
    console.error('[register]', err);
    res.status(500).json({ error: 'خطأ في السيرفر' });
  }
});

/* ── POST /api/auth/login ── */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'البريد وكلمة المرور مطلوبان' });

  try {
    const { rows } = await query(
      'SELECT id, email, password_hash, full_name, phone, role FROM users WHERE email = $1 LIMIT 1',
      [email.toLowerCase()]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'بيانات الدخول خاطئة' });
    const user = rows[0];
    const passwordHash = user.password_hash;

    const valid = await bcrypt.compare(password, passwordHash);
    if (!valid) return res.status(401).json({ error: 'بيانات الدخول خاطئة' });

    // تحديث آخر تسجيل دخول
    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    // التحقق من وجود متجر
    const { rows: storeRows } = await query('SELECT slug FROM stores WHERE owner_id = $1 LIMIT 1', [user.id]);
    const hasStore = storeRows.length > 0;
    const storeSlug = hasStore ? storeRows[0].slug : null;

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.role,
        hasStore,
        storeSlug,
      },
    });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ error: 'خطأ في السيرفر' });
  }
});

/* ── POST /api/auth/store/create ── */
router.post('/store/create', async (req, res) => {
  // استخراج userId من الـ token
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'غير مصرح' });

  let userId;
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET);
    userId = payload.userId;
  } catch {
    return res.status(401).json({ error: 'token غير صالح' });
  }

  const {
    name, slug, description, whatsappNumber,
    primaryColor, secondaryColor, fontFamily,
    category, shippingRate, defaultCurrency,
  } = req.body;

  if (!name || !slug) return res.status(400).json({ error: 'الاسم والرابط مطلوبان' });
  if (!whatsappNumber) return res.status(400).json({ error: 'رقم الواتساب مطلوب' });

  // التحقق من slug - حروف وأرقام وشرطة فقط
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ error: 'الرابط يجب أن يحتوي على حروف إنجليزية صغيرة وأرقام وشرطة فقط' });
  }

  try {
    // التحقق من عدم تكرار الـ slug
    const { rows: existing } = await query('SELECT id FROM stores WHERE slug = $1 LIMIT 1', [slug]);
    if (existing.length > 0) return res.status(409).json({ error: 'هذا الرابط محجوز، جرّب رابطاً آخر' });

    // التحقق من عدم وجود متجر لهذا المستخدم مسبقاً
    const { rows: existingStore } = await query('SELECT id FROM stores WHERE owner_id = $1 LIMIT 1', [userId]);
    if (existingStore.length > 0) return res.status(409).json({ error: 'لديك متجر مسجل بالفعل' });

    const { rows } = await query(
      `INSERT INTO stores
        (owner_id, plan_id, slug, name, description, whatsapp_number,
         primary_color, secondary_color, font_family,
         shipping_rate, default_currency, currencies,
         is_active, is_published)
       VALUES ($1, 1, $2, $3, $4, $5, $6, $7, $8, $9, $10, ARRAY[$10], true, true)
       RETURNING id, slug, name`,
      [
        userId, slug, name, description || '', whatsappNumber,
        primaryColor || '#7C3AED', secondaryColor || '#A78BFA', fontFamily || 'Tajawal',
        Number(shippingRate || 0), defaultCurrency || 'SAR',
      ]
    );

    res.status(201).json({ store: rows[0], storeUrl: `/store/${rows[0].slug}` });
  } catch (err) {
    console.error('[store/create]', err);
    res.status(500).json({ error: 'خطأ في إنشاء المتجر' });
  }
});

/* ── GET /api/auth/me ── */
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'غير مصرح' });

  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET);
    const { rows } = await query(
      'SELECT id, email, full_name, phone, role, avatar_url FROM users WHERE id = $1 LIMIT 1',
      [payload.userId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'المستخدم غير موجود' });

    const { rows: storeRows } = await query('SELECT slug FROM stores WHERE owner_id = $1 LIMIT 1', [payload.userId]);

    res.json({
      id: rows[0].id,
      email: rows[0].email,
      fullName: rows[0].full_name,
      phone: rows[0].phone,
      role: rows[0].role,
      avatarUrl: rows[0].avatar_url,
      hasStore: storeRows.length > 0,
      storeSlug: storeRows[0]?.slug || null,
    });
  } catch {
    res.status(401).json({ error: 'token غير صالح' });
  }
});

export default router;
